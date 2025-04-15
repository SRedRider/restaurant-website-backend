const db = require('../../utils/database');

const createItem = async (category, name, description, ingredients, allergens, size, price, image_url) => {
  // Ensure allergens is a comma-separated string (already done in the controller)
  const allergensString = Array.isArray(allergens) ? allergens.join(',') : allergens;

  const [result] = await db.query(
    `INSERT INTO items (category, name, description, ingredients, allergens, size, price, image_url) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [category, name, description, ingredients, allergensString, size, price, image_url]
  );

  return result.insertId;
};

  

const getAllItems = async () => {
    const [rows] = await db.query(`SELECT * FROM items`);
    return rows;
};

const getItemById = async (id) => {
    const [rows] = await db.query(`SELECT * FROM items WHERE id = ?`, [id]);
    return rows[0];
};

const checkIfItemIsInMeal = async (id) => {
  try {
      const result = await db.query(`
          SELECT COUNT(*) AS count
          FROM meals
          WHERE hamburger_id = ? OR wrap_id = ? OR chicken_burger_id = ? OR vegan_id = ? 
          OR side_id = ? OR breakfast_id = ? OR dessert_id = ? OR drink_id = ?`, 
          [id, id, id, id, id, id, id, id]
      );
      return result[0][0].count > 0; // Return true if count > 0
  } catch (error) {
      console.error('Error checking item in meal:', error);
      return false; // Return false in case of any errors
  }
};



const deleteItem = async (id) => {
    await db.query(`DELETE FROM items WHERE id = ?`, [id]);
};

const updateItem = async (id, category, name, description, ingredients, allergens, size, price, image_url) => {
  const allergensString = Array.isArray(allergens) ? allergens.join(',') : allergens;

  await db.query(
      `UPDATE items SET category = ?, name = ?, description = ?, ingredients = ?, allergens = ?, size = ?, price = ?, image_url = ? WHERE id = ?`,
      [category, name, description, ingredients, allergensString, size, price, image_url, id]
  );
};


module.exports = { createItem, getAllItems, getItemById, deleteItem, checkIfItemIsInMeal, updateItem };
