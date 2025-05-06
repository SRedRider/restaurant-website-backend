# API Documentation

This document provides a comprehensive overview of all the API endpoints available in the Burger Company backend. Each endpoint includes details about the HTTP method, URL, required parameters, authentication requirements, and possible responses.

---

# API Base URL

The base URL for all API endpoints is:

```
https://10.120.32.59/app
```

Use this base URL to access the API routes described in the documentation.

---

## Authentication Routes

### Register User
**POST** `/api/v1/register`

**Description:** Register a new user.

**Request Body:**
```json
{
  "email": "string", // required
  "name": "string", // required
  "password": "string", // required
  "retype_password": "string" // required
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Registration successful! Please check your email to verify your account."
  }
  ```
- **400 Bad Request:**
  - Email already in use.
  - Passwords do not match.
  - Invalid email format.

**Authentication:** None

---

### Login User
**POST** `/api/v1/login`

**Description:** Log in an existing user.

**Request Body:**
```json
{
  "email": "string", // required
  "password": "string" // required
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Login successful",
    "token": "string",
    "data": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- **400 Bad Request:**
  - Email does not exist.
  - Invalid email or password.

**Authentication:** None

---

### Verify Email
**GET** `/api/v1/verify`

**Description:** Verify a user's email address.

**Query Parameters:**
- `token` (string): Verification token sent to the user's email. // required

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Your email has been successfully verified."
  }
  ```
- **400 Bad Request:**
  - Invalid or expired verification token.

**Authentication:** None

---

### Forgot Password
**POST** `/api/v1/forgot-password`

**Description:** Request a password reset link.

**Request Body:**
```json
{
  "email": "string" // required
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Password reset link has been sent to your email."
  }
  ```
- **400 Bad Request:**
  - Email not found.
  - Account is disabled.
  - Email not verified.

**Authentication:** None

---

### Reset Password
**POST** `/api/v1/reset-password`

**Description:** Reset a user's password.

**Query Parameters:**
- `token` (string): Password reset token sent to the user's email. // required

**Request Body:**
```json
{
  "newPassword": "string", // required
  "retypePassword": "string" // required
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Your password has been successfully reset."
  }
  ```
- **400 Bad Request:**
  - Invalid or expired token.
  - Passwords do not match.
  - Password must be at least 6 characters long.

**Authentication:** None

---

### Delete User
**DELETE** `/api/v1/users/:id`

**Description:** Delete a user by their ID.

**Path Parameters:**
- `id` (number): User ID. // required

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "User deleted successfully."
  }
  ```
- **404 Not Found:**
  - User not found.
- **500 Internal Server Error:**
  - Failed to delete user.

**Authentication:** Admin

---

## Favourites Routes

### Add Favourite Item
**POST** `/api/v1/favourites`

**Description:** Add an item or meal to the user's favourites.
The `type` field in the favourites API can have one of the following values:

- **item**: Refers to a single menu item.
- **meal**: Refers to a meal that includes multiple items.

**Request Body:**
```json
{
  "itemId": "number", // required
  "type": "string" // required, either "item" or "meal"
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Favourite added successfully.",
    "favouriteId": "number"
  }
  ```
- **400 Bad Request:**
  - Invalid item ID or type.
  - This item is already in your favourites.
- **404 Not Found:**
  - Item does not exist.
- **500 Internal Server Error:**
  - Failed to add favourite.

**Authentication:** User or Admin

---

### Remove Favourite Item
**DELETE** `/api/v1/favourites/:id`

**Description:** Remove a favourite item or meal by its ID.

**Path Parameters:**
- `id` (number): Favourite ID. // required

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Favourite item deleted successfully."
  }
  ```
- **404 Not Found:**
  - Favourite item not found.
- **500 Internal Server Error:**
  - Failed to delete favourite item.

**Authentication:** User or Admin

---

### Get All Favourite Items
**GET** `/api/v1/favourites`

**Description:** Retrieve all favourite items or meals for the logged-in user.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "id": "number",
      "item_id": "number",
      "type": "string" // Either "item" or "meal"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve favourites.

**Authentication:** User or Admin

---

## Reservation Routes

### Book a Reservation
**POST** `/api/v1/reservations`

