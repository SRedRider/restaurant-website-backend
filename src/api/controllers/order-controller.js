const nodemailer = require('nodemailer');
const { createOrder, getAllOrders, getOrderById} = require('../models/order-model');
const { getItemById } = require('../models/item-model');
const { getMealById } = require('../models/meal-model');

// Controller to create a new order
const createNewOrder = async (req, res) => {
  const { user_id, customer_name, customer_phone, customer_email, items, method, address, scheduled_time, notes, total_price } = req.body;

  if (!customer_name || typeof customer_name !== 'string' || customer_name.trim() === '') {
    return res.status(400).json({ message: 'Customer name is required and must be a non-empty string' });
  }

  const phoneRegex = /^(?:\+358|0)\d{8,9}$/;
  if (!customer_phone || !phoneRegex.test(customer_phone)) {
    return res.status(400).json({ message: 'Invalid phone number format. Expected Finnish format: +358XXXXXXXXX or 0XXXXXXXXX' });
  }

  if (!customer_email || typeof customer_email !== 'string' || customer_email.trim() === '') {
    return res.status(400).json({ message: 'Customer email is required and must be a non-empty string' });
  }

  if (customer_email && !/\S+@\S+\.\S+/.test(customer_email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items must be an array and cannot be empty' });
  }

  let calculatedTotalPrice = 0;
  const seenItems = new Set(); // Track items to prevent duplicates

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

    // Check if the item type is valid
    for (const item of items) {
      if (item.type === 'item') {
        const { error, data: itemDetails } = await getItemById(item.id, req.isAdmin); // Pass the isAdmin flag
        if (error) {
          return res.status(400).json({ message: error });
        }
      } else if (item.type === 'meal') {
        const { error, data: mealDetails } = await getMealById(item.id, req.isAdmin); // Pass the isAdmin flag
        if (error) {
          return res.status(400).json({ message: error });
        }
      } else {
        return res.status(400).json({ message: `Invalid item type: ${item.type}. Expected "item" or "meal"` });
      }
    }
    

    // Check for duplicates by item id and type
    const itemKey = `${item.id}-${item.type}`;
    if (seenItems.has(itemKey)) {
      return res.status(400).json({ message: `Duplicate item found. Each item can only appear once.` });
    }

    // Mark this item as seen
    seenItems.add(itemKey);

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
      finalTime = 'Now';  // Set the scheduled time as "Now"
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

  try {
    const { id, order_id } = await createOrder(user_id, customer_name, customer_phone, customer_email, items, method, method === 'delivery' ? address : null, finalTime, notes, total_price);
    
    // Enrich order items after creation
    const enrichedOrder = await enrichOrderItems(order_id);

    await sendOrderConfirmationEmail(customer_email, enrichedOrder);

    // Return the enriched order
    res.status(201).json({ message: 'Order created successfully', order_id: enrichedOrder.order_id, order: enrichedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};




// Function to enrich the order items with item/meal details
const enrichOrderItems = async (orderId, isAdmin) => {
  try {
    // Get the order by orderId
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Use Promise.all to fetch details for all items in parallel
    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        let itemDetails = null;

        // Fetch details based on the type (item or meal)
        if (item.type === 'item') {
          itemDetails = await getItemById(item.id, isAdmin); // Pass isAdmin flag here
        } else if (item.type === 'meal') {
          itemDetails = await getMealById(item.id, isAdmin); // Pass isAdmin flag here
        }

        // If details for the item are not found, return an error
        if (!itemDetails) {
          throw new Error(`Details not found for item with ID: ${item.id}`);
        }

        // Return the enriched item with its details
        return {
          ...item, // Keep the original properties of the item (id, quantity, price, type)
          details: itemDetails, // Add the fetched details for the item
        };
      })
    );

    // Update the order with the enriched items
    order.items = enrichedItems;

    return order; // Return the fully enriched order with items details
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to enrich order items: ${error.message}`);
  }
};



// Controller to get all orders with enriched details
const getOrders = async (req, res) => {
  try {
    // Fetch all orders first
    const orders = await getAllOrders(req.isAdmin);

    // If no orders are found, return an empty array
    if (orders.length === 0) {
      return res.status(200).json([]);
    }

    // Enrich each order with item details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        // Enrich the items in each order
        const enrichedOrder = await enrichOrderItems(order.order_id);
        return enrichedOrder;
      })
    );

    // Return the enriched orders
    res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};


// Controller to get a specific order by ID
const getOrder = async (req, res) => {
  const { orderId } = req.params;
  const requested = req.user;
  console.log("Requested user:", requested);  // Log the requested user

  try {
    const order = await getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (requested.role !== "admin" && order.user_id !== requested.userId) {
      console.log("Access denied for user:", requested.userId);
      console.log("Order user_id:", order.user_id);
      console.log("Requested user role:", requested.role);
      return res.status(403).json({ message: 'You do not have permission to access this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
};


const sendOrderConfirmationEmail = async (email, order) => {
  // Ensure total_price is a number
  const totalPrice = parseFloat(order.total_price);
  if (isNaN(totalPrice)) {
    throw new Error('Invalid total price value');
  }

  // Ensure scheduled_time is displayed correctly (either "Now" or a valid date string)
  let scheduledTime = 'Not scheduled'; // Default value
  if (order.scheduled_time) {
    if (order.scheduled_time === 'Now') {
      scheduledTime = 'Now'; // If it's "Now", display as is
    } else {
      // Otherwise, parse it as a date and format it
      scheduledTime = new Date(order.scheduled_time).toLocaleString();
    }
  }

  // Ensure created_at is a valid date string
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleString() : 'Not available';

  // Create the HTML content for the email
  let itemsTable = '';
  order.items.forEach((item) => {
    itemsTable += `
      <tr>
        <td>${item.details ? item.details.name : 'N/A'}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toFixed(2)}</td>
        <td>${(item.quantity * item.price).toFixed(2)}</td>
      </tr>
    `;
  });

  const htmlContent = `
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #4CAF50;
          text-align: center;
          margin-bottom: 20px;
        }
        h3 {
          color: #333;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        p {
          line-height: 1.6;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          padding: 12px 15px;
          text-align: left;
          border: 1px solid #ddd;
        }
        th {
          background-color: #f2f2f2;
        }
        .total-price {
          font-size: 20px;
          font-weight: bold;
          color: #4CAF50;
          margin-top: 20px;
        }
        .address, .info {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          color: #777;
        }
        .footer p {
          margin: 5px 0;
        }
        .header, .footer p {
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Order Confirmation</h1>
        <p>Dear ${order.customer_name},</p>
        <p>Thank you for your order! Your order has been successfully received. Here are the details:</p>

        <h3>Order Information</h3>
        <p><strong>Order ID:</strong> ${order.order_id}</p>
        <p><strong>Order Created At:</strong> ${createdAt}</p>
        <p><strong>Name:</strong> ${order.customer_name}</p>
        <p><strong>Phone:</strong> ${order.customer_phone}</p>
        <p><strong>Email:</strong> ${order.customer_email}</p>
        <p><strong>Method:</strong> ${order.method}</p>

        ${order.method === 'delivery' ? `
          <div class="address">
            <h3>Delivery Address</h3>
            <p><strong>Street:</strong> ${order.address.street}</p>
            <p><strong>City:</strong> ${order.address.city}</p>
            <p><strong>Postal Code:</strong> ${order.address.postalCode}</p>
          </div>
        ` : ''}

        <h3>Items</h3>
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsTable}
          </tbody>
        </table>

        <div class="info">
          <h3>Additional Information</h3>
          <p><strong>Notes:</strong> ${order.notes || 'None'}</p>
          <p><strong>Scheduled Food Ready:</strong> ${scheduledTime}</p>
        </div>

        <h3>Total Price</h3>
        <p class="total-price">${totalPrice.toFixed(2)}€</p>

        <p>If you have any questions, feel free to contact us.</p>

        <div class="footer">
          <p>Best regards,</p>
          <p>Your Company Name</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Set up the nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Order Confirmation - Your Order has been Received',
    html: htmlContent, // Send HTML formatted email
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error); // If there is an error, reject the promise
      }
      resolve(info); // If successful, resolve the promise
    });
  });
};






module.exports = { createNewOrder, getOrders, getOrder };
