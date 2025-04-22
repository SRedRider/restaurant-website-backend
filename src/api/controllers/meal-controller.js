const Meal = require('../models/meal-model');

const addMeal = async (req, res) => {
    const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;
    try {
        const { name, description, price, hamburgerId, wrapId, chicken_burgerId, veganId, sideId, breakfastId, dessertId, drinkId, visible } = req.body;
        const mealId = await Meal.createMeal(name, description, price, hamburgerId, wrapId, chicken_burgerId, veganId, sideId, breakfastId, dessertId, drinkId, image_url, visible);
        res.status(201).json({ message: 'Meal added successfully', id: mealId, image_url });
    } catch (error) {
        console.error('Error adding meal:', error);
        res.status(500).json({ error: 'Database error' });
    }
};
const getAllMeals = async (req, res) => {
    try {
        const meals = await Meal.getAllMeals();
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
}

const getMealById = async (req, res) => {
    try {
        const meal = await Meal.getMealById(req.params.id);
        if (!meal) return res.status(404).json({ error: 'Meal not found' });
        res.json(meal);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

const updateMeal = async (req, res) => {
    const { name, description, price, hamburger_id, wrap_id, chicken_burger_id, vegan_id, side_id, breakfast_id, dessert_id,  drink_id, visible } = req.body;
    const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;

    const hamburger_idValue = hamburger_id && hamburger_id.trim() ? hamburger_id : null;
    const wrap_idValue = wrap_id && wrap_id.trim() ? wrap_id : null;
    const chicken_burger_idValue = chicken_burger_id && chicken_burger_id.trim() ? chicken_burger_id : null;
    const vegan_idValue = vegan_id && vegan_id.trim() ? vegan_id : null;
    const side_idValue = side_id && side_id.trim() ? side_id : null;
    const breakfast_idValue = breakfast_id && breakfast_id.trim() ? breakfast_id : null;
    const dessert_idValue = dessert_id && dessert_id.trim() ? dessert_id : null;
    const drink_idValue = drink_id && drink_id.trim() ? drink_id : null;

    // If no image is uploaded, keep the existing image
    const currentMeal = await Meal.getMealById(req.params.id);
    const finalImageUrl = image_url || currentMeal.image_url;

    try {
        // Update the meal in the database
        await Meal.updateMeal(req.params.id, name, description, price, hamburger_idValue, wrap_idValue, chicken_burger_idValue, vegan_idValue, side_idValue, breakfast_idValue, dessert_idValue, drink_idValue, finalImageUrl, visible);
        res.status(200).json({ message: 'Meal updated successfully' });
    } catch (error) {
        console.error('Error updating meal:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};


module.exports = { addMeal, getAllMeals, getMealById, updateMeal };
