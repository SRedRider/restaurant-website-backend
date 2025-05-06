const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Discord = require('../../services/discordService');
const { createOrder, getAllOrders, getOrderById, updateOrder} = require('../models/order-model');
const { getItemById } = require('../models/item-model');
const { getMealById } = require('../models/meal-model');

// Helper function to read email templates
const readTemplate = (fileName, replacements) => {
    let template = fs.readFileSync(path.join(__dirname, '../../email-templates', fileName), 'utf-8');
    for (const key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, replacements[key]);
    }
    return template;
};

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

    // Check if the item type is valid and check stock status
    if (item.type === 'item') {
      itemDetails = await getItemById(item.id, req.isAdmin); // Pass the isAdmin flag
      if (!itemDetails) {
        console.log(itemDetails)
        return res.status(400).json({ message: `Item with ID ${item.id} not found or an error occurred` });
      }
      if (itemDetails.stock === 'no') {
        return res.status(400).json({ message: `Item '${itemDetails.name}' is out of stock` });
      }
    } else if (item.type === 'meal') {
      mealDetails = await getMealById(item.id, req.isAdmin); // Pass the isAdmin flag
      if (!mealDetails) {
        return res.status(400).json({ message: `Meal with ID ${item.id} not found or an error occurred` });
      }
      if (mealDetails.stock === 'no') {
        return res.status(400).json({ message: `Meal '${mealDetails.name}' is out of stock` });
      }
    } else {
      return res.status(400).json({ message: `Invalid item type: ${item.type}. Expected "item" or "meal"` });
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
    if (!address.city || typeof address.city !== 'string' || address.city.trim() === '' || !['Helsinki', 'Espoo', 'Vantaa'].includes(address.city)) {
      return res.status(400).json({ message: 'Address must include a valid city: Helsinki, Espoo, or Vantaa' });
    }
    const postalCodeRegex = /^\d{5}$/;
    if (!address.postalCode || typeof address.postalCode !== 'string' || !postalCodeRegex.test(address.postalCode)) {
      return res.status(400).json({ message: 'Address must include a valid Finnish postal code (5 digits)' });
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

  // Round the calculated total price to two decimal places
  const roundedTotalPrice = Math.round(calculatedTotalPrice * 100) / 100;

  if (total_price != roundedTotalPrice) {
    return res.status(400).json({ message: `Total price mismatch: The calculated total is ${roundedTotalPrice}, but received ${total_price}` });
  }

  if (!total_price || isNaN(total_price) || total_price <= 0) {
    return res.status(400).json({ message: 'Invalid total_price. It must be a valid number greater than zero' });
  }

  try {
    const { id, order_id } = await createOrder(user_id, customer_name, customer_phone, customer_email, items, method, method === 'delivery' ? address : null, finalTime, notes, total_price);
    
    // Enrich order items after creation
    const enrichedOrder = await enrichOrderItems(order_id, req.isAdmin); // Pass the isAdmin flag

    await sendOrderConfirmationEmail(customer_email, enrichedOrder);

    // Return the enriched order
    res.status(201).json({ message: 'Order created successfully', order_id: enrichedOrder.order_id, order: enrichedOrder });
    Discord.sendOrderToDiscord(`New order created! #${order_id}`); // Send a message to Discord
  } catch (error) {
    console.error(error);
    Discord.sendErrorToDiscord("(ORDER - createNewOrder) " + error); // Send the error to Discord
    res.status(500).json({ message: 'Failed to create order' });
  }
};




// Function to enrich the order items with item/meal details
const enrichOrderItems = async (orderId, isAdmin) => {
  try {
    // Get the order by orderId
    const order = await getOrderById(orderId, isAdmin); // Pass isAdmin flag here
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
    Discord.sendErrorToDiscord("(ORDER - enrichOrderItems) " + error); // Send the error to Discord
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
        const enrichedOrder = await enrichOrderItems(order.order_id, req.isAdmin); // Pass the isAdmin flag
        return enrichedOrder;
      })
    );

    // Return the enriched orders
    res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error(error);
    Discord.sendErrorToDiscord("(ORDER - getOrders) " + error); // Send the error to Discord
    res.status(500).json({ message: 'Failed to retrieve orders' });
  }
};


// Controller to get a specific order by ID
const getOrder = async (req, res) => {
  const { orderId } = req.params;
  const requested = req.user;
  
  try {
    console.log("Requested order ID:", req.isAdmin); // Log the requested order ID
    const order = await getOrderById(orderId, req.isAdmin);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (requested.role !== "admin" && order.user_id !== requested.userId) {
      console.log("Access denied for user:", requested.userId);
      console.log("Order user_id:", order.user_id);
      console.log("Requested user role:", requested.role);
      return res.status(403).json({ message: 'You do not have permission to access this order' });
    }

    // Enrich the order with item details
    const enrichedOrder = await enrichOrderItems(order.order_id, req.isAdmin);

    res.status(200).json(enrichedOrder);
  } catch (error) {
    console.error(error);
    Discord.sendErrorToDiscord("(ORDER - getOrder) " + error); // Send the error to Discord
    res.status(500).json({ message: 'Failed to retrieve order' });
  }
};