**Description:** Book a new reservation.

**Request Body:**
```json
{
  "date": "string", // required
  "time": "string", // required
  "guest_count": "number", // required
  "name": "string", // required
  "phone": "string", // required
  "email": "string", // required
  "notes": "string" // optional
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "success": true,
    "reservationId": "number",
    "allocatedTables": ["string"]
  }
  ```
- **400 Bad Request:**
  - Missing required fields.
  - Invalid phone number format.
  - Invalid email format.
  - Invalid number of guests.

**Authentication:** None

---

### Get All Reservations
**GET** `/api/v1/reservations`

**Description:** Retrieve all reservations.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "reservation_id": "number",
      "name": "string",
      "phone": "string",
      "email": "string",
      "guest_count": "number",
      "date": "string",
      "time": "string",
      "notes": "string",
      "allocated_tables": "string"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Error fetching reservations.

**Authentication:** Admin

---

### Get Available Days
**GET** `/api/v1/reservations/available-days`

**Description:** Fetch days with available or unavailable chairs.

**Responses:**
- **200 OK:**
  ```json
  {
    "data": [
      {
        "date": "string",
        "remainingChairs": "number",
        "allocatedTables": "string",
        "status": "string"
      }
    ]
  }
  ```
- **500 Internal Server Error:**
  - Error fetching available days.

**Authentication:** None

---

### Get Reservation by ID
**GET** `/api/v1/reservations/:id`

**Description:** Retrieve a reservation by its ID.

**Path Parameters:**
- `id` (number): Reservation ID. // required

**Responses:**
- **200 OK:**
  ```json
  {
    "reservation_id": "number",
    "name": "string",
    "phone": "string",
    "email": "string",
    "guest_count": "number",
    "date": "string",
    "time": "string",
    "notes": "string",
    "allocated_tables": "string"
  }
  ```
- **404 Not Found:**
  - Reservation not found.
- **500 Internal Server Error:**
  - Error fetching reservation.

**Authentication:** Admin

---

### Update Reservation
**PUT** `/api/v1/reservations/:id`

**Description:** Update an existing reservation.

**Path Parameters:**
- `id` (number): Reservation ID.

**Request Body:**
```json
{
  "date": "string",
  "time": "string",
  "guest_count": "number",
  "name": "string",
  "phone": "string",
  "email": "string",
  "notes": "string"
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "success": true,
    "message": "Reservation updated successfully."
  }
  ```
- **400 Bad Request:**
  - Missing required fields.
- **500 Internal Server Error:**
  - Error updating reservation.

**Authentication:** Admin

---

### Delete Reservation
**DELETE** `/api/v1/reservations/:id`

**Description:** Delete a reservation by its ID.

**Path Parameters:**
- `id` (number): Reservation ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "success": true,
    "message": "Reservation deleted successfully."
  }
  ```
- **404 Not Found:**
  - Reservation not found.
- **500 Internal Server Error:**
  - Error deleting reservation.

**Authentication:** Admin

---

## Orders Routes

### Create a New Order
**POST** `/api/v1/orders`

**Description:** Create a new order.

**Request Body:**
```json
{
  "user_id": "number", // optional
  "customer_name": "string", // required
  "customer_phone": "string", // required
  "customer_email": "string", // required
  "items": [ // required
    {
      "id": "number", // required
      "quantity": "number",
      "price": "number",
      "type": "string" // required, either "item" or "meal"
    }
  ],
  "method": "string", // required
  "address": { // required if method is "delivery"
    "street": "string", // required
    "city": "string", // required
    "postalCode": "string" // required
  },
  "scheduled_time": "string", // required - "Now" or DateTime
  "notes": "string", // optional
  "total_price": "number" // required
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Order created successfully",
    "order_id": "number",
    "order": { ...orderDetails }
  }
  ```
- **400 Bad Request:**
  - Missing or invalid fields.
  - Total price mismatch.
- **500 Internal Server Error:**
  - Failed to create order.

**Authentication:** User or Admin

---

### Get All Orders
**GET** `/api/v1/orders`

**Description:** Retrieve all orders.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "order_id": "number",
      "customer_name": "string",
      "items": [ ...itemsDetails ],
      "total_price": "number",
      "status": "string"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve orders.

**Authentication:** Admin

---

### Get Order by ID
**GET** `/api/v1/orders/:orderId`

**Description:** Retrieve a specific order by its ID.

**Path Parameters:**
- `orderId` (number): Order ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "order_id": "number",
    "customer_name": "string",
    "items": [ ...itemsDetails ],
    "total_price": "number",
    "status": "string"
  }
  ```
