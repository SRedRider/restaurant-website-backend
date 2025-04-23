import * as jestGlobals from '@jest/globals';
import app from '../src/app.js';
import { closePool } from '../src/db.js';

import {
    getItems,
    getOneItem,
    postItem,
} from './mealTests';

import {
    getMeals,
    getOneMeal,
    postMeal,
} from './mealTests';

import {
    getOrders,
    getOneOrder,
    postOrder,
} from './orderTests';

const { describe, afterAll } = jestGlobals;

describe('Test API v1', () => {
    // TODO: Close DB connection
    afterAll(async () => {
        await closePool();
    });
});

const item = {
    category: 'wrap',
    name: 'Chicken Wrap',
    description: 'A delicious chicken wrap with fresh vegetables.',
    ingredients: ['chicken', 'lettuce', 'tomato', 'sauce'],
    allergens: ['gluten'],
    size: 'large',
    price: 8.99,
    image_url: 'http://example.com/chicken_wrap.jpg',
    stock: 100,
    visible: true,
};

let testItemId = 0;
let createdItem = 0;