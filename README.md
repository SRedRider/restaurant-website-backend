# Burger Company

![Burger Company Logo](https://users.metropolia.fi/~quangth/restaurant/images/logo_trimmed.png)

## Description
This repository contains the backend system for the **Burger Company**. It is designed to manage the restaurant's backend operations and the admin system. The backend provides APIs and services to handle reservations, orders, menus, announcements, and more. It also includes an admin dashboard for efficient management.

---

## Framework
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

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
- **Description**: Sends reservation confirmations and updates via email. This feature ensures that customers receive timely updates about their reservations.
- **Technologies**:
  - **Library**: Nodemailer
  - **Templates**: HTML files in `email-templates/`

### Discord Integration
- **Description**: Notifies staff about reservations and errors via Discord. This feature helps the staff stay informed about important updates and issues.
- **Technologies**:
  - **Library**: Axios for making API requests to Discord's webhook system
  - **Service**: `discordService.js`

---

## API Documentation
📄 For detailed information about the API endpoints and their usage, please refer to the [API Documentation](docs/API.md).

---

## License
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Contact
📧 For any inquiries or support, please contact us at:
- **Email**: burgersinhelsinki@gmail.com
- **Website**: [Burger Company](https://users.metropolia.fi/~quangth/restaurant/)

---

## Website Link
🌐 Visit the live website: [Burger Company](https://users.metropolia.fi/~quangth/restaurant/)