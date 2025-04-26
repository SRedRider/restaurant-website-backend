const restaurantScheduleModel = require('../models/restaurant-schedule-model');

// Add a new schedule
const addSchedule = async (req, res) => {
    try {
        const { date, open_time, close_time, status, message } = req.body;

        // Call the model function to add the schedule to the database
        const result = await restaurantScheduleModel.addSchedule(
            date, open_time, close_time, status, message
        );

        res.status(201).json({
            message: 'Schedule added successfully!',
            data: { id: result.insertId, date, open_time, close_time, status, message },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding schedule', error: error.message });
    }
};

// Get all schedules sorted by date
const getSchedules = async (req, res) => {
    try {
        // Call the model function to get all schedules
        const schedules = await restaurantScheduleModel.getSchedules();

        res.status(200).json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching schedules', error: error.message });
    }
};

module.exports = { addSchedule, getSchedules };
