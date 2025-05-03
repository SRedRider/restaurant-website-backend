const Search = require('../models/search-model');
const Item = require('../models/item-model');
const Meal = require('../models/meal-model');

const searchAll = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const announcements = await Search.searchAnnouncements(query);
    const items = await Search.searchItems(query);
    const meals = await Search.searchMeals(query);

    // Remove created_at and updated_at fields from the response
    const sanitizedAnnouncements = announcements.map(({ created_at, updated_at, visible, ...rest }) => rest);
    const sanitizedItems = items.map(({ created_at, updated_at, ingredients, allergens, visible, ...rest }) => rest);
    const sanitizedMeals = meals.map(({ created_at, updated_at, hamburger_id, wrap_id, chicken_burger_id, vegan_id, side_id, breakfast_id, dessert_id, drink_id, visible, ...rest }) => rest);

    res.status(200).json({ announcements: sanitizedAnnouncements, items: sanitizedItems, meals: sanitizedMeals });
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { searchAll };