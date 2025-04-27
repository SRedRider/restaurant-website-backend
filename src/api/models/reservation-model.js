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

    for (const table of availableTables) {
      if (requiredChairs <= 0) break;
      tablesToAllocate.push(table.id);
      requiredChairs -= table.chairs;
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
      'INSERT INTO reservation_details (reservation_id, name, phone, email, guest_count, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        reservationId,
        details.name,
        details.phone,
        details.email,
        guestCount,
        date,
        time,
        details.notes || ''
      ]
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    return { success: true, reservationId};
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




module.exports = { getMaxChairs, checkAndBookReservation, getAllReservations, getReservationDays };
