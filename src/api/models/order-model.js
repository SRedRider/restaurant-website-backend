// api/models/order-model.js
const promisePool = require('../../utils/database');
const moment = require('moment-timezone');


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
  


  const getAllOrders = async () => {
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
              itemDetails = await getItemDetailsById(item.id);
            } else if (item.type === 'meal') {
              itemDetails = await getMealDetailsById(item.id);
            }
  
            // If details for the item are not found, log an error and return the item as is
            if (!itemDetails) {
              console.error(`Details not found for item with ID: ${item.id}`);
              return item; // Return the item as it is if details are not found
            }
  
            // Return the enriched item with its details
            return {
              ...item, // Keep the original properties of the item
              details: itemDetails, // Add the fetched details for the item
            };
          })
        );
  
        // Return the enriched order
        return {
          ...order,
          created_at: createdAt, // Store it as formatted local time
          items: enrichedItems,  // Include enriched item details
          address: order.address ? JSON.parse(order.address) : null, // Parse address if exists
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

  return {
    ...order,
    items: JSON.parse(order.items),
    address: order.address ? JSON.parse(order.address) : null
  };
};


// Function to get item details from the items table by ID
const getItemDetailsById = async (itemId, isAdmin) => {
  try {
    // Adjust the query to check visibility if not admin
    const query = isAdmin
      ? 'SELECT * FROM items WHERE id = ?' 
      : 'SELECT * FROM items WHERE id = ? AND visible = "yes"';
    
    const [rows] = await promisePool.query(query, [itemId]);

    if (rows.length === 0) {
      return { error: `Item not found `, data: null }; // Return error if not found or not visible
    }
    
    const item = rows[0];

    // Format the created_at and updated_at dates if they exist
    if (item.created_at) {
      item.created_at = moment.utc(item.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
    }
    if (item.updated_at) {
      item.updated_at = moment.utc(item.updated_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
    }

    return { error: null, data: item }; // Return data if found and visible
  } catch (error) {
    console.error('Error fetching item details:', error);
    return { error: 'An error occurred while fetching item details', data: null };
  }
};

const getMealDetailsById = async (mealId, isAdmin) => {
  try {
    // Adjust the query to check visibility if not admin
    const query = isAdmin
      ? 'SELECT * FROM meals WHERE id = ?' 
      : 'SELECT * FROM meals WHERE id = ? AND visible = "yes"';
    
    const [rows] = await promisePool.query(query, [mealId]);

    if (rows.length === 0) {
      return { error: `Meal not found`, data: null }; // Return error if not found or not visible
    }

    const meal = rows[0];

    // Format the created_at and updated_at dates if they exist
    if (meal.created_at) {
      meal.created_at = moment.utc(meal.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
    }
    if (meal.updated_at) {
      meal.updated_at = moment.utc(meal.updated_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
    }

    return { error: null, data: meal }; // Return data if found and visible
  } catch (error) {
    console.error('Error fetching meal details:', error);
    return { error: 'An error occurred while fetching meal details', data: null };
  }
};



module.exports = { createOrder, getAllOrders, getOrderById, getMealDetailsById, getItemDetailsById };
