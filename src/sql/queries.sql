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
DROP DATABASE IF EXISTS `restaurant`;
CREATE DATABASE IF NOT EXISTS `restaurant` /*!40100 DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci */;
USE `restaurant`;

-- Dumping structure for table restaurant.users
DROP TABLE IF EXISTS `users`;
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
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  CONSTRAINT `fk_users_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table restaurant.users: ~2 rows (approximately)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `email`, `name`, `password`, `role`, `status`, `verified`, `verification_token`, `reset_token`, `reset_token_expiry`, `created_at`, `updated_at`) VALUES
	(6, 'johndoe@example.com', 'John Doe', '$2b$10$jNmqSnVBfV1JqJnQPkZSCuMbaLRbG.IfoLnMg72KoFTOD/Q.iBsUe', 'customer', 'enabled', 1, '054e62b48bc79605d8297ae8dd3c0991af07a1bdfec871f006ec14658d23b9bb', NULL, NULL, '2025-04-23 10:06:08', '2025-04-28 11:02:13'),
	(7, 'johnadmin@example.com', 'John Admin', '$2b$10$rQkRqZsT3HP.4/Q1S0O2D.3m2OUmDveEdlmUzpfhCtLk3Ebwutm2y', 'admin', 'enabled', 1, 'a559ef68db2f7087981860d45833105d69c80dd1e13743eb62db456785913e58', NULL, NULL, '2025-04-23 10:56:38', '2025-04-23 10:57:01');


-- Dumping structure for table restaurant.announcements
DROP TABLE IF EXISTS `announcements`;
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `visible` enum('yes','no') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_announcements_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Update the character set and collation for the `announcements` table to support emojis
ALTER TABLE `announcements` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Dumping data for table restaurant.announcements: ~5 rows (approximately)
DELETE FROM `announcements`;
INSERT INTO `announcements` (`id`, `title`, `content`, `image_url`, `created_at`, `updated_at`) VALUES
	(2, 'asd', 'asdasdsa', NULL, '2025-04-29 11:29:06', '2025-04-29 11:29:06'),
	(3, 'asd', '', NULL, '2025-04-29 12:15:32', '2025-04-29 12:15:32'),
	(4, 'asdasd', '', NULL, '2025-04-29 12:15:59', '2025-04-29 12:15:59'),
	(5, 'asd', '', NULL, '2025-04-29 12:16:45', '2025-04-29 12:16:45'),
	(7, 'asda', '', NULL, '2025-04-29 12:19:40', '2025-04-29 12:19:40');

-- Dumping structure for table restaurant.items
DROP TABLE IF EXISTS `items`;
CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` enum('hamburger','wrap','chicken_burger','vegan','side','breakfast','dessert','drink') DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` mediumtext DEFAULT NULL,
  `ingredients` mediumtext DEFAULT NULL,
  `allergens` text DEFAULT NULL,
  `size` enum('small','medium','large') DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `stock` enum('yes','no') DEFAULT 'yes',
  `visible` enum('yes','no') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_items_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table restaurant.items: ~14 rows (approximately)
DELETE FROM `items`;
INSERT INTO `items` (`id`, `category`, `name`, `description`, `ingredients`, `allergens`, `size`, `price`, `image_url`, `stock`, `visible`, `created_at`, `updated_at`) VALUES
	(28, 'hamburger', 'Double Cheeseburger', 'Two juicy beef patties, cheddar cheese, and our signature sauce.', 'Beef, Cheddar, Bun, Sauce', 'Gluten,Dairy', 'large', 7.99, '/public/uploads/1745825165183-963770985.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-29 16:51:35'),
	(29, 'hamburger', 'BBQ Bacon Burger', 'Grilled beef patty, crispy bacon, BBQ sauce, and onion rings.', 'Beef, Bacon, BBQ Sauce, Onion Rings, Bun', 'Gluten', 'large', 8.49, 'images/bbq_bacon_burger.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(30, 'wrap', 'Falafel Wrap', 'Homemade falafel with hummus, lettuce, and tahini dressing.', 'Falafel, Hummus, Lettuce, Tortilla, Tahini', 'Gluten,Sesame', 'medium', 5.99, 'images/falafel_wrap.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-29 16:48:06'),
	(31, 'wrap', 'Grilled Veggie Wrap', 'Seasonal grilled veggies with pesto in a soft tortilla.', 'Zucchini, Peppers, Onions, Pesto, Tortilla', 'Nuts,Gluten', 'medium', 5.49, 'images/veggie_wrap.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(32, 'chicken_burger', 'Grilled Chicken Club', 'Grilled chicken breast with bacon, lettuce, tomato, and mayo.', 'Chicken, Bacon, Lettuce, Tomato, Mayo, Bun', 'Gluten,Egg', 'medium', 6.79, 'images/grilled_chicken_club.jpg', 'no', 'yes', '2025-04-23 11:25:56', '2025-04-29 16:38:32'),
	(33, 'vegan', 'Tofu Banh Mi', 'Marinated tofu, pickled veggies, and vegan sriracha mayo in a baguette.', 'Tofu, Carrots, Radish, Cucumber, Sriracha Mayo, Baguette', 'Gluten,Soy', 'medium', 6.49, 'images/tofu_banhmi.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(34, 'side', 'Onion Rings', 'Crispy battered onion rings.', 'Onions, Batter, Oil', 'Gluten', 'medium', 3.29, 'images/onion_rings.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(35, 'side', 'Side Salad', 'Fresh garden salad with your choice of dressing.', 'Lettuce, Tomato, Cucumber, Carrot', 'None', 'small', 2.99, 'images/side_salad.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(36, 'breakfast', 'Veggie Breakfast Burrito', 'Eggs, spinach, mushrooms, and cheese in a warm tortilla.', 'Eggs, Spinach, Mushrooms, Cheese, Tortilla', 'Egg,Dairy,Gluten', 'medium', 4.49, 'images/veggie_burrito.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(37, 'breakfast', 'Pancake Stack', 'Fluffy pancakes served with maple syrup.', 'Flour, Eggs, Milk, Syrup', 'Gluten,Egg,Dairy', 'large', 4.99, 'images/pancake_stack.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(38, 'dessert', 'Apple Pie', 'Warm apple pie with a flaky crust.', 'Apples, Flour, Butter, Sugar', 'Gluten,Dairy', 'medium', 3.49, 'images/apple_pie.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(39, 'dessert', 'Vegan Brownie', 'Rich and fudgy vegan chocolate brownie.', 'Cocoa, Flour, Coconut Oil, Sugar', 'Gluten', 'small', 2.99, 'images/vegan_brownie.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(40, 'drink', 'Lemonade', 'Freshly squeezed lemonade.', 'Lemon, Sugar, Water', 'None', 'medium', 1.99, 'images/lemonade.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56'),
	(41, 'drink', 'Strawberry Milkshake', 'Creamy milkshake made with real strawberries.', 'Milk, Strawberries, Sugar', 'Dairy', 'large', 3.99, 'images/strawberry_milkshake.jpg', 'yes', 'yes', '2025-04-23 11:25:56', '2025-04-23 11:25:56');

-- Dumping structure for table restaurant.meals
DROP TABLE IF EXISTS `meals`;
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
  `stock` enum('yes','no') DEFAULT 'yes',
  `visible` enum('yes','no') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
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
  CONSTRAINT `meals_ibfk_8` FOREIGN KEY (`drink_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_meals_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table restaurant.meals: ~2 rows (approximately)
