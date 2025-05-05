process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const request = require('supertest');
const baseUrl = 'https://10.120.32.59/app/api/v1/';

describe('Restaurant API v1', () => {
    it('should return 200 for all items', async () => {
        const response = await request(baseUrl)
            .get('items');

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('price');
        expect(response.body[0]).toHaveProperty('type');
    });

    it('should create a user', async () => {
        const response = await request(baseUrl)
            .post('register')
            .send({
                email: 'testing1@testing.com',
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

    it('should return 201 for adding a favourite item', async () => {
        const response = await request(baseUrl)
            .post('favourites')
            .send({
                itemId: 28,
                type: 'item',
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Item added to favourites successfully');
    })

    it('should return 400 for invalid item ID or type', async () => {
        const response = await request(baseUrl)
            .post('favourites')
            .send({
                itemId: '28',
                type: 'item',
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    it('should return 404 if the item does not exist', async () => {
        const response = await request(baseUrl)
            .post('favourites')
            .send({
                itemId: 9999, // Non-existent item ID
                type: 'item',
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'Item does not exist.');
    });

    it('should create a new order', async () => {
        const response = await request(baseUrl)
            .post('orders')
            .send({
                user_id: 6,
                customer_name: 'John Doe',
                customer_phone: '0401234567',
                customer_email: 'johndoe@example.com',
                items: [
                    { id: 28, quantity: 1, price: 7.99, type: 'item' },
                ],
                method: 'delivery',
                address: {
                    street: 'Von Daehnin Katu 23 A3',
                    city: 'Helsinki',
                    postalCode: '00790'
                },
                scheduled_time: '2023-10-01T12:00:00Z',
                notes: 'Leave at the door',
                total_price: 7.99
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k');

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Order created successfully');
        expect(response.body).toHaveProperty('order_id');
        expect(response.body).toHaveProperty('order');
    });

    it('should return 400 for missing or invalid fields', async () => {
        const response = await request(baseUrl)
            .post('orders')
            .send({
                user_id: 1,
                customer_name: '',
                items: [],
                total_price: 0
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Customer name is required and must be a non-empty string');
    });

    it('should return 400 for total price mismatch', async () => {
        const response = await request(baseUrl)
            .post('orders')
            .send({
                user_id: 6,
                customer_name: 'John Doe',
                customer_phone: '0401234567',
                customer_email: 'johndoe@example.com',
                items: [
                    { id: 28, quantity: 1, price: 7.99, type: 'item' },
                ],
                method: 'delivery',
                address: {
                    street: 'Von Daehnin Katu 23 A3',
                    city: 'Helsinki',
                    postalCode: '00790'
                },
                scheduled_time: '2023-10-01T12:00:00Z',
                notes: 'Leave at the door',
                total_price: 50.0 // Incorrect total price
            })
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ1MDM5MywiZXhwIjoxNzQ2NDUzOTkzfQ.QMIbHPJxSdjNrBMcWv2uRr-Cg7woiGQi2gWlOm2B-0k');

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Total price mismatch: The calculated total is 7.99, but received 50');
    });

    it('should return 200 for delete account', async () => {
        const response = await request(baseUrl)
            .delete('users/13')
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ3NzM3NiwiZXhwIjoxNzQ2NDgwOTc2fQ.QH5ZMeANshTQcjJ7YDoSh-jTuwVDi0rtwkL7Cm4becI');

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'User deleted successfully.');
    });

    it('should return 404 for non-existent user', async () => {
        const response = await request(baseUrl)
            .delete('users/99999999') // Non-existent user ID
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjYsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0NjQ3NzM3NiwiZXhwIjoxNzQ2NDgwOTc2fQ.QH5ZMeANshTQcjJ7YDoSh-jTuwVDi0rtwkL7Cm4becI');

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User not found or delete failed.');
    });
});