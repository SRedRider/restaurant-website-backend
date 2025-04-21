// api/models/order-model.js
const promisePool = require('../../utils/database');

// Function to generate a random 5-digit number
const generateRandomOrderId = () => {
  return Math.floor(10000 + Math.random() * 90000); // Random number between 10000 and 99999
};

// Function to create a new order
const createOrder = async (user_id = null, customer_name, customer_phone, items, notes, method, address = null, scheduled_time = null) => {
    const order_id = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  
    const query = `
      INSERT INTO orders (user_id, customer_name, customer_phone, items, notes, method, address, scheduled_time, order_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const [result] = await promisePool.query(query, [
      user_id,
      customer_name,
      customer_phone,
      JSON.stringify(items),
      notes,
      method,
      address ? JSON.stringify(address) : null,
      scheduled_time,
      order_id
    ]);
  
    return { id: result.insertId, order_id };
  };
  

// Function to retrieve all orders
const getAllOrders = async () => {
    const [rows] = await promisePool.query('SELECT * FROM orders');
  
    const parsedRows = rows.map(order => {
      return {
        ...order,
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
    return {
      ...order,
      items: JSON.parse(order.items),
      address: order.address ? JSON.parse(order.address) : null
    };
  };


module.exports = { createOrder, getAllOrders, getOrderById };