- **404 Not Found:**
  - Order not found.
- **403 Forbidden:**
  - Unauthorized access.
- **500 Internal Server Error:**
  - Failed to retrieve order.

**Authentication:** User or Admin

---

### Update Order
**PUT** `/api/v1/orders/:orderId`

**Description:** Update an existing order.

**Path Parameters:**
- `orderId` (number): Order ID.

**Request Body:**
```json
{
  "customer_name": "string",
  "items": [ ...itemsDetails ],
  "total_price": "number",
  "status": "string"
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Order updated successfully",
    "order": { ...updatedOrderDetails }
  }
  ```
- **404 Not Found:**
  - Order not found.
- **403 Forbidden:**
  - Unauthorized access.
- **500 Internal Server Error:**
  - Failed to update order.

**Authentication:** User or Admin

---

### Delete Order
**DELETE** `/api/v1/orders/:orderId`

**Description:** Delete an order by its ID.

**Path Parameters:**
- `orderId` (number): Order ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Order deleted successfully"
  }
  ```
- **404 Not Found:**
  - Order not found.
- **500 Internal Server Error:**
  - Failed to delete order.

**Authentication:** Admin

---

## Items Routes

### Add a New Item
**POST** `/api/v1/items`

**Description:** Add a new item to the menu.

**Request Body:**
```json
{
  "category": "string", // required
  "name": "string", // required
  "description": "string", // required
  "ingredients": "string", // required
  "allergens": "string", // optional
  "size": "string", // optional
  "price": "number", // required
  "image_url": "string", // required
  "stock": "string", // required, either "yes" or "no"
  "visible": "string" // required, either "yes" or "no"
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Item added successfully",
    "id": "number",
    "image_url": "string"
  }
  ```
- **400 Bad Request:**
  - Missing or invalid fields.
- **500 Internal Server Error:**
  - Failed to add item.

**Authentication:** Admin

---

### Get All Items
**GET** `/api/v1/items`

**Description:** Retrieve all items.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "price": "number",
      "type": "item"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve items.

**Authentication:** None

---

### Get Item by ID
**GET** `/api/v1/items/:id`

**Description:** Retrieve a specific item by its ID.

**Path Parameters:**
- `id` (number): Item ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "id": "number",
    "name": "string",
    "price": "number",
    "type": "item"
  }
  ```
- **404 Not Found:**
  - Item not found.
- **500 Internal Server Error:**
  - Failed to retrieve item.

**Authentication:** None

---

### Update Item
**PUT** `/api/v1/items/:id`

**Description:** Update an existing item.

**Path Parameters:**
- `id` (number): Item ID.

**Request Body:**
```json
{
  "category": "string",
  "name": "string",
  "description": "string",
  "ingredients": "string",
  "allergens": "string",
  "size": "string",
  "price": "number",
  "stock": "string",
  "visible": "string"
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Item updated successfully"
  }
  ```
- **404 Not Found:**
  - Item not found.
- **500 Internal Server Error:**
  - Failed to update item.

**Authentication:** Admin

---

### Delete Item
**DELETE** `/api/v1/items/:id`

**Description:** Delete an item by its ID.

