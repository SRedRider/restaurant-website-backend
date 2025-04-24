import { expect } from '@jest/globals';
import request from 'supertest';

const getMeals = async (url) => {
    const response = await request(url)
        .get('/api/v1/meals/')
        .expect(200); // Expecting HTTP 200 OK

    const result = response.body;
    expect(result).toBeInstanceOf(Array);

    result.forEach((item) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('hamburger_id');
        expect(item).toHaveProperty("wrap_id");
        expect(item).toHaveProperty('chicken_burger_id');
        expect(item).toHaveProperty('vegan_id');
        expect(item).toHaveProperty('side_id');
        expect(item).toHaveProperty('breakfast_id');
        expect(item).toHaveProperty('dessert_id');
        expect(item).toHaveProperty('drink_id');
        expect(item).toHaveProperty('image_url');
        expect(item).toHaveProperty('created_at');
    });

    return result;
};

const getOneMeal = async (url, id) => {
    const response = await request(url)
        .get(`/api/v1/meals/${id}`)
        .expect(200); // Expecting HTTP 200 OK

    const result = response.body;
    expect(result).toHaveProperty('id', id);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('price');
    expect(result).toHaveProperty('hamburger_id');
    expect(result).toHaveProperty("wrap_id");
    expect(result).toHaveProperty('chicken_burger_id');
    expect(result).toHaveProperty('vegan_id');
    expect(result).toHaveProperty('side_id');
    expect(result).toHaveProperty('breakfast_id');
    expect(result).toHaveProperty('dessert_id');
    expect(result).toHaveProperty('drink_id');
    expect(result).toHaveProperty('image_url');
    expect(result).toHaveProperty('created_at');

    return result;
}

const createMeal = async (url, newMeal) => {
    return new Promise((resolve, reject) => {
        request(url)
            .post('/api/v1/meals/')
            .send(newMeal)
            .expect(201) // Expecting HTTP 201 Created
            .end((err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const result = response.body;
                    expect(result).toHaveProperty('id');
                    expect(result).toHaveProperty('name', newMeal.name);
                    expect(result).toHaveProperty('description', newMeal.description);
                    expect(result).toHaveProperty('price', newMeal.price);
                    resolve(result);
                }
            });
    });
};

// PUT Meal
const putMeal = async (url, mealId, updatedMeal) => {
    return new Promise((resolve, reject) => {
        request(url)
            .put(`/api/v1/meals/${mealId}`)
            .set('Content-Type', 'application/json')
            .send(updatedMeal)
            .expect(200, (err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const result = response.body;
                    expect(result.message).toBe('Meal updated successfully');
                    expect(result.id).toBe(mealId);
                    resolve(result);
                }
            });
    });
};

// DELETE Meal
const deleteMeal = async (url, mealId) => {
    return new Promise((resolve, reject) => {
        request(url)
            .delete(`/api/v1/meals/${mealId}`)
            .expect(200)
            .end((err, response) => {
                if (err) {
                    reject(err);
                } else {
                    const result = response.body;
                    expect(result.message).toBe('Meal deleted successfully');
                    expect(result.id).toBe(mealId);
                    resolve(result);
                }
            });
    });
};

export {
    getMeals,
    getOneMeal,
    createMeal,
    putMeal,
    deleteMeal,
}