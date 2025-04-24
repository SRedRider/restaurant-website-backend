import app from '../src/app.js';
import * as errorTests from './errorTests.js';
import * as itemTests from './itemTests.js';
import * as mealTests from './mealTests.js';
import * as orderTests from './orderTests.js';
import * as userTests from './userTests.js';
import {describe, expect, it} from "@jest/globals";

describe('Test API version 1.0', () => {
    it('should return 200 for the root URL', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
    });

    it('should return 404 for a random URL', async () => {
        const response = await errorTests.getNotFound(app);
        expect(response.status).toBe(404);
    });

    it('should return 404 for a non-existent student', async () => {
        const response = await errorTests.getSingleStudentError(app, 99999);
        expect(response.status).toBe(404);
    });

    it('should return 400 for missing file when adding a student', async () => {
        const student = {
            name: 'John Doe',
            birthdate: '2000-01-01',
        };
        const response = await errorTests.postStudentFileError(app, student);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('file not valid');
    });

    it('should return 400 for missing student_name when adding a student', async () => {
        const student = {
            image: 'path/to/image.jpg',
            birthdate: '2000-01-01',
        };
        const response = await errorTests.postStudentNameError(app, student);
        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid value: student_name');
    });

    it('should return 404 for a non-existent file', async () => {
        const response = await errorTests.fileNotFoundError(app, 'non_existent_file.jpg');
        expect(response.status).toBe(404);
    });

    it('should return 200 for fetching all items', async () => {
        const items = await itemTests.getItems(app);
        expect(items).toBeInstanceOf(Array);
    });

    it('should return 200 for fetching a single item', async () => {
        const item = await itemTests.getOneItem(app, 1);
        expect(item).toHaveProperty('id', 1);
    });

    it('should return 201 for creating a new item', async () => {
        const newItem = {
            category: 'food',
            name: 'Pizza',
            description: 'Delicious cheese pizza',
            ingredients: 'Cheese, Tomato Sauce, Dough',
            allergens: 'Dairy',
            size: 'Large',
            price: 9.99,
            image_url: 'http://example.com/pizza.jpg',
            stock: 100,
            visible: true,
        };
        const createdItem = await itemTests.postItem(app, newItem);
        expect(createdItem).toHaveProperty('id');
    });

    it('should return 200 for fetching all meals', async () => {
        const meals = await mealTests.getMeals(app);
        expect(meals).toBeInstanceOf(Array);
    });

    it('should return 200 for fetching a single meal', async () => {
        const meal = await mealTests.getOneMeal(app, 1);
        expect(meal).toHaveProperty('id', 1);
    });

    it('should return 201 for creating a new meal', async () => {
        const newMeal = {
            name: 'Pasta',
            description: 'Delicious pasta with tomato sauce',
            price: 8.99,
            hamburger_id: null,
            wrap_id: null,
            chicken_burger_id: null,
            vegan_id: null,
            side_id: null,
            breakfast_id: null,
            dessert_id: null,
            drink_id: null,
            image_url: 'http://example.com/pasta.jpg',
        };
        const createdMeal = await mealTests.createMeal(app, newMeal);
        expect(createdMeal).toHaveProperty('id');
    });

    it('should return 200 for fetching all orders', async () => {
        const orders = await orderTests.getOrders(app);
        expect(orders).toBeInstanceOf(Array);
    });

    it('should return 200 for fetching a single order', async () => {
        const order = await orderTests.getOneOrder(app, 1);
        expect(order).toHaveProperty('id', 1);
    });

    it('should return 201 for creating a new order', async () => {
        const newOrder = {
            user_id: 1,
            order_id: 'ORD123',
            customer_name: 'Jane Doe',
            customer_phone: '1234567890',
            items: ['item1', 'item2'],
            method: 'delivery',
            vegan_id: null,
            address: '123 Main St',
            scheduled_time: '2023-10-01T12:00:00Z',
            notes: 'No onions',
            total_price: 19.99,
            status: 'pending',
        };
        const createdOrder = await orderTests.createOrder(app, newOrder);
        expect(createdOrder).toHaveProperty('id');
    });
});