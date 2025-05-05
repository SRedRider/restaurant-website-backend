const db = require('../../utils/database');

const getMaxChairs = async () => {
  try {
    const [rows] = await db.query('SELECT SUM(chairs) as totalChairs FROM tables');
    return rows[0].totalChairs || 0;
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching total chairs from the database');
  }
};

// Check availability and book reservation with transaction safety
const checkAndBookReservation = async (date, time, guestCount, details) => {
  const connection = await db.getConnection(); // Get a connection for transaction

  try {
    // Start transaction
    await connection.beginTransaction();

    // Validate input
    if (!date || !time || !details.name || !details.phone || guestCount <= 0) {
      throw new Error('Invalid input');
    }

    // Fetch existing reservations for the date
    const [existingReservations] = await connection.query(
      'SELECT allocated_tables, remaining_chairs FROM reservations WHERE date = ? FOR UPDATE',
      [date]
    );

    const allocatedTables = existingReservations.length > 0
      ? existingReservations[0].allocated_tables.split(',').map(Number)
      : [];

    // Fetch all tables with their chair counts
    const [allTables] = await connection.query('SELECT id, chairs FROM tables');

    // Filter available tables
    const availableTables = allTables.filter(table => !allocatedTables.includes(table.id));

    // Sort available tables by chair count (ascending) for optimal allocation
    availableTables.sort((a, b) => a.chairs - b.chairs);

    // Allocate tables based on required chairs
    let requiredChairs = guestCount;
    const tablesToAllocate = [];

    // First, try to find a single table that matches the guest count exactly
    const exactMatchTable = availableTables.find(table => table.chairs === guestCount);
    if (exactMatchTable) {
      tablesToAllocate.push(exactMatchTable.id);
      requiredChairs = 0;
    } else {
      // If no exact match, combine tables to meet the required chairs
      for (const table of availableTables) {
        if (requiredChairs <= 0) break;
        tablesToAllocate.push(table.id);
        requiredChairs -= table.chairs;
      }
    }

    if (requiredChairs > 0) {
      throw new Error('Not enough chairs available for the selected day');
    }

    // Update the remaining chairs after allocating tables
    const updatedRemainingChairs = existingReservations.length > 0
      ? existingReservations[0].remaining_chairs - guestCount
      : allTables.reduce((sum, table) => sum + table.chairs, 0) - guestCount;

    if (existingReservations.length === 0) {
      await connection.query(
        'INSERT INTO reservations (date, remaining_chairs, allocated_tables) VALUES (?, ?, ?)',
        [date, updatedRemainingChairs, tablesToAllocate.join(',')]
      );
    } else {
      await connection.query(
        'UPDATE reservations SET remaining_chairs = ?, allocated_tables = ? WHERE date = ?',
        [
          updatedRemainingChairs,
          [...allocatedTables, ...tablesToAllocate].join(','),
          date
        ]
      );
    }

    // Insert into reservation_details
    const reservationId = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
    await connection.query(
      'INSERT INTO reservation_details (reservation_id, name, phone, email, guest_count, date, time, notes, allocated_tables) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        reservationId,
        details.name,
        details.phone,
        details.email,
        guestCount,
        date,
        time,
        details.notes || '',
        tablesToAllocate.join(',')
      ]
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    return { success: true, reservationId, allocatedTables: tablesToAllocate };
  } catch (err) {
    console.error(err);
    if (connection) {
      await connection.rollback(); // Undo any changes
      connection.release();
    }
    return { success: false, message: err.message || 'An error occurred while processing the reservation' };
  }
};


// Fetch all reservations
const getAllReservations = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM reservation_details');
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching reservations');
  }
}

