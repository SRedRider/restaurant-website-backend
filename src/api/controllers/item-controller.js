const Item = require('../models/item-model');

const addItem = async (req, res) => {
    const { category, name, description, ingredients, allergens, size, price, stock, visible } = req.body;
    const image_url = req.file ? `/public/uploads/${req.file.filename}` : null;

    // Validate stock and visible values
    const validOptions = ['yes', 'no'];
    if (!validOptions.includes(stock?.toLowerCase()) || !validOptions.includes(visible?.toLowerCase())) {
        return res.status(400).json({ error: 'Stock and visible fields must be either "yes" or "no"' });
    }

    // Ensure allergens is a string before attempting to split it
    let allergensString = '';
    if (allergens) {
        if (Array.isArray(allergens)) {
            allergensString = allergens.join(',');
        } else if (typeof allergens === 'string') {
            allergensString = allergens;
        }

        const allergensArray = allergensString.split(',').filter(Boolean);
        const uniqueAllergens = [...new Set(allergensArray)];
        allergensString = uniqueAllergens.join(',');
    }

    const sizeValue = size && size.trim() ? size : null;

    // Validate required fields
    if (!category || !name || !description || !ingredients || !allergensString || !price || !image_url) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (isNaN(price) || price <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
    }

    try {
        const itemId = await Item.createItem(
            category,
            name,
            description,
            ingredients,
            allergensString,
            sizeValue,
            price,
            image_url,
            stock.toLowerCase(),   
            visible.toLowerCase()   
        );
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

        // Add type: "item" to each item in the response
        const itemsWithType = items.map(item => ({
            ...item,
            type: "item"
        }));

        res.json(itemsWithType);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
};


const getItemById = async (req, res) => {
    try {
        const item = await Item.getItemById(req.params.id, req.isAdmin); // Assuming `req.user.isAdmin` is available
        if (!item) return res.status(404).json({ error: 'Item not found' });

        // Add type: "item" to the response
        const itemWithType = {
            ...item,
            type: "item"
        };

        res.json(itemWithType);
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
    const currentItem = await Item.getItemById(req.params.id, req.isAdmin);
    if (!currentItem) {
        return res.status(404).json({ message: 'Item not found' });
    }
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
