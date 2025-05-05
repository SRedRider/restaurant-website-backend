// api/models/order-model.js
const promisePool = require('../../utils/database');
const moment = require('moment-timezone');
const { getItemById } = require('../models/item-model');
const { getMealById } = require('../models/meal-model');

// Function to create a new order
const createOrder = async (user_id = null, customer_name, customer_phone, customer_email, items, method, address = null, scheduled_time = null, notes, total_price) => {
    const order_id = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
  
    const query = `
      INSERT INTO orders (user_id, order_id, customer_name, customer_phone, customer_email, items, method, address, scheduled_time, notes, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    const [result] = await promisePool.query(query, [
      user_id,
      order_id,
      customer_name,
      customer_phone,
      customer_email,
      JSON.stringify(items),
      method,
      address ? JSON.stringify(address) : null,
      scheduled_time,
      notes,
      total_price
    ]);
  
    return { id: result.insertId, order_id };
  };

const getAllOrders = async (isAdmin) => {
    const [rows] = await promisePool.query('SELECT * FROM orders');
  
    if (rows.length === 0) {
      return []; // If no orders are found, return an empty array
    }
  
    // Enrich each order with item details
    const enrichedOrders = await Promise.all(
      rows.map(async (order) => {
        const createdAt = moment.utc(order.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss'); // Convert to local time zone
  
        // Enrich the items in the order
        const enrichedItems = await Promise.all(
          JSON.parse(order.items).map(async (item) => {
            let itemDetails = null;
  
            // Fetch details based on the type (item or meal)
            if (item.type === 'item') {
              itemDetails = await getItemById(item.id, isAdmin);
            } else if (item.type === 'meal') {
              itemDetails = await getMealById(item.id, isAdmin);

              if (!isAdmin && itemDetails) {
                delete itemDetails.added_by;
                delete itemDetails.updated_by;
              }
            }
  
            if (!itemDetails) {
              console.error(`Details not found for item with ID: ${item.id}`);
              return item;
            }
  
            return {
              ...item,
              details: itemDetails,
            };
          })
        );
  
        return {
          ...order,
          created_at: createdAt,
          items: enrichedItems,
          address: order.address ? JSON.parse(order.address) : null,
        };
      })
    );
  
    return enrichedOrders;
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

  if (order.items) {
    order.items = await Promise.all(
        order.items.map(async (item) => {
            let itemDetails = null;

            if (item.type === 'item') {
                itemDetails = await getItemById(item.id, isAdmin);
            } else if (item.type === 'meal') {
                itemDetails = await getMealById(item.id, isAdmin);

                if (!isAdmin && itemDetails) {
                    delete itemDetails.added_by;
                    delete itemDetails.updated_by;
                }
            }

            if (!itemDetails) {
                console.error(`Details not found for item with ID: ${item.id}`);
                return item;
            }

            return {
                ...item,
                details: itemDetails,
            };
        })
    );
  }

  return {
    ...order,
    items: JSON.parse(order.items),
    address: order.address ? JSON.parse(order.address) : null
  };
};

const updateOrder = async (orderId, updateData) => {
  const { customer_name, customer_phone, customer_email, items, method, address, scheduled_time, notes, total_price, status, requestedBy } = updateData;

  const query = `
    UPDATE orders
    SET customer_name = ?, customer_phone = ?, customer_email = ?, items = ?, method = ?, address = ?, scheduled_time = ?, notes = ?, total_price = ?, status = ?, updated_by = ?
    WHERE order_id = ?
  `;

  const [result] = await promisePool.query(query, [
    customer_name,
    customer_phone,
    customer_email,
    JSON.stringify(items),  // Ensure items are stored as JSON
    method,
    address ? JSON.stringify(address) : null,  // Only store address if it's provided
    scheduled_time,
    notes,
    total_price,
    status,
    requestedBy,
    orderId
  ]);

  if (result.affectedRows === 0) {
    return null; // No rows updated, meaning order wasn't found
  }

  // Return the updated order data
  return {
    order_id: orderId,
    customer_name,
    customer_phone,
    customer_email,
    items,
    method,
    address,
    scheduled_time,
    notes,
    total_price,
    status,
    requestedBy,
  };
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrder };
