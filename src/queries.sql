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

-- Dumping structure for table restaurant.items
DROP TABLE IF EXISTS `items`;
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Data exporting was unselected.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
