const reservationModel = require('../models/reservation-model');
const moment = require('moment-timezone');

// Book reservation
const bookReservation = async (req, res) => {
  const { date, time, peopleCount, name, phone, email, notes } = req.body;

  if (!date || !time || !peopleCount || !name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const details = { name, phone, email, peopleCount, notes };

  const result = await reservationModel.checkAndBookReservation(date, time, peopleCount, details);

  if (result.success) {
    res.status(200).json({ success: true, reservationId: result.reservationId });
  } else {
    res.status(400).json({ success: false, message: result.message });
  }
}

// Get all reservations
const getReservations = async (req, res) => {
  try {
    const reservations = await reservationModel.getAllReservations();
    res.status(200).json({ success: true, reservations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching reservations' });
  }
}

// Fetch the days with no chairs and days with remaining chairs
const getAvailableDays = async (req, res) => {
  try {
    const rows = await reservationModel.getDaysWithChairs();

    let noChairs = [];
    let remainingChairs = [];

    // Separate the days into no chairs and remaining chairs
    rows.forEach(row => {
      const formattedDate = moment.utc(row.date).tz('Europe/Helsinki').format('YYYY-MM-DD');
      if (row.remaining_chairs === 0) {
        noChairs.push(formattedDate); // No chairs available
      } else {
        remainingChairs.push({
          date: formattedDate,
          remainingChairs: row.remaining_chairs
        });
      }
    });

    // Respond with the separated days
    res.json({
      noChairs,              // Days with no chairs
      remainingChairs,       // Days with remaining chairs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching available days' });
  }
}

module.exports = { bookReservation, getReservations, getAvailableDays };
