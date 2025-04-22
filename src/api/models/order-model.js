// api/models/order-model.js
const promisePool = require('../../utils/database');
const moment = require('moment-timezone');

// Function to generate a random 5-digit number
const generateRandomOrderId = () => {
  return Math.floor(10000 + Math.random() * 90000); // Random number between 10000 and 99999
};

// Function to create a new order
const createOrder = async (user_id = null, customer_name, customer_phone, items, method, address = null, scheduled_time = null, notes, total_price) => {
    const order_id = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  
    const query = `
      INSERT INTO orders (user_id, order_id, customer_name, customer_phone, items, method, address, scheduled_time, notes, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const [result] = await promisePool.query(query, [
      user_id,
      order_id,
      customer_name,
      customer_phone,
      JSON.stringify(items),
      method,
      address ? JSON.stringify(address) : null,
      scheduled_time,
      notes,
      total_price
    ]);
  
    return { id: result.insertId, order_id };
  };
  


const getAllOrders = async () => {
  const [rows] = await promisePool.query('SELECT * FROM orders');

  const parsedRows = rows.map(order => {
    const createdAt = moment.utc(order.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss'); // Convert to local time zone

    return {
      ...order,
      created_at: createdAt, // Store it as formatted local time
      items: JSON.parse(order.items),
      address: order.address ? JSON.parse(order.address) : null
    };
  });

  return parsedRows;
};


  

const getOrderById = async (orderId) => {
  const query = 'SELECT * FROM orders WHERE order_id = ?';
  const [rows] = await promisePool.query(query, [orderId]);

  if (rows.length === 0) {
    return null;  // If no order was found, return null
  }

  const order = rows[0];

  // Adjust any time-related fields (e.g., created_at, updated_at)
  if (order.created_at) {
    order.created_at = moment.utc(order.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
  }
  if (order.updated_at) {
    order.updated_at = moment.utc(order.updated_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
  }
  // Add any other time fields here if needed

  return {
    ...order,
    items: JSON.parse(order.items),
    address: order.address ? JSON.parse(order.address) : null
  };
};


module.exports = { createOrder, getAllOrders, getOrderById };