const editOrder = async (req, res) => {
  const { orderId } = req.params;
  const { customer_name, customer_phone, customer_email, items, method, address, scheduled_time, notes, total_price, status } = req.body;
  const requested = req.user;

  try {
    // Fetch the existing order
    const existingOrder = await getOrderById(orderId, requested.isAdmin);
    if (!existingOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is allowed to edit the order
    const requestedUser = req.user; // Assuming the user making the request is in req.user
    if (requestedUser.role !== 'admin' && requestedUser.userId !== existingOrder.user_id) {
      return res.status(403).json({ message: 'You do not have permission to edit this order' });
    }

    // Validate fields (the same validation as in createNewOrder)
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

      // Check if the item type is valid and check stock status
      if (item.type === 'item') {
        itemDetails = await getItemById(item.id, req.isAdmin); // Pass the isAdmin flag
        if (!itemDetails) {
          return res.status(400).json({ message: `Item with ID ${item.id} not found or an error occurred` });
        }
        if (itemDetails.stock === 'no') {
          return res.status(400).json({ message: `Item '${itemDetails.name}' is out of stock` });
        }
      } else if (item.type === 'meal') {
        mealDetails = await getMealById(item.id, req.isAdmin); // Pass the isAdmin flag
        if (!mealDetails) {
          return res.status(400).json({ message: `Meal with ID ${item.id} not found or an error occurred` });
        }
        if (mealDetails.stock === 'no') {
          return res.status(400).json({ message: `Meal '${mealDetails.name}' is out of stock` });
        }
      } else {
        return res.status(400).json({ message: `Invalid item type: ${item.type}. Expected "item" or "meal"` });
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

    // Round the calculated total price to two decimal places
    const roundedTotalPrice = Math.round(calculatedTotalPrice * 100) / 100;

    if (total_price != roundedTotalPrice) {
      return res.status(400).json({ message: `Total price mismatch: The calculated total is ${roundedTotalPrice}, but received ${total_price}` });
    }

    if (!total_price || isNaN(total_price) || total_price <= 0) {
      return res.status(400).json({ message: 'Invalid total_price. It must be a valid number greater than zero' });
    }

    // Update the order in the database
    const updatedOrder = await updateOrder(orderId, {
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
      requestedBy: requested.userId,
    });

    if (!updatedOrder) {
      return res.status(500).json({ message: 'Failed to update the order' });
    }

    // If the status is "ready", send an email to the customer
    if (status === 'ready') {
      const emailContent = method === 'pickup'
        ? `<p>Your food is ready to be picked up. Please visit our restaurant to collect your order.</p>`
        : `<p>Your food is ready to be delivered. It will be on its way shortly to the address provided.</p>`;

      const emailSubject = `Your Order #${orderId} is Ready`;

      const emailHtml = readTemplate('order-ready.html', { customer_name : customer_name, order_id : orderId, email_content : emailContent });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customer_email,
        subject: emailSubject,
        html: emailHtml,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Failed to send email:', error);
          Discord.sendErrorToDiscord("(ORDER - editOrder - mail) " + error); // Send the error to Discord
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    // If the status is "cancelled", send a cancellation email to the customer
    if (status === 'cancelled') {
      const emailSubject = `Your Order #${orderId} has been Cancelled`;

      const emailHtml = readTemplate('order-cancelled.html', { customer_name : customer_name, order_id : orderId});

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customer_email,
        subject: emailSubject,
        html: emailHtml,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Failed to send cancellation email:', error);
          Discord.sendErrorToDiscord("(ORDER - editOrder - mail) " + error); // Send the error to Discord
        } else {
          console.log('Cancellation email sent:', info.response);
        }
      });
    }

    res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
  } catch (error) {
    console.error(error);
    Discord.sendErrorToDiscord("(ORDER - editOrder) " + error); // Send the error to Discord
    res.status(500).json({ message: 'Failed to update order' });
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


  // Create the HTML content for the email
  let itemsTable = '';
  order.items.forEach((item) => {
    itemsTable += `
      <tr>
        <td>${item.details ? item.details.name : 'N/A'}</td>
        <td>${item.quantity}</td>
        <td>${parseFloat(item.price).toFixed(2)}€</td>
        <td>${(item.quantity * parseFloat(item.price)).toFixed(2)}€</td>
      </tr>
    `;
  });

  const htmlContent = `
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
                background-color: #0D0D0D; /* Dark background */
                line-height: 1.6;
                padding: 20px;
            }

            /* Container */
            .container {
                background-color: #1C1C1C;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                color: white;
            }

            /* Header (Logo Section) */
            .header {
                text-align: center;
                margin-bottom: 30px;
            }

            .header img {
                max-width: 150px; /* Adjust size of your logo */
                margin-bottom: 20px;
            }

            h1 {
                font-size: 2.5rem;
                color: #F7B41A;
                text-align: center;
                margin-bottom: 20px;
            }

            h3 {
                font-size: 1.5rem;
                color: #F7B41A;
                margin-top: 20px;
                margin-bottom: 10px;
            }

            p {
                font-size: 1.1rem;
                margin-bottom: 15px;
                color: white;
            }

            .highlight {
                color: #F7B41A;
                font-weight: bold;
            }

            .total-price {
                font-size: 1.5rem;
                font-weight: bold;
                color: #F7B41A;
            }

            .footer {
                text-align: center;
                font-size: 0.9rem;
                color: #F7B41A;
                margin-top: 30px;
            }

            a {
                color: #F7B41A;
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s ease;
            }

            a:hover {
                color: #FFB84D;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }

            th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #F7B41A;
            }

            th {
                background-color: #333;
            }

            /* Responsive Design for Small Screens */
            @media screen and (max-width: 600px) {
                .container {
                    padding: 20px;
                }

                h1 {
                    font-size: 2rem;
                }

                h3 {
                    font-size: 1.3rem;
                }

                p {
                    font-size: 1rem;
                }

                .total-price {
                    font-size: 1.2rem;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Logo Section -->
            <div class="header">
                <img src="https://users.metropolia.fi/~quangth/restaurant/images/logo_trimmed.png" alt="Company Logo"> <!-- Replace with your logo path -->
            </div>
            
            <h1>Order Confirmation</h1>
            <p>Dear <span class="highlight">${order.customer_name}</span>,</p>
            <p>Thank you for your order! Your order has been successfully received. Here are the details:</p>

            <h3>Order Information</h3>
            <p><strong>Order ID:</strong> ${order.order_id}</p>
            <p><strong>Order Created At:</strong> ${new Date(order.created_at).toLocaleString('fi')}</p>
            <p><strong>Method:</strong> ${order.method.charAt(0).toUpperCase() + order.method.slice(1)}</p>

            ${order.method === 'delivery' ? `
              <div class="address">
                <h3>Delivery Address</h3>
                <p><strong>${order.address.street}</p>
                <p><strong>${order.address.postalCode} ${order.address.city}</p>
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
                <p><strong>Scheduled Food Ready:</strong> ${new Date(scheduledTime).toLocaleString('fi-FI')}</p>
            </div>

            <h3 style="margin-top:50px">Total Price</h3>
            <p class="total-price">${totalPrice.toFixed(2)}€</p>
            <p>Payment will be made at the time of receiving your order. Thank you</p>

            <p style="margin-top: 50px; text-align: center;">If you have any questions, feel free to <a href="mailto:burgersinhelsinki@gmail.com">contact us via email</p></a>

            <div class="footer">
                <p>Best regards,</p>
                <p>&copy; 2025 <a href="https://users.metropolia.fi/~quangth/restaurant/">Burger Company</a>. All rights reserved.</p>
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
        Discord.sendErrorToDiscord("ORDER - sendOrderConfirmationEmail" + error); // Send the error to Discord
        return reject(error); // If there is an error, reject the promise
      }
      resolve(info); // If successful, resolve the promise
    });
  });
};




