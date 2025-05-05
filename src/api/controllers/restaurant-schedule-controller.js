const restaurantScheduleModel = require('../models/restaurant-schedule-model');
const Discord = require('../../services/discordService');

// Add a new schedule
const addSchedule = async (req, res) => {
    try {
        const { date, open_time, close_time, status, message } = req.body;
        const requested = req.user;
        
        if (open_time && close_time && open_time >= close_time) {
            return res.status(400).json({ message: 'Open time must be before close time.' });
        }
        // Call the model function to add the schedule to the database
        const result = await restaurantScheduleModel.addSchedule(
            date, open_time, close_time, status, message, requested.userId
        );

        res.status(201).json({
            message: 'Schedule added successfully!',
            data: { id: result.insertId, date, open_time, close_time, status, message},
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding schedule', error: error.message });
        console.error('Error adding schedule:', error); // Log the error for debugging
        Discord.sendErrorToDiscord(`(SCHEDULE - addSchedule) ${error}`); // Send error to Discord
    }
};

// Get all schedules sorted by date
const getSchedules = async (req, res) => {
    try {
        // Call the model function to get all schedules
        const schedules = await restaurantScheduleModel.getSchedules(req.isAdmin);

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules', error: error.message });
        console.error('Error fetching schedules:', error); // Log the error for debugging
        Discord.sendErrorToDiscord(`(SCHEDULE - getSchedules) ${error}`); // Send error to Discord
    }
};

// Get a specific schedule by ID (if needed)
const getScheduleById = async (req, res) => {
    try {
        const { id } = req.params;

        // Call the model function to get a specific schedule by ID
        const schedule = await restaurantScheduleModel.getScheduleById(id, req.isAdmin);

        if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.status(200).json(schedule);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedule', error: error.message });
        console.error('Error fetching schedule:', error); // Log the error for debugging
        Discord.sendErrorToDiscord(`(SCHEDULE - getScheduleById) ${error}`); // Send error to Discord
    }
};

// Update an existing schedule
const updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, open_time, close_time, status, message } = req.body;
        const requested = req.user;

        if (open_time && close_time && open_time >= close_time) {
            return res.status(400).json({ message: 'Open time must be before close time.' });
        }
        
        // Call the model function to update the schedule in the database
        console.log(requested.userId, date, open_time, close_time, status, message);
        const result = await restaurantScheduleModel.updateSchedule(
            id, date, open_time, close_time, status, message, requested.userId
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.status(200).json({ message: 'Schedule updated successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating schedule', error: error.message });
        console.error('Error updating schedule:', error); // Log the error for debugging
        Discord.sendErrorToDiscord(`(SCHEDULE - updateSchedule) ${error}`); // Send error to Discord
    }
};

// Delete a schedule
const deleteSchedule = async (req, res) => {
    try {
        const { id } = req.params;

        // Call the model function to delete the schedule from the database
        const result = await restaurantScheduleModel.deleteSchedule(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Schedule not found' });
        }

        res.status(200).json({ message: 'Schedule deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting schedule', error: error.message });
        console.error('Error deleting schedule:', error); // Log the error for debugging
        Discord.sendErrorToDiscord(`(SCHEDULE - deleteSchedule) ${error}`); // Send error to Discord
    }
};

module.exports = { addSchedule, getSchedules, getScheduleById, updateSchedule, deleteSchedule };
