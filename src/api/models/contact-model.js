const db = require('../../utils/database');

const createContact = async (user_id, title, description) => {
    const [result] = await db.query(
        `INSERT INTO contacts (user_id, title, description) VALUES (?, ?, ?)`,
        [user_id, title, description]
    );
    return result.insertId;
};

const getAllContacts = async () => {
    const [rows] = await db.query('SELECT * FROM contacts');
    return rows;
};

const getContactById = async (id) => {
    const [rows] = await db.query('SELECT * FROM contacts WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
};

const getContactsByUserId = async (userId) => {
    const [rows] = await db.query('SELECT * FROM contacts WHERE user_id = ?', [userId]);
    return rows;
};

module.exports = { createContact, getAllContacts, getContactById, getContactsByUserId };