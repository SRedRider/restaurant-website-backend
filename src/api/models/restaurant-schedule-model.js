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
const getSchedules = async (isAdmin) => {
    const [schedules] = await promisePool.query(
        'SELECT * FROM restaurant_schedule ORDER BY date ASC'
    );

    // Format the schedules based on their status
    const formattedSchedules = schedules.map(schedule => {
        const baseSchedule = {
            id: schedule.id,
            date: moment(schedule.date).tz('Europe/Helsinki').format('YYYY-MM-DD'),
            status: schedule.status,
            message: schedule.message
        };

        if (schedule.status !== 'close') {
            baseSchedule.open_time = schedule.open_time;
            baseSchedule.close_time = schedule.close_time;
        }

        if (isAdmin) {
            baseSchedule.created_at = schedule.created_at;
            baseSchedule.updated_at = schedule.updated_at;
            baseSchedule.added_by = schedule.added_by;
            baseSchedule.updated_by = schedule.updated_by;
        }

        return baseSchedule;
    });

    return formattedSchedules; // Return the formatted schedules
};

const getScheduleById = async (id, isAdmin) => {
    const [schedule] = await promisePool.query(
        'SELECT * FROM restaurant_schedule WHERE id = ?',
        [id]
    );

    if (schedule.length === 0) return null;

    const scheduleData = schedule[0];
    const baseSchedule = {
        id: scheduleData.id,
        date: moment(scheduleData.date).tz('Europe/Helsinki').format('YYYY-MM-DD'),
        status: scheduleData.status,
        message: scheduleData.message
    };

    if (scheduleData.status !== 'close') {
        baseSchedule.open_time = scheduleData.open_time;
        baseSchedule.close_time = scheduleData.close_time;
    }

    if (isAdmin) {
        baseSchedule.created_at = scheduleData.created_at;
        baseSchedule.updated_at = scheduleData.updated_at;
        baseSchedule.added_by = scheduleData.added_by;
        baseSchedule.updated_by = scheduleData.updated_by;
    }

    return baseSchedule;
}

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

module.exports = { addSchedule, getSchedules, getScheduleById, updateSchedule, deleteSchedule };
