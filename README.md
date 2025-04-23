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
```