require('dotenv').config();
const axios = require('axios'); 

const DISCORD_WEBHOOK_URL_ORDER = process.env.DISCORD_WEBHOOK_URL_ORDER;
const DISCORD_WEBHOOK_URL_ERROR = process.env.DISCORD_WEBHOOK_URL_ERROR;
const DISCORD_WEBHOOK_URL_REGISTERED_USER = process.env.DISCORD_WEBHOOK_URL_REGISTERED_USER;
const DISCORD_WEBHOOK_URL_CONTACT = process.env.DISCORD_WEBHOOK_URL_CONTACT;
const DISCORD_WEBHOOK_URL_RESERVATION = process.env.DISCORD_WEBHOOK_URL_RESERVATION;


// Function to send registered user to Discord
function sendRegisteredUserToDiscord(content) {
  const message = {
    content: content
  };

  axios.post(DISCORD_WEBHOOK_URL_REGISTERED_USER, message)
    .then(() => console.log('User sent to Discord'))
    .catch(err => console.error('Error sending to Discord:', err));
}

// Function to send contact to Discord
function sendContactToDiscord(content) {
  const message = {
    content: content
  };

  axios.post(DISCORD_WEBHOOK_URL_CONTACT, message)
    .then(() => console.log('Contact sent to Discord'))
    .catch(err => console.error('Error sending to Discord:', err));
}

// Function to send reservation to Discord
function sendReservationToDiscord(content) {
  const message = {
    content: content
  };

  axios.post(DISCORD_WEBHOOK_URL_RESERVATION, message)
    .then(() => console.log('Reservation sent to Discord'))
    .catch(err => console.error('Error sending to Discord:', err));
}

// Function to send order to Discord
function sendOrderToDiscord(content) {
  const message = {
    content: content
  };

  axios.post(DISCORD_WEBHOOK_URL_ORDER, message)
    .then(() => console.log('Order sent to Discord'))
    .catch(err => console.error('Error sending to Discord:', err));
}

// Function to send error logs to Discord
function sendErrorToDiscord(content) {
  const message = {
    content: content
  };

  axios.post(DISCORD_WEBHOOK_URL_ERROR, message)
    .then(() => console.log('Error sent to Discord'))
    .catch(err => console.error('Error sending to Discord:', err));
}

module.exports = { sendOrderToDiscord, sendRegisteredUserToDiscord, sendContactToDiscord, sendReservationToDiscord, sendErrorToDiscord };
