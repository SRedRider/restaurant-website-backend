const promisePool = require('../../utils/database');
const moment = require('moment-timezone');

// Add a new schedule to the database
const addSchedule = async (date, open_time, close_time, status, message, added_by) => {
    const [result] = await promisePool.query(
        'INSERT INTO restaurant_schedule (date, open_time, close_time, status, message, added_by) VALUES (?, ?, ?, ?, ?, ?)', 
        [date, open_time, close_time, status, message, added_by]
    );
    return result; // Return the result of the insert query
};

// Get all schedules sorted by date
const getSchedules = async () => {
    const [schedules] = await promisePool.query(
        'SELECT * FROM restaurant_schedule ORDER BY date ASC'
    );

    // Format the schedules based on their status
    const formattedSchedules = schedules.map(schedule => {
        if (schedule.status === 'close') {
            return {
                id: schedule.id,
                date: moment(schedule.date).tz('Europe/Helsinki').format('YYYY-MM-DD'),
                status: schedule.status,
                message: schedule.message
            };
        }
        return {
            id: schedule.id,
            date: moment(schedule.date).tz('Europe/Helsinki').format('YYYY-MM-DD'),
            open_time: schedule.open_time,
            close_time: schedule.close_time,
            message: schedule.message,
            status: schedule.status
        };
    });

    return formattedSchedules; // Return the formatted schedules
};

// Update an existing schedule in the database
const updateSchedule = async (id, date, open_time, close_time, status, message, updated_by) => {
    const [result] = await promisePool.query(
        'UPDATE restaurant_schedule SET date = ?, open_time = ?, close_time = ?, status = ?, message = ?, updated_by = ? WHERE id = ?',
        [date, open_time, close_time, status, message, updated_by, id]
    );
    return result;
};

// Delete a schedule from the database
const deleteSchedule = async (id) => {
    const [result] = await promisePool.query(
        'DELETE FROM restaurant_schedule WHERE id = ?',
        [id]
    );
    return result;
};

module.exports = { addSchedule, getSchedules, updateSchedule, deleteSchedule };
