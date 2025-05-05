const reservationModel = require('../models/reservation-model');
const nodemailer = require('nodemailer');
const Discord = require('../../services/discordService');
const moment = require('moment-timezone'); // Ensure moment is imported

// Book reservation
const bookReservation = async (req, res) => {
  const { date, time, guest_count, name, phone, email, notes } = req.body;

  if (!date || !time || !guest_count || !name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const phoneRegex = /^(?:\+358|0)\d{8,9}$/;
  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({success: false, message: 'Invalid phone number format. Expected Finnish format: +358XXXXXXXXX or 0XXXXXXXXX' });
  }

  if (email && !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ success: false, message: 'Invalid email format' });
  }

  if (guest_count <= 0 || guest_count > 10) { 
    return res.status(400).json({ success: false, message: 'Invalid number of guests' });
  }


  const details = { name, phone, email, guest_count, notes };

  try {
    const result = await reservationModel.checkAndBookReservation(date, time, guest_count, details);

    if (result.success) {
      res.status(200).json({
        success: true,
        reservationId: result.reservationId,
        allocatedTables: result.allocatedTables
      });
      await sendConfirmationEmail(email, name, date, time, guest_count, notes, result.allocatedTables);
      Discord.sendReservationToDiscord(`New reservation: ${name}, Date: ${date}, Time: ${time}, Guests: ${guest_count}, Notes: ${notes}, Tables: ${result.allocatedTables.join(', ')}`);
    } else {
      res.status(400).json({ success: false, message: result.message });
      console.log(result.message); // Log the error message for debugging
      Discord.sendErrorToDiscord(`(RESERVATION - bookReservation) ${result.message}`);
    }
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - bookReservation) ${err}`);
    res.status(500).json({ success: false, message: 'An error occurred while booking the reservation' });
  }
}

// Get all reservations
const getReservations = async (req, res) => {
  try {
    const reservations = await reservationModel.getAllReservations();
    res.status(200).json(reservations);
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - getReservations) ${err}`);
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
    Discord.sendErrorToDiscord(`(RESERVATION - getAvailableDays) ${err}`);
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
const sendConfirmationEmail = async (email, name, reservationDate, reservationTime, guest_count, notes, allocatedTables) => {
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
    <style>
        /* General Reset */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        /* Body Styling */
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f9f9f9;
            line-height: 1.6;
            padding: 20px;
        }

        /* Container for the reservation confirmation */
        .container {
            background-color: #0D0D0D;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            color: white;
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .header img {
            max-width: 200px; /* Adjust size as needed */
            margin-bottom: 10px;
        }

        h1 {
            font-size: 2.5rem;
            color: #F7B41A;
            text-align: center;
        }

        /* Highlight Class for Important Information */
        .highlight {
            font-weight: bold;
            color: #F7B41A;
        }

        /* Main Paragraph Styling */
        p {
            font-size: 1.1rem;
            margin-bottom: 15px;
            color: white;
        }

        /* Styling for Footer */
        .footer {
            text-align: center;
            font-size: 0.9rem;
            color: #c9c7c7;
            margin-top: 50px;
        }

        /* Links */
        a {
            text-decoration: none;
            color: #F7B41A;
            font-weight: bold;
            transition: color 0.3s ease;
        }

        a:hover {
            color: #F7B41A;
        }

        /* Responsive Design for Small Screens */
        @media screen and (max-width: 600px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 2rem;
            }

            p {
                font-size: 1rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Logo Section -->
        <div class="header">
            <img src="https://users.metropolia.fi/~quangth/restaurant/images/logo_trimmed.png" alt="Restaurant Logo"> <!-- Replace with your logo path -->
        </div>
        
        <h1>Reservation Confirmation</h1>
        <p style="margin-top: 30px;">Dear <span class="highlight">${name}</span>,</p>
        <p>Thank you for choosing our restaurant! We are pleased to confirm your reservation for <span class="highlight">${guest_count}</span> guest(s) on <span class="highlight">${formattedDate}</span> at <span class="highlight">${reservationTime}</span>.</p>
        <p>${notes ? `Additional notes: <span class="highlight">${notes}</span>` : ''}</p>
        <p>Table number(s): <span class="highlight">${allocatedTables.join(', ')}</span></p>

        <p>We kindly ask that you arrive a few minutes early to ensure a smooth seating process. </p>
            
        <p>Should you need to make any changes or cancel your reservation, please <a href="mailto:burgersinhelsinki@gmail.com" class="highlight">contact us via email</a> at least 24 hours in advance.</p>


        <div class="footer">
            <p>We look forward to welcoming you!</p>
            <p>&copy; 2025 <a href="https://users.metropolia.fi/~quangth/restaurant/">Burger Company</a>. All rights reserved.</p>
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
    Discord.sendErrorToDiscord(`(RESERVATION - sendConfirmationEmail) ${err}`);
    throw new Error('Failed to send confirmation email');
  }
};

