# API Documentation

Base URL: `/api/v1`

---

## 📦 Items

### Create Item  
**POST** `/items/`  
**Authorization:** Required (Admin Only)

#### Request Body
```json
{
  "category": "Beverages",
  "name": "Iced Latte",
  "description": "A chilled coffee drink with milk and ice.",
  "ingredients": "Espresso, Milk, Ice",
  "allergens": "Milk",
  "size": "Medium",
  "price": 3.99,
  "stock": "yes",
  "visible": "no"
}
```

#### Possible Response (Unauthorized)
```json
{
  "message": "Authorization token required"
}
```

---

### Get All Items  
**GET** `/items/`  
**Authorization:** Optional  
- Returns only visible items by default  
- Admins can see all items (including non-visible) if authorized

#### Sample Response
```json
[
  {
    "id": 24,
    "category": "hamburgers",
    "name": "Big Mac",
    "description": "adasdasd",
    "ingredients": "",
    "allergens": null,
    "size": null,
    "price": "12.00",
    "image_url": "/public/uploads/1745334362426-349163308.jpg",
    "stock": "no",
    "visible": "yes",
    "created_at": "2025-04-22 18:06:02"
  },
  {
    "id": 27,
    "category": "hamburgers",
    "name": "Chipotle Mission2",
    "description": "asdasd",
    "ingredients": "asdasd",
    "allergens": "Gluten",
    "size": null,
    "price": "12.00",
    "image_url": "/public/uploads/1745393923721-63244532.jpg",
    "stock": "yes",
    "visible": "yes",
    "created_at": "2025-04-23 10:38:43"
  }
]
```

---

## 🍱 Meals

### Create Meal  
**POST** `/meals/`  
**Authorization:** Required (Admin Only)

#### Request Body
```json
{
  "name": "Classic Meal Deal",
  "description": "A complete meal with a hamburger, fries, and a drink.",
  "price": 9.99,
  "hamburgerId": 1,
  "wrapId": null,
  "chicken_burgerId": null,
  "veganId": null,
  "sideId": 2,
  "breakfastId": null,
  "dessertId": 3,
  "drinkId": 4,
  "visible": "yes"
}
```

#### Possible Response (Unauthorized)
```json
{
  "message": "Authorization token required"
}
```

---

### Get All Meals  
**GET** `/meals/`  
**Authorization:** Optional  
- Returns only visible meals by default  
- Admins can see all meals (including non-visible) if authorized

#### Sample Response
```json
[
  {
    "id": 12,
    "name": "Coca-Cola",
    "description": "asdasd",
    "price": "25.00",
    "hamburger_id": 17,
    "wrap_id": null,
    "chicken_burger_id": null,
    "vegan_id": null,
    "side_id": null,
    "breakfast_id": null,
    "dessert_id": null,
    "drink_id": null,
    "image_url": "/public/uploads/1745347473769-416561554.jpg",
    "stock": "yes",
    "visible": "yes",
    "created_at": "2025-04-22 21:44:33"
  },
  {
    "id": 13,
    "name": "asd",
    "description": "asd",
    "price": "12.00",
    "hamburger_id": null,
    "wrap_id": null,
    "chicken_burger_id": null,
    "vegan_id": null,
    "side_id": null,
    "breakfast_id": null,
    "dessert_id": null,
    "drink_id": null,
    "image_url": "/public/uploads/1745347618725-638437673.jpg",
    "stock": "yes",
    "visible": "yes",
    "created_at": "2025-04-22 21:46:58"
  }
]



Perfect! Here's a complete **README.md** file with full API documentation, including both pickup and delivery request examples — all in a single, clean file for easy copy-paste:

---

```
# 📦 Order API Documentation

API endpoint to create new **pickup** or **delivery** orders.

---

## 🛣️ Endpoint

```
POST /api/v1/orders
```

---

## 📥 Request Body

### Required Fields

| Field             | Type     | Description |
|------------------|----------|-------------|
| `customer_name`  | `string` | Full name of the customer. Cannot be empty. |
| `customer_phone` | `string` | Phone number in Finnish format: `+358XXXXXXXXX` or `0XXXXXXXXX`. |
| `items`          | `array`  | List of ordered items. Each item must include `id`, `quantity`, and `price`. |
| `method`         | `string` | Order method: must be either `"pickup"` or `"delivery"`. |
| `scheduled_time` | `string` | Either `"now"` or a valid ISO 8601 date string (e.g. `"2025-04-23T18:00:00"`). |
| `total_price`    | `number` | Total price of the order. Must match the calculated total from items. |

### Optional Fields

| Field     | Type     | Description |
|-----------|----------|-------------|
| `notes`   | `string` | Additional instructions for the order. |
| `address` | `object` | Required if `method` is `"delivery"`. Includes: `street`, `city`, `postalCode`. |

---

## 📦 Items Format

Each item in the `items` array should be formatted like this:

```json
{
  "id": 3,
  "quantity": 2,
  "price": 12.00
}
```