**Path Parameters:**
- `id` (number): Item ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Item deleted successfully"
  }
  ```
- **404 Not Found:**
  - Item not found.
- **500 Internal Server Error:**
  - Failed to delete item.

**Authentication:** Admin

---

## Meals Routes

### Add a New Meal
**POST** `/api/v1/meals`

**Description:** Add a new meal to the menu.

**Request Body:**
```json
{
  "name": "string", // required
  "description": "string", // required
  "price": "number", // required
  "image_url": "string", // required
  "visible": "string" // required, either "yes" or "no"
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Meal added successfully",
    "id": "number",
    "image_url": "string"
  }
  ```
- **400 Bad Request:**
  - Missing or invalid fields.
- **500 Internal Server Error:**
  - Failed to add meal.

**Authentication:** Admin

---

### Get All Meals
**GET** `/api/v1/meals`

**Description:** Retrieve all meals.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "id": "number",
      "name": "string",
      "price": "number",
      "type": "meal"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve meals.

**Authentication:** None

---

### Get Meal by ID
**GET** `/api/v1/meals/:id`

**Description:** Retrieve a specific meal by its ID.

**Path Parameters:**
- `id` (number): Meal ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "id": "number",
    "name": "string",
    "price": "number",
    "type": "meal"
  }
  ```
- **404 Not Found:**
  - Meal not found.
- **500 Internal Server Error:**
  - Failed to retrieve meal.

**Authentication:** None

---

### Update Meal
**PUT** `/api/v1/meals/:id`

**Description:** Update an existing meal.

**Path Parameters:**
- `id` (number): Meal ID.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "item_ids": {
    "hamburger_id": "number",
    "wrap_id": "number",
    "side_id": "number"
  },
  "visible": "string"
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Meal updated successfully"
  }
  ```
- **404 Not Found:**
  - Meal not found.
- **500 Internal Server Error:**
  - Failed to update meal.

**Authentication:** Admin

---

### Delete Meal
**DELETE** `/api/v1/meals/:id`

**Description:** Delete a meal by its ID.

**Path Parameters:**
- `id` (number): Meal ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Meal deleted successfully"
  }
  ```
- **404 Not Found:**
  - Meal not found.
- **500 Internal Server Error:**
  - Failed to delete meal.

**Authentication:** Admin

---

## Announcements Routes

### Add a New Announcement
**POST** `/api/v1/announcements`

**Description:** Add a new announcement.

**Request Body:**
```json
{
  "title": "string", // required
  "content": "string", // required
  "image_url": "string", // required
  "visible": "string" // required, either "yes" or "no"
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Announcement added successfully",
    "image_url": "string"
  }
  ```
- **400 Bad Request:**
  - Missing or invalid fields.
- **500 Internal Server Error:**
  - Failed to add announcement.

**Authentication:** Admin

---

### Get All Announcements
**GET** `/api/v1/announcements`

**Description:** Retrieve all announcements.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "id": "number",
      "title": "string",
      "content": "string",
      "visible": "string"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve announcements.

**Authentication:** None

---

### Get Announcement by ID
**GET** `/api/v1/announcements/:id`

**Description:** Retrieve a specific announcement by its ID.

**Path Parameters:**
- `id` (number): Announcement ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "id": "number",
    "title": "string",
    "content": "string",
    "visible": "string"
  }
  ```
- **404 Not Found:**
  - Announcement not found.
- **500 Internal Server Error:**
  - Failed to retrieve announcement.

**Authentication:** None

---

### Update Announcement
**PUT** `/api/v1/announcements/:id`

**Description:** Update an existing announcement.

**Path Parameters:**
- `id` (number): Announcement ID.

**Request Body:**
```json
{
  "title": "string",
  "content": "string",
  "visible": "string"
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Announcement updated successfully"
  }
  ```
- **404 Not Found:**
  - Announcement not found.
- **500 Internal Server Error:**
  - Failed to update announcement.

**Authentication:** Admin

---

### Delete Announcement
**DELETE** `/api/v1/announcements/:id`

**Description:** Delete an announcement by its ID.

**Path Parameters:**
- `id` (number): Announcement ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Announcement deleted successfully"
  }
  ```
- **404 Not Found:**
  - Announcement not found.
- **500 Internal Server Error:**
  - Failed to delete announcement.

**Authentication:** Admin

---

## Contact Routes

### Add a New Contact
**POST** `/api/v1/contacts`

**Description:** Add a new contact message.

**Request Body:**
```json
{
  "title": "string", // required
  "description": "string" // required
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Contact added successfully",
    "id": "number"
  }
  ```
- **400 Bad Request:**
  - Missing required fields.
- **500 Internal Server Error:**
  - Failed to add contact message.

**Authentication:** User or Admin

---

