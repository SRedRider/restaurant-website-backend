const Item = require('../models/item-model');

const addItem = async (req, res) => {
    const { category, name, description, ingredients, allergens, size, price, stock, visible } = req.body;
    const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;

    // Ensure allergens is a string before attempting to split it
    let allergensString = '';
    if (allergens) {
        // If allergens is an array, join it as a comma-separated string
        if (Array.isArray(allergens)) {
            allergensString = allergens.join(',');
        } else if (typeof allergens === 'string') {
            allergensString = allergens;
        }

        // Remove any duplicates from allergens (just in case)
        const allergensArray = allergensString.split(',').filter(Boolean); // Split and filter out empty values
        const uniqueAllergens = [...new Set(allergensArray)]; // Remove duplicates using Set
        allergensString = uniqueAllergens.join(','); // Join back into a string
    }

    // Handle empty size values (set to NULL if not provided)
    const sizeValue = size && size.trim() ? size : null;

    // Validate required fields
    if (!category || !name || !price) {
        return res.status(400).json({ error: 'Category, name, and price are required' });
    }

    try {
        // Call the createItem function with the allergens string
        const itemId = await Item.createItem(category, name, description, ingredients, allergensString, sizeValue, price, image_url, stock, visible);
        res.status(201).json({ message: 'Item added successfully', id: itemId, image_url });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};



const getAllItems = async (req, res) => {
    try {
        // Use the isAdmin flag from the middleware
        const items = await Item.getAllItems(req.isAdmin); // Pass isAdmin flag to model
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};


const getItemById = async (req, res) => {
    try {
        const item = await Item.getItemById(req.params.id);
        if (!item) return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};

const deleteItem = async (req, res) => {
    try {
        await Item.deleteItem(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
        console.error('Error deleting:', error);
    }
};

const checkItemMealAssociation = async (req, res) => {
    try {
        const id = req.params.id;
        const isAssociated = await Item.checkIfItemIsInMeal(id);
        res.json({ isAssociatedWithMeal: isAssociated });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
        console.error('Error checking item association:', error);
    }
};


const updateItem = async (req, res) => {
    const { category, name, description, ingredients, allergens, size, price, otherAllergens, stock, visible } = req.body;

    let finalAllergens = allergens ? allergens.split(',') : [];
    
    if (otherAllergens) {
        const otherAllergensList = otherAllergens.split(',').map(item => item.trim());
        finalAllergens = [...finalAllergens, ...otherAllergensList];
    }

    const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;

    // If no image is uploaded, keep the existing image
    const currentItem = await Item.getItemById(req.params.id);
    const finalImageUrl = image_url || currentItem.image_url;

    const sizeValue = size && size.trim() ? size : null;
    const allergensValue = finalAllergens.length > 0 ? finalAllergens.join(',') : null;

    try {
        await Item.updateItem(req.params.id, category, name, description, ingredients, allergensValue, sizeValue, price, finalImageUrl, stock, visible);
        res.status(200).json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Database error', details: error.message });
    }
};




module.exports = { addItem, getAllItems, getItemById, deleteItem, checkItemMealAssociation, updateItem };