// Fetch days with no chairs and days with remaining chairs
const getReservationDays = async () => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(date) as date, remaining_chairs, allocated_tables, status 
      FROM reservations 
      ORDER BY date
    `);
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching available days');
  }
}

// Ensure the date is returned in a raw format from the database
const getReservationById = async (id) => {
  try {
    const [rows] = await db.query('SELECT * FROM reservation_details WHERE reservation_id = ?', [id]);
    return rows[0] || null; // Keep the raw date format here
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching reservation by ID');
  }
};

// Update reservation
const updateReservation = async (id, details) => {
  const connection = await db.getConnection(); // Get a connection for transaction

  try {
    // Start transaction
    await connection.beginTransaction();

    // Validate input
    if (!id || !details.date || !details.time || !details.name || !details.phone || details.guest_count <= 0) {
      throw new Error('Invalid input');
    }

    // Fetch the reservation details to get allocated tables and guest count
    const [reservationDetails] = await connection.query(
      'SELECT allocated_tables, guest_count, date FROM reservation_details WHERE reservation_id = ?',
      [id]
    );

    if (reservationDetails.length === 0) {
      throw new Error('Reservation not found');
    }

    const { allocated_tables, guest_count, date } = reservationDetails[0];

    // Fetch the current reservation entry for the date
    const [existingReservation] = await connection.query(
      'SELECT allocated_tables, remaining_chairs FROM reservations WHERE date = ? FOR UPDATE',
      [date]
    );

    if (existingReservation.length === 0) {
      throw new Error('Reservation entry not found for the date');
    }

    const currentAllocatedTables = existingReservation[0].allocated_tables
      .split(',')
      .map(Number);
    const tablesToRemove = allocated_tables.split(',').map(Number);

    // Remove the allocated tables from the list
    const updatedAllocatedTables = currentAllocatedTables.filter(
      (table) => !tablesToRemove.includes(table)
    );

    // Update the remaining chairs
    const updatedRemainingChairs = existingReservation[0].remaining_chairs + guest_count;

    // Update the reservations table
    await connection.query(
      'UPDATE reservations SET allocated_tables = ?, remaining_chairs = ? WHERE date = ?',
      [updatedAllocatedTables.join(','), updatedRemainingChairs, date]
    );

    // Reallocate tables using the same logic as checkAndBookReservation
    const [allTables] = await connection.query('SELECT id, chairs FROM tables');

    // Filter available tables
    const availableTables = allTables.filter(table => !updatedAllocatedTables.includes(table.id));

    // Sort available tables by chair count (ascending) for optimal allocation
    availableTables.sort((a, b) => a.chairs - b.chairs);

    // Allocate tables based on required chairs
    let requiredChairs = details.guest_count;
    const tablesToAllocate = [];

    // First, try to find a single table that matches the guest count exactly
    const exactMatchTable = availableTables.find(table => table.chairs === details.guest_count);
    if (exactMatchTable) {
      tablesToAllocate.push(exactMatchTable.id);
      requiredChairs = 0;
    } else {
      // If no exact match, combine tables to meet the required chairs
      for (const table of availableTables) {
        if (requiredChairs <= 0) break;
        tablesToAllocate.push(table.id);
        requiredChairs -= table.chairs;
      }
    }

    if (requiredChairs > 0) {
      throw new Error('Not enough chairs available for the selected day');
    }

    // Update the remaining chairs after allocating tables
    const newRemainingChairs = updatedRemainingChairs - details.guest_count;

    await connection.query(
      'UPDATE reservations SET allocated_tables = ?, remaining_chairs = ? WHERE date = ?',
      [
        [...updatedAllocatedTables, ...tablesToAllocate].join(','),
        newRemainingChairs,
        date
      ]
    );

    // Update reservation details
    const result = await connection.query(
      'UPDATE reservation_details SET date = ?, time = ?, guest_count = ?, name = ?, phone = ?, email = ?, notes = ?, allocated_tables = ?, updated_by = ? WHERE reservation_id = ?',
      [
        details.date,
        details.time,
        details.guest_count,
        details.name,
        details.phone,
        details.email,
        details.notes,
        tablesToAllocate.join(','),
        details.requested,
        id
      ]
    );

    if (result[0].affectedRows === 0) {
      throw new Error('Reservation not found or no changes made');
    }

    // Commit the transaction
    await connection.commit();
    connection.release();

    return { success: true };
  } catch (err) {
    console.error(err);
    if (connection) {
      await connection.rollback(); // Undo any changes
      connection.release();
    }
    return { success: false, message: err.message || 'An error occurred while updating the reservation' };
  }
};

// Delete reservation
const deleteReservation = async (id) => {
  const connection = await db.getConnection(); // Get a connection for transaction

  try {
    // Start transaction
    await connection.beginTransaction();

    // Fetch the reservation details to get allocated tables and guest count
    const [reservationDetails] = await connection.query(
      'SELECT allocated_tables, guest_count, date FROM reservation_details WHERE reservation_id = ?',
      [id]
    );

    if (reservationDetails.length === 0) {
      throw new Error('Reservation not found');
    }

    const { allocated_tables, guest_count, date } = reservationDetails[0];

    // Remove the reservation
    const result = await connection.query('DELETE FROM reservation_details WHERE reservation_id = ?', [id]);

    if (result[0].affectedRows === 0) {
      throw new Error('Reservation not found');
    }

    // Fetch the current reservation entry for the date
    const [existingReservation] = await connection.query(
      'SELECT allocated_tables, remaining_chairs FROM reservations WHERE date = ? FOR UPDATE',
      [date]
    );

    if (existingReservation.length === 0) {
      throw new Error('Reservation entry not found for the date');
    }

    const currentAllocatedTables = existingReservation[0].allocated_tables
      .split(',')
      .map(Number);
    const tablesToRemove = allocated_tables.split(',').map(Number);

    // Remove the allocated tables from the list
    const updatedAllocatedTables = currentAllocatedTables.filter(
      (table) => !tablesToRemove.includes(table)
    );

    // Update the remaining chairs
    const updatedRemainingChairs = existingReservation[0].remaining_chairs + guest_count;

    // Update the reservations table
    await connection.query(
      'UPDATE reservations SET allocated_tables = ?, remaining_chairs = ? WHERE date = ?',
      [updatedAllocatedTables.join(','), updatedRemainingChairs, date]
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    return { success: true };
  } catch (err) {
    console.error(err);
    if (connection) {
      await connection.rollback(); // Undo any changes
      connection.release();
    }
    return { success: false, message: err.message || 'An error occurred while deleting the reservation' };
  }
};

const getReservationTables = async () => {
  try {
    const [rows] = await db.query('SELECT * FROM tables');
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching reservation tables');
  }
};

const getReservationTableById = async (id) => {
  try {
    const [rows] = await db.query('SELECT * FROM tables WHERE id = ?', [id]);
    return rows[0] || null;
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching reservation table by ID');
  }
};

const updateReservationTable = async (id, details) => {
  try {
    const result = await db.query('UPDATE tables SET table_number = ?, chairs = ? WHERE id = ?', [
      details.table_number,
      details.chairs,
      id
    ]);

    if (result[0].affectedRows === 0) {
      throw new Error('Reservation table not found or no changes made');
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw new Error('Error updating reservation table');
  }
};

// Add a new table
const addReservationTable = async ({chairs }) => {
  const table_number = Math.floor(100 + Math.random() * 900); // 5-digit random number
  try {
    const result = await db.query('INSERT INTO tables (table_number, chairs) VALUES (?, ?)', [
      table_number,
      chairs
    ]);

    if (result[0].affectedRows === 0) {
      throw new Error('Failed to add table');
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw new Error('Error adding table');
  }
};

// Delete a table
const deleteReservationTable = async (id) => {
  try {
    // Check if the table is allocated in any reservation
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM reservations WHERE FIND_IN_SET(?, allocated_tables)',
      [id]
    );

    if (rows[0].count > 0) {
      return { success: false, message: 'Table is currently allocated in a reservation and cannot be deleted' };
    }

    // Proceed to delete the table if not allocated
    const result = await db.query('DELETE FROM tables WHERE id = ?', [id]);

    if (result[0].affectedRows === 0) {
      return { success: false, message: 'Table not found' };
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    throw new Error('Error deleting table');
  }
};

module.exports = { getMaxChairs, checkAndBookReservation, getAllReservations, getReservationDays, getReservationById, updateReservation, deleteReservation, getReservationTables, getReservationTableById, updateReservationTable, addReservationTable, deleteReservationTable };