### Get All Contacts
**GET** `/api/v1/contacts`

**Description:** Retrieve all contact messages.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "id": "number",
      "user_id": "number",
      "title": "string",
      "description": "string",
      "status": "string"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve contact messages.

**Authentication:** Admin

---

### Get User Contacts
**GET** `/api/v1/contacts/user`

**Description:** Retrieve contact messages for the logged-in user.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "id": "number",
      "title": "string",
      "description": "string",
      "status": "string"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve user contact messages.

**Authentication:** User or Admin

---

### Get Contact by ID
**GET** `/api/v1/contacts/:id`

**Description:** Retrieve a specific contact message by its ID.

**Path Parameters:**
- `id` (number): Contact ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "id": "number",
    "user_id": "number",
    "title": "string",
    "description": "string",
    "status": "string"
  }
  ```
- **404 Not Found:**
  - Contact message not found.
- **403 Forbidden:**
  - Access denied.
- **500 Internal Server Error:**
  - Failed to retrieve contact message.

**Authentication:** Admin

---

### Update Contact
**PUT** `/api/v1/contacts/:id`

**Description:** Update an existing contact message.

**Path Parameters:**
- `id` (number): Contact ID.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "status": "string"
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Contact updated successfully"
  }
  ```
- **400 Bad Request:**
  - Missing required fields.
- **404 Not Found:**
  - Contact message not found.
- **403 Forbidden:**
  - Access denied.
- **500 Internal Server Error:**
  - Failed to update contact message.

**Authentication:** Admin

---

## Restaurant Schedule Routes

### Add a New Schedule
**POST** `/api/v1/schedule`

**Description:** Add a new restaurant schedule.

**Request Body:**
```json
{
  "date": "string", // required
  "open_time": "string", // optional
  "close_time": "string", // optional
  "status": "string", // required
  "message": "string" // optional
}
```

**Responses:**
- **201 Created:**
  ```json
  {
    "message": "Schedule added successfully",
    "data": {
      "id": "number",
      "date": "string",
      "open_time": "string",
      "close_time": "string",
      "status": "string",
      "message": "string"
    }
  }
  ```
- **400 Bad Request:**
  - Open time must be before close time.
- **500 Internal Server Error:**
  - Failed to add schedule.

**Authentication:** Admin

---

### Get All Schedules
**GET** `/api/v1/schedule`

**Description:** Retrieve all restaurant schedules.

**Responses:**
- **200 OK:**
  ```json
  [
    {
      "id": "number",
      "date": "string",
      "open_time": "string",
      "close_time": "string",
      "status": "string",
      "message": "string"
    }
  ]
  ```
- **500 Internal Server Error:**
  - Failed to retrieve schedules.

**Authentication:** None

---

### Update Schedule
**PUT** `/api/v1/schedule/:id`

**Description:** Update an existing restaurant schedule.

**Path Parameters:**
- `id` (number): Schedule ID.

**Request Body:**
```json
{
  "date": "string",
  "open_time": "string",
  "close_time": "string",
  "status": "string",
  "message": "string"
}
```

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Schedule updated successfully"
  }
  ```
- **404 Not Found:**
  - Schedule not found.
- **500 Internal Server Error:**
  - Failed to update schedule.

**Authentication:** Admin

---

### Delete Schedule
**DELETE** `/api/v1/schedule/:id`

**Description:** Delete a restaurant schedule by its ID.

**Path Parameters:**
- `id` (number): Schedule ID.

**Responses:**
- **200 OK:**
  ```json
  {
    "message": "Schedule deleted successfully"
  }
  ```
- **404 Not Found:**
  - Schedule not found.
- **500 Internal Server Error:**
  - Failed to delete schedule.

**Authentication:** Admin

---

## Search Routes

### Search All
**GET** `/api/v1/search?query=`

**Description:** Search for announcements, items, and meals.

**Query Parameters:**
- `query (string)`: 

**Responses:**
- **200 OK:**
  ```json
  {
    "announcements": [ ... ],
    "items": [ ... ],
    "meals": [ ... ]
  }
  ```
- **400 Bad Request:**
  - Search query is required.
- **500 Internal Server Error:**
  - Failed to perform search.

**Authentication:** None

