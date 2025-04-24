const Meal = require('../models/meal-model');

const addMeal = async (req, res) => {
    const { name, description, price, hamburgerId, wrapId, chicken_burgerId, veganId, sideId, breakfastId, dessertId, drinkId, visible } = req.body;
    const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;

    if (!name || !description || !price || !image_url || !visible) {
        return res.status(400).json({ message: 'Name, description, price, image_url, and visible are required' });
    }
    if (isNaN(price)) {
        return res.status(400).json({ message: 'Price must be a number' });
    }
    if (price < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
    }
    
    try {
        const mealId = await Meal.createMeal(name, description, price, hamburgerId, wrapId, chicken_burgerId, veganId, sideId, breakfastId, dessertId, drinkId, image_url, visible);
        res.status(201).json({ message: 'Meal added successfully', id: mealId, image_url });
    } catch (error) {
        console.error('Error adding meal:', error);
        res.status(500).json({ error: 'Database error' });
    }
};

const getAllMeals = async (req, res) => {
    try {
        // Use the isAdmin flag from the middleware
        const meals = await Meal.getAllMeals(req.isAdmin); // Pass isAdmin flag to model
        res.json(meals);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

const getMealById = async (req, res) => {
    try {
        const meal = await Meal.getMealById(req.params.id, req.isAdmin); // Assuming `req.user.isAdmin` is available

        // If meal is not found or it's not visible for non-admin users, return 404
        if (!meal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        // If everything is good, return the meal data
        res.json(meal);
    } catch (error) {
        // If there's a database error or other issues, return 500
        console.error("Error occurred while fetching meal:", error);
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
    const currentMeal = await Meal.getMealById(req.params.id, req.isAdmin);
    if (!currentMeal) {
        return res.status(404).json({ message: 'Meal not found' });
    }
    const finalImageUrl = image_url || currentMeal.image_url;

    if (!name || !description || !price || !finalImageUrl) {
        return res.status(400).json({ message: 'Name, description, price, and image_url are required' });
    }
    if (isNaN(price)) {
        return res.status(400).json({ message: 'Price must be a number' });
    }
    if (price < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
    }
    

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