- `id`: Positive number
- `quantity`: Positive number
- `price`: Positive number

---

## 🏠 Address Format (Required for Delivery)

```json
"address": {
  "street": "Example Street 123",
  "city": "Helsinki",
  "postalCode": "00100"
}
```

---

## 📋 Example Request — Pickup Order

```json
{
  "customer_name": "Jane Smith",
  "customer_phone": "+358501112223",
  "items": [
    {
      "id": 3,
      "quantity": 1,
      "price": 12.00
    },
    {
      "id": 5,
      "quantity": 3,
      "price": 8.50
    }
  ],
  "method": "pickup",
  "scheduled_time": "2025-04-23T18:00:00",
  "notes": "I'll arrive around 6 PM.",
  "total_price": 37.50
}
```

---

## 📋 Example Request — Delivery Order

```json
{
  "customer_name": "Marko Lehtonen",
  "customer_phone": "+358449876543",
  "items": [
    {
      "id": 7,
      "quantity": 2,
      "price": 10.00
    },
    {
      "id": 9,
      "quantity": 1,
      "price": 18.00
    }
  ],
  "method": "delivery",
  "address": {
    "street": "Itäinen Pitkäkatu 4",
    "city": "Turku",
    "postalCode": "20520"
  },
  "scheduled_time": "now",
  "notes": "Call upon arrival.",
  "total_price": 38.00
}
```

---

## ✅ Successful Response

**Status:** `201 Created`

```json
{
  "message": "Order created successfully",
  "order_id": "ORD123456",
  "orderId": 123
}
```

---

## ❌ Error Responses

| Status | Example Message |
|--------|-----------------|
| `400`  | `"Customer name is required and must be a non-empty string"` |
| `400`  | `"Invalid phone number format. Expected Finnish format: +358XXXXXXXXX or 0XXXXXXXXX"` |
| `400`  | `"Items must be an array and cannot be empty"` |
| `400`  | `"Each item must have a valid id"` |
| `400`  | `"Each item must have a valid quantity greater than zero"` |
| `400`  | `"Each item must have a valid price greater than zero"` |
| `400`  | `"Invalid method. It should be either \"pickup\" or \"delivery\""` |
| `400`  | `"Address is required for delivery orders"` |
| `400`  | `"Invalid scheduled_time format. It must be a valid ISO date string or \"now\""` |
| `400`  | `"Total price mismatch: The calculated total is 37.50, but received 40.00"` |
| `500`  | `"Failed to create order"` |

---

## 📌 Notes

- `scheduled_time` accepts `"now"` or a valid ISO date string.
- `total_price` must match the sum of `quantity * price` for each item.
- `address` is **only required** for delivery orders.
- All error responses return JSON with descriptive messages and appropriate HTTP status codes.

---

## Endpoints

### 1. **User Registration**

**POST** `/api/v1/register`

#### Request Body
```json
{
    "email": "johndoe@example.com",
    "name": "John Doe",
    "password": "securePassword123",
    "retype_password": "securePassword123"
}
```

#### Request Parameters
- `email` (string) - The email address of the user. Must be a valid email format.
- `name` (string) - The full name of the user.
- `password` (string) - The password for the user account. Must be at least 6 characters long.
- `retype_password` (string) - The password confirmation. Should match the `password` field.

#### Response
```json
{
    "message": "Registration successful! Please check your email to verify your account."
}
```

#### Error Responses
- **400 Bad Request** - Email already in use.
```json
{
    "message": "Email already in use."
}
```
- **400 Bad Request** - Missing required fields.
```json
{
    "message": "Email, name, and password are required."
}
```
- **400 Bad Request** - Passwords do not match.
```json
{
    "message": "Passwords do not match."
}
```
- **400 Bad Request** - Password too short.
```json
{
    "message": "Password must be at least 6 characters long."
}
```
- **400 Bad Request** - Invalid email format.
```json
{
    "message": "Invalid email format."
}
```

### 2. **User Login**

**POST** `/api/v1/login`

#### Request Body
```json
{
    "email": "johndoe@example.com",
    "password": "securePassword123"
}
```

#### Request Parameters
- `email` (string) - The email address of the user.
- `password` (string) - The password for the user account.

#### Response
```json
{
    "message": "Login successful",
    "token": "TOKEN_HERE"
}
```

#### Error Responses
- **400 Bad Request** - Email does not exist.
```json
{
    "message": "Email does not exist"
}
```
- **400 Bad Request** - Invalid email or password.
```json
{
    "message": "Invalid email or password."
}
```
- **400 Bad Request** - Account not verified or disabled.
```json
{
    "message": "Account is either disabled or not verified."
}
```

## Authentication

The login process returns a JWT (JSON Web Token), which should be included in the `Authorization` header of subsequent API requests to access protected resources.

#### Example:

```bash
Authorization: Bearer TOKEN_HERE
```

### How to Create a Token
The JWT token is generated when a user successfully logs in. It includes the user's ID and role and is valid for 1 hour by default.

---




```