// Test reservation feasibility without booking
const testReservationAvailability = async (req, res) => {
  const { guest_count } = req.body;

  if (!guest_count || guest_count <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid number of guests' });
  }

  try {
    const rows = await reservationModel.getReservationDays();
    const maxChairs = await reservationModel.getMaxChairs();
    const requiredTables = Math.ceil(guest_count / 5); // Assuming 5 chairs per table

    let unavailableDates = [];

    for (const row of rows) {
      const remainingChairs = row.remaining_chairs;
      const allocatedTables = row.allocated_tables ? row.allocated_tables.split(',').length : 0;
      const totalTables = Math.ceil(maxChairs / 5); // Total tables available in restaurant
      const freeTables = totalTables - allocatedTables;

      if (remainingChairs < guest_count || freeTables < requiredTables) {
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
    Discord.sendErrorToDiscord(`(RESERVATION - testReservationAvailability) ${err}`);
    res.status(500).json({ success: false, message: 'Error testing reservation availability' });
  }
};

// Get reservation by ID
const getReservationById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Reservation ID is required' });
  }

  try {
    const reservation = await reservationModel.getReservationById(id);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Convert date to ISO 8601 format
    reservation.date = moment(reservation.date, 'DD.MM.YYYY').format('YYYY-MM-DD');

    res.status(200).json(reservation);
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - getReservationById) ${err}`);
    res.status(500).json({ success: false, message: 'Error fetching reservation' });
  }
};

// Update reservation
const updateReservation = async (req, res) => {
  const { id } = req.params;
  const { date, time, guest_count, name, phone, email, notes } = req.body;
  const requested = req.user.userId;

  if (!id || !date || !time || !guest_count || !name || !phone || !email) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }


  try {
    const result = await reservationModel.updateReservation(id, { date, time, guest_count, name, phone, email, notes, requested });

    if (result.success) {
      res.status(200).json({ success: true, message: 'Reservation updated successfully' });
    } else {
      res.status(400).json({ success: false, message: result.message });
      console.log(result.message);
    }
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - updateReservation) ${err}`);
    res.status(500).json({ success: false, message: 'Error updating reservation' });
  }
};

// Delete reservation
const deleteReservation = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Reservation ID is required' });
  }

  try {
    const result = await reservationModel.deleteReservation(id);

    if (result.success) {
      res.status(200).json({ success: true, message: 'Reservation deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Reservation not found' });
    }
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - deleteReservation) ${err}`);
    res.status(500).json({ success: false, message: 'Error deleting reservation' });
  }
};

const getReservationTables = async (req, res) => {
  try {
    const tables = await reservationModel.getReservationTables();
    res.status(200).json(tables);
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - getReservationTables) ${err}`);
    res.status(500).json({ success: false, message: 'Error fetching reservation tables' });
  }
};

const getReservationTableById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Table ID is required' });
  }

  try {
    const table = await reservationModel.getReservationTableById(id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    res.status(200).json(table);
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - getReservationTableById) ${err}`);
    res.status(500).json({ success: false, message: 'Error fetching table by ID' });
  }
};

const updateReservationTable = async (req, res) => {
  const { id } = req.params;
  const { table_number, chairs } = req.body;

  if (!table_number || !chairs) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const result = await reservationModel.updateReservationTable(id, { table_number, chairs });

    if (result.success) {
      res.status(200).json({ success: true, message: 'Table updated successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to update table' });
    }
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - updateReservationTable) ${err}`);
    res.status(500).json({ success: false, message: 'Error updating table' });
  }
};

// Add a new table
const addReservationTable = async (req, res) => {
  const {chairs, added_by} = req.body;


  if (!chairs) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  try {
    const result = await reservationModel.addReservationTable({ chairs , added_by });

    if (result.success) {
      res.status(201).json({ success: true, message: 'Table added successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to add table' });
    }
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - addReservationTable) ${err}`);
    res.status(500).json({ success: false, message: 'Error adding table' });
  }
};

// Delete a table
const deleteReservationTable = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Table ID is required' });
  }

  try {
    const result = await reservationModel.deleteReservationTable(id);

    if (result.success) {
      res.status(200).json({ success: true, message: 'Table deleted successfully' });
    } else if (result.message === 'Table is currently allocated in a reservation and cannot be deleted') {
      res.status(400).json({ success: false, message: 'Table is currently allocated in a reservation and cannot be deleted' });
      console.log(result.message);
    } else {
      res.status(404).json({ success: false, message: 'Table not found' });
    }
  } catch (err) {
    console.error(err);
    Discord.sendErrorToDiscord(`(RESERVATION - deleteReservationTable) ${err}`);
    res.status(500).json({ success: false, message: 'Error deleting table' });
  }
};

module.exports = { bookReservation, getReservations, getAvailableDays, testReservationAvailability, getReservationById, updateReservation, deleteReservation, getReservationTables, getReservationTableById, updateReservationTable, addReservationTable, deleteReservationTable };