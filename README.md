# Burger Company

<div align="center">
  <img src="https://users.metropolia.fi/~quangth/restaurant/images/logo_trimmed.png" alt="Burger Company Logo">
</div>

## Description
This repository contains the backend system for the **Burger Company**. It is designed to manage the restaurant's backend operations and the admin system. The backend provides APIs and services to handle reservations, orders, menus, announcements, and more.

---

## Framework
<div align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
</div>

The backend is built using **Node.js** with the **Express.js** framework. This combination provides a robust and scalable environment for building RESTful APIs and handling server-side logic efficiently.

---

## Features and Technologies Used

### Reservations Management
- **Description**: Allows users to book, update, and delete table reservations. This feature ensures that customers can reserve tables at their convenience, and staff can manage reservations efficiently.
- **Technologies**:
  - **Database**: SQL (queries in `queries.sql`)
  - **Backend**: Node.js with Express.js
  - **Models**: `reservation-model.js`
  - **Controllers**: `reservation-controller.js`
  - **Routes**: `reservation-route.js`

### Order Management
- **Description**: Enables viewing and updating customer orders. This feature helps staff track and manage customer orders in real-time.
- **Technologies**:
  - **Database**: SQL
  - **Backend**: Node.js with Express.js
  - **Models**: `order-model.js`
  - **Controllers**: `order-controller.js`
  - **Routes**: `order-route.js`

### Menu Management
- **Description**: Facilitates adding, editing, and removing menu items. This feature allows the restaurant to keep its menu up-to-date and manage item availability.
- **Technologies**:
  - **Database**: SQL
  - **Backend**: Node.js with Express.js
  - **Models**: `item-model.js`, `meal-model.js`
  - **Controllers**: `item-controller.js`, `meal-controller.js`
  - **Routes**: `item-route.js`, `meal-route.js`

### Announcements
- **Description**: Allows creating and managing announcements with visibility options. This feature is used to inform customers about special offers, events, or updates.
- **Technologies**:
  - **Database**: SQL
  - **Backend**: Node.js with Express.js
  - **Models**: `annoucement-model.js`
  - **Controllers**: `annoucement-controller.js`
  - **Routes**: `annoucement-route.js`

### Restaurant Schedule
- **Description**: Manages restaurant opening and closing schedules. This feature ensures that customers and staff are aware of the restaurant's operating hours.
- **Technologies**:
  - **Database**: SQL
  - **Backend**: Node.js with Express.js
  - **Models**: `restaurant-schedule-model.js`
  - **Controllers**: `restaurant-schedule-controller.js`
  - **Routes**: `restaurant-route.js`

### User Accounts
- **Description**: Handles user account management and roles. This feature supports user authentication, role-based access, and account management.
- **Technologies**:
  - **Database**: SQL
  - **Backend**: Node.js with Express.js
  - **Models**: `user-model.js`
  - **Middleware**: `auth-middleware.js`
  - **Routes**: `auth-route.js`

### Search Functionality
- **Description**: Provides search capabilities for items, meals, and more. This feature helps users quickly find what they are looking for.
- **Technologies**:
  - **Database**: SQL
  - **Backend**: Node.js with Express.js
  - **Models**: `search-model.js`
  - **Controllers**: `search-controller.js`
  - **Routes**: `search-route.js`

### Contact Form
- **Description**: Handles customer inquiries through a contact form. This feature allows customers to reach out to the restaurant for questions or feedback.
- **Technologies**:
  - **Backend**: Node.js with Express.js
  - **Models**: `contact-model.js`
  - **Controllers**: `contact-controller.js`
  - **Routes**: `contact-route.js`

### Email Notifications
- **Description**: Automatically sends reservation confirmations, order confirmations, and order-ready notifications via email to keep customers informed and up to date.
- **Technologies**:
  - **Library**: Nodemailer
  - **Templates**: HTML files in `email-templates/`

### Discord Integration
- **Description**: Notifies staff about reservations, orders and errors via Discord. This feature helps the staff stay informed about important updates and issues.
- **Technologies**:
  - **Library**: Axios for making API requests to Discord's webhook system
  - **Service**: `discordService.js`

---

## Restaurant Website Backend Setup Guide

Follow these steps to set up your Node.js backend server.

---

## Step 1: Create Your Node Server

Follow the instructions in this document to set up your Node server:  
[Node Server Setup Guide](https://docs.google.com/document/d/1n3A7yqE0Z-NgrSfYF_pwkFv4Oj-W57XaQWxcddcqfEc/edit?tab=t.0#heading=h.y75cpzqs4yla)

---

## Step 2: Clone the Repository

```bash
git clone [your-repo-url]
```

---

## Step 3: Create the `.env` File

Inside the `src` directory, create a `.env` file. Here's an example:

```env
DB_HOST=localhost
DB_USER=name
DB_PASSWORD=password
DB_NAME=restaurant

EMAIL_USER=example-email@gmail.com
EMAIL_PASS=example password

JWT_SECRET="Some secret"

DISCORD_WEBHOOK_URL_REGISTERED_USER=discord webhooks
DISCORD_WEBHOOK_URL_CONTACT=discord webhooks
DISCORD_WEBHOOK_URL_RESERVATION=discord webhooks
DISCORD_WEBHOOK_URL_ORDER=discord webhooks
DISCORD_WEBHOOK_URL_ERROR=discord webhooks
```

---

## Step 4: Install Dependencies

Navigate to the `restaurant-website-backend` directory and run:

```bash
npm install
```

---

## Step 5: Start the Server with PM2

```bash
pm2 start index.js --name [your-name-for-the-api]
```

---

## Step 6: Check for PM2 Errors

Check the process list:

```bash
pm2 list
```

View logs (replace `[your-api-name]` with your PM2 process name):

```bash
pm2 logs [your-api-name]
```

---

## Step 7: Save the PM2 Process

If there are no errors, save the process list:

```bash
pm2 save
```

Congratulations! Your backend server should now be running.

---

## API Documentation
📄 For detailed information about the API endpoints and their usage, please refer to the [API Documentation](https://10.120.32.59/app/).

---

## License
<div align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</div>

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contact
📧 For any inquiries or support, please contact us at:
- **Email**: burgersinhelsinki@gmail.com
- **Website**: [Burger Company](https://10.120.32.59:8000/)

---

## Website Link
🌐 Visit the live website: [Burger Company](https://10.120.32.59:8000/)