DELETE FROM `meals`;
INSERT INTO `meals` (`id`, `name`, `description`, `price`, `hamburger_id`, `wrap_id`, `chicken_burger_id`, `vegan_id`, `side_id`, `breakfast_id`, `dessert_id`, `drink_id`, `image_url`, `stock`, `visible`, `created_at`, `updated_at`) VALUES
	(1, 'Happy Meal™ Chicken Burger', 'Savor the deliciousness of our signature Chicken Burger, a tender, juicy grilled chicken fillet served in a soft, toasted bun. This Happy Meal™ includes a side of crispy, golden fries, and a refreshing soft drink to quench your thirst. Whether you\'re craving a quick snack or a satisfying meal, this delightful combination will hit the spot!', 20.00, 28, 30, 32, 33, 34, 36, 38, NULL, '/public/uploads/1745527267932-12650273.jpg', 'no', 'yes', '2025-04-24 20:41:07', '2025-04-29 16:38:32'),
	(2, 'Sunshine Veggie Wrap', 'Wrap yourself in freshness with the Sunshine Veggie Wrap, a vibrant mix of crunchy vegetables, creamy hummus, and a tangy lemon dressing, all wrapped in a soft whole-wheat tortilla. This delightful wrap is not only packed with nutrients but also bursting with flavors that will energize your day!', 12.00, 29, NULL, 32, NULL, NULL, NULL, 38, 40, '/public/uploads/1745530580120-650648379.jpg', 'no', 'yes', '2025-04-24 21:28:40', '2025-04-29 16:38:32');