// Add a new endpoint to get orders for a specific user
const getOrdersByUser = async (req, res) => {
  const { userId } = req.params;
  const requestedUser = req.user; // Assuming the user making the request is in req.user

  try {
    // Check if the requested user is the same as the logged-in user or an admin
    if (requestedUser.role !== 'admin' && requestedUser.userId !== parseInt(userId, 10)) {
      return res.status(403).json({ message: 'You do not have permission to access these orders' });
    }

    // Fetch all orders for the specific user
    const orders = await getAllOrders(req.isAdmin);

    // Filter orders by userId
    const userOrders = orders.filter(order => order.user_id === parseInt(userId, 10));

    // If no orders are found, return an empty array
    if (userOrders.length === 0) {
      return res.status(200).json([]);
    }

    // Enrich each order with item details
    const enrichedOrders = await Promise.all(
      userOrders.map(async (order) => {
        const enrichedOrder = await enrichOrderItems(order.order_id, req.isAdmin);
        return enrichedOrder;
      })
    );

    // Return the enriched orders
    res.status(200).json(enrichedOrders);
  } catch (error) {
    console.error(error);
    Discord.sendErrorToDiscord("(ORDER - getOrdersByUser) " + error); // Send the error to Discord
    res.status(500).json({ message: 'Failed to retrieve user orders' });
  }
};


module.exports = { createNewOrder, getOrders, getOrder, editOrder, getOrdersByUser };
