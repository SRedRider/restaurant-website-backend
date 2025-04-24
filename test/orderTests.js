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

const getOneOrder = async (url, id) => {
    const response = await request(url)
        .get(`/api/v1/orders/${id}`)
        .expect(200); // Expecting HTTP 200 OK

    const result = response.body;
    expect(result).toHaveProperty('id', id);
    expect(result).toHaveProperty('user_id');
    expect(result).toHaveProperty('order_id');
    expect(result).toHaveProperty('customer_name');
    expect(result).toHaveProperty('customer_phone');
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty('method');
    expect(result).toHaveProperty('vegan_id');
    expect(result).toHaveProperty('address');
    expect(result).toHaveProperty('scheduled_time');
    expect(result).toHaveProperty('notes');
    expect(result).toHaveProperty('total_price');
    expect(result).toHaveProperty('status');
    expect(result).toHaveProperty('created_at');

    return result;
}

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


// PUT Order
const putOrder = async (url, orderId, updatedOrder) => {
    return new Promise((resolve, reject) => {
        request(url)
            .put(`/api/v1/orders/${orderId}`)
            .set('Content-Type', 'application/json')
            .send(updatedOrder)
            .expect(200, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const result = response.body;
                    expect(result.message).toBe('Order updated successfully');
                    expect(result.id).toBe(orderId);
                    resolve(result);
                }
            });
    });
};

// DELETE Order
const deleteOrder = async (url, orderId) => {
    return new Promise((resolve, reject) => {
        request(url)
            .delete(`/api/v1/orders/${orderId}`)
            .expect(200)
            .end((err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const result = response.body;
                    expect(result.message).toBe('Order deleted successfully');
                    expect(result.id).toBe(orderId);
                    resolve(result);
                }
            });
    });
};

export {
    getOrders,
    createOrder,
    putOrder,
    deleteOrder,
}