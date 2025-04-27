const reservationModel = require('../models/reservation-model');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');

// Book reservation
const bookReservation = async (req, res) => {
  const { date, time, guestCount, name, phone, email, notes } = req.body;

  if (!date || !time || !guestCount || !name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  if (guestCount <= 0 || guestCount > 10) { 
    return res.status(400).json({ success: false, message: 'Invalid number of guests' });
  }


  const details = { name, phone, email, guestCount, notes };

  try {
    const result = await reservationModel.checkAndBookReservation(date, time, guestCount, details);

    if (result.success) {
      res.status(200).json({
        success: true,
        reservationId: result.reservationId,
        allocatedTables: result.allocatedTables
      });
      await sendConfirmationEmail(email, name, date, time, guestCount, notes);
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'An error occurred while booking the reservation' });
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
    const rows = await reservationModel.getReservationDays();

    let notAvailable = [];
    let data = [];

    // Separate the days into no chairs and remaining chairs
    rows.forEach(row => {
      const formattedDate = moment.utc(row.date).tz('Europe/Helsinki').format('DD.MM.YYYY');


        data.push({
          date: formattedDate,
          remainingChairs: row.remaining_chairs,
          allocatedTables: row.allocated_tables,
          status: row.status,
        });
    });

    // Respond with the separated days
    res.json({
      data,       // Days with remaining chairs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching available days' });
  }
}



// Configure the nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// Updated the email content to present reservation details as a single paragraph instead of separate sections
const sendConfirmationEmail = async (email, name, reservationDate, reservationTime, guestCount, notes) => {
  const formattedDate = moment(reservationDate, 'YYYY-MM-DD').format('DD.MM.YYYY');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reservation Confirmation',
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservation Confirmation</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f4f9;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            font-size: 28px;
            margin-bottom: 20px;
        }
        p {
            font-size: 16px;
            line-height: 1.6;
            margin: 10px 0;
        }
        .highlight {
            color: #e74c3c;
            font-weight: bold;
        }
        .button {
            display: inline-block;
            padding: 12px 20px;
            margin-top: 20px;
            background-color: #3498db;
            color: white;
            text-decoration: none;
            font-weight: bold;
            border-radius: 5px;
            text-align: center;
        }
        .button:hover {
            background-color: #2980b9;
        }
        .footer {
            margin-top: 30px;
            font-size: 14px;
            text-align: center;
            color: #7f8c8d;
        }
        .footer a {
            color: #3498db;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Reservation Confirmation</h1>
        <p>Dear <span class="highlight">${name}</span>,</p>
        <p>Thank you for choosing our restaurant! We are delighted to confirm your reservation for <span class="highlight">${guestCount}</span> guest(s) on <span class="highlight">${formattedDate}</span> at <span class="highlight">${reservationTime}</span>. ${notes ? `Additional notes: <span class="highlight">${notes}</span>.` : ''}</p>

        <p>Please arrive a few minutes early to ensure a smooth seating process. If you need to modify or cancel your reservation, contact us at least 24 hours in advance.</p>

        <a href="mailto:burgersinhelsinki@gmail.com" class="button">Contact Us</a>

        <div class="footer">
            <p>We look forward to welcoming you!</p>
            <p>&copy; 2025 Your Restaurant. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw new Error('Failed to send confirmation email');
  }
};

// Test reservation feasibility without booking
const testReservationAvailability = async (req, res) => {
  const { guestCount } = req.body;

  if (!guestCount || guestCount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid number of guests' });
  }

  try {
    const rows = await reservationModel.getReservationDays();
    const maxChairs = await reservationModel.getMaxChairs();
    const requiredTables = Math.ceil(guestCount / 5); // Assuming 5 chairs per table

    let unavailableDates = [];

    for (const row of rows) {
      const remainingChairs = row.remaining_chairs;
      const allocatedTables = row.allocated_tables ? row.allocated_tables.split(',').length : 0;
      const totalTables = Math.ceil(maxChairs / 5); // Total tables available in restaurant
      const freeTables = totalTables - allocatedTables;

      if (remainingChairs < guestCount || freeTables < requiredTables) {
        unavailableDates.push({
          date: moment.utc(row.date).tz('Europe/Helsinki').format('DD.MM.YYYY'),
          remainingChairs,
          freeTables,
        });
      }
    }

    res.status(200).json({ success: true, unavailableDates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error testing reservation availability' });
  }
};

module.exports = { bookReservation, getReservations, getAvailableDays, testReservationAvailability };
