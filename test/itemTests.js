import { expect } from '@jest/globals';
import request from 'supertest';

const getItems = async (url) => {
    const response = await request(url)
        .get('/api/v1/items/')
        .expect(200); // Expecting HTTP 200 OK

    const result = response.body;
    expect(result).toBeInstanceOf(Array);

    result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('ingredients');
        expect(item).toHaveProperty('allergens');
        expect(item).toHaveProperty('size');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('image_url');
        expect(item).toHaveProperty('stock');
        expect(item).toHaveProperty('visible');
        expect(item).toHaveProperty('created_at');
    });

    return result;
};


const createItem = async (url, newItem) => {
    return new Promise((resolve, reject) => {
        request(url)
            .post('/api/v1/items/')
            .send(newItem)
            .expect(201) // Expecting HTTP 201 Created
            .end((err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const result = response.body;
                    expect(result).toHaveProperty('id');
                    expect(result).toHaveProperty('name', newItem.name);
                    expect(result).toHaveProperty('category', newItem.category);
                    resolve(result);
                }
            });
    });
};

export {
    getItems,
    createItem,
}