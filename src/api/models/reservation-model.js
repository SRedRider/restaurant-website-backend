const db = require('../../utils/database');


// Check availability and book reservation
const checkAndBookReservation=  async (date, time, peopleCount, details) => {
  try {
    // First, check if there are available chairs on the requested date and time
    const [rows] = await db.query(
      'SELECT * FROM reservations WHERE date = ? AND time = ?',
      [date, time]
    );

    if (rows.length === 0) {
      // No reservation exists, so create a new one
      await db.query(
        'INSERT INTO reservations (date, time, remaining_chairs) VALUES (?, ?, ?)',
        [date, time, 20 - peopleCount]
      );

      // Fetch the newly created reservation ID
      const [newReservation] = await db.query(
        'SELECT * FROM reservations WHERE date = ? AND time = ?',
        [date, time]
      );

      const reservationId = newReservation[0].id;

      // Insert the customer details into reservation_details
      await db.query(
        'INSERT INTO reservation_details (reservation_id, name, phone, email, people_count, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [reservationId, details.name, details.phone, details.email, details.peopleCount, details.notes]
      );

      return { success: true, reservationId };
    }

    // If a reservation exists, check if there are enough chairs
    const remainingChairs = rows[0].remaining_chairs;

    if (remainingChairs >= peopleCount) {
      // Update the remaining chairs
      await db.query(
        'UPDATE reservations SET remaining_chairs = ? WHERE id = ?',
        [remainingChairs - peopleCount, rows[0].id]
      );

      // Insert customer details into reservation_details
      await db.query(
        'INSERT INTO reservation_details (reservation_id, name, phone, email, people_count, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [rows[0].id, details.name, details.phone, details.email, details.peopleCount, details.notes]
      );

      return { success: true, reservationId: rows[0].id };
    }

    return { success: false, message: 'Not enough chairs available for the selected time' };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'An error occurred while processing the reservation' };
  }
}

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
