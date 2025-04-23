import { expect } from '@jest/globals';
import request from 'supertest';

const getOrders = async (url) => {
    const response = await request(url)
        .get('/api/v1/orders/')
        .expect(200); // Expecting HTTP 200 OK

    const result = response.body;
    expect(result).toBeInstanceOf(Array);

    result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('user_id');
        expect(item).toHaveProperty('order_id');
        expect(item).toHaveProperty('customer_name');
        expect(item).toHaveProperty('customer_phone');
        expect(item).toHaveProperty("items");
        expect(item).toHaveProperty('method');
        expect(item).toHaveProperty('vegan_id');
        expect(item).toHaveProperty('address');
        expect(item).toHaveProperty('scheduled_time');
        expect(item).toHaveProperty('notes');
        expect(item).toHaveProperty('total_price');
        expect(item).toHaveProperty('status');
        expect(item).toHaveProperty('created_at');
    });

    return result;
};

const createOrder = async (url, newOrder) => {
    return new Promise((resolve, reject) => {
        request(url)
            .post('/api/v1/orders/')
            .send(newMeal)
            .expect(201) // Expecting HTTP 201 Created
            .end((err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const result = response.body;
                    expect(result).toHaveProperty('id');
                    expect(result).toHaveProperty('customer_name', newOrder.name);
                    expect(result).toHaveProperty('items', newOrder.description);
                    expect(result).toHaveProperty('total_price', newOrder.price);
                    resolve(result);
                }
            });
    });
};