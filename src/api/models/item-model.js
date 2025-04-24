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
          if (!isAdmin) {
              // Remove admin-specific fields for non-admin users
              delete item.visible;
              delete item.created_at;
              delete item.updated_at;
          } else {
              // Adjust the `created_at` field to Finland's time zone (Europe/Helsinki)
              if (item.created_at) {
                  item.created_at = moment.utc(item.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
              }
          }
          
          return item;
      });

      return adjustedRows;
  } catch (error) {
      console.error('Error fetching items:', error);
      throw new Error('Database error');
  }
};



const getItemById = async (id, isAdmin) => {
  try {
    console.log("Fetching item with ID:", id); // Debugging line to check the ID being fetched
    console.log("Is admin:", isAdmin); // Debugging line to check if the user is admin
      let query = 'SELECT * FROM items WHERE id = ?';

      // If not admin, ensure the item is visible
      if (!isAdmin) {
          query += " AND visible = 'yes'";
          console.log("Query for non-admin:", query); // Debugging line to check the query
      }

      const [rows] = await db.query(query, [id]);
      
      if (rows.length === 0) {
          console.log("No item found with the given ID:", id); // Debugging line to check if meal exists
          return null; // No meal found with the given ID
      }
          const item = rows[0];
          
          if (!isAdmin) {
              // Remove admin-specific fields for non-admin users
              delete item.visible;
              delete item.created_at;
              delete item.updated_at;
          } else {
              // Adjust any time-related fields (e.g., created_at, updated_at)
              if (item.created_at) {
                  item.created_at = moment.utc(item.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
              }
              if (item.updated_at) {
                  item.updated_at = moment.utc(item.updated_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
              }
          }
          
          return item;
      
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
