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

        if (requested.role !== "admin" && contact.user_id !== requested.userId) {
            console.log(requested.role, contact.user_id, requested.userId);
            return res.status(403).json({ error: 'Access denied' });
        }

        let contactWithoutUserId = contact; // Default to the full contact object
        // Remove user_id from the response
        if (requested.role !== "admin") {
            const { user_id, ...contactWithoutUserId } = contact;
        } else {
            contactWithoutUserId = contact; // Admins can see the user_id
        }

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

const editContact = async (req, res) => {
    const { id } = req.params;
    const { title, description, status } = req.body; // Added 'status' field
    const requested = req.user;

    if (!title || !description || !status) { // Validate 'status' field
        return res.status(400).json({ error: 'Title, description, and status are required' });
    }

    try {
        const contact = await Contact.getContactById(id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        if (requested.role !== "admin") {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await Contact.updateContact(id, title, description, status, requested.userId); // Pass 'status' to updateContact
        if (updated) {
            res.status(200).json({ message: 'Contact updated successfully' });
        } else {
            res.status(500).json({ error: 'Failed to update contact' });
        }
    } catch (error) {
        console.error('Error updating contact:', error);
        Discord.sendErrorToDiscord(`(CONTACT - editContact) ${error.message}`);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};

module.exports = { addContact, getAllContacts, getContactById, getUserContacts, editContact };