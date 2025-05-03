const db = require('../../utils/database');

const searchAnnouncements = async (query) => {
  const [results] = await db.query(
    'SELECT * FROM announcements WHERE title LIKE ? OR content LIKE ?',
    [`%${query}%`, `%${query}%`]
  );
  return results;
};

const searchItems = async (query) => {
  const [results] = await db.query(
    'SELECT * FROM items WHERE name LIKE ? OR description LIKE ?',
    [`%${query}%`, `%${query}%`]
  );
  return results;
};

const searchMeals = async (query) => {
  const [results] = await db.query(
    'SELECT * FROM meals WHERE name LIKE ? OR description LIKE ?',
    [`%${query}%`, `%${query}%`]
  );
  return results;
};

module.exports = { searchAnnouncements, searchItems, searchMeals };