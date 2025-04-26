const db = require('../../utils/database');



const MAX_CHAIRS = 20;

// Check availability and book reservation with transaction safety
const checkAndBookReservation = async (date, time, peopleCount, details) => {
  const connection = await db.getConnection(); // Get a connection for transaction

  try {
    // Start transaction
    await connection.beginTransaction();

    // Validate input
    if (!date || !time || !details.name || !details.phone || peopleCount <= 0) {
      throw new Error('Invalid input');
    }

    // Check if there's already a reservation for the date
    const [rows] = await connection.query(
      'SELECT * FROM reservations WHERE date = ? FOR UPDATE', // Lock the row!
      [date]
    );

    const reservationId = Math.floor(10000 + Math.random() * 90000); // 5-digit random number

    if (rows.length === 0) {
      // No reservation exists for that day, create a new one
      if (peopleCount > MAX_CHAIRS) {
        throw new Error('Not enough chairs available for a new reservation');
      }

      const [result] = await connection.query(
        'INSERT INTO reservations (date, remaining_chairs) VALUES (?, ?)',
        [date, MAX_CHAIRS - peopleCount]
      );
    } else {
      // Reservation exists, check remaining chairs
      const remainingChairs = rows[0].remaining_chairs;
      if (remainingChairs < peopleCount) {
        throw new Error('Not enough chairs available for the selected day');
      }

      // Update remaining chairs
      await connection.query(
        'UPDATE reservations SET remaining_chairs = ? WHERE id = ?',
        [remainingChairs - peopleCount, rows[0].id]
      );
    }

    // Insert into reservation_details
    await connection.query(
      'INSERT INTO reservation_details (reservation_id, name, phone, email, people_count, date, time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [reservationId, details.name, details.phone, details.email, peopleCount, date, time, details.notes || '']
    );

    // Commit the transaction
    await connection.commit();
    connection.release();

    return { success: true, reservationId };
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
const getDaysWithChairs = async () => {
  try {
    const [rows] = await db.query(`
      SELECT DATE(date) as date, remaining_chairs 
      FROM reservations 
      WHERE remaining_chairs <= 20
      ORDER BY date
    `);
    return rows;
  } catch (err) {
    console.error(err);
    throw new Error('Error fetching available days');
  }
}

module.exports = { checkAndBookReservation, getAllReservations, getDaysWithChairs };
