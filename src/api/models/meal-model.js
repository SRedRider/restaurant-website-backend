const db = require('../../utils/database');
const moment = require('moment-timezone');


const createMeal = async (name, description, price, hamburgerId, wrapId, chicken_burgerId, veganId, sideId, breakfastId, dessertId, drinkId, image_url, visible, added_by) => {
    try {
        // Insert the data into the 'meals' table with safe placeholders
        const [result] = await db.query(
            `INSERT INTO meals (name, description, price, hamburger_id, wrap_id, chicken_burger_id, vegan_id, side_id, breakfast_id, dessert_id, drink_id, image_url, visible, added_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                description,
                price,
                hamburgerId === 'null' ? null : hamburgerId, // If hamburgerId is 'null', set to null
                wrapId === 'null' ? null : wrapId,         // If wrapId is 'null', set to null
                chicken_burgerId === 'null' ? null : chicken_burgerId, // If chicken_burgerId is 'null', set to null
                veganId === 'null' ? null : veganId,       // If veganId is 'null', set to null
                sideId === 'null' ? null : sideId,         // If sideId is 'null', set to null
                breakfastId === 'null' ? null : breakfastId, // If breakfastId is 'null', set to null
                dessertId === 'null' ? null : dessertId, // If dessertId is 'null', set to null
                drinkId === 'null' ? null : drinkId,     // If drinkId is 'null', set to null
                image_url,
                visible,
                added_by
            ]
        );

        return result.insertId; // Return the ID of the newly inserted meal
    } catch (err) {
        console.error('Error creating meal:', err);
        throw err; // Optionally handle or rethrow the error
    }
};


const getAllMeals = async (isAdmin) => {
    let query = 'SELECT * FROM meals';
    
    // If not admin, only return meals that are visible
    if (!isAdmin) {
        query += " WHERE visible = 'yes'";
    }

    try {
        const [rows] = await db.query(query);

        // Adjust time-related fields and exclude sensitive fields if not admin
        const adjustedRows = rows.map(meal => {
            // Remove null fields for non-admin users
            if (!isAdmin) {
                // Exclude created_at, updated_at, and visible for non-admin
                delete meal.created_at;
                delete meal.updated_at;
                delete meal.visible;
                delete meal.added_by; // Don't expose the added_by field to non-admins
                delete meal.updated_by; // Don't expose the updated_by field to non-admins

                // Remove fields with null values for non-admin
                Object.keys(meal).forEach(key => {
                    if (meal[key] === null) {
                        delete meal[key];
                    }
                });
            } else {
                // Admin: Adjust time-related fields
                if (meal.created_at) {
                    meal.created_at = moment.utc(meal.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
                }
                if (meal.updated_at) {
                    meal.updated_at = moment.utc(meal.updated_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
                }
            }

            return meal;
        });

        return adjustedRows;
    } catch (error) {
        console.error('Error fetching meals:', error);
        throw new Error('Database error');
    }
};



const getMealById = async (id, isAdmin) => {
    try {
        let query = `
            SELECT m.*, 
            m.hamburger_id AS hamburger_id,
            m.wrap_id AS wrap_id,
            m.chicken_burger_id AS chicken_burger_id,
            m.vegan_id AS vegan_id,
            m.side_id AS side_id,
            m.breakfast_id AS breakfast_id,
            m.dessert_id AS dessert_id,
            m.drink_id AS drink_id
            FROM meals m
            WHERE m.id = ?`;

        // If not admin, only return meals that are visible
        if (!isAdmin) {
            query += " AND m.visible = 'yes'";
        }

        const [rows] = await db.query(query, [id]);

        if (rows.length === 0) {
            console.log("No meal found with the given ID:", id); // Debugging line to check if meal exists
            return null; // No meal found with the given ID
        }

        const meal = rows[0];

        // Admin: Adjust time-related fields (e.g., created_at, updated_at) if they exist
        if (isAdmin) {
            if (meal.created_at) {
                meal.created_at = moment.utc(meal.created_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
            }
            if (meal.updated_at) {
                meal.updated_at = moment.utc(meal.updated_at).tz('Europe/Helsinki').format('YYYY-MM-DD HH:mm:ss');
            }

        } else {
            // Non-admin: Remove sensitive information (e.g., created_at, updated_at, visible)
            delete meal.created_at;
            delete meal.updated_at;
            delete meal.visible;  // Don't expose the visible field to non-admins
            delete meal.added_by; // Don't expose the added_by field to non-admins
            delete meal.updated_by; // Don't expose the updated_by field to non-admins

            // Remove fields with null values for non-admin
            Object.keys(meal).forEach(key => {
                if (meal[key] === null) {
                    delete meal[key];
                }
            });
        }


        return meal;
    } catch (error) {
        console.error("Error occurred while fetching meal by ID:", error);
    }
};




const deleteMeal = async (id) => {
    await db.query(`DELETE FROM meals WHERE id = ?`, [id]);
};

const updateMeal = async (id, name, description, price, hamburgerId, wrapId, chicken_burgerId, veganId, sideId, breakfastId, dessertId, drinkId, image_url, visible, updated_by) => {
    await db.query(
        `UPDATE meals SET name = ?, description = ?, price = ?, hamburger_id = ?, wrap_id = ?, chicken_burger_id = ?, vegan_id = ?, side_id = ?, breakfast_id = ?, dessert_id = ?, drink_id = ?, image_url = ?, visible = ?, updated_by = ? WHERE id = ?`,
        [name, description, price, hamburgerId, wrapId, chicken_burgerId, veganId, sideId, breakfastId, dessertId, drinkId, image_url, visible, updated_by, id]
    );
  };

module.exports = { createMeal, getAllMeals, getMealById, deleteMeal, updateMeal };
