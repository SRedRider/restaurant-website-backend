// api/controllers/order-controller.js
const { createOrder, getAllOrders, getOrderById} = require('../models/order-model');

// Controller to create a new order
const createNewOrder = async (req, res) => {
  const { user_id, customer_name, customer_phone, items, notes, method, address, scheduled_time} = req.body;

  if (!customer_name || !customer_phone || !items) {
    return res.status(400).json({ message: 'Customer name, phone, and items are required' });
  }

  if (method === 'delivery' && !address) {
    return res.status(400).json({ message: 'Address is required for delivery orders' });
  }

  let finalTime = null;
  if (scheduled_time) {
    if (scheduled_time === 'now') {
      finalTime = new Date();  // Set to the current time
    } else {
      const parsedTime = new Date(scheduled_time);
      if (!isNaN(parsedTime.getTime())) {
        finalTime = parsedTime;
      } else {
        return res.status(400).json({ message: 'Invalid scheduled_time format' });
      }
    }
  }

  try {
    const { id, order_id } = await createOrder(user_id, customer_name, customer_phone, items, notes, method, method === 'delivery' ? address : null, finalTime);
    res.status(201).json({ message: 'Order created successfully', order_id, orderId: id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Controller to get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};

const getOrder = async (req, res) => {
    const { orderId} = req.params;  // Extract the orderId from URL params
    const requested = req.user;
    console.log("Requested user:", requested);  // Log the requested user

    try {
      const order = await getOrderById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      if (requested.role !== "admin" && order.user_id !== requested.userId) {
        // If the user is neither an admin nor the owner of the order, deny access
        console.log("Access denied for user:", requested.userId);  // Log the denied access
        console.log("Order user_id:", order.user_id);  // Log the order's user_id
        console.log("Requested user role:", requested.role);  // Log the requested user's role
        return res.status(403).json({ message: 'You do not have permission to access this order' });
    }
    
      res.status(200).json(order);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve order' });
    }
  };


module.exports = { createNewOrder, getOrders, getOrder };

