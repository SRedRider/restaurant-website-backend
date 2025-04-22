const db = require('../../utils/database');
const moment = require('moment-timezone');

const createItem = async (category, name, description, ingredients, allergens, size, price, image_url, stock, visible) => {
  // Ensure allergens is a comma-separated string (already done in the controller)
  const allergensString = Array.isArray(allergens) ? allergens.join(',') : allergens;

  const [result] = await db.query(
    `INSERT INTO items (category, name, description, ingredients, allergens, size, price, image_url, stock, visible) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [category, name, description, ingredients, allergensString, size, price, image_url, stock, visible]
  );

  return result.insertId;
};

  

const getAllItems = async (isAdmin) => {
  let query = 'SELECT * FROM items';
  
  // If not admin, only return items that are visible
  if (!isAdmin) {
      query += " WHERE visible = 'yes'";
  }

  try {
      const [rows] = await db.query(query);
      
      // Map through the rows to adjust any time fields (e.g., created_at)
      const adjustedRows = rows.map(item => {
          if (item.created_at) {
              // Adjust the `created_at` field to Finland's time zone (Europe/Helsinki)
              item.created_at = moment.utc(item.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
          }
          
          return item;
      });

      return adjustedRows;
  } catch (error) {
      console.error('Error fetching items:', error);
      throw new Error('Database error');
  }
};



const getItemById = async (id) => {
  try {
      const [rows] = await db.query(`SELECT * FROM items WHERE id = ?`, [id]);
      
      if (rows.length > 0) {
          const item = rows[0];
          
          // Adjust any time-related fields (e.g., created_at, updated_at)
          if (item.created_at) {
              item.created_at = moment.utc(item.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
          }
          if (item.updated_at) {
              item.updated_at = moment.utc(item.updated_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
          }
          // Add any other time fields here as necessary
          
          return item;
      } else {
          // No item found with the given ID
          return null;
      }
  } catch (error) {
      console.error('Error fetching item by ID:', error);
      throw new Error('Database error');
  }
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

const updateItem = async (id, category, name, description, ingredients, allergens, size, price, image_url, stock, visible) => {
  const allergensString = Array.isArray(allergens) ? allergens.join(',') : allergens;

  await db.query(
      `UPDATE items SET category = ?, name = ?, description = ?, ingredients = ?, allergens = ?, size = ?, price = ?, image_url = ?, stock = ?, visible = ? WHERE id = ?`,
      [category, name, description, ingredients, allergensString, size, price, image_url, stock, visible, id]
  );
};


module.exports = { createItem, getAllItems, getItemById, deleteItem, checkIfItemIsInMeal, updateItem };
