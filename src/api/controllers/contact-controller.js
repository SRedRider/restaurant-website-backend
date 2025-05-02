const Contact = require('../models/contact-model');
const Discord = require('../../services/discordService');

const addContact = async (req, res) => {
    const { title, description} = req.body;
    const requested = req.user;
    const user_id = requested.userId; // Ensure the user ID is taken from the authenticated user

    if (!user_id || !title || !description) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const contactId = await Contact.createContact(user_id, title, description);
        res.status(201).json({ message: 'Contact added successfully', id: contactId });
        Discord.sendContactToDiscord(`New contact added by user ID ${user_id}: ${title} - ${description}`);
    } catch (error) {
        console.error('Error adding contact:', error);
        Discord.sendErrorToDiscord(`(CONTACT - addContact) ${error.message}`);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

const getAllContacts = async (req, res) => {
    try {
        if (!req.isAdmin) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const contacts = await Contact.getAllContacts();
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        Discord.sendErrorToDiscord(`(CONTACT - getAllContacts) ${error.message}`);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

const getContactById = async (req, res) => {
    const requested = req.user;
    try {
        const contact = await Contact.getContactById(req.params.id);
        if (!contact) return res.status(404).json({ error: 'Contact not found' });

        if (!req.isAdmin && contact.user_id !== requested.userId) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Remove user_id from the response
        const { user_id, ...contactWithoutUserId } = contact;

        res.status(200).json(contactWithoutUserId);
    } catch (error) {
        console.error('Error fetching contact by ID:', error);
        Discord.sendErrorToDiscord(`(CONTACT - getContactById) ${error.message}`);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

const getUserContacts = async (req, res) => {
    const requested = req.user;
    try {
        const userId = requested.userId; // Get the user ID from the authenticated user
        console.log('User ID:', userId); // Debugging line to check the user ID
        const contacts = await Contact.getContactsByUserId(userId);
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching user contacts:', error);
        Discord.sendErrorToDiscord(`(CONTACT - getUserContacts) ${error.message}`);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

module.exports = { addContact, getAllContacts, getContactById, getUserContacts };