-- Dumping structure for table restaurant.orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `order_id` varchar(5) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(15) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `method` enum('delivery','pickup') DEFAULT 'pickup',
  `address` text DEFAULT NULL,
  `scheduled_time` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('processing','preparing','ready','completed') DEFAULT 'processing',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_order` (`user_id`),
  CONSTRAINT `fk_user_order` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table restaurant.orders: ~7 rows (approximately)
DELETE FROM `orders`;
INSERT INTO `orders` (`id`, `user_id`, `order_id`, `customer_name`, `customer_phone`, `customer_email`, `items`, `method`, `address`, `scheduled_time`, `notes`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
	(3, 6, '93917', 'Marko Lehtonen', '+358449876543', 'fecirad539@cyluna.com', '[{"id":2,"quantity":1,"price":12,"type":"meal"},{"id":1,"quantity":2,"price":20,"type":"meal"}]', 'delivery', '{"street":"Katu","postalCode":"0347","city":"Helsinki"}', '2025-04-30T20:32', 'Call upon arrival.1', 52.00, 'preparing', '2025-04-28 12:25:56', '2025-04-29 15:40:48'),
	(4, 6, '44351', 'Marko Lehtonen', '+358449876543', 'fecirad539@cyluna.com', '[{"id":2,"quantity":2,"price":10,"type":"meal"}]', 'pickup', NULL, 'Now', 'Call upon arrival.', 20.00, 'processing', '2025-04-28 12:28:25', '2025-04-28 12:28:25'),
	(5, NULL, '89777', 'Marko Lehtonen', '+358449876543', 'fecirad539@cyluna.com', '[{"id":38,"quantity":1,"price":3.49,"type":"item"},{"id":1,"quantity":2,"price":20,"type":"meal"},{"id":40,"quantity":1,"price":1.99,"type":"item"}]', 'delivery', '{"street":"Katu","postalCode":"0347","city":"Helsinki"}', 'Now', 'Call upon arrival.1', 45.48, 'processing', '2025-04-28 17:28:16', '2025-04-28 17:28:16'),
	(6, 6, '34073', 'Marko Lehtonen', '+358449876543', 'fecirad539@cyluna.com', '[{"id":38,"quantity":1,"price":3.49,"type":"item"},{"id":1,"quantity":2,"price":20,"type":"meal"},{"id":40,"quantity":1,"price":1.99,"type":"item"}]', 'delivery', '{"street":"Katu","postalCode":"0347","city":"Helsinki"}', 'Now', 'Call upon arrival', 45.48, 'processing', '2025-04-28 17:33:43', '2025-04-28 17:33:43'),
	(7, 6, '13703', 'Marko Lehtonen', '+358449876543', 'fecirad539@cyluna.com', '[{"id":38,"quantity":1,"price":3.49,"type":"item"},{"id":1,"quantity":2,"price":20,"type":"meal"},{"id":40,"quantity":1,"price":1.99,"type":"item"}]', 'pickup', NULL, 'Now', 'Call upon arrival', 45.48, 'preparing', '2025-04-28 17:33:59', '2025-04-28 17:37:35'),
	(8, 6, '11347', 'Marko Lehtonen', '+358449876543', 'pokotos579@mongrec.com', '[{"id":38,"quantity":1,"price":3.49,"type":"item"},{"id":1,"quantity":2,"price":20,"type":"meal"},{"id":40,"quantity":1,"price":1.99,"type":"item"}]', 'delivery', '{"street":"Katu","postalCode":"0347","city":"Helsinki"}', 'Now', 'Call upon arrival', 45.48, 'processing', '2025-04-28 18:20:46', '2025-04-28 18:20:46'),
	(9, 6, '52951', 'Marko Lehtonen', '+358449876543', 'pokotos579@mongrec.com', '[{"id":38,"quantity":1,"price":3.49,"type":"item"},{"id":1,"quantity":2,"price":20,"type":"meal"},{"id":40,"quantity":1,"price":1.99,"type":"item"}]', 'pickup', NULL, 'Now', 'Call upon arrival', 45.48, 'ready', '2025-04-28 18:36:50', '2025-04-28 18:43:32');

-- Dumping structure for table restaurant.reservations
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `remaining_chairs` int(11) DEFAULT 20,
  `allocated_tables` varchar(255) DEFAULT NULL,
  `status` enum('full','available') DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_reservations_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table restaurant.reservations: ~3 rows (approximately)
DELETE FROM `reservations`;
INSERT INTO `reservations` (`id`, `date`, `remaining_chairs`, `allocated_tables`, `status`) VALUES
	(49, '2025-04-29', 27, '1,2,3,4,5,6,7,8,9,10', 'full'),
	(50, '2025-05-01', 11, '10,7,1,2,3,4,5,6,8', 'available'),
	(51, '2025-05-04', 45, '10', 'available');

-- Dumping structure for table restaurant.reservation_details
DROP TABLE IF EXISTS `reservation_details`;
CREATE TABLE IF NOT EXISTS `reservation_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reservation_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `guest_count` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `notes` text DEFAULT NULL,
  `allocated_tables` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_reservation_details_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table restaurant.reservation_details: ~16 rows (approximately)
