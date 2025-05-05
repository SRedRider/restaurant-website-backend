const request = require('supertest');
const app = require('../src/app.js');

describe('Restaurant API v1', () => {
    it('should create a user', async () => {
        const response = await request(app)
            .post('/api/v1/register')
            .send({
                email: 'testing@testing.com',
                name: 'John Doe',
                password: 'password123',
                retype_password: 'password123',
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty(
            'message',
            'Registration successful! Please check your email to verify your account.'
        );
    });

    it('should add a favourite item', async () => {
        const response = await request(app)
            .post('/api/v1/favourites')
            .send({
                itemId: 123,
                type: 'item',
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Favourite added successfully.');
        expect(response.body).toHaveProperty('favouriteId');
    });

    it('should return 400 for invalid item ID or type', async () => {
        const response = await request(app)
            .post('/api/v1/favourites')
            .send({
                itemId: 'invalid',
                type: 'unknown',
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    it('should return 404 if the item does not exist', async () => {
        const response = await request(app)
            .post('/api/v1/favourites')
            .send({
                itemId: 9999, // Non-existent item ID
                type: 'item',
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Item does not exist.');
    });

    it('should return 500 for server errors', async () => {
        const response = await request(app)
            .post('/api/v1/favourites')
            .send({
                itemId: 123,
                type: 'item',
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        // Simulate server error
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Failed to add favourite.');
    });

    it('should create a new order', async () => {
        const response = await request(app)
            .post('/api/v1/orders')
            .send({
                user_id: 1,
                customer_name: 'John Doe',
                customer_phone: '1234567890',
                customer_email: 'johndoe@example.com',
                items: [
                    { id: 101, quantity: 2, price: 10.5, type: 'item' },
                    { id: 102, quantity: 1, price: 20.0, type: 'meal' }
                ],
                method: 'delivery',
                address: {
                    street: '123 Main St',
                    city: 'Sample City',
                    postalCode: '12345'
                },
                scheduled_time: '2023-10-01T12:00:00Z',
                notes: 'Leave at the door',
                total_price: 41.0
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Order created successfully');
        expect(response.body).toHaveProperty('order_id');
        expect(response.body).toHaveProperty('order');
    });

    it('should return 400 for missing or invalid fields', async () => {
        const response = await request(app)
            .post('/api/v1/orders')
            .send({
                user_id: 1,
                customer_name: '',
                items: [],
                total_price: 0
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Missing or invalid fields.');
    });

    it('should return 400 for total price mismatch', async () => {
        const response = await request(app)
            .post('/api/v1/orders')
            .send({
                user_id: 1,
                customer_name: 'John Doe',
                customer_phone: '0401234567',
                customer_email: 'johndoe@example.com',
                items: [
                    { id: 101, quantity: 2, price: 10.5, type: 'item' },
                    { id: 102, quantity: 1, price: 20.0, type: 'meal' }
                ],
                method: 'delivery',
                address: {
                    street: '123 Main St',
                    city: 'Sample City',
                    postalCode: '12345'
                },
                scheduled_time: '2023-10-01T12:00:00Z',
                notes: 'Leave at the door',
                total_price: 50.0 // Incorrect total price
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Total price mismatch.');
    });

    it('should return 500 for server errors', async () => {
        const response = await request(app)
            .post('/api/v1/orders')
            .send({
                user_id: 1,
                customer_name: 'John Doe',
                customer_phone: '1234567890',
                customer_email: 'johndoe@example.com',
                items: [
                    { id: 101, quantity: 2, price: 10.5, type: 'item' }
                ],
                method: 'delivery',
                address: {
                    street: '123 Main St',
                    city: 'Sample City',
                    postalCode: '12345'
                },
                scheduled_time: '2023-10-01T12:00:00Z',
                notes: 'Leave at the door',
                total_price: 21.0
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k'); // Replace with a valid token

        // Simulate server error
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Failed to create order.');
    });
});