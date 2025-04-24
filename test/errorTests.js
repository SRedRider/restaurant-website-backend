import request from 'supertest';
import { expect } from '@jest/globals';

// Test for a random URL, should return 404
const getNotFound = (baseUrl) => {
    return request(baseUrl)
        .get('/what-is-this')
        .expect(404)
        .then((response) => response.body);
};

// Test for a student not found, should return 404
const getSingleStudentError = (baseUrl, studentId) => {
    return request(baseUrl)
        .get(`/api/v1/students/${studentId}`)
        .expect(404)
        .then((response) => response.body);
};

// Test for missing file when adding a student, should return 400 with correct error message
const postStudentFileError = (baseUrl, student) => {
    return request(baseUrl)
        .post('/api/v1/students')
        .set('Content-Type', 'multipart/form-data')
        .field('student_name', student.name)
        .field('birthdate', student.birthdate)
        .expect(400)
        .then((response) => {
            expect(response.body.message).toBe('file not valid');
            return response.body;
        });
};

// Test for missing student_name when adding a student, should return 400 with correct error message
const postStudentNameError = (baseUrl, student) => {
    return request(baseUrl)
        .post('/api/v1/students')
        .set('Content-Type', 'multipart/form-data')
        .attach('image', student.image)
        .field('birthdate', student.birthdate)
        .expect(400)
        .then((response) => {
            expect(response.body.message).toBe('Invalid value: student_name');
            return response.body;
        });
};

// Test for file not found, should return 404
const fileNotFoundError = (baseUrl, filename) => {
    return request(baseUrl)
        .get(`/uploads/${filename}`)
        .expect(404)
        .then((response) => response.body);
};

export {
    getNotFound,
    getSingleStudentError,
    postStudentFileError,
    postStudentNameError,
    fileNotFoundError,
};