DELETE FROM `reservation_details`;
INSERT INTO `reservation_details` (`id`, `reservation_id`, `name`, `phone`, `email`, `guest_count`, `date`, `time`, `notes`, `allocated_tables`) VALUES
	(172, 36517, 'asd', '041234567', 'asd@asd.com', 1, '2025-04-29', '10:25:00', 'asdasdassad', '3'),
	(173, 91583, 'asd', '041234567', 'asd@asd.com', 6, '2025-04-29', '10:25:00', 'asdasdassad', '1,2'),
	(175, 11585, 'asd', '041234567', 'asd@asd.com', 10, '2025-05-01', '10:46:00', 'asdad', '10'),
	(176, 36117, 'asd', '041234567', 'asd@asd.com', 1, '2025-05-01', '14:54:00', 'asdasd', '7'),
	(177, 24492, 'asd', '041234567', 'asd@asd.com', 10, '2025-05-04', '13:37:00', 'asdasdsadsd', '10'),
	(178, 93860, 'asd', '041234567', 'asd@asd.com', 10, '2025-05-01', '16:56:00', 'asdasdasd', '1,2'),
	(179, 97187, 'asd', '041234567', 'asd@asd.com', 1, '2025-05-01', '19:50:00', 'wdasdasd', '3'),
	(180, 88020, 'asd', '041234567', 'asd@asd.com', 3, '2025-04-29', '10:25:00', 'asdasdassad', '4'),
	(181, 81275, 'asd', '041234567', 'asd@asd.com', 3, '2025-04-29', '10:25:00', 'asdasdassad', '5'),
	(182, 35948, 'asd', '041234567', 'asd@asd.com', 3, '2025-04-29', '10:25:00', 'asdasdassad', '6'),
	(183, 84877, 'asd', '041234567', 'asd@asd.com', 3, '2025-04-29', '10:25:00', 'asdasdassad', '7'),
	(184, 40681, 'asd', '041234567', 'asd@asd.com', 3, '2025-04-29', '10:25:00', 'asdasdassad', '8'),
	(185, 47277, 'asd', '041234567', 'asd@asd.com', 3, '2025-04-29', '10:25:00', 'asdasdassad', '9'),
	(186, 93957, 'asd', '041234567', 'asd@asd.com', 3, '2025-04-29', '10:25:00', 'asdasdassad', '10'),
	(187, 30905, 'asd', '041234567', 'asd@asd.com', 10, '2025-05-01', '10:25:00', 'asdasdassad', '4,5'),
	(188, 88413, 'asd', '041234567', 'asd@asd.com', 10, '2025-05-01', '10:25:00', 'asdasdassad', '6,8');

