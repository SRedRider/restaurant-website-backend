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

const getOneItem = async (url, id) => {
    const response = await request(url)
        .get(`/api/v1/items/${id}`)
        .expect(200); // Expecting HTTP 200 OK

    const result = response.body;
    expect(result).toHaveProperty('id', id);
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('ingredients');
    expect(result).toHaveProperty('allergens');
    expect(result).toHaveProperty('size');
    expect(result).toHaveProperty('price');
    expect(result).toHaveProperty('image_url');
    expect(result).toHaveProperty('stock');
    expect(result).toHaveProperty('visible');
    expect(result).toHaveProperty('created_at');

    return result;
}


const postItem = async (url, newItem) => {
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
    getOneItem,
    postItem,
}