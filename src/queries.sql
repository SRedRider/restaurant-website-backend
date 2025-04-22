-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.5.2-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.6.0.6765
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for restaurant
CREATE DATABASE IF NOT EXISTS `restaurant` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `restaurant`;

-- Dumping structure for table restaurant.items
CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` enum('hamburgers','wraps','chicken_burgers','vegan','sides','breakfast','dessert','drinks') DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `ingredients` mediumtext DEFAULT NULL,
  `allergens` text DEFAULT NULL,
  `size` enum('small','medium','large') DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data exporting was unselected.

-- Dumping structure for table restaurant.meals
CREATE TABLE IF NOT EXISTS `meals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `hamburger_id` int(11) DEFAULT NULL,
  `wrap_id` int(11) DEFAULT NULL,
  `chicken_burger_id` int(11) DEFAULT NULL,
  `vegan_id` int(11) DEFAULT NULL,
  `side_id` int(11) DEFAULT NULL,
  `breakfast_id` int(11) DEFAULT NULL,
  `dessert_id` int(11) DEFAULT NULL,
  `drink_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `hamburger_id` (`hamburger_id`),
  KEY `wrap_id` (`wrap_id`),
  KEY `chicken_burger_id` (`chicken_burger_id`),
  KEY `vegan_id` (`vegan_id`),
  KEY `side_id` (`side_id`),
  KEY `breakfast_id` (`breakfast_id`),
  KEY `dessert_id` (`dessert_id`),
  KEY `drink_id` (`drink_id`),
  CONSTRAINT `meals_ibfk_1` FOREIGN KEY (`hamburger_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meals_ibfk_2` FOREIGN KEY (`wrap_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meals_ibfk_3` FOREIGN KEY (`chicken_burger_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meals_ibfk_4` FOREIGN KEY (`vegan_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meals_ibfk_5` FOREIGN KEY (`side_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meals_ibfk_6` FOREIGN KEY (`breakfast_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meals_ibfk_7` FOREIGN KEY (`dessert_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `meals_ibfk_8` FOREIGN KEY (`drink_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

-- ----------------------------------------
-- Trigger: Set meals.stock = 'no' if any linked item is out of stock
-- ----------------------------------------
DELIMITER //

CREATE TRIGGER update_meal_stock
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
  IF NEW.stock = 'no' THEN
    UPDATE meals
    SET stock = 'no'
    WHERE hamburger_id = NEW.id
       OR wrap_id = NEW.id
       OR chicken_burger_id = NEW.id
       OR vegan_id = NEW.id
       OR side_id = NEW.id
       OR breakfast_id = NEW.id
       OR dessert_id = NEW.id
       OR drink_id = NEW.id;
  END IF;
END;
//

DELIMITER ;

-- ----------------------------------------
-- Trigger: Restore meals.stock = 'yes' if ALL linked items are in stock
-- ----------------------------------------
DELIMITER //

CREATE TRIGGER restore_meal_stock
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
  IF NEW.stock = 'yes' THEN
    UPDATE meals
    SET stock = 'yes'
    WHERE (
      (hamburger_id IS NULL OR (hamburger_id IS NOT NULL AND (SELECT stock FROM items WHERE id = hamburger_id) = 'yes')) AND
      (wrap_id IS NULL OR (wrap_id IS NOT NULL AND (SELECT stock FROM items WHERE id = wrap_id) = 'yes')) AND
      (chicken_burger_id IS NULL OR (chicken_burger_id IS NOT NULL AND (SELECT stock FROM items WHERE id = chicken_burger_id) = 'yes')) AND
      (vegan_id IS NULL OR (vegan_id IS NOT NULL AND (SELECT stock FROM items WHERE id = vegan_id) = 'yes')) AND
      (side_id IS NULL OR (side_id IS NOT NULL AND (SELECT stock FROM items WHERE id = side_id) = 'yes')) AND
      (breakfast_id IS NULL OR (breakfast_id IS NOT NULL AND (SELECT stock FROM items WHERE id = breakfast_id) = 'yes')) AND
      (dessert_id IS NULL OR (dessert_id IS NOT NULL AND (SELECT stock FROM items WHERE id = dessert_id) = 'yes')) AND
      (drink_id IS NULL OR (drink_id IS NOT NULL AND (SELECT stock FROM items WHERE id = drink_id) = 'yes'))
    );
  END IF;
END;
//

DELIMITER ;


-- ----------------------------------------
-- Trigger: Set meals.stock = 'yes' if all linked items are in stock or set  meals.stock = 'no' if any linked item is out of stock
-- ----------------------------------------
DELIMITER //

CREATE TRIGGER update_meal_stock_on_item_change
BEFORE UPDATE ON meals
FOR EACH ROW
BEGIN
  IF NEW.hamburger_id != OLD.hamburger_id
     OR NEW.wrap_id != OLD.wrap_id
     OR NEW.chicken_burger_id != OLD.chicken_burger_id
     OR NEW.vegan_id != OLD.vegan_id
     OR NEW.side_id != OLD.side_id
     OR NEW.breakfast_id != OLD.breakfast_id
     OR NEW.dessert_id != OLD.dessert_id
     OR NEW.drink_id != OLD.drink_id
  THEN
    IF (
      (NEW.hamburger_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.hamburger_id) = 'yes') AND
      (NEW.wrap_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.wrap_id) = 'yes') AND
      (NEW.chicken_burger_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.chicken_burger_id) = 'yes') AND
      (NEW.vegan_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.vegan_id) = 'yes') AND
      (NEW.side_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.side_id) = 'yes') AND
      (NEW.breakfast_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.breakfast_id) = 'yes') AND
      (NEW.dessert_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.dessert_id) = 'yes') AND
      (NEW.drink_id IS NULL OR (SELECT stock FROM items WHERE id = NEW.drink_id) = 'yes')
    ) THEN
      SET NEW.stock = 'yes';
    ELSE
      SET NEW.stock = 'no';
    END IF;
  END IF;
END;
//

DELIMITER ;



-- Dumping structure for table restaurant.orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(15) NOT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `notes` text DEFAULT NULL,
  `method` enum('delivery','pickup') DEFAULT 'pickup',
  `status` enum('processing','preparing','ready','completed') DEFAULT 'processing',
  `address` text DEFAULT NULL,
  `scheduled_time` datetime DEFAULT NULL,
  `order_id` varchar(5) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_user_order` (`user_id`),
  CONSTRAINT `fk_user_order` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

-- Dumping structure for table restaurant.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','employee','customer') DEFAULT 'customer',
  `status` enum('enabled','disabled') DEFAULT 'enabled',
  `verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