-- Dumping structure for table restaurant.restaurant_schedule
DROP TABLE IF EXISTS `restaurant_schedule`;
CREATE TABLE IF NOT EXISTS `restaurant_schedule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `open_time` time NOT NULL,
  `close_time` time NOT NULL,
  `status` enum('open','close') DEFAULT 'open',
  `message` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`),
  CONSTRAINT `fk_restaurant_schedule_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table restaurant.restaurant_schedule: ~4 rows (approximately)
DELETE FROM `restaurant_schedule`;
INSERT INTO `restaurant_schedule` (`id`, `date`, `open_time`, `close_time`, `status`, `message`) VALUES
	(1, '2025-04-30', '08:00:00', '22:00:00', 'close', NULL),
	(5, '2025-04-20', '08:00:00', '22:00:00', 'close', 'Holiday Special from 12 PM - 3 PM'),
	(7, '2025-04-29', '08:00:00', '22:00:00', 'open', 'Holiday Special from 12 PM - 3 PM'),
	(9, '2025-04-18', '08:00:00', '22:00:00', 'open', 'Holiday Special from 12 PM - 3 PM');

-- Dumping structure for table restaurant.tables
DROP TABLE IF EXISTS `tables`;
CREATE TABLE IF NOT EXISTS `tables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `table_number` int(11) NOT NULL,
  `chairs` int(11) DEFAULT 5,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tables_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping data for table restaurant.tables: ~10 rows (approximately)
DELETE FROM `tables`;
INSERT INTO `tables` (`id`, `table_number`, `chairs`) VALUES
	(1, 1, 5),
	(2, 2, 5),
	(3, 3, 5),
	(4, 4, 5),
	(5, 5, 5),
	(6, 6, 5),
	(7, 7, 5),
	(8, 8, 5),
	(9, 9, 5),
	(10, 10, 5);

-- Dumping structure for table restaurant.favourites
CREATE TABLE IF NOT EXISTS `favourites` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `type` enum('item','meal') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_item` (`user_id`, `item_id`, `type`),
  CONSTRAINT `fk_favourites_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping structure for table restaurant.contacts
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` ENUM('pending', 'resolved', 'closed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_contacts_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Dumping structure for trigger restaurant.restore_meal_stock
DROP TRIGGER IF EXISTS `restore_meal_stock`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
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
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger restaurant.update_meal_stock
DROP TRIGGER IF EXISTS `update_meal_stock`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
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
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger restaurant.update_meal_stock_on_item_change
DROP TRIGGER IF EXISTS `update_meal_stock_on_item_change`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
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
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger restaurant.update_reservation_status
DROP TRIGGER IF EXISTS `update_reservation_status`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER update_reservation_status
BEFORE INSERT ON reservations
FOR EACH ROW
BEGIN
    DECLARE total_tables INT;
    DECLARE allocated_count INT;
    
    -- Count the total number of tables
    SELECT COUNT(*) INTO total_tables FROM tables;
    
    -- Count how many tables are allocated (by counting commas + 1)
    IF NEW.allocated_tables IS NULL OR NEW.allocated_tables = '' THEN
        SET allocated_count = 0;
    ELSE
        SET allocated_count = LENGTH(NEW.allocated_tables) - LENGTH(REPLACE(NEW.allocated_tables, ',', '')) + 1;
    END IF;
    
    -- Compare and set the status
    IF allocated_count >= total_tables THEN
        SET NEW.status = 'full';
    ELSE
        SET NEW.status = 'available';
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

-- Dumping structure for trigger restaurant.update_reservation_status_on_update
DROP TRIGGER IF EXISTS `update_reservation_status_on_update`;
SET @OLDTMP_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
DELIMITER //
CREATE TRIGGER update_reservation_status_on_update
BEFORE UPDATE ON reservations
FOR EACH ROW
BEGIN
    DECLARE total_tables INT;
    DECLARE allocated_count INT;
    
    SELECT COUNT(*) INTO total_tables FROM tables;
    
    IF NEW.allocated_tables IS NULL OR NEW.allocated_tables = '' THEN
        SET allocated_count = 0;
    ELSE
        SET allocated_count = LENGTH(NEW.allocated_tables) - LENGTH(REPLACE(NEW.allocated_tables, ',', '')) + 1;
    END IF;
    
    IF allocated_count >= total_tables THEN
        SET NEW.status = 'full';
    ELSE
        SET NEW.status = 'available';
    END IF;
END//
DELIMITER ;
SET SQL_MODE=@OLDTMP_SQL_MODE;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
