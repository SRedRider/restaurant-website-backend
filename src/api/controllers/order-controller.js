// api/controllers/order-controller.js
const { createOrder, getAllOrders, getOrderById} = require('../models/order-model');

// Controller to create a new order
const createNewOrder = async (req, res) => {
  const { user_id, customer_name, customer_phone, items, method, address, scheduled_time, notes, total_price } = req.body;


  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim() === '') {
    return res.status(400).json({ message: 'Customer name is required and must be a non-empty string' });
  }

  const phoneRegex = /^[0-9]{3}-[0-9]{4}$/;
  if (!customer_phone || !phoneRegex.test(customer_phone)) {
    return res.status(400).json({ message: 'Invalid phone number format. Expected format: xxx-xxxx' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items must be an array and cannot be empty' });
  }

  let calculatedTotalPrice = 0;
  for (const item of items) {
    if (!item.id || isNaN(item.id) || item.id <= 0) {
      return res.status(400).json({ message: 'Each item must have a valid id' });
    }
    if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
      return res.status(400).json({ message: 'Each item must have a valid quantity greater than zero' });
    }
    if (!item.price || isNaN(item.price) || item.price <= 0) {
      return res.status(400).json({ message: 'Each item must have a valid price greater than zero' });
    }

    calculatedTotalPrice += item.quantity * item.price;
  }

  const validMethods = ['pickup', 'delivery'];
  if (!validMethods.includes(method)) {
    return res.status(400).json({ message: 'Invalid method. It should be either "pickup" or "delivery"' });
  }

  if (method === 'delivery') {
    if (!address) {
      return res.status(400).json({ message: 'Address is required for delivery orders' });
    }
    if (!address.street || typeof address.street !== 'string' || address.street.trim() === '') {
      return res.status(400).json({ message: 'Address must include a valid street' });
    }
    if (!address.city || typeof address.city !== 'string' || address.city.trim() === '') {
      return res.status(400).json({ message: 'Address must include a valid city' });
    }
    if (!address.postalCode || typeof address.postalCode !== 'string' || address.postalCode.trim() === '') {
      return res.status(400).json({ message: 'Address must include a valid postal code' });
    }
  }


  let finalTime = null;
  if (scheduled_time) {
    if (scheduled_time === 'now') {
      finalTime = new Date(); // Set to the current time
    } else {
      const parsedTime = new Date(scheduled_time);
      if (isNaN(parsedTime.getTime())) {
        return res.status(400).json({ message: 'Invalid scheduled_time format. It must be a valid ISO date string or "now"' });
      }
      finalTime = parsedTime;
    }
  }

  if (total_price != calculatedTotalPrice) {
    return res.status(400).json({ message: `Total price mismatch: The calculated total is ${calculatedTotalPrice}, but received ${total_price}` });
  }

  if (!total_price || isNaN(total_price) || total_price <= 0) {
    return res.status(400).json({ message: 'Invalid total_price. It must be a valid number greater than zero' });
  }


  // Proceed with creating the order after all validations pass
  try {
    const { id, order_id } = await createOrder(user_id, customer_name, customer_phone, items, method, method === 'delivery' ? address : null, finalTime, notes, total_price);
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

