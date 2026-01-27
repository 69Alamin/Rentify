-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 27, 2026 at 09:50 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rentify_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `guest_phone` varchar(50) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `total_hours` int(11) DEFAULT NULL,
  `booked_hours` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `booking_status` enum('pending','confirmed','active','completed','cancelled') DEFAULT 'pending',
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_emergency` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `guest_name`, `guest_email`, `guest_phone`, `room_id`, `check_in_time`, `check_out_time`, `total_hours`, `booked_hours`, `total_price`, `booking_status`, `payment_status`, `created_at`, `is_emergency`) VALUES
(1, 8, NULL, NULL, NULL, 1, '2026-01-23 20:37:48', '2026-01-24 20:37:48', 24, 24, 5000.00, 'completed', 'pending', '2026-01-23 19:37:48', 0),
(2, 8, NULL, NULL, NULL, 286, '2026-01-24 00:00:00', '2026-01-24 01:00:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-23 20:16:59', 0),
(15, 8, NULL, NULL, NULL, 287, '2026-01-24 00:00:00', '2026-01-24 01:00:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-23 20:28:33', 0),
(16, 8, NULL, NULL, NULL, 288, '2026-01-24 02:41:00', '2026-01-24 03:41:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-23 20:42:11', 0),
(17, 1, NULL, NULL, NULL, 1, '2026-01-23 23:06:56', '2026-01-24 01:06:56', NULL, NULL, 2400.00, 'completed', 'pending', '2026-01-23 22:06:56', 0),
(18, 8, NULL, NULL, NULL, 289, '2026-01-24 04:23:00', '2026-01-24 05:23:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-23 22:23:36', 0),
(19, 8, NULL, NULL, NULL, 290, '2026-01-24 05:09:00', '2026-01-24 06:09:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-23 23:09:24', 0),
(20, 8, NULL, NULL, NULL, 291, '2026-01-24 05:59:00', '2026-01-24 06:59:00', 1, 1, 1900.00, 'completed', 'pending', '2026-01-23 23:59:15', 0),
(21, 8, NULL, NULL, NULL, 292, '2026-01-24 08:29:00', '2026-01-24 09:29:00', 1, 1, 2000.00, 'completed', 'pending', '2026-01-24 00:33:45', 0),
(22, 8, NULL, NULL, NULL, 271, '2026-01-24 08:34:00', '2026-01-24 09:34:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-24 00:34:51', 0),
(23, 8, NULL, NULL, NULL, 293, '2026-01-24 09:41:00', '2026-01-24 12:41:00', 3, 3, 5500.00, 'completed', 'pending', '2026-01-24 00:43:17', 0),
(24, 8, NULL, NULL, NULL, 256, '2026-01-24 07:46:00', '2026-01-24 08:46:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-24 00:48:26', 0),
(25, 8, NULL, NULL, NULL, 272, '2026-01-24 06:50:00', '2026-01-24 07:50:00', 1, 1, 1300.00, 'cancelled', 'pending', '2026-01-24 00:49:55', 0),
(26, 8, NULL, NULL, NULL, 294, '2026-01-24 09:51:00', '2026-01-24 10:51:00', 1, 1, 1900.00, 'cancelled', 'pending', '2026-01-24 00:51:45', 0),
(27, 8, NULL, NULL, NULL, 257, '2026-01-24 08:54:00', '2026-01-24 09:54:00', 1, 1, 1300.00, 'cancelled', 'pending', '2026-01-24 00:54:36', 0),
(28, 8, NULL, NULL, NULL, 295, '2026-01-24 10:00:00', '2026-01-24 11:00:00', 1, 1, 1993.02, 'completed', 'pending', '2026-01-24 01:01:20', 0),
(29, 8, NULL, NULL, NULL, 258, '2026-01-24 10:01:00', '2026-01-24 11:01:00', 1, 1, 1276.45, 'completed', 'pending', '2026-01-24 01:02:14', 0),
(30, 8, NULL, NULL, NULL, 226, '2026-01-24 23:35:00', '2026-01-25 00:35:00', 1, 1, 1272.97, 'completed', 'pending', '2026-01-24 14:35:36', 0),
(31, 13, NULL, NULL, NULL, 241, '2026-01-24 21:36:00', '2026-01-24 22:36:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-24 15:36:42', 0),
(32, 8, NULL, NULL, NULL, 296, '2026-01-24 23:55:00', '2026-01-25 02:55:00', 3, 3, 8484.95, 'cancelled', 'pending', '2026-01-24 15:56:30', 0),
(33, 1, NULL, NULL, NULL, 231, '2026-01-25 15:54:00', '2026-01-25 16:54:00', 1, 1, 1900.00, 'cancelled', 'pending', '2026-01-24 17:54:40', 0),
(34, 8, NULL, NULL, NULL, 211, '2026-01-24 23:55:00', '2026-01-25 00:55:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-24 17:55:51', 0),
(35, 8, NULL, NULL, NULL, 212, '2026-01-24 23:59:00', '2026-01-25 00:59:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-24 17:59:15', 0),
(36, 8, NULL, NULL, NULL, 213, '2026-01-25 00:06:00', '2026-01-25 01:06:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-24 18:06:44', 0),
(37, 8, NULL, NULL, NULL, 181, '2026-01-25 00:11:00', '2026-01-25 01:11:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-24 18:11:04', 0),
(38, 8, NULL, NULL, NULL, 273, '2026-01-25 00:17:00', '2026-01-25 01:17:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-24 18:17:30', 0),
(46, 8, NULL, NULL, NULL, 276, '2026-01-25 00:44:00', '2026-01-25 01:44:00', 1, 1, 1875.82, 'completed', 'pending', '2026-01-24 18:45:50', 0),
(47, 8, NULL, NULL, NULL, 227, '2026-01-25 00:47:00', '2026-01-25 01:47:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-24 18:47:46', 0),
(48, 1, NULL, NULL, NULL, 272, '2026-01-25 01:53:00', '2026-01-25 02:53:00', 1, 1, 1275.82, 'cancelled', 'pending', '2026-01-24 19:53:36', 0),
(49, 8, '', '', '', 294, '2026-01-25 06:12:00', '2026-01-25 07:12:00', 1, 1, 1885.09, 'completed', 'pending', '2026-01-24 20:16:57', 0),
(50, 8, '', '', '', 136, '2026-01-25 02:50:00', '2026-01-25 03:50:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-24 20:50:34', 0),
(51, 8, '', '', '', 214, '2026-01-25 03:22:00', '2026-01-25 05:22:00', 2, 2, 2400.00, 'completed', 'pending', '2026-01-24 21:22:51', 1),
(52, 8, '', '', '', 272, '2026-01-25 03:39:00', '2026-01-25 04:39:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-24 21:39:13', 0),
(53, 1, '', '', '', 296, '2026-01-25 04:54:00', '2026-01-25 05:54:00', 1, 1, 2800.00, 'cancelled', 'pending', '2026-01-24 22:54:19', 0),
(54, 8, '', '', '', 297, '2026-01-25 14:20:00', '2026-01-26 02:20:00', 12, 12, 33700.00, 'completed', 'pending', '2026-01-25 08:20:11', 0),
(55, 8, '', '', '', 228, '2026-01-25 14:28:00', '2026-01-25 15:28:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-25 08:28:30', 0),
(56, 8, '', '', '', 215, '2026-01-25 14:29:00', '2026-01-25 15:29:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 08:29:42', 0),
(57, 8, '', '', '', 221, '2026-01-25 14:31:00', '2026-01-25 20:31:00', 6, 6, 16869.52, 'completed', 'pending', '2026-01-25 08:31:31', 0),
(58, 8, '', '', '', 216, '2026-01-25 14:48:00', '2026-01-25 16:48:00', 2, 2, 3700.00, 'completed', 'pending', '2026-01-25 08:48:08', 1),
(59, 8, '', '', '', 281, '2026-01-25 14:51:00', '2026-01-25 15:51:00', 1, 1, 2800.00, 'completed', 'pending', '2026-01-25 08:51:34', 0),
(60, 8, '', '', '', 101, '2026-01-25 14:58:00', '2026-01-25 15:58:00', 1, 1, 2800.00, 'cancelled', 'pending', '2026-01-25 08:58:16', 0),
(61, 8, '', '', '', 274, '2026-01-25 15:14:00', '2026-01-25 16:14:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 09:14:40', 0),
(62, 8, '', '', '', 298, '2026-01-25 15:23:00', '2026-01-25 16:23:00', 1, 1, 2800.00, 'completed', 'pending', '2026-01-25 09:23:33', 0),
(63, 8, '', '', '', 299, '2026-01-25 15:23:00', '2026-01-25 16:23:00', 1, 1, 2800.00, 'completed', 'pending', '2026-01-25 09:23:33', 0),
(64, 8, '', '', '', 286, '2026-01-25 15:27:00', '2026-01-25 16:27:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 09:27:25', 0),
(65, 8, '', '', '', 226, '2026-01-25 15:28:00', '2026-01-25 16:28:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 09:28:46', 0),
(66, 8, '', '', '', 286, '2026-01-25 15:32:00', '2026-01-25 16:32:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 09:32:08', 0),
(67, 8, '', '', '', 271, '2026-01-25 15:32:00', '2026-01-25 16:32:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 09:32:18', 0),
(68, 8, '', '', '', 211, '2026-01-25 15:37:00', '2026-01-25 17:37:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 09:37:43', 1),
(69, 8, NULL, NULL, NULL, 212, '2026-01-25 15:41:00', '2026-01-25 17:41:00', 2, 2, 2500.00, 'cancelled', 'pending', '2026-01-25 09:41:22', 1),
(70, 9, NULL, NULL, NULL, 271, '2026-01-25 15:43:00', '2026-01-25 16:43:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 09:43:09', 0),
(71, 9, NULL, NULL, NULL, 271, '2026-01-25 15:47:00', '2026-01-25 16:47:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 09:47:17', 0),
(72, 9, NULL, NULL, NULL, 211, '2026-01-25 15:50:00', '2026-01-25 17:50:00', 2, 2, 2400.00, 'completed', 'pending', '2026-01-25 09:50:54', 1),
(73, 8, NULL, NULL, NULL, 271, '2026-01-25 15:51:00', '2026-01-25 16:51:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 09:52:06', 0),
(74, 9, NULL, NULL, NULL, 272, '2026-01-25 15:55:00', '2026-01-25 16:55:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 09:55:15', 0),
(75, 9, NULL, NULL, NULL, 273, '2026-01-25 15:57:00', '2026-01-25 16:57:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 09:57:07', 0),
(76, 8, '', '', '', 274, '2026-01-25 16:20:00', '2026-01-25 17:20:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 10:20:35', 0),
(77, NULL, 'MD Alamin', 'alaminpma@gmail.com', '01796078653', 212, '2026-01-25 20:28:00', '2026-01-25 22:28:00', 2, 2, 2400.00, 'pending', 'pending', '2026-01-25 14:29:11', 1),
(78, 14, '', '', '', 286, '2026-01-25 20:41:00', '2026-01-25 21:41:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 14:41:26', 0),
(79, NULL, 'gg', 'd', 'ff', 291, '2026-01-25 20:46:00', '2026-01-25 21:46:00', 1, 1, 1800.00, 'pending', 'pending', '2026-01-25 14:47:23', 0),
(80, NULL, 'gg', 'd', 'ff', 292, '2026-01-25 20:46:00', '2026-01-25 21:46:00', 1, 1, 1800.00, 'pending', 'pending', '2026-01-25 14:47:24', 0),
(81, 14, '', '', '', 287, '2026-01-25 20:49:00', '2026-01-25 21:49:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 14:49:51', 0),
(82, 14, '', '', '', 213, '2026-01-25 20:50:00', '2026-01-25 22:50:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 14:50:20', 1),
(83, 14, '', '', '', 286, '2026-01-25 21:07:00', '2026-01-25 22:07:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 15:07:25', 0),
(84, 14, '', '', '', 213, '2026-01-25 21:09:00', '2026-01-25 23:09:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 15:09:27', 1),
(85, 14, '', '', '', 274, '2026-01-25 21:09:00', '2026-01-25 22:09:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 15:09:49', 0),
(86, 14, '', '', '', 273, '2026-01-25 21:29:00', '2026-01-25 22:29:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 15:29:38', 0),
(87, 14, '', '', '', 213, '2026-01-25 21:30:00', '2026-01-25 23:30:00', 2, 2, 2550.00, 'completed', 'pending', '2026-01-25 15:30:25', 1),
(88, 15, 'pp', 'p@gmail.com', '00111111', 214, '2026-01-25 21:31:00', '2026-01-25 23:31:00', 2, 2, 2400.00, 'completed', 'pending', '2026-01-25 15:31:44', 1),
(89, 15, '', '', '', 211, '2026-01-25 21:33:00', '2026-01-25 23:33:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 15:33:18', 1),
(90, 15, '', '', '', 286, '2026-01-25 21:33:00', '2026-01-25 22:33:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 15:33:37', 0),
(91, 15, '', '', '', 287, '2026-01-25 21:33:00', '2026-01-25 22:33:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 15:33:38', 0),
(92, 15, '', '', '', 293, '2026-01-25 22:35:00', '2026-01-25 23:35:00', 1, 1, 1800.00, 'cancelled', 'pending', '2026-01-25 17:08:24', 0),
(93, 15, '', '', '', 294, '2026-01-25 22:35:00', '2026-01-25 23:35:00', 1, 1, 1800.00, 'completed', 'pending', '2026-01-25 17:08:25', 0),
(94, 15, '', '', '', 271, '2026-01-25 23:16:00', '2026-01-26 00:16:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 17:16:45', 0),
(95, 15, '', '', '', 146, '2026-01-25 23:17:00', '2026-01-26 05:17:00', 6, 6, 16900.00, 'cancelled', 'pending', '2026-01-25 17:17:17', 0),
(96, 15, '', '', '', 271, '2026-01-25 23:40:00', '2026-01-26 00:40:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 17:53:07', 0),
(97, 2, '', '', '', 272, '2026-01-26 00:03:00', '2026-01-26 01:03:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 18:03:23', 0),
(98, 1, '', '', '', 276, '2026-01-26 00:04:00', '2026-01-26 01:04:00', 1, 1, 1800.00, 'cancelled', 'pending', '2026-01-25 18:04:08', 0),
(99, 1, '', '', '', 286, '2026-01-26 00:08:00', '2026-01-26 01:08:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 18:08:56', 0),
(100, 1, '', '', '', 271, '2026-01-26 00:09:00', '2026-01-26 01:09:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 18:09:54', 0),
(101, 2, '', '', '', 272, '2026-01-26 00:10:00', '2026-01-26 01:10:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 18:10:39', 0),
(102, 15, '', '', '', 273, '2026-01-26 00:14:00', '2026-01-26 01:14:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 18:14:49', 0),
(103, 15, '', '', '', 211, '2026-01-26 00:15:00', '2026-01-26 02:15:00', 2, 2, 2400.00, 'completed', 'pending', '2026-01-25 18:15:32', 1),
(104, 15, '', '', '', 213, '2026-01-26 00:21:00', '2026-01-26 02:21:00', 2, 2, 2469.46, 'completed', 'pending', '2026-01-25 18:21:19', 1),
(105, 15, '', '', '', 271, '2026-01-26 00:31:00', '2026-01-26 01:31:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 18:31:34', 0),
(106, 15, '', '', '', 211, '2026-01-26 00:31:00', '2026-01-26 02:31:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:31:49', 1),
(107, 15, '', '', '', 213, '2026-01-26 00:31:00', '2026-01-26 02:31:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:31:50', 1),
(108, 15, '', '', '', 211, '2026-01-26 00:32:00', '2026-01-26 02:32:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:32:49', 1),
(109, 15, '', '', '', 213, '2026-01-26 00:32:00', '2026-01-26 02:32:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:32:51', 1),
(110, 15, '', '', '', 211, '2026-01-26 00:33:00', '2026-01-26 02:33:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:33:16', 1),
(111, 15, '', '', '', 256, '2026-01-26 00:33:00', '2026-01-26 01:33:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 18:33:42', 0),
(112, 15, '', '', '', 213, '2026-01-26 00:34:00', '2026-01-26 02:34:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:34:19', 1),
(113, 15, '', '', '', 214, '2026-01-26 00:34:00', '2026-01-26 02:34:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:38:09', 1),
(114, 15, '', '', '', 215, '2026-01-26 00:38:00', '2026-01-26 02:38:00', 2, 2, 2400.00, 'cancelled', 'pending', '2026-01-25 18:38:29', 1),
(115, 15, '', '', '', 286, '2026-01-26 00:59:00', '2026-01-26 01:59:00', 1, 1, 1200.00, 'completed', 'pending', '2026-01-25 18:59:39', 0),
(116, 15, '', '', '', 271, '2026-01-26 02:32:00', '2026-01-26 03:32:00', 1, 1, 1200.00, 'cancelled', 'pending', '2026-01-25 20:32:55', 0),
(117, 15, '', '', '', 286, '2026-01-26 03:08:00', '2026-01-26 04:08:00', 1, 1, 1300.00, 'completed', 'pending', '2026-01-25 21:09:04', 0),
(118, 15, '', '', '', 211, '2026-01-26 03:16:00', '2026-01-26 05:16:00', 2, 2, 2500.00, 'cancelled', 'pending', '2026-01-25 21:16:54', 1),
(119, 15, '', '', '', 271, '2026-01-26 03:42:00', '2026-01-26 04:42:00', 1, 1, 1200.00, 'cancelled', 'completed', '2026-01-25 21:42:18', 0),
(120, 15, '', '', '', 211, '2026-01-26 03:43:00', '2026-01-26 04:43:00', 1, 1, 1300.00, 'cancelled', 'completed', '2026-01-25 21:43:31', 0),
(121, 15, '', '', '', 286, '2026-01-26 04:08:00', '2026-01-26 05:08:00', 1, 1, 1200.00, 'completed', 'completed', '2026-01-25 22:08:29', 0),
(122, 15, '', '', '', 301, '2026-01-26 04:10:00', '2026-01-26 05:10:00', 1, 1, 3.00, 'completed', 'completed', '2026-01-25 22:10:44', 0),
(123, 15, '', '', '', 211, '2026-01-26 14:10:00', '2026-01-26 16:10:00', 2, 2, 2500.00, 'cancelled', 'completed', '2026-01-26 08:10:24', 1),
(124, 15, '', '', '', 271, '2026-01-26 15:22:00', '2026-01-26 16:22:00', 1, 1, 1200.00, 'cancelled', 'completed', '2026-01-26 09:22:39', 0),
(125, 15, '', '', '', 281, '2026-01-26 16:28:00', '2026-01-26 17:28:00', 1, 1, 2800.00, 'cancelled', 'completed', '2026-01-26 10:28:42', 0),
(126, 15, '', '', '', 276, '2026-01-26 16:41:00', '2026-01-26 17:41:00', 1, 1, 1800.00, 'cancelled', 'completed', '2026-01-26 10:41:50', 0),
(127, 16, '', '', '', 271, '2026-01-27 18:14:00', '2026-01-27 19:14:00', 1, 1, 1200.00, 'active', 'completed', '2026-01-27 12:14:20', 0),
(128, 17, '', '', '', 301, '2026-01-27 19:11:00', '2026-01-27 20:11:00', 1, 1, 3.00, 'cancelled', 'pending', '2026-01-27 13:12:09', 0),
(129, 18, '', '', '', 286, '2026-01-27 19:10:00', '2026-01-27 21:10:00', 2, 2, 2550.00, 'active', 'pending', '2026-01-27 13:15:09', 0),
(130, 9, '', '', '', 301, '2026-01-27 21:12:00', '2026-01-27 22:12:00', 1, 1, 3.00, 'cancelled', 'pending', '2026-01-27 15:14:50', 0),
(131, 19, '', '', '', 257, '2026-01-27 21:49:00', '2026-01-27 22:49:00', 1, 1, 1200.00, 'cancelled', 'completed', '2026-01-27 15:49:50', 0),
(132, 15, '', '', '', 301, '2026-01-27 22:07:00', '2026-01-27 23:07:00', 1, 1, 3.00, 'cancelled', 'completed', '2026-01-27 16:07:34', 0),
(133, 20, '', '', '', 301, '2026-01-27 22:12:00', '2026-01-27 23:12:00', 1, 1, 3.00, 'cancelled', 'completed', '2026-01-27 16:12:31', 0),
(134, 20, '', '', '', 272, '2026-01-27 22:17:00', '2026-01-27 23:17:00', 1, 1, 1200.00, 'cancelled', 'completed', '2026-01-27 16:17:47', 0),
(135, 20, '', '', '', 211, '2026-01-27 22:18:00', '2026-01-28 00:18:00', 2, 2, 2400.00, 'cancelled', 'completed', '2026-01-27 16:18:25', 1),
(136, 21, '', '', '', 136, '2026-01-28 00:36:00', '2026-01-28 01:36:00', 1, 1, 1300.00, 'pending', 'completed', '2026-01-27 18:40:38', 0),
(137, 21, '', '', '', 213, '2026-01-28 00:41:00', '2026-01-28 02:41:00', 2, 2, 2400.00, 'active', 'completed', '2026-01-27 18:41:59', 1);

-- --------------------------------------------------------

--
-- Table structure for table `booking_extensions`
--

CREATE TABLE `booking_extensions` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `extension_hours` decimal(5,2) NOT NULL,
  `new_checkout_time` datetime NOT NULL,
  `extension_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `booking_extensions`
--

INSERT INTO `booking_extensions` (`id`, `booking_id`, `extension_hours`, `new_checkout_time`, `extension_price`, `created_at`) VALUES
(1, 25, 1.00, '2026-01-22 10:00:00', 500.00, '2026-01-21 18:40:41'),
(2, 25, 1.00, '2026-01-22 16:00:00', 500.00, '2026-01-21 18:44:10'),
(3, 25, 1.00, '2026-01-22 22:00:00', 500.00, '2026-01-21 18:46:46'),
(4, 25, 1.00, '2026-01-23 04:00:00', 500.00, '2026-01-21 18:46:55'),
(5, 25, 1.00, '2026-01-23 10:00:00', 500.00, '2026-01-21 18:47:00'),
(6, 25, 1.00, '2026-01-23 16:00:00', 500.00, '2026-01-21 18:47:07'),
(7, 25, 1.00, '2026-01-23 22:00:00', 500.00, '2026-01-21 18:47:11'),
(8, 25, 1.00, '2026-01-24 04:00:00', 500.00, '2026-01-21 18:47:19'),
(9, 25, 1.00, '2026-01-24 10:00:00', 500.00, '2026-01-21 18:47:23'),
(10, 25, 1.00, '2026-01-24 16:00:00', 500.00, '2026-01-21 18:49:02'),
(11, 25, 1.00, '2026-01-24 22:00:00', 500.00, '2026-01-21 18:49:05'),
(12, 25, 1.00, '2026-01-25 04:00:00', 500.00, '2026-01-21 18:49:06'),
(13, 25, 1.00, '2026-01-25 10:00:00', 500.00, '2026-01-21 18:49:10'),
(14, 25, 1.00, '2026-01-25 16:00:00', 500.00, '2026-01-21 18:49:16'),
(15, 25, 1.00, '2026-01-25 22:00:00', 500.00, '2026-01-21 18:49:19'),
(16, 25, 1.00, '2026-01-26 04:00:00', 500.00, '2026-01-21 18:49:25'),
(17, 25, 1.00, '2026-01-26 10:00:00', 500.00, '2026-01-21 18:50:24'),
(18, 25, 1.00, '2026-01-26 16:00:00', 500.00, '2026-01-21 18:50:29'),
(19, 25, 1.00, '2026-01-26 22:00:00', 500.00, '2026-01-21 18:50:36'),
(20, 25, 1.00, '2026-01-27 04:00:00', 500.00, '2026-01-21 18:50:40'),
(21, 25, 1.00, '2026-01-27 10:00:00', 500.00, '2026-01-21 18:50:44'),
(22, 25, 1.00, '2026-01-27 16:00:00', 500.00, '2026-01-21 18:50:49'),
(23, 25, 1.00, '2026-01-27 22:00:00', 500.00, '2026-01-21 18:52:05'),
(24, 25, 1.00, '2026-01-28 04:00:00', 500.00, '2026-01-21 18:52:09'),
(25, 25, 1.00, '2026-01-28 10:00:00', 500.00, '2026-01-21 18:52:14'),
(26, 25, 1.00, '2026-01-28 16:00:00', 500.00, '2026-01-21 18:52:49'),
(27, 25, 1.00, '2026-01-28 22:00:00', 500.00, '2026-01-21 18:52:52'),
(28, 25, 1.00, '2026-01-29 04:00:00', 500.00, '2026-01-21 18:53:04'),
(29, 25, 5.00, '2026-01-29 14:00:00', 2500.00, '2026-01-21 18:53:11');

-- --------------------------------------------------------

--
-- Table structure for table `cancellation_penalties`
--

CREATE TABLE `cancellation_penalties` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `penalty_amount` decimal(10,2) DEFAULT NULL,
  `cancellation_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `strike_count` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cms_content`
--

CREATE TABLE `cms_content` (
  `id` int(11) NOT NULL,
  `content_key` varchar(100) NOT NULL,
  `content_value` text NOT NULL,
  `content_type` enum('text','html','image_url') DEFAULT 'text',
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cms_content`
--

INSERT INTO `cms_content` (`id`, `content_key`, `content_value`, `content_type`, `updated_at`) VALUES
(1, 'privacy_policy', 'Privacy Policy Congggtent Here...', 'text', '2026-01-24 16:58:40'),
(2, 'terms_conditions', 'Terms and Conditions Content ddddHere...', 'text', '2026-01-24 16:32:57'),
(3, 'about_us', 'About Us Content Here...', 'text', '2026-01-23 17:12:24'),
(4, 'contact_email', 'support@rentify.com', 'text', '2026-01-23 17:12:24');

-- --------------------------------------------------------

--
-- Table structure for table `food_items`
--

CREATE TABLE `food_items` (
  `id` int(11) NOT NULL,
  `hotel_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_available` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `food_items`
--

INSERT INTO `food_items` (`id`, `hotel_id`, `name`, `description`, `price`, `image_url`, `is_available`, `created_at`) VALUES
(1, 1, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:31'),
(2, 1, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:31'),
(3, 1, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:31'),
(4, 1, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:31'),
(5, 1, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:31'),
(6, 1, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:31'),
(7, 1, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:31'),
(8, 1, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:31'),
(9, 2, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:31'),
(10, 2, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:31'),
(11, 2, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:31'),
(12, 2, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:31'),
(13, 2, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:31'),
(14, 2, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:31'),
(15, 2, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:31'),
(16, 2, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:31'),
(17, 3, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:31'),
(18, 3, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:31'),
(19, 3, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:31'),
(20, 3, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:31'),
(21, 3, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:31'),
(22, 3, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:31'),
(23, 3, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:31'),
(24, 3, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:31'),
(25, 4, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:31'),
(26, 4, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:31'),
(27, 4, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:31'),
(28, 4, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:31'),
(29, 4, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:31'),
(30, 4, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:31'),
(31, 4, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:31'),
(32, 4, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:31'),
(33, 5, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(34, 5, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(35, 5, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(36, 5, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(37, 5, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(38, 5, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(39, 5, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(40, 5, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(41, 6, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(42, 6, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(43, 6, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(44, 6, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(45, 6, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(46, 6, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(47, 6, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(48, 6, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(49, 7, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(50, 7, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(51, 7, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(52, 7, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(53, 7, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(54, 7, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(55, 7, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(56, 7, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(57, 8, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(58, 8, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(59, 8, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(60, 8, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(61, 8, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(62, 8, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(63, 8, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(64, 8, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(65, 9, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(66, 9, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(67, 9, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(68, 9, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(69, 9, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(70, 9, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(71, 9, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(72, 9, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(73, 10, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(74, 10, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(75, 10, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(76, 10, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(77, 10, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(78, 10, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(79, 10, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(80, 10, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(81, 11, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(82, 11, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(83, 11, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(84, 11, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(85, 11, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(86, 11, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(87, 11, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(88, 11, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(89, 12, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(90, 12, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(91, 12, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(92, 12, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(93, 12, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(94, 12, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(95, 12, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(96, 12, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(97, 13, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(98, 13, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(99, 13, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(100, 13, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(101, 13, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(102, 13, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(103, 13, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(104, 13, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(105, 14, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(106, 14, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(107, 14, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(108, 14, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(109, 14, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(110, 14, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(111, 14, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(112, 14, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(113, 15, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(114, 15, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(115, 15, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(116, 15, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(117, 15, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(118, 15, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(119, 15, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(120, 15, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(121, 16, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(122, 16, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(123, 16, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(124, 16, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(125, 16, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(126, 16, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(127, 16, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(128, 16, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(129, 17, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(130, 17, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(131, 17, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(132, 17, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(133, 17, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(134, 17, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(135, 17, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(136, 17, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(137, 18, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(138, 18, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(139, 18, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(140, 18, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(141, 18, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(142, 18, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(143, 18, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(144, 18, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(145, 19, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(146, 19, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(147, 19, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(148, 19, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(149, 19, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(150, 19, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(151, 19, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(152, 19, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32'),
(153, 20, 'Biryani', 'Fragrant basmati rice with spices', 250.00, 'assets/food/biryani.png', 1, '2026-01-23 19:21:32'),
(154, 20, 'Butter Chicken', 'Creamy chicken curry', 280.00, 'assets/food/butter_chicken.png', 1, '2026-01-23 19:21:32'),
(155, 20, 'Tandoori Chicken', 'Char-grilled spiced chicken', 300.00, 'assets/food/tandoori_chicken.png', 1, '2026-01-23 19:21:32'),
(156, 20, 'Dal Fry', 'Lentil curry', 180.00, '/assets/food/dal_fry.png', 1, '2026-01-23 19:21:32'),
(157, 20, 'Naan Bread', 'Traditional Indian bread', 80.00, 'assets/food/naan_bread.png', 1, '2026-01-23 19:21:32'),
(158, 20, 'Tea/Coffee', 'Hot beverage', 50.00, 'assets/food/tea.png', 1, '2026-01-23 19:21:32'),
(159, 20, 'Breakfast Combo', 'Eggs, toast, butter, jam', 150.00, 'assets/food/breakfast.png', 1, '2026-01-23 19:21:32'),
(160, 20, 'Fresh Juice', 'Orange or mango juice', 100.00, 'assets/food/fresh_juice.png', 1, '2026-01-23 19:21:32');

-- --------------------------------------------------------

--
-- Table structure for table `food_orders`
--

CREATE TABLE `food_orders` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `items_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`items_json`)),
  `total_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','accepted','preparing','ready','on_the_way','delivered','cancelled') DEFAULT 'pending',
  `delivery_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `food_orders`
--

INSERT INTO `food_orders` (`id`, `booking_id`, `user_id`, `items_json`, `total_amount`, `status`, `delivery_time`, `created_at`) VALUES
(1, 1, 8, '[{\"id\":2,\"name\":\"Butter Chicken\",\"quantity\":2,\"price\":\"280.00\"}]', 560.00, 'delivered', '2026-01-23 22:12:32', '2026-01-23 20:33:11'),
(2, 1, 8, '[{\"id\":2,\"name\":\"Butter Chicken\",\"quantity\":2,\"price\":\"280.00\"}]', 560.00, 'delivered', '2026-01-23 22:17:30', '2026-01-23 20:42:22'),
(3, 16, 8, '[{\"id\":153,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"}]', 250.00, 'delivered', '2026-01-23 22:12:40', '2026-01-23 22:08:29'),
(4, 16, 8, '[{\"id\":153,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"}]', 250.00, 'delivered', '2026-01-23 23:37:00', '2026-01-23 22:19:57'),
(5, 16, 8, '[{\"id\":153,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"},{\"id\":154,\"name\":\"Butter Chicken\",\"quantity\":1,\"price\":\"280.00\"},{\"id\":159,\"name\":\"Breakfast Combo\",\"quantity\":1,\"price\":\"150.00\"},{\"id\":160,\"name\":\"Fresh Juice\",\"quantity\":2,\"price\":\"100.00\"}]', 880.00, 'delivered', '2026-01-23 23:36:59', '2026-01-23 22:29:43'),
(6, 16, 8, '[{\"id\":153,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"},{\"id\":154,\"name\":\"Butter Chicken\",\"quantity\":1,\"price\":\"280.00\"}]', 530.00, 'delivered', '2026-01-23 23:36:58', '2026-01-23 22:34:18'),
(7, 2, 8, '[{\"id\":153,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"},{\"id\":154,\"name\":\"Butter Chicken\",\"quantity\":1,\"price\":\"280.00\"}]', 530.00, 'delivered', '2026-01-23 23:36:54', '2026-01-23 23:36:27'),
(8, 30, 8, '[{\"id\":121,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"},{\"id\":122,\"name\":\"Butter Chicken\",\"quantity\":5,\"price\":\"280.00\"}]', 1650.00, 'cancelled', '2026-01-24 15:57:58', '2026-01-24 14:36:32'),
(9, 32, 8, '[{\"id\":153,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"},{\"id\":154,\"name\":\"Butter Chicken\",\"quantity\":2,\"price\":\"280.00\"},{\"id\":155,\"name\":\"Tandoori Chicken\",\"quantity\":1,\"price\":\"300.00\"}]', 1110.00, 'delivered', '2026-01-24 16:04:22', '2026-01-24 15:59:18'),
(10, 117, 15, '[{\"id\":153,\"name\":\"Biryani\",\"quantity\":3,\"price\":\"250.00\"}]', 750.00, 'delivered', '2026-01-25 21:10:47', '2026-01-25 21:10:16'),
(11, 137, 21, '[{\"id\":113,\"name\":\"Biryani\",\"quantity\":1,\"price\":\"250.00\"},{\"id\":114,\"name\":\"Butter Chicken\",\"quantity\":1,\"price\":\"280.00\"},{\"id\":115,\"name\":\"Tandoori Chicken\",\"quantity\":1,\"price\":\"300.00\"}]', 830.00, 'delivered', '2026-01-27 18:55:35', '2026-01-27 18:51:31');

-- --------------------------------------------------------

--
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `is_verified` tinyint(4) DEFAULT 1,
  `food_service_enabled` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(4) DEFAULT 1,
  `contact_email` varchar(255) DEFAULT NULL,
  `check_in_time` time DEFAULT '14:00:00',
  `check_out_time` time DEFAULT '12:00:00',
  `emergency_contact` varchar(20) DEFAULT NULL,
  `cancellation_policy` text DEFAULT NULL,
  `house_rules` text DEFAULT NULL,
  `min_booking_hours` int(11) DEFAULT 1,
  `max_booking_hours` int(11) DEFAULT 24,
  `has_wifi` tinyint(4) DEFAULT 1,
  `has_parking` tinyint(4) DEFAULT 0,
  `has_ac` tinyint(4) DEFAULT 1,
  `has_elevator` tinyint(4) DEFAULT 0,
  `has_restaurant` tinyint(4) DEFAULT 0,
  `has_gym` tinyint(4) DEFAULT 0,
  `has_pool` tinyint(4) DEFAULT 0,
  `has_laundry` tinyint(4) DEFAULT 0,
  `hotel_type` enum('hotel','apartment','resort','villa','hostel') DEFAULT 'hotel'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`id`, `vendor_id`, `name`, `description`, `address`, `city`, `latitude`, `longitude`, `image_url`, `contact_phone`, `is_verified`, `food_service_enabled`, `created_at`, `is_active`, `contact_email`, `check_in_time`, `check_out_time`, `emergency_contact`, `cancellation_policy`, `house_rules`, `min_booking_hours`, `max_booking_hours`, `has_wifi`, `has_parking`, `has_ac`, `has_elevator`, `has_restaurant`, `has_gym`, `has_pool`, `has_laundry`, `hotel_type`) VALUES
(1, 2, 'Vatara Grand Hotel', 'Modern hotel with excellent amenities and 24/7 room service', '100 Ft Area, Vatara, Dhaka (Ref: 1)', 'Dhaka', 23.80420000, 90.45260000, 'assets/properties/hotel_1.jpg', NULL, 1, 1, '2026-01-23 19:21:31', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(2, 2, '100 Ft Plaza Stay', 'Budget-friendly rooms perfect for short-term stays', '100 Ft Area, Vatara, Dhaka (Ref: 2)', 'Dhaka', 23.80830000, 90.44320000, 'assets/properties/hotel_2.jpg', NULL, 1, 1, '2026-01-23 19:21:31', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(3, 2, 'Dhaka Central Lodge', 'Luxury accommodation with premium facilities', '100 Ft Area, Vatara, Dhaka (Ref: 3)', 'Dhaka', 23.81120000, 90.45510000, 'assets/properties/hotel_3.jpg', NULL, 1, 1, '2026-01-23 19:21:31', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(4, 2, 'Business Express Hotel', 'Business-focused hotel with meeting rooms', '100 Ft Area, Vatara, Dhaka (Ref: 4)', 'Dhaka', 23.82000000, 90.44130000, 'assets/properties/hotel_4.jpg', NULL, 1, 1, '2026-01-23 19:21:31', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(5, 2, 'Comfort Inn Vatara', 'Cozy rooms with complimentary breakfast', '100 Ft Area, Vatara, Dhaka (Ref: 5)', 'Dhaka', 23.80690000, 90.45180000, 'assets/properties/hotel_5.jpg', NULL, 1, 1, '2026-01-23 19:21:31', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(6, 2, 'City View Residency', 'Contemporary rooms with city views', '100 Ft Area, Vatara, Dhaka (Ref: 6)', 'Dhaka', 23.81270000, 90.44590000, 'assets/properties/hotel_6.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 0, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(7, 2, 'Modern Stay Hotel', 'Quick check-in/check-out service', '100 Ft Area, Vatara, Dhaka (Ref: 7)', 'Dhaka', 23.81060000, 90.43840000, 'assets/properties/hotel_7.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 0, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(8, 2, 'Vatara Premier Rooms', 'Family-friendly accommodation with activities', '100 Ft Area, Vatara, Dhaka (Ref: 8)', 'Dhaka', 23.81540000, 90.44930000, 'assets/properties/hotel_8.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(9, 2, 'Quick Escape Suites', 'Executive suites with premium service', '100 Ft Area, Vatara, Dhaka (Ref: 9)', 'Dhaka', 23.81780000, 90.45290000, 'assets/properties/hotel_9.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(10, 2, 'Riverside Executive Hotel', 'Riverside location with scenic views', '100 Ft Area, Vatara, Dhaka (Ref: 10)', 'Dhaka', 23.81990000, 90.45060000, 'assets/properties/hotel_10.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(11, 2, 'Dhaka Hub Lodging', 'Central location near major attractions', '100 Ft Area, Vatara, Dhaka (Ref: 11)', 'Dhaka', 23.80730000, 90.44170000, 'assets/properties/hotel_11.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(12, 2, 'Budget Plus Hotel', 'Affordable rooms for budget travelers', '100 Ft Area, Vatara, Dhaka (Ref: 12)', 'Dhaka', 23.80290000, 90.44360000, 'assets/properties/hotel_12.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(13, 2, 'Premium Boutique Stay', 'High-end boutique experience', '100 Ft Area, Vatara, Dhaka (Ref: 13)', 'Dhaka', 23.81670000, 90.44470000, 'assets/properties/hotel_13.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(14, 2, 'Vatara Comfort Zone', 'Comfortable and spacious rooms', '100 Ft Area, Vatara, Dhaka (Ref: 14)', 'Dhaka', 23.80580000, 90.45400000, 'assets/properties/hotel_14.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(15, 2, 'Central Business Hotel', 'Business traveler friendly', '100 Ft Area, Vatara, Dhaka (Ref: 15)', 'Dhaka', 23.80530000, 90.43960000, 'assets/properties/hotel_15.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(16, 2, 'Express Lodging Vatara', 'Fast and efficient service', '100 Ft Area, Vatara, Dhaka (Ref: 16)', 'Dhaka', 23.80680000, 90.44120000, 'assets/properties/hotel_16.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(17, 2, 'Elite Rest Hotel', 'Premium amenities and facilities', '100 Ft Area, Vatara, Dhaka (Ref: 17)', 'Dhaka', 23.80960000, 90.44000000, 'assets/properties/hotel_17.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(18, 2, 'Dhaka Transit Station', 'Perfect for transit travelers', '100 Ft Area, Vatara, Dhaka (Ref: 18)', 'Dhaka', 23.80540000, 90.44470000, 'assets/properties/hotel_18.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(19, 2, 'Vatara Smart Stay', 'Smart rooms with modern technology', '100 Ft Area, Vatara, Dhaka (Ref: 19)', 'Dhaka', 23.80160000, 90.44540000, 'assets/properties/hotel_19.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel'),
(20, 2, 'Downtown Residency', 'Downtown convenience and comfort', '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'Dhaka', 23.81250000, 90.44650000, 'assets/properties/hotel_20.jpg', NULL, 1, 1, '2026-01-23 19:21:32', 1, NULL, '14:00:00', '12:00:00', NULL, NULL, NULL, 1, 24, 1, 0, 1, 0, 0, 0, 0, 0, 'hotel');

-- --------------------------------------------------------

--
-- Table structure for table `hotel_reviews`
--

CREATE TABLE `hotel_reviews` (
  `id` int(11) NOT NULL,
  `hotel_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hotel_reviews`
--

INSERT INTO `hotel_reviews` (`id`, `hotel_id`, `user_id`, `booking_id`, `rating`, `comment`, `created_at`) VALUES
(2, 16, 8, 47, 5, '', '2026-01-24 19:22:27'),
(3, 19, 8, 46, 5, '', '2026-01-24 19:22:37'),
(4, 15, 8, 36, 5, '', '2026-01-24 19:22:45'),
(5, 13, 8, 37, 5, '', '2026-01-24 19:22:59'),
(6, 19, 8, 38, 5, '', '2026-01-24 19:37:31'),
(7, 20, 8, 28, 5, '', '2026-01-24 19:37:38'),
(8, 19, 8, 52, 5, '', '2026-01-24 21:39:45'),
(9, 15, 15, 88, 5, '', '2026-01-25 15:32:22'),
(10, 20, 15, 122, 5, '', '2026-01-25 23:08:51'),
(11, 20, 15, 121, 1, '', '2026-01-25 23:09:17'),
(12, 15, 15, 104, 5, '', '2026-01-25 23:47:21'),
(13, 20, 15, 117, 4, '', '2026-01-26 01:02:48');

-- --------------------------------------------------------

--
-- Table structure for table `journey_requests`
--

CREATE TABLE `journey_requests` (
  `id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `pickup_latitude` decimal(10,8) DEFAULT NULL,
  `pickup_longitude` decimal(11,8) DEFAULT NULL,
  `dropoff_latitude` decimal(10,8) DEFAULT NULL,
  `dropoff_longitude` decimal(11,8) DEFAULT NULL,
  `destination_name` varchar(255) DEFAULT NULL,
  `vehicle_type` enum('motorbike','car') DEFAULT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  `fare` decimal(10,2) DEFAULT NULL,
  `status` enum('requested','assigned','on_the_way','picked','completed','cancelled') DEFAULT 'requested',
  `rider_id` int(11) DEFAULT NULL,
  `request_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `locked_at` timestamp NULL DEFAULT NULL,
  `locked_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `journey_requests`
--

INSERT INTO `journey_requests` (`id`, `booking_id`, `user_id`, `driver_id`, `pickup_latitude`, `pickup_longitude`, `dropoff_latitude`, `dropoff_longitude`, `destination_name`, `vehicle_type`, `distance`, `fare`, `status`, `rider_id`, `request_time`, `created_at`, `locked_at`, `locked_by`) VALUES
(1, 15, 8, NULL, 23.81250000, 90.44650000, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-23 20:28:33', '2026-01-23 20:28:33', NULL, NULL),
(2, 16, 8, NULL, 23.79939704, 90.42870434, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-23 20:42:11', '2026-01-23 20:42:11', NULL, NULL),
(3, 18, 8, NULL, 23.79932685, 90.42858518, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-23 22:23:36', '2026-01-23 22:23:36', '2026-01-24 20:33:07', 3),
(4, 20, 8, NULL, 23.79941506, 90.42865649, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-23 23:59:15', '2026-01-23 23:59:15', '2026-01-24 20:48:34', 3),
(5, 0, 8, NULL, 23.79935660, 90.42861982, 23.76438630, 90.38901440, 'Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1215, Bangladesh', '', 5.60, 134.00, 'completed', 3, '2026-01-24 00:06:28', '2026-01-24 00:06:28', NULL, NULL),
(6, 21, 8, NULL, 23.79933601, 90.42856084, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'car', NULL, 200.00, 'completed', 3, '2026-01-24 00:33:45', '2026-01-24 00:33:45', '2026-01-24 20:38:17', 3),
(7, 22, 8, NULL, 23.79933347, 90.42856780, 23.80160000, 90.44540000, '100 Ft Area, Vatara, Dhaka (Ref: 19)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-24 00:34:51', '2026-01-24 00:34:51', '2026-01-24 20:38:15', 3),
(8, 23, 8, NULL, 23.79936994, 90.42864080, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-24 00:43:17', '2026-01-24 00:43:17', '2026-01-24 20:42:27', 3),
(9, 24, 8, NULL, 23.79934735, 90.42856629, 23.80540000, 90.44470000, '100 Ft Area, Vatara, Dhaka (Ref: 18)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-24 00:48:26', '2026-01-24 00:48:26', '2026-01-24 20:33:36', 3),
(10, 25, 8, NULL, 23.79938290, 90.42863911, 23.80160000, 90.44540000, '100 Ft Area, Vatara, Dhaka (Ref: 19)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-24 00:49:55', '2026-01-24 00:49:55', '2026-01-24 20:47:37', 3),
(11, 26, 8, NULL, 23.79932928, 90.42859517, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-24 00:51:45', '2026-01-24 00:51:45', '2026-01-24 20:38:12', 3),
(12, 27, 8, NULL, 23.79933417, 90.42861287, 23.80540000, 90.44470000, '100 Ft Area, Vatara, Dhaka (Ref: 18)', 'motorbike', NULL, 100.00, 'completed', 3, '2026-01-24 00:54:36', '2026-01-24 00:54:36', '2026-01-24 20:41:33', 3),
(13, 28, 8, NULL, 23.79939448, 90.42868582, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', 'car', NULL, 193.02, 'completed', 3, '2026-01-24 01:01:20', '2026-01-24 01:01:20', '2026-01-24 20:48:40', 3),
(14, 29, 8, NULL, 23.79937745, 90.42866343, 23.80540000, 90.44470000, '100 Ft Area, Vatara, Dhaka (Ref: 18)', '', NULL, 76.45, 'completed', 3, '2026-01-24 01:02:14', '2026-01-24 01:02:14', NULL, NULL),
(15, 30, 8, NULL, 23.79932354, 90.42855748, 23.80680000, 90.44120000, '100 Ft Area, Vatara, Dhaka (Ref: 16)', '', NULL, 72.97, 'completed', 3, '2026-01-24 14:35:36', '2026-01-24 14:35:36', NULL, NULL),
(16, 0, 8, NULL, 23.79937207, 90.42862310, 23.76438630, 90.38901440, 'Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1215, Bangladesh', '', 5.60, 134.00, 'completed', 3, '2026-01-24 14:40:40', '2026-01-24 14:40:40', NULL, NULL),
(17, 32, 8, NULL, 23.79936396, 90.42865262, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', '', NULL, 84.95, 'completed', 3, '2026-01-24 15:56:30', '2026-01-24 15:56:30', NULL, NULL),
(18, 0, 8, NULL, 23.79937583, 90.42868487, 23.79856090, 90.42463690, 'Nk Electric Office, vatara, Madani Avenue, Notun Bazar, Baridhara, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1212, Bangladesh', '', 0.42, 56.00, 'completed', 3, '2026-01-24 16:05:12', '2026-01-24 16:05:12', NULL, NULL),
(19, 33, 1, NULL, 23.80680000, 90.44120000, 23.80680000, 90.44120000, '100 Ft Area, Vatara, Dhaka (Ref: 16)', '', NULL, 100.00, 'completed', 3, '2026-01-24 17:54:40', '2026-01-24 17:54:40', '2026-01-24 20:48:45', 3),
(20, 34, 8, NULL, 23.80530000, 90.43960000, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 100.00, 'completed', 3, '2026-01-24 17:55:51', '2026-01-24 17:55:51', '2026-01-24 20:38:21', 3),
(21, 0, 8, NULL, 23.79928733, 90.42851136, 23.76438630, 90.38901440, 'Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1215, Bangladesh', '', 5.59, 134.00, 'completed', 3, '2026-01-24 18:21:13', '2026-01-24 18:21:13', '2026-01-24 20:42:16', 3),
(22, 46, 8, NULL, 23.79937083, 90.42865560, 23.80160000, 90.44540000, '100 Ft Area, Vatara, Dhaka (Ref: 19)', '', NULL, 75.82, 'completed', 3, '2026-01-24 18:45:50', '2026-01-24 18:45:50', '2026-01-24 20:48:02', 3),
(23, 48, 1, NULL, 23.79936706, 90.42865532, 23.80160000, 90.44540000, '100 Ft Area, Vatara, Dhaka (Ref: 19)', '', NULL, 75.82, 'completed', 3, '2026-01-24 19:53:36', '2026-01-24 19:53:36', '2026-01-24 20:38:40', 3),
(24, 49, 8, NULL, 23.79932843, 90.42856676, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', '', NULL, 85.09, 'completed', 3, '2026-01-24 20:16:57', '2026-01-24 20:16:57', NULL, NULL),
(25, 50, 8, NULL, 23.81990000, 90.45060000, 23.81990000, 90.45060000, '100 Ft Area, Vatara, Dhaka (Ref: 10)', '', NULL, 100.00, 'completed', 3, '2026-01-24 20:50:34', '2026-01-24 20:50:34', '2026-01-24 20:50:46', 3),
(26, 50, 8, NULL, 23.81990000, 90.45060000, 23.76438630, 90.38901440, 'dhaka', '', 8.80, 181.94, 'completed', 3, '2026-01-24 21:06:46', '2026-01-24 21:06:46', '2026-01-24 21:07:19', 3),
(27, 54, 8, NULL, 23.81250000, 90.44650000, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', '', NULL, 100.00, 'completed', 3, '2026-01-25 08:20:11', '2026-01-25 08:20:11', '2026-01-25 21:13:34', 3),
(28, 55, 8, NULL, 23.80680000, 90.44120000, 23.80680000, 90.44120000, '100 Ft Area, Vatara, Dhaka (Ref: 16)', '', NULL, 100.00, 'cancelled', NULL, '2026-01-25 08:28:30', '2026-01-25 08:28:30', NULL, NULL),
(29, 57, 8, NULL, 23.79935281, 90.42858110, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 69.52, 'cancelled', NULL, '2026-01-25 08:31:31', '2026-01-25 08:31:31', NULL, NULL),
(30, 58, 8, NULL, 23.80530000, 90.43960000, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 100.00, 'cancelled', NULL, '2026-01-25 08:48:08', '2026-01-25 08:48:08', NULL, NULL),
(31, 69, 8, NULL, 23.80530000, 90.43960000, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 100.00, 'completed', 3, '2026-01-25 09:41:22', '2026-01-25 09:41:22', '2026-01-25 21:13:30', 3),
(32, 87, 14, NULL, 23.80530000, 90.43960000, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 150.00, 'cancelled', NULL, '2026-01-25 15:30:25', '2026-01-25 15:30:25', NULL, NULL),
(33, 95, 15, NULL, 23.81990000, 90.45060000, 23.81990000, 90.45060000, '100 Ft Area, Vatara, Dhaka (Ref: 10)', '', NULL, 100.00, 'cancelled', NULL, '2026-01-25 17:17:17', '2026-01-25 17:17:17', NULL, NULL),
(34, 104, 15, NULL, 23.79938400, 90.42860905, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 69.46, 'cancelled', NULL, '2026-01-25 18:21:19', '2026-01-25 18:21:19', NULL, NULL),
(35, 117, 15, NULL, 23.81250000, 90.44650000, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', '', NULL, 100.00, 'cancelled', NULL, '2026-01-25 21:09:04', '2026-01-25 21:09:04', NULL, NULL),
(36, 0, 15, NULL, 23.79933234, 90.42857189, 23.76438630, 90.38901440, 'Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1215, Bangladesh', 'car', 5.59, 324.00, 'completed', 3, '2026-01-25 21:11:36', '2026-01-25 21:11:36', '2026-01-25 21:11:58', 3),
(37, 118, 15, NULL, 23.80530000, 90.43960000, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 100.00, 'completed', 3, '2026-01-25 21:16:54', '2026-01-25 21:16:54', '2026-01-25 21:17:01', 3),
(38, 120, 15, NULL, 23.80530000, 90.43960000, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 100.00, 'completed', 3, '2026-01-25 21:43:31', '2026-01-25 21:43:31', '2026-01-25 21:44:01', 3),
(39, 123, 15, NULL, 23.80530000, 90.43960000, 23.80530000, 90.43960000, '100 Ft Area, Vatara, Dhaka (Ref: 15)', '', NULL, 100.00, 'cancelled', NULL, '2026-01-26 08:10:24', '2026-01-26 08:10:24', NULL, NULL),
(40, 129, 18, NULL, 23.81250000, 90.44650000, 23.81250000, 90.44650000, '100 Ft Area, Vatara, Dhaka (Ref: 20)', '', NULL, 150.00, 'cancelled', NULL, '2026-01-27 13:15:09', '2026-01-27 13:15:09', NULL, NULL),
(41, 136, 21, NULL, 23.81990000, 90.45060000, 23.81990000, 90.45060000, '100 Ft Area, Vatara, Dhaka (Ref: 10)', '', NULL, 100.00, '', 3, '2026-01-27 18:40:38', '2026-01-27 18:40:38', '2026-01-27 18:48:39', 3),
(42, 0, 21, NULL, 23.79932797, 90.42854871, 23.77373100, 90.36139680, 'Dhaka Central International Medical College & Hospital, 2/1, Ring Road, Japan Garden City, Bashbari, Mohammadpur, Dhaka, Dhaka Metropolitan, Dhaka District, Dhaka Division, 1207, Bangladesh', '', 7.40, 161.00, 'requested', NULL, '2026-01-27 18:52:09', '2026-01-27 18:52:09', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_logs`
--

CREATE TABLE `maintenance_logs` (
  `id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `staff_notified_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `cleaned_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `notification_type` varchar(50) DEFAULT 'general',
  `reference_id` int(11) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `data` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `notification_type`, `reference_id`, `reference_type`, `data`, `is_read`, `created_at`) VALUES
(1, 3, 'Booking Update: Confirmed', 'Your booking for \'Unus\' has been confirmed.', 'booking_status', 'general', 32, NULL, NULL, 1, '2026-01-22 21:17:41'),
(2, 3, 'Booking Update: Confirmed', 'Your booking for \'Unus\' has been confirmed.', 'booking_status', 'general', 32, NULL, NULL, 1, '2026-01-22 21:18:40'),
(3, 3, 'Booking Update: Confirmed', 'Your booking for \'Unus\' has been confirmed.', 'booking_status', 'general', 32, NULL, NULL, 1, '2026-01-22 21:21:51'),
(4, 3, 'Booking Update: Confirmed', 'Your booking for \'Unus\' has been confirmed.', 'booking_status', 'general', 32, NULL, NULL, 1, '2026-01-22 21:22:39'),
(5, 2, 'Booking Update: Confirmed', 'Your booking for \'Unus\' has been confirmed.', 'booking_status', 'general', 31, NULL, NULL, 1, '2026-01-22 21:33:43'),
(6, 1, 'Booking Update: Cancelled', 'Your booking for \'Unus\' has been cancelled.', 'booking_status', 'general', 30, NULL, NULL, 1, '2026-01-22 21:33:47'),
(7, 1, 'Booking Update: Cancelled', 'Your booking for \'Unus\' has been cancelled.', 'booking_status', 'general', 29, NULL, NULL, 1, '2026-01-22 21:49:55'),
(8, 1, 'Booking Update: Cancelled', 'Your booking for \'Unus\' has been cancelled.', 'booking_status', 'general', 28, NULL, NULL, 1, '2026-01-22 22:07:35'),
(9, 1, 'Booking Update: Confirmed', 'Your booking for \'Unus\' has been confirmed.', 'booking_status', 'general', 27, NULL, NULL, 1, '2026-01-22 22:07:39'),
(10, 3, 'Booking Update: Confirmed', 'Your booking for \'Unus\' has been confirmed.', 'booking_status', 'general', 33, NULL, NULL, 1, '2026-01-22 22:25:28'),
(11, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 34, NULL, NULL, 1, '2026-01-22 22:32:33'),
(12, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 35, NULL, NULL, 1, '2026-01-22 22:43:16'),
(13, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 36, NULL, NULL, 1, '2026-01-22 23:02:12'),
(14, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 37, NULL, NULL, 1, '2026-01-23 07:48:44'),
(15, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 38, NULL, NULL, 1, '2026-01-23 08:05:20'),
(16, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 41, NULL, NULL, 1, '2026-01-23 08:08:31'),
(17, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 43, NULL, NULL, 1, '2026-01-23 08:48:06'),
(18, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 44, NULL, NULL, 1, '2026-01-23 09:00:25'),
(19, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 40, NULL, NULL, 1, '2026-01-23 09:08:20'),
(20, 3, 'Booking Update: Confirmed', 'Your booking for \'Shihab\'s Grand Palace\' has been confirmed.', 'booking_status', 'general', 45, NULL, NULL, 1, '2026-01-23 10:15:54'),
(21, 3, 'Booking Update: Confirmed', 'Your booking for \'Alamin_5*\' has been confirmed.', 'booking_status', 'general', 46, NULL, NULL, 1, '2026-01-23 10:15:55'),
(22, 3, 'Booking Update: Confirmed', 'Your booking for \'Supreme Comfort Inn\' has been confirmed.', 'booking_status', 'general', 50, NULL, NULL, 1, '2026-01-23 18:54:32'),
(23, 3, 'Booking Update: Confirmed', 'Your booking for \'Supreme Comfort Inn\' has been confirmed.', 'booking_status', 'general', 53, NULL, NULL, 1, '2026-01-23 19:09:34'),
(24, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 16, NULL, NULL, 1, '2026-01-23 21:05:26'),
(25, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 15, NULL, NULL, 1, '2026-01-23 21:05:28'),
(26, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 2, NULL, NULL, 1, '2026-01-23 21:05:30'),
(27, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 19, NULL, NULL, 1, '2026-01-23 23:09:52'),
(28, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 18, NULL, NULL, 1, '2026-01-23 23:17:02'),
(29, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 28, NULL, NULL, 1, '2026-01-24 01:01:35'),
(30, 8, 'Booking Update: Confirmed', 'Your booking for \'Dhaka Transit Station\' has been confirmed.', 'booking_status', 'general', 29, NULL, NULL, 1, '2026-01-24 14:14:59'),
(31, 8, 'Booking Update: Confirmed', 'Your booking for \'Dhaka Transit Station\' has been confirmed.', 'booking_status', 'general', 27, NULL, NULL, 1, '2026-01-24 14:15:08'),
(32, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 26, NULL, NULL, 1, '2026-01-24 14:15:11'),
(33, 8, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 25, NULL, NULL, 1, '2026-01-24 14:15:26'),
(34, 8, 'Booking Update: Confirmed', 'Your booking for \'Dhaka Transit Station\' has been confirmed.', 'booking_status', 'general', 24, NULL, NULL, 1, '2026-01-24 14:16:32'),
(35, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 23, NULL, NULL, 1, '2026-01-24 14:26:37'),
(36, 8, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 22, NULL, NULL, 1, '2026-01-24 14:26:42'),
(37, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 21, NULL, NULL, 1, '2026-01-24 14:26:47'),
(38, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 20, NULL, NULL, 1, '2026-01-24 14:28:49'),
(39, 8, 'Booking Update: Confirmed', 'Your booking for \'Express Lodging Vatara\' has been confirmed.', 'booking_status', 'general', 30, NULL, NULL, 1, '2026-01-24 14:35:53'),
(40, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 32, NULL, NULL, 1, '2026-01-24 15:58:03'),
(63, 8, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:10:23'),
(64, 9, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:10:23'),
(65, 10, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(66, 11, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(67, 12, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(68, 13, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(69, 3, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:10:23'),
(70, 4, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(71, 5, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(72, 6, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(73, 7, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:10:23'),
(74, 2, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:10:23'),
(75, 1, 'ee', 'ee', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:10:23'),
(76, 8, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:16:38'),
(77, 9, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:16:38'),
(78, 10, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(79, 11, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(80, 12, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(81, 13, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(82, 3, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:16:38'),
(83, 4, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(84, 5, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(85, 6, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(86, 7, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-24 18:16:38'),
(87, 2, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:16:38'),
(88, 1, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-24 18:16:38'),
(89, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 276). Status: Pending.', 'booking_new', 'general', 46, NULL, NULL, 1, '2026-01-24 18:45:50'),
(90, 2, 'New Booking Request', 'New booking for Express Lodging Vatara (Room 227). Status: Pending.', 'booking_new', 'general', 47, NULL, NULL, 1, '2026-01-24 18:47:46'),
(91, 8, 'Booking Update: Confirmed', 'Your booking for \'Express Lodging Vatara\' has been confirmed.', 'booking_status', 'general', 47, NULL, NULL, 1, '2026-01-24 18:47:55'),
(92, 8, 'Booking Update: Completed', 'Your booking for \'Vatara Smart Stay\' has been completed.', 'booking_status', 'general', 46, NULL, NULL, 1, '2026-01-24 18:55:47'),
(93, 8, 'Booking Update: Active', 'Your booking for \'Dhaka Transit Station\' has been active.', 'booking_status', 'general', 29, NULL, NULL, 1, '2026-01-24 19:17:19'),
(94, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 28, NULL, NULL, 1, '2026-01-24 19:18:06'),
(95, 1, 'Booking Update: Active', 'Your booking for \'Vatara Grand Hotel\' has been active.', 'booking_status', 'general', 17, NULL, NULL, 1, '2026-01-24 19:18:10'),
(96, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 20, NULL, NULL, 1, '2026-01-24 19:18:13'),
(97, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 21, NULL, NULL, 1, '2026-01-24 19:18:15'),
(98, 8, 'Booking Update: Active', 'Your booking for \'Dhaka Transit Station\' has been active.', 'booking_status', 'general', 24, NULL, NULL, 1, '2026-01-24 19:18:18'),
(99, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 23, NULL, NULL, 1, '2026-01-24 19:19:52'),
(100, 8, 'Booking Update: Active', 'Your booking for \'Vatara Smart Stay\' has been active.', 'booking_status', 'general', 22, NULL, NULL, 1, '2026-01-24 19:19:54'),
(101, 1, 'Booking Update: Completed', 'Your booking for \'Vatara Grand Hotel\' has been completed.', 'booking_status', 'general', 17, NULL, NULL, 1, '2026-01-24 19:20:56'),
(102, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 272). Status: Pending.', 'booking_new', 'general', 48, NULL, NULL, 1, '2026-01-24 19:53:36'),
(103, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 294). Status: Pending.', 'booking_new', 'general', 49, NULL, NULL, 1, '2026-01-24 20:16:57'),
(104, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 49, NULL, NULL, 1, '2026-01-24 20:17:37'),
(105, 2, 'New Booking Request', 'New booking for Riverside Executive Hotel (Room 136). Status: Pending.', 'booking_new', 'general', 50, NULL, NULL, 1, '2026-01-24 20:50:34'),
(106, 8, 'Booking Update: Confirmed', 'Your booking for \'Riverside Executive Hotel\' has been confirmed.', 'booking_status', 'general', 50, NULL, NULL, 1, '2026-01-24 21:01:35'),
(107, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 214). Status: Pending.', 'booking_new', 'general', 51, NULL, NULL, 1, '2026-01-24 21:22:51'),
(108, 8, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 51, NULL, NULL, 1, '2026-01-24 21:23:34'),
(109, 8, 'Booking Update: Active', 'Your booking for \'Central Business Hotel\' has been active.', 'booking_status', 'general', 51, NULL, NULL, 1, '2026-01-24 21:23:47'),
(110, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 272). Status: Pending.', 'booking_new', 'general', 52, NULL, NULL, 1, '2026-01-24 21:39:13'),
(111, 8, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 52, NULL, NULL, 1, '2026-01-24 21:39:28'),
(112, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 296). Status: Pending.', 'booking_new', 'general', 53, NULL, NULL, 1, '2026-01-24 22:54:19'),
(113, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 297). Status: Pending.', 'booking_new', 'general', 54, NULL, NULL, 1, '2026-01-25 08:20:11'),
(114, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 54, NULL, NULL, 1, '2026-01-25 08:22:06'),
(115, 1, 'Booking Update: Cancelled', 'Your booking for \'Downtown Residency\' has been cancelled.', 'booking_status', 'general', 53, NULL, NULL, 1, '2026-01-25 08:23:02'),
(116, 2, 'New Booking Request', 'New booking for Express Lodging Vatara (Room 228). Status: Pending.', 'booking_new', 'general', 55, NULL, NULL, 1, '2026-01-25 08:28:30'),
(117, 8, 'Booking Update: Confirmed', 'Your booking for \'Express Lodging Vatara\' has been confirmed.', 'booking_status', 'general', 55, NULL, NULL, 1, '2026-01-25 08:28:43'),
(118, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 215). Status: Pending.', 'booking_new', 'general', 56, NULL, NULL, 1, '2026-01-25 08:29:42'),
(119, 8, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 56, NULL, NULL, 1, '2026-01-25 08:30:01'),
(120, 8, 'Booking Update: Active', 'Your booking for \'Central Business Hotel\' has been active.', 'booking_status', 'general', 56, NULL, NULL, 1, '2026-01-25 08:30:15'),
(121, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 221). Status: Pending.', 'booking_new', 'general', 57, NULL, NULL, 1, '2026-01-25 08:31:31'),
(122, 8, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 57, NULL, NULL, 1, '2026-01-25 08:31:42'),
(123, 8, 'Booking Update: Active', 'Your booking for \'Central Business Hotel\' has been active.', 'booking_status', 'general', 57, NULL, NULL, 1, '2026-01-25 08:31:57'),
(124, 8, 'Booking Update: Completed', 'Your booking for \'Central Business Hotel\' has been completed.', 'booking_status', 'general', 57, NULL, NULL, 1, '2026-01-25 08:32:23'),
(125, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 216). Status: Pending.', 'booking_new', 'general', 58, NULL, NULL, 1, '2026-01-25 08:48:08'),
(126, 8, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 58, NULL, NULL, 1, '2026-01-25 08:48:31'),
(127, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 281). Status: Pending.', 'booking_new', 'general', 59, NULL, NULL, 1, '2026-01-25 08:51:34'),
(128, 8, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 59, NULL, NULL, 1, '2026-01-25 08:51:43'),
(129, 2, 'New Booking Request', 'New booking for Modern Stay Hotel (Room 101). Status: Pending.', 'booking_new', 'general', 60, NULL, NULL, 1, '2026-01-25 08:58:16'),
(130, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 274). Status: Pending.', 'booking_new', 'general', 61, NULL, NULL, 1, '2026-01-25 09:14:40'),
(131, 8, 'Booking Update: Active', 'Your booking for \'Vatara Smart Stay\' has been active.', 'booking_status', 'general', 59, NULL, NULL, 1, '2026-01-25 09:15:10'),
(132, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 298). Status: Pending.', 'booking_new', 'general', 62, NULL, NULL, 1, '2026-01-25 09:23:33'),
(133, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 299). Status: Pending.', 'booking_new', 'general', 63, NULL, NULL, 1, '2026-01-25 09:23:33'),
(134, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 63, NULL, NULL, 1, '2026-01-25 09:23:48'),
(135, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 63, NULL, NULL, 1, '2026-01-25 09:23:57'),
(136, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 64, NULL, NULL, 1, '2026-01-25 09:27:25'),
(137, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 62, NULL, NULL, 1, '2026-01-25 09:27:34'),
(138, 8, 'Booking Update: Cancelled', 'Your booking for \'Downtown Residency\' has been cancelled.', 'booking_status', 'general', 64, NULL, NULL, 1, '2026-01-25 09:27:43'),
(139, 2, 'New Booking Request', 'New booking for Express Lodging Vatara (Room 226). Status: Pending.', 'booking_new', 'general', 65, NULL, NULL, 1, '2026-01-25 09:28:46'),
(140, 8, 'Booking Update: Confirmed', 'Your booking for \'Express Lodging Vatara\' has been confirmed.', 'booking_status', 'general', 65, NULL, NULL, 1, '2026-01-25 09:29:00'),
(141, 8, 'Booking Update: Cancelled', 'Your booking for \'Vatara Smart Stay\' has been cancelled.', 'booking_status', 'general', 61, NULL, NULL, 1, '2026-01-25 09:29:02'),
(142, 8, 'Booking Update: Cancelled', 'Your booking for \'Modern Stay Hotel\' has been cancelled.', 'booking_status', 'general', 60, NULL, NULL, 1, '2026-01-25 09:29:04'),
(143, 8, 'Booking Update: Active', 'Your booking for \'Express Lodging Vatara\' has been active.', 'booking_status', 'general', 65, NULL, NULL, 1, '2026-01-25 09:29:20'),
(144, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 62, NULL, NULL, 1, '2026-01-25 09:29:23'),
(145, 8, 'Booking Update: Completed', 'Your booking for \'Downtown Residency\' has been completed.', 'booking_status', 'general', 62, NULL, NULL, 1, '2026-01-25 09:29:48'),
(146, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 66, NULL, NULL, 1, '2026-01-25 09:32:08'),
(147, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 67, NULL, NULL, 1, '2026-01-25 09:32:18'),
(148, 8, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 67, NULL, NULL, 1, '2026-01-25 09:32:27'),
(149, 8, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 66, NULL, NULL, 1, '2026-01-25 09:32:30'),
(150, 8, 'Booking Update: Active', 'Your booking for \'Vatara Smart Stay\' has been active.', 'booking_status', 'general', 67, NULL, NULL, 1, '2026-01-25 09:32:33'),
(151, 8, 'Booking Update: Completed', 'Your booking for \'Vatara Smart Stay\' has been completed.', 'booking_status', 'general', 67, NULL, NULL, 1, '2026-01-25 09:32:54'),
(152, 8, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 66, NULL, NULL, 1, '2026-01-25 09:32:56'),
(153, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 68, NULL, NULL, 1, '2026-01-25 09:37:43'),
(154, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 212). Status: Pending.', 'booking_new', 'general', 69, NULL, NULL, 1, '2026-01-25 09:41:22'),
(155, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 70, NULL, NULL, 1, '2026-01-25 09:43:09'),
(156, 9, 'Booking Update: Cancelled', 'Your booking for \'Vatara Smart Stay\' has been cancelled.', 'booking_status', 'general', 70, NULL, NULL, 0, '2026-01-25 09:46:31'),
(157, 8, 'Booking Update: Cancelled', 'Your booking for \'Central Business Hotel\' has been cancelled.', 'booking_status', 'general', 69, NULL, NULL, 1, '2026-01-25 09:46:34'),
(158, 8, 'Booking Update: Cancelled', 'Your booking for \'Central Business Hotel\' has been cancelled.', 'booking_status', 'general', 68, NULL, NULL, 1, '2026-01-25 09:46:36'),
(159, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 71, NULL, NULL, 1, '2026-01-25 09:47:17'),
(160, 9, 'Booking Update: Cancelled', 'Your booking for \'Vatara Smart Stay\' has been cancelled.', 'booking_status', 'general', 71, NULL, NULL, 0, '2026-01-25 09:49:50'),
(161, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 72, NULL, NULL, 1, '2026-01-25 09:50:54'),
(162, 9, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 72, NULL, NULL, 0, '2026-01-25 09:51:04'),
(163, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 73, NULL, NULL, 1, '2026-01-25 09:52:06'),
(164, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 272). Status: Pending.', 'booking_new', 'general', 74, NULL, NULL, 1, '2026-01-25 09:55:15'),
(165, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 273). Status: Pending.', 'booking_new', 'general', 75, NULL, NULL, 1, '2026-01-25 09:57:07'),
(166, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 274). Status: Pending.', 'booking_new', 'general', 76, NULL, NULL, 1, '2026-01-25 10:20:35'),
(167, 8, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 76, NULL, NULL, 1, '2026-01-25 10:20:56'),
(168, 9, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 74, NULL, NULL, 0, '2026-01-25 10:21:04'),
(169, 9, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 75, NULL, NULL, 0, '2026-01-25 10:21:08'),
(170, 8, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 73, NULL, NULL, 1, '2026-01-25 10:21:10'),
(171, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 212). Status: Pending.', 'booking_new', 'general', 77, NULL, NULL, 1, '2026-01-25 14:29:11'),
(172, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 78, NULL, NULL, 1, '2026-01-25 14:41:26'),
(173, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 291). Status: Pending.', 'booking_new', 'general', 79, NULL, NULL, 1, '2026-01-25 14:47:23'),
(174, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 292). Status: Pending.', 'booking_new', 'general', 80, NULL, NULL, 1, '2026-01-25 14:47:24'),
(175, 14, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 78, NULL, NULL, 1, '2026-01-25 14:49:32'),
(176, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 287). Status: Pending.', 'booking_new', 'general', 81, NULL, NULL, 1, '2026-01-25 14:49:51'),
(177, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 213). Status: Pending.', 'booking_new', 'general', 82, NULL, NULL, 1, '2026-01-25 14:50:20'),
(178, 14, 'Booking Update: Cancelled', 'Your booking for \'Central Business Hotel\' has been cancelled.', 'booking_status', 'general', 82, NULL, NULL, 1, '2026-01-25 15:06:36'),
(179, 14, 'Booking Update: Cancelled', 'Your booking for \'Downtown Residency\' has been cancelled.', 'booking_status', 'general', 81, NULL, NULL, 1, '2026-01-25 15:06:38'),
(180, 14, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 78, NULL, NULL, 1, '2026-01-25 15:06:54'),
(181, 14, 'Booking Update: Completed', 'Your booking for \'Downtown Residency\' has been completed.', 'booking_status', 'general', 78, NULL, NULL, 1, '2026-01-25 15:06:59'),
(182, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 83, NULL, NULL, 1, '2026-01-25 15:07:25'),
(183, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 213). Status: Pending.', 'booking_new', 'general', 84, NULL, NULL, 1, '2026-01-25 15:09:27'),
(184, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 274). Status: Pending.', 'booking_new', 'general', 85, NULL, NULL, 1, '2026-01-25 15:09:49'),
(185, 14, 'Booking Update: Cancelled', 'Your booking for \'Vatara Smart Stay\' has been cancelled.', 'booking_status', 'general', 85, NULL, NULL, 1, '2026-01-25 15:21:11'),
(186, 14, 'Booking Update: Cancelled', 'Your booking for \'Central Business Hotel\' has been cancelled.', 'booking_status', 'general', 84, NULL, NULL, 1, '2026-01-25 15:21:13'),
(187, 14, 'Booking Update: Cancelled', 'Your booking for \'Downtown Residency\' has been cancelled.', 'booking_status', 'general', 83, NULL, NULL, 1, '2026-01-25 15:21:15'),
(188, 9, 'Booking Update: Active', 'Your booking for \'Vatara Smart Stay\' has been active.', 'booking_status', 'general', 75, NULL, NULL, 0, '2026-01-25 15:21:18'),
(189, 9, 'Booking Update: Completed', 'Your booking for \'Vatara Smart Stay\' has been completed.', 'booking_status', 'general', 75, NULL, NULL, 0, '2026-01-25 15:21:25'),
(190, 9, 'Booking Update: Active', 'Your booking for \'Vatara Smart Stay\' has been active.', 'booking_status', 'general', 74, NULL, NULL, 0, '2026-01-25 15:21:33'),
(191, 8, 'Booking Update: Active', 'Your booking for \'Vatara Smart Stay\' has been active.', 'booking_status', 'general', 73, NULL, NULL, 1, '2026-01-25 15:21:36'),
(192, 2, 'New Booking', 'New booking for Vatara Smart Stay.', 'booking_new', 'general', 86, NULL, NULL, 1, '2026-01-25 15:29:38'),
(193, 14, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 86, NULL, NULL, 1, '2026-01-25 15:29:49'),
(194, 2, 'New Booking', 'New booking for Central Business Hotel.', 'booking_new', 'general', 87, NULL, NULL, 1, '2026-01-25 15:30:25'),
(195, 14, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 87, NULL, NULL, 0, '2026-01-25 15:30:40'),
(196, 2, 'New Booking', 'New booking for Central Business Hotel.', 'booking_new', 'general', 88, NULL, NULL, 1, '2026-01-25 15:31:44'),
(197, 15, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 88, NULL, NULL, 1, '2026-01-25 15:32:04'),
(198, 14, 'Booking Update: Active', 'Your booking for \'Central Business Hotel\' has been active.', 'booking_status', 'general', 87, NULL, NULL, 0, '2026-01-25 15:32:29'),
(199, 14, 'Booking Update: Completed', 'Your booking for \'Central Business Hotel\' has been completed.', 'booking_status', 'general', 87, NULL, NULL, 0, '2026-01-25 15:32:35'),
(200, 9, 'Booking Update: Completed', 'Your booking for \'Vatara Smart Stay\' has been completed.', 'booking_status', 'general', 74, NULL, NULL, 0, '2026-01-25 15:32:36'),
(201, 8, 'Booking Update: Completed', 'Your booking for \'Vatara Smart Stay\' has been completed.', 'booking_status', 'general', 73, NULL, NULL, 1, '2026-01-25 15:32:38'),
(202, 14, 'Booking Update: Active', 'Your booking for \'Vatara Smart Stay\' has been active.', 'booking_status', 'general', 86, NULL, NULL, 0, '2026-01-25 15:32:41'),
(203, 14, 'Booking Update: Completed', 'Your booking for \'Vatara Smart Stay\' has been completed.', 'booking_status', 'general', 86, NULL, NULL, 0, '2026-01-25 15:32:43'),
(204, 9, 'Booking Update: Active', 'Your booking for \'Central Business Hotel\' has been active.', 'booking_status', 'general', 72, NULL, NULL, 0, '2026-01-25 15:32:45'),
(205, 9, 'Booking Update: Completed', 'Your booking for \'Central Business Hotel\' has been completed.', 'booking_status', 'general', 72, NULL, NULL, 0, '2026-01-25 15:32:47'),
(206, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 89, NULL, NULL, 1, '2026-01-25 15:33:18'),
(207, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 90, NULL, NULL, 1, '2026-01-25 15:33:37'),
(208, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 287). Status: Pending.', 'booking_new', 'general', 91, NULL, NULL, 1, '2026-01-25 15:33:38'),
(209, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 293). Status: Pending.', 'booking_new', 'general', 92, NULL, NULL, 1, '2026-01-25 17:08:24'),
(210, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 294). Status: Pending.', 'booking_new', 'general', 93, NULL, NULL, 1, '2026-01-25 17:08:25'),
(211, 15, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 93, NULL, NULL, 1, '2026-01-25 17:08:59'),
(212, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 94, NULL, NULL, 1, '2026-01-25 17:16:45'),
(213, 15, 'Booking Cancelled', 'Your booking for Vatara Smart Stay was cancelled by the Host.', 'booking_cancelled', 'general', 94, NULL, NULL, 1, '2026-01-25 17:16:55'),
(214, 2, 'New Booking Request', 'New booking for Riverside Executive Hotel (Room 146). Status: Pending.', 'booking_new', 'general', 95, NULL, NULL, 1, '2026-01-25 17:17:17'),
(215, 15, 'Booking Cancelled', 'Your booking for Riverside Executive Hotel was cancelled by the Host.', 'booking_cancelled', 'general', 95, NULL, NULL, 1, '2026-01-25 17:17:30'),
(216, 2, 'New Booking', 'New booking for Vatara Smart Stay.', 'booking_new', 'general', 96, NULL, NULL, 1, '2026-01-25 17:53:07'),
(217, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 272). Status: Pending.', 'booking_new', 'general', 97, NULL, NULL, 1, '2026-01-25 18:03:23'),
(218, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 276). Status: Pending.', 'booking_new', 'general', 98, NULL, NULL, 1, '2026-01-25 18:04:08'),
(219, 2, 'Booking Cancelled', 'Booking #98 for Vatara Smart Stay was cancelled by Support.', 'booking_cancelled', 'general', 98, NULL, NULL, 1, '2026-01-25 18:04:22'),
(220, 2, 'Booking Cancelled', 'Your booking for Vatara Smart Stay was cancelled by Support.', 'booking_cancelled', 'general', 97, NULL, NULL, 1, '2026-01-25 18:07:32'),
(221, 2, 'Booking Cancelled', 'Booking #97 for Vatara Smart Stay was cancelled by Support.', 'booking_cancelled', 'general', 97, NULL, NULL, 1, '2026-01-25 18:07:32'),
(222, 15, 'Booking Cancelled', 'Your booking for Vatara Smart Stay was cancelled by Support.', 'booking_cancelled', 'general', 96, NULL, NULL, 1, '2026-01-25 18:07:34'),
(223, 2, 'Booking Cancelled', 'Booking #96 for Vatara Smart Stay was cancelled by Support.', 'booking_cancelled', 'general', 96, NULL, NULL, 1, '2026-01-25 18:07:34'),
(224, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 99, NULL, NULL, 1, '2026-01-25 18:08:56'),
(225, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 100, NULL, NULL, 1, '2026-01-25 18:09:54'),
(226, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 272). Status: Pending.', 'booking_new', 'general', 101, NULL, NULL, 1, '2026-01-25 18:10:39'),
(227, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 273). Status: Pending.', 'booking_new', 'general', 102, NULL, NULL, 1, '2026-01-25 18:14:49'),
(228, 1, 'Booking Cancelled', 'Your booking for Downtown Residency was cancelled by the Host.', 'booking_cancelled', 'general', 99, NULL, NULL, 1, '2026-01-25 18:15:06'),
(229, 15, 'Booking Cancelled', 'Your booking for Vatara Smart Stay was cancelled by the Host.', 'booking_cancelled', 'general', 102, NULL, NULL, 1, '2026-01-25 18:15:09'),
(230, 1, 'Booking Cancelled', 'Your booking for Vatara Smart Stay was cancelled by the Host.', 'booking_cancelled', 'general', 100, NULL, NULL, 1, '2026-01-25 18:15:14'),
(231, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 103, NULL, NULL, 1, '2026-01-25 18:15:32'),
(232, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 213). Status: Pending.', 'booking_new', 'general', 104, NULL, NULL, 1, '2026-01-25 18:21:19'),
(233, 15, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 104, NULL, NULL, 1, '2026-01-25 18:29:46'),
(234, 15, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 103, NULL, NULL, 1, '2026-01-25 18:29:49'),
(235, 15, 'Booking Update: Active', 'Your booking for \'Central Business Hotel\' has been active.', 'booking_status', 'general', 104, NULL, NULL, 1, '2026-01-25 18:30:26'),
(236, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 105, NULL, NULL, 1, '2026-01-25 18:31:34'),
(237, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 106, NULL, NULL, 1, '2026-01-25 18:31:49'),
(238, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 213). Status: Pending.', 'booking_new', 'general', 107, NULL, NULL, 1, '2026-01-25 18:31:50'),
(239, 2, 'Booking Cancelled', 'Booking #107 for Central Business Hotel was cancelled by the Guest.', 'booking_cancelled', 'general', 107, NULL, NULL, 1, '2026-01-25 18:32:28'),
(240, 2, 'Booking Cancelled', 'Booking #106 for Central Business Hotel was cancelled by the Guest.', 'booking_cancelled', 'general', 106, NULL, NULL, 1, '2026-01-25 18:32:30'),
(241, 2, 'Booking Cancelled', 'Booking #105 for Vatara Smart Stay was cancelled by the Guest.', 'booking_cancelled', 'general', 105, NULL, NULL, 1, '2026-01-25 18:32:32'),
(242, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 108, NULL, NULL, 1, '2026-01-25 18:32:49'),
(243, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 213). Status: Pending.', 'booking_new', 'general', 109, NULL, NULL, 1, '2026-01-25 18:32:51'),
(244, 2, 'Booking Cancelled', 'Booking #109 for Central Business Hotel was cancelled by the Guest.', 'booking_cancelled', 'general', 109, NULL, NULL, 1, '2026-01-25 18:32:59'),
(245, 2, 'Booking Cancelled', 'Booking #108 for Central Business Hotel was cancelled by the Guest.', 'booking_cancelled', 'general', 108, NULL, NULL, 1, '2026-01-25 18:33:01'),
(246, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 110, NULL, NULL, 1, '2026-01-25 18:33:16'),
(247, 2, 'New Booking Request', 'New booking for Dhaka Transit Station (Room 256). Status: Pending.', 'booking_new', 'general', 111, NULL, NULL, 1, '2026-01-25 18:33:42'),
(248, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 213). Status: Pending.', 'booking_new', 'general', 112, NULL, NULL, 1, '2026-01-25 18:34:19'),
(249, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 214). Status: Pending.', 'booking_new', 'general', 113, NULL, NULL, 1, '2026-01-25 18:38:09'),
(250, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 215). Status: Pending.', 'booking_new', 'general', 114, NULL, NULL, 1, '2026-01-25 18:38:29'),
(251, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 115, NULL, NULL, 1, '2026-01-25 18:59:39'),
(252, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 116, NULL, NULL, 1, '2026-01-25 20:32:55'),
(253, 15, 'Booking Cancelled', 'Your booking for Vatara Smart Stay was cancelled by the Host.', 'booking_cancelled', 'general', 116, NULL, NULL, 1, '2026-01-25 20:33:15'),
(254, 15, 'Booking Cancelled', 'Your booking for Dhaka Transit Station was cancelled by the Host.', 'booking_cancelled', 'general', 111, NULL, NULL, 1, '2026-01-25 20:33:30'),
(255, 15, 'Booking Cancelled', 'Your booking for Central Business Hotel was cancelled by the Host.', 'booking_cancelled', 'general', 114, NULL, NULL, 1, '2026-01-25 20:33:53'),
(256, 15, 'Booking Cancelled', 'Your booking for Central Business Hotel was cancelled by the Host.', 'booking_cancelled', 'general', 113, NULL, NULL, 1, '2026-01-25 20:33:56'),
(257, 15, 'Booking Cancelled', 'Your booking for Central Business Hotel was cancelled by the Host.', 'booking_cancelled', 'general', 112, NULL, NULL, 1, '2026-01-25 20:33:58'),
(258, 15, 'Booking Cancelled', 'Your booking for Central Business Hotel was cancelled by the Host.', 'booking_cancelled', 'general', 110, NULL, NULL, 1, '2026-01-25 20:34:01'),
(259, 15, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 115, NULL, NULL, 1, '2026-01-25 20:34:02'),
(260, 15, 'Booking Update: Completed', 'Your booking for \'Downtown Residency\' has been completed.', 'booking_status', 'general', 115, NULL, NULL, 1, '2026-01-25 20:34:37'),
(261, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 117, NULL, NULL, 1, '2026-01-25 21:09:04'),
(262, 15, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 117, NULL, NULL, 1, '2026-01-25 21:09:46'),
(263, 2, 'New Food Order #10', 'Order of ৳750 for Downtown Residency. Please prepare.', 'food_order', 'general', 10, NULL, NULL, 1, '2026-01-25 21:10:16'),
(264, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 118, NULL, NULL, 1, '2026-01-25 21:16:54'),
(265, 2, 'Booking Cancelled', 'Booking #118 for Central Business Hotel was cancelled by the Guest.', 'booking_cancelled', 'general', 118, NULL, NULL, 1, '2026-01-25 21:42:00'),
(266, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 119, NULL, NULL, 1, '2026-01-25 21:42:18'),
(267, 2, 'Booking Cancelled', 'Booking #119 for Vatara Smart Stay was cancelled by the Guest.', 'booking_cancelled', 'general', 119, NULL, NULL, 1, '2026-01-25 21:42:28'),
(268, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 120, NULL, NULL, 1, '2026-01-25 21:43:31'),
(269, 15, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 120, NULL, NULL, 1, '2026-01-25 21:52:52'),
(270, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 286). Status: Pending.', 'booking_new', 'general', 121, NULL, NULL, 1, '2026-01-25 22:08:29'),
(271, 15, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 121, NULL, NULL, 1, '2026-01-25 22:08:38'),
(272, 15, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 121, NULL, NULL, 1, '2026-01-25 22:08:45'),
(273, 15, 'Booking Update: Completed', 'Your booking for \'Downtown Residency\' has been completed.', 'booking_status', 'general', 121, NULL, NULL, 1, '2026-01-25 22:09:06'),
(274, 2, 'Booking Cancelled', 'Booking #120 for Central Business Hotel was cancelled by the Guest.', 'booking_cancelled', 'general', 120, NULL, NULL, 1, '2026-01-25 22:09:19'),
(275, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 301). Status: Pending.', 'booking_new', 'general', 122, NULL, NULL, 1, '2026-01-25 22:10:44'),
(276, 15, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 122, NULL, NULL, 1, '2026-01-25 22:11:09'),
(277, 15, 'Booking Update: Active', 'Your booking for \'Downtown Residency\' has been active.', 'booking_status', 'general', 122, NULL, NULL, 1, '2026-01-25 22:11:14'),
(278, 8, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-26 00:23:38'),
(279, 9, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(280, 10, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(281, 11, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(282, 12, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(283, 13, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(284, 14, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(285, 15, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-26 00:23:38'),
(286, 3, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-26 00:23:38'),
(287, 4, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(288, 5, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(289, 6, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(290, 7, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-26 00:23:38'),
(291, 2, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-26 00:23:38'),
(292, 1, 'ff', 'ff', 'info', 'general', NULL, NULL, NULL, 1, '2026-01-26 00:23:38'),
(293, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 123, NULL, NULL, 1, '2026-01-26 08:10:24'),
(294, 2, 'Booking Cancelled', 'Booking #123 for Central Business Hotel was cancelled by the Guest.', 'booking_cancelled', 'general', 123, NULL, NULL, 1, '2026-01-26 08:10:42'),
(295, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 124, NULL, NULL, 1, '2026-01-26 09:22:39'),
(296, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 281). Status: Pending.', 'booking_new', 'general', 125, NULL, NULL, 1, '2026-01-26 10:28:42'),
(297, 2, 'Booking Cancelled', 'Booking #125 for Vatara Smart Stay was cancelled by the Guest.', 'booking_cancelled', 'general', 125, NULL, NULL, 1, '2026-01-26 10:28:47'),
(298, 2, 'Booking Cancelled', 'Booking #124 for Vatara Smart Stay was cancelled by the Guest.', 'booking_cancelled', 'general', 124, NULL, NULL, 1, '2026-01-26 10:28:52'),
(299, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 276). Status: Pending.', 'booking_new', 'general', 126, NULL, NULL, 1, '2026-01-26 10:41:50'),
(300, 2, 'Booking Cancelled', 'Booking #126 for Vatara Smart Stay was cancelled by the Guest.', 'booking_cancelled', 'general', 126, NULL, NULL, 1, '2026-01-26 10:41:57'),
(301, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 271). Status: Pending.', 'booking_new', 'general', 127, NULL, NULL, 1, '2026-01-27 12:14:20'),
(302, 16, 'Booking Update: Confirmed', 'Your booking for \'Vatara Smart Stay\' has been confirmed.', 'booking_status', 'general', 127, NULL, NULL, 1, '2026-01-27 12:15:09'),
(303, 2, 'New Booking', 'New booking for Downtown Residency.', 'booking_new', 'general', 128, NULL, NULL, 1, '2026-01-27 13:12:09'),
(304, 2, 'New Booking', 'New booking for Downtown Residency.', 'booking_new', 'general', 129, NULL, NULL, 1, '2026-01-27 13:15:09'),
(305, 18, 'Booking Update: Confirmed', 'Your booking for \'Downtown Residency\' has been confirmed.', 'booking_status', 'general', 129, NULL, NULL, 1, '2026-01-27 13:16:35'),
(306, 17, 'Booking Cancelled', 'Your booking for Downtown Residency was cancelled by the Host.', 'booking_cancelled', 'general', 128, NULL, NULL, 0, '2026-01-27 15:11:39'),
(307, 2, 'New Booking', 'New booking for Downtown Residency.', 'booking_new', 'general', 130, NULL, NULL, 1, '2026-01-27 15:14:50'),
(308, 2, 'Booking Cancelled', 'Booking #130 for Downtown Residency was cancelled by the Guest.', 'booking_cancelled', 'general', 130, NULL, NULL, 1, '2026-01-27 15:15:15'),
(309, 2, 'New Booking Request', 'New booking for Dhaka Transit Station (Room 257). Status: Pending.', 'booking_new', 'general', 131, NULL, NULL, 0, '2026-01-27 15:49:50'),
(310, 19, 'Booking Cancelled', 'Your booking for Dhaka Transit Station was cancelled by the Host.', 'booking_cancelled', 'general', 131, NULL, NULL, 0, '2026-01-27 16:07:08'),
(311, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 301). Status: Pending.', 'booking_new', 'general', 132, NULL, NULL, 0, '2026-01-27 16:07:34'),
(312, 15, 'Booking Cancelled', 'Your booking for Downtown Residency was cancelled by the Host.', 'booking_cancelled', 'general', 132, NULL, NULL, 0, '2026-01-27 16:07:45'),
(313, 2, 'New Booking Request', 'New booking for Downtown Residency (Room 301). Status: Pending.', 'booking_new', 'general', 133, NULL, NULL, 0, '2026-01-27 16:12:32'),
(314, 20, 'Booking Cancelled', 'Your booking for Downtown Residency was cancelled by the Host.', 'booking_cancelled', 'general', 133, NULL, NULL, 1, '2026-01-27 16:12:46'),
(315, 2, 'New Booking Request', 'New booking for Vatara Smart Stay (Room 272). Status: Pending.', 'booking_new', 'general', 134, NULL, NULL, 0, '2026-01-27 16:17:47'),
(316, 2, 'Booking Cancelled', 'Booking #134 for Vatara Smart Stay was cancelled by the Guest.', 'booking_cancelled', 'general', 134, NULL, NULL, 0, '2026-01-27 16:17:51'),
(317, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 211). Status: Pending.', 'booking_new', 'general', 135, NULL, NULL, 0, '2026-01-27 16:18:25'),
(318, 20, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 135, NULL, NULL, 1, '2026-01-27 16:18:56'),
(319, 2, 'New Booking Request', 'New booking for Riverside Executive Hotel (Room 136). Status: Pending.', 'booking_new', 'general', 136, NULL, NULL, 0, '2026-01-27 18:40:38'),
(320, 2, 'New Booking Request', 'New booking for Central Business Hotel (Room 213). Status: Pending.', 'booking_new', 'general', 137, NULL, NULL, 0, '2026-01-27 18:41:59'),
(321, 21, 'Booking Update: Confirmed', 'Your booking for \'Central Business Hotel\' has been confirmed.', 'booking_status', 'general', 137, NULL, NULL, 0, '2026-01-27 18:45:41'),
(322, 2, 'New Food Order #11', 'Order of ৳830 for Central Business Hotel. Please prepare.', 'food_order', 'general', 11, NULL, NULL, 0, '2026-01-27 18:51:31'),
(323, 20, 'Booking Cancelled', 'Your booking for Central Business Hotel was cancelled by Support.', 'booking_cancelled', 'general', 135, NULL, NULL, 0, '2026-01-27 18:58:41'),
(324, 2, 'Booking Cancelled', 'Booking #135 for Central Business Hotel was cancelled by Support.', 'booking_cancelled', 'general', 135, NULL, NULL, 0, '2026-01-27 18:58:41'),
(325, 8, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(326, 9, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(327, 10, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(328, 11, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(329, 12, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(330, 13, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(331, 14, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(332, 15, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(333, 16, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(334, 17, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(335, 18, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(336, 19, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(337, 20, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(338, 21, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(339, 3, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(340, 4, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(341, 5, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(342, 6, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(343, 7, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(344, 2, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(345, 1, 'dd', 'wee', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:43'),
(346, 8, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(347, 9, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(348, 10, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(349, 11, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(350, 12, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(351, 13, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(352, 14, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(353, 15, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56');
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `notification_type`, `reference_id`, `reference_type`, `data`, `is_read`, `created_at`) VALUES
(354, 16, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(355, 17, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(356, 18, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(357, 19, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(358, 20, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(359, 21, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(360, 3, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(361, 4, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(362, 5, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(363, 6, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(364, 7, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(365, 2, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(366, 1, 'dd', 'gggg', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:28:56'),
(367, 8, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(368, 9, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(369, 10, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(370, 11, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(371, 12, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(372, 13, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(373, 14, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(374, 15, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(375, 16, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(376, 17, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(377, 18, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(378, 19, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(379, 20, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(380, 21, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(381, 3, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(382, 4, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(383, 5, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(384, 6, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(385, 7, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(386, 2, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(387, 1, 'Shihab', 'KKKKK', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:36'),
(388, 8, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(389, 9, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(390, 10, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(391, 11, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(392, 12, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(393, 13, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(394, 14, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(395, 15, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(396, 16, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(397, 17, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(398, 18, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(399, 19, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(400, 20, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(401, 21, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(402, 3, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(403, 4, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(404, 5, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(405, 6, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(406, 7, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(407, 2, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51'),
(408, 1, 'ALAMin', 'FFFIIINNNALLL', 'info', 'general', NULL, NULL, NULL, 0, '2026-01-27 19:29:51');

-- --------------------------------------------------------

--
-- Table structure for table `pricing_rules`
--

CREATE TABLE `pricing_rules` (
  `id` int(11) NOT NULL,
  `property_id` int(11) DEFAULT NULL,
  `rule_name` varchar(100) NOT NULL,
  `multiplier` decimal(3,2) NOT NULL DEFAULT 1.00,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_availability`
--

CREATE TABLE `rider_availability` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `current_location_lat` decimal(10,8) DEFAULT NULL,
  `current_location_lng` decimal(11,8) DEFAULT NULL,
  `working_hours_start` time DEFAULT NULL,
  `working_hours_end` time DEFAULT NULL,
  `auto_offline_minutes` int(11) DEFAULT 30,
  `last_activity_at` timestamp NULL DEFAULT NULL,
  `last_location_update` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_documents`
--

CREATE TABLE `rider_documents` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `document_type` enum('license','nid','vehicle_papers','insurance','pollution') NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_notes` text DEFAULT NULL,
  `verified_by` int(11) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_earnings`
--

CREATE TABLE `rider_earnings` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `fare_amount` decimal(10,2) DEFAULT NULL,
  `commission_percentage` decimal(5,2) DEFAULT 20.00,
  `commission_amount` decimal(10,2) DEFAULT NULL,
  `earning_amount` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `payout_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_location_history`
--

CREATE TABLE `rider_location_history` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `ride_id` int(11) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `accuracy_meters` decimal(7,2) DEFAULT NULL,
  `speed_kmh` decimal(5,2) DEFAULT NULL,
  `heading` int(11) DEFAULT NULL,
  `altitude` decimal(7,2) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_notifications`
--

CREATE TABLE `rider_notifications` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `notification_type` enum('ride_request','system','warning','payment','review') DEFAULT 'system',
  `reference_id` int(11) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_profiles`
--

CREATE TABLE `rider_profiles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `vehicle_type` enum('bike','car','auto') NOT NULL,
  `vehicle_number` varchar(20) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `license_expiry` date DEFAULT NULL,
  `profile_photo_url` varchar(255) DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `approval_date` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_rides` int(11) DEFAULT 0,
  `total_earnings` decimal(12,2) DEFAULT 0.00,
  `bank_account` varchar(50) DEFAULT NULL,
  `bank_ifsc` varchar(20) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_ratings`
--

CREATE TABLE `rider_ratings` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `review` text DEFAULT NULL,
  `categories` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`categories`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rider_settings`
--

CREATE TABLE `rider_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` varchar(255) DEFAULT NULL,
  `data_type` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rider_settings`
--

INSERT INTO `rider_settings` (`id`, `setting_key`, `setting_value`, `data_type`, `description`, `updated_at`) VALUES
(1, 'commission_percentage', '20.00', 'decimal', 'Commission % for platform', '2026-01-23 17:51:56'),
(2, 'cancellation_penalty_amount', '50.00', 'decimal', 'Penalty amount for cancellations', '2026-01-23 17:51:56'),
(3, 'auto_offline_minutes', '30', 'integer', 'Auto-offline after inactivity', '2026-01-23 17:51:56'),
(4, 'ride_request_timeout_seconds', '30', 'integer', 'Time to respond to ride offer', '2026-01-23 17:51:56'),
(5, 'minimum_rating_to_accept_rides', '3.5', 'decimal', 'Minimum rider rating', '2026-01-23 17:51:56'),
(6, 'max_cancellations_per_day', '3', 'integer', 'Max cancellations allowed per day', '2026-01-23 17:51:56'),
(7, 'location_update_frequency_seconds', '5', 'integer', 'GPS location update frequency', '2026-01-23 17:51:56');

-- --------------------------------------------------------

--
-- Table structure for table `rider_wallet`
--

CREATE TABLE `rider_wallet` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `balance` decimal(12,2) DEFAULT 0.00,
  `total_added` decimal(12,2) DEFAULT 0.00,
  `total_withdrawn` decimal(12,2) DEFAULT 0.00,
  `last_transaction_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rides`
--

CREATE TABLE `rides` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rider_id` int(11) DEFAULT NULL,
  `pickup_latitude` decimal(10,8) DEFAULT NULL,
  `pickup_longitude` decimal(11,8) DEFAULT NULL,
  `dropoff_latitude` decimal(10,8) DEFAULT NULL,
  `dropoff_longitude` decimal(11,8) DEFAULT NULL,
  `vehicle_type` varchar(50) DEFAULT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  `estimated_fare` decimal(10,2) DEFAULT NULL,
  `final_fare` decimal(10,2) DEFAULT NULL,
  `status` enum('requested','assigned','started','completed','cancelled') DEFAULT 'requested',
  `rating` int(11) DEFAULT NULL,
  `review` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ride_assignment_queue`
--

CREATE TABLE `ride_assignment_queue` (
  `id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `assigned_rider_id` int(11) DEFAULT NULL,
  `offer_status` enum('offered','accepted','rejected','expired') DEFAULT 'offered',
  `offered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `response_at` timestamp NULL DEFAULT NULL,
  `expiry_seconds` int(11) DEFAULT 30,
  `assignment_order` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ride_history`
--

CREATE TABLE `ride_history` (
  `id` int(11) NOT NULL,
  `ride_id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('requested','accepted','on_the_way','picked_up','completed','cancelled') DEFAULT 'requested',
  `pickup_lat` decimal(10,8) DEFAULT NULL,
  `pickup_lng` decimal(11,8) DEFAULT NULL,
  `drop_lat` decimal(10,8) DEFAULT NULL,
  `drop_lng` decimal(11,8) DEFAULT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `estimated_time_minutes` int(11) DEFAULT NULL,
  `actual_time_minutes` int(11) DEFAULT NULL,
  `fare_amount` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `payment_method` enum('cash','wallet','card') DEFAULT 'cash',
  `rider_rating` int(11) DEFAULT NULL,
  `rider_review` text DEFAULT NULL,
  `user_rating` int(11) DEFAULT NULL,
  `user_review` text DEFAULT NULL,
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `cancelled_by` enum('rider','user','system') DEFAULT NULL,
  `route_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`route_json`)),
  `accepted_at` timestamp NULL DEFAULT NULL,
  `pickup_time` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_type_id` int(11) NOT NULL,
  `room_number` varchar(50) DEFAULT NULL,
  `status` enum('available','occupied','maintenance') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `locked_at` timestamp NULL DEFAULT NULL,
  `locked_by_session` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `room_type_id`, `room_number`, `status`, `created_at`, `locked_at`, `locked_by_session`) VALUES
(1, 1, '1011', 'available', '2026-01-23 19:21:31', NULL, NULL),
(2, 1, '1012', 'available', '2026-01-23 19:21:31', NULL, NULL),
(3, 1, '1013', 'available', '2026-01-23 19:21:31', NULL, NULL),
(4, 1, '1014', 'available', '2026-01-23 19:21:31', NULL, NULL),
(5, 1, '1015', 'available', '2026-01-23 19:21:31', NULL, NULL),
(6, 2, '1021', 'available', '2026-01-23 19:21:31', NULL, NULL),
(7, 2, '1022', 'available', '2026-01-23 19:21:31', NULL, NULL),
(8, 2, '1023', 'available', '2026-01-23 19:21:31', NULL, NULL),
(9, 2, '1024', 'available', '2026-01-23 19:21:31', NULL, NULL),
(10, 2, '1025', 'available', '2026-01-23 19:21:31', NULL, NULL),
(11, 3, '1031', 'available', '2026-01-23 19:21:31', NULL, NULL),
(12, 3, '1032', 'available', '2026-01-23 19:21:31', NULL, NULL),
(13, 3, '1033', 'available', '2026-01-23 19:21:31', NULL, NULL),
(14, 3, '1034', 'available', '2026-01-23 19:21:31', NULL, NULL),
(15, 3, '1035', 'available', '2026-01-23 19:21:31', NULL, NULL),
(16, 4, '2041', 'available', '2026-01-23 19:21:31', NULL, NULL),
(17, 4, '2042', 'available', '2026-01-23 19:21:31', NULL, NULL),
(18, 4, '2043', 'available', '2026-01-23 19:21:31', NULL, NULL),
(19, 4, '2044', 'available', '2026-01-23 19:21:31', NULL, NULL),
(20, 4, '2045', 'available', '2026-01-23 19:21:31', NULL, NULL),
(21, 5, '2051', 'available', '2026-01-23 19:21:31', NULL, NULL),
(22, 5, '2052', 'available', '2026-01-23 19:21:31', NULL, NULL),
(23, 5, '2053', 'available', '2026-01-23 19:21:31', NULL, NULL),
(24, 5, '2054', 'available', '2026-01-23 19:21:31', NULL, NULL),
(25, 5, '2055', 'available', '2026-01-23 19:21:31', NULL, NULL),
(26, 6, '2061', 'available', '2026-01-23 19:21:31', NULL, NULL),
(27, 6, '2062', 'available', '2026-01-23 19:21:31', NULL, NULL),
(28, 6, '2063', 'available', '2026-01-23 19:21:31', NULL, NULL),
(29, 6, '2064', 'available', '2026-01-23 19:21:31', NULL, NULL),
(30, 6, '2065', 'available', '2026-01-23 19:21:31', NULL, NULL),
(31, 7, '3071', 'available', '2026-01-23 19:21:31', NULL, NULL),
(32, 7, '3072', 'available', '2026-01-23 19:21:31', NULL, NULL),
(33, 7, '3073', 'available', '2026-01-23 19:21:31', NULL, NULL),
(34, 7, '3074', 'available', '2026-01-23 19:21:31', NULL, NULL),
(35, 7, '3075', 'available', '2026-01-23 19:21:31', NULL, NULL),
(36, 8, '3081', 'available', '2026-01-23 19:21:31', NULL, NULL),
(37, 8, '3082', 'available', '2026-01-23 19:21:31', NULL, NULL),
(38, 8, '3083', 'available', '2026-01-23 19:21:31', NULL, NULL),
(39, 8, '3084', 'available', '2026-01-23 19:21:31', NULL, NULL),
(40, 8, '3085', 'available', '2026-01-23 19:21:31', NULL, NULL),
(41, 9, '3091', 'available', '2026-01-23 19:21:31', NULL, NULL),
(42, 9, '3092', 'available', '2026-01-23 19:21:31', NULL, NULL),
(43, 9, '3093', 'available', '2026-01-23 19:21:31', NULL, NULL),
(44, 9, '3094', 'available', '2026-01-23 19:21:31', NULL, NULL),
(45, 9, '3095', 'available', '2026-01-23 19:21:31', NULL, NULL),
(46, 10, '4101', 'available', '2026-01-23 19:21:31', NULL, NULL),
(47, 10, '4102', 'available', '2026-01-23 19:21:31', NULL, NULL),
(48, 10, '4103', 'available', '2026-01-23 19:21:31', NULL, NULL),
(49, 10, '4104', 'available', '2026-01-23 19:21:31', NULL, NULL),
(50, 10, '4105', 'available', '2026-01-23 19:21:31', NULL, NULL),
(51, 11, '4111', 'available', '2026-01-23 19:21:31', NULL, NULL),
(52, 11, '4112', 'available', '2026-01-23 19:21:31', NULL, NULL),
(53, 11, '4113', 'available', '2026-01-23 19:21:31', NULL, NULL),
(54, 11, '4114', 'available', '2026-01-23 19:21:31', NULL, NULL),
(55, 11, '4115', 'available', '2026-01-23 19:21:31', NULL, NULL),
(56, 12, '4121', 'available', '2026-01-23 19:21:31', NULL, NULL),
(57, 12, '4122', 'available', '2026-01-23 19:21:31', NULL, NULL),
(58, 12, '4123', 'available', '2026-01-23 19:21:31', NULL, NULL),
(59, 12, '4124', 'available', '2026-01-23 19:21:31', NULL, NULL),
(60, 12, '4125', 'available', '2026-01-23 19:21:31', NULL, NULL),
(61, 13, '5131', 'available', '2026-01-23 19:21:31', NULL, NULL),
(62, 13, '5132', 'available', '2026-01-23 19:21:31', NULL, NULL),
(63, 13, '5133', 'available', '2026-01-23 19:21:31', NULL, NULL),
(64, 13, '5134', 'available', '2026-01-23 19:21:31', NULL, NULL),
(65, 13, '5135', 'available', '2026-01-23 19:21:31', NULL, NULL),
(66, 14, '5141', 'available', '2026-01-23 19:21:31', NULL, NULL),
(67, 14, '5142', 'available', '2026-01-23 19:21:31', NULL, NULL),
(68, 14, '5143', 'available', '2026-01-23 19:21:31', NULL, NULL),
(69, 14, '5144', 'available', '2026-01-23 19:21:31', NULL, NULL),
(70, 14, '5145', 'available', '2026-01-23 19:21:31', NULL, NULL),
(71, 15, '5151', 'available', '2026-01-23 19:21:32', NULL, NULL),
(72, 15, '5152', 'available', '2026-01-23 19:21:32', NULL, NULL),
(73, 15, '5153', 'available', '2026-01-23 19:21:32', NULL, NULL),
(74, 15, '5154', 'available', '2026-01-23 19:21:32', NULL, NULL),
(75, 15, '5155', 'available', '2026-01-23 19:21:32', NULL, NULL),
(76, 16, '6161', 'available', '2026-01-23 19:21:32', NULL, NULL),
(77, 16, '6162', 'available', '2026-01-23 19:21:32', NULL, NULL),
(78, 16, '6163', 'available', '2026-01-23 19:21:32', NULL, NULL),
(79, 16, '6164', 'available', '2026-01-23 19:21:32', NULL, NULL),
(80, 16, '6165', 'available', '2026-01-23 19:21:32', NULL, NULL),
(81, 17, '6171', 'available', '2026-01-23 19:21:32', NULL, NULL),
(82, 17, '6172', 'available', '2026-01-23 19:21:32', NULL, NULL),
(83, 17, '6173', 'available', '2026-01-23 19:21:32', NULL, NULL),
(84, 17, '6174', 'available', '2026-01-23 19:21:32', NULL, NULL),
(85, 17, '6175', 'available', '2026-01-23 19:21:32', NULL, NULL),
(86, 18, '6181', 'available', '2026-01-23 19:21:32', NULL, NULL),
(87, 18, '6182', 'available', '2026-01-23 19:21:32', NULL, NULL),
(88, 18, '6183', 'available', '2026-01-23 19:21:32', NULL, NULL),
(89, 18, '6184', 'available', '2026-01-23 19:21:32', NULL, NULL),
(90, 18, '6185', 'available', '2026-01-23 19:21:32', NULL, NULL),
(91, 19, '7191', 'available', '2026-01-23 19:21:32', NULL, NULL),
(92, 19, '7192', 'available', '2026-01-23 19:21:32', NULL, NULL),
(93, 19, '7193', 'available', '2026-01-23 19:21:32', NULL, NULL),
(94, 19, '7194', 'available', '2026-01-23 19:21:32', NULL, NULL),
(95, 19, '7195', 'available', '2026-01-23 19:21:32', NULL, NULL),
(96, 20, '7201', 'available', '2026-01-23 19:21:32', NULL, NULL),
(97, 20, '7202', 'available', '2026-01-23 19:21:32', NULL, NULL),
(98, 20, '7203', 'available', '2026-01-23 19:21:32', NULL, NULL),
(99, 20, '7204', 'available', '2026-01-23 19:21:32', NULL, NULL),
(100, 20, '7205', 'available', '2026-01-23 19:21:32', NULL, NULL),
(101, 21, '7211', 'available', '2026-01-23 19:21:32', NULL, NULL),
(102, 21, '7212', 'available', '2026-01-23 19:21:32', NULL, NULL),
(103, 21, '7213', 'available', '2026-01-23 19:21:32', NULL, NULL),
(104, 21, '7214', 'available', '2026-01-23 19:21:32', NULL, NULL),
(105, 21, '7215', 'available', '2026-01-23 19:21:32', NULL, NULL),
(106, 22, '8221', 'available', '2026-01-23 19:21:32', NULL, NULL),
(107, 22, '8222', 'available', '2026-01-23 19:21:32', NULL, NULL),
(108, 22, '8223', 'available', '2026-01-23 19:21:32', NULL, NULL),
(109, 22, '8224', 'available', '2026-01-23 19:21:32', NULL, NULL),
(110, 22, '8225', 'available', '2026-01-23 19:21:32', NULL, NULL),
(111, 23, '8231', 'available', '2026-01-23 19:21:32', NULL, NULL),
(112, 23, '8232', 'available', '2026-01-23 19:21:32', NULL, NULL),
(113, 23, '8233', 'available', '2026-01-23 19:21:32', NULL, NULL),
(114, 23, '8234', 'available', '2026-01-23 19:21:32', NULL, NULL),
(115, 23, '8235', 'available', '2026-01-23 19:21:32', NULL, NULL),
(116, 24, '8241', 'available', '2026-01-23 19:21:32', NULL, NULL),
(117, 24, '8242', 'available', '2026-01-23 19:21:32', NULL, NULL),
(118, 24, '8243', 'available', '2026-01-23 19:21:32', NULL, NULL),
(119, 24, '8244', 'available', '2026-01-23 19:21:32', NULL, NULL),
(120, 24, '8245', 'available', '2026-01-23 19:21:32', NULL, NULL),
(121, 25, '9251', 'available', '2026-01-23 19:21:32', NULL, NULL),
(122, 25, '9252', 'available', '2026-01-23 19:21:32', NULL, NULL),
(123, 25, '9253', 'available', '2026-01-23 19:21:32', NULL, NULL),
(124, 25, '9254', 'available', '2026-01-23 19:21:32', NULL, NULL),
(125, 25, '9255', 'available', '2026-01-23 19:21:32', NULL, NULL),
(126, 26, '9261', 'available', '2026-01-23 19:21:32', NULL, NULL),
(127, 26, '9262', 'available', '2026-01-23 19:21:32', NULL, NULL),
(128, 26, '9263', 'available', '2026-01-23 19:21:32', NULL, NULL),
(129, 26, '9264', 'available', '2026-01-23 19:21:32', NULL, NULL),
(130, 26, '9265', 'available', '2026-01-23 19:21:32', NULL, NULL),
(131, 27, '9271', 'available', '2026-01-23 19:21:32', NULL, NULL),
(132, 27, '9272', 'available', '2026-01-23 19:21:32', NULL, NULL),
(133, 27, '9273', 'available', '2026-01-23 19:21:32', NULL, NULL),
(134, 27, '9274', 'available', '2026-01-23 19:21:32', NULL, NULL),
(135, 27, '9275', 'available', '2026-01-23 19:21:32', NULL, NULL),
(136, 28, '10281', 'occupied', '2026-01-23 19:21:32', NULL, NULL),
(137, 28, '10282', 'available', '2026-01-23 19:21:32', NULL, NULL),
(138, 28, '10283', 'available', '2026-01-23 19:21:32', NULL, NULL),
(139, 28, '10284', 'available', '2026-01-23 19:21:32', NULL, NULL),
(140, 28, '10285', 'available', '2026-01-23 19:21:32', NULL, NULL),
(141, 29, '10291', 'available', '2026-01-23 19:21:32', NULL, NULL),
(142, 29, '10292', 'available', '2026-01-23 19:21:32', NULL, NULL),
(143, 29, '10293', 'available', '2026-01-23 19:21:32', NULL, NULL),
(144, 29, '10294', 'available', '2026-01-23 19:21:32', NULL, NULL),
(145, 29, '10295', 'available', '2026-01-23 19:21:32', NULL, NULL),
(146, 30, '10301', 'available', '2026-01-23 19:21:32', NULL, NULL),
(147, 30, '10302', 'available', '2026-01-23 19:21:32', NULL, NULL),
(148, 30, '10303', 'available', '2026-01-23 19:21:32', NULL, NULL),
(149, 30, '10304', 'available', '2026-01-23 19:21:32', NULL, NULL),
(150, 30, '10305', 'available', '2026-01-23 19:21:32', NULL, NULL),
(151, 31, '11311', 'available', '2026-01-23 19:21:32', NULL, NULL),
(152, 31, '11312', 'available', '2026-01-23 19:21:32', NULL, NULL),
(153, 31, '11313', 'available', '2026-01-23 19:21:32', NULL, NULL),
(154, 31, '11314', 'available', '2026-01-23 19:21:32', NULL, NULL),
(155, 31, '11315', 'available', '2026-01-23 19:21:32', NULL, NULL),
(156, 32, '11321', 'available', '2026-01-23 19:21:32', NULL, NULL),
(157, 32, '11322', 'available', '2026-01-23 19:21:32', NULL, NULL),
(158, 32, '11323', 'available', '2026-01-23 19:21:32', NULL, NULL),
(159, 32, '11324', 'available', '2026-01-23 19:21:32', NULL, NULL),
(160, 32, '11325', 'available', '2026-01-23 19:21:32', NULL, NULL),
(161, 33, '11331', 'available', '2026-01-23 19:21:32', NULL, NULL),
(162, 33, '11332', 'available', '2026-01-23 19:21:32', NULL, NULL),
(163, 33, '11333', 'available', '2026-01-23 19:21:32', NULL, NULL),
(164, 33, '11334', 'available', '2026-01-23 19:21:32', NULL, NULL),
(165, 33, '11335', 'available', '2026-01-23 19:21:32', NULL, NULL),
(166, 34, '12341', 'available', '2026-01-23 19:21:32', NULL, NULL),
(167, 34, '12342', 'available', '2026-01-23 19:21:32', NULL, NULL),
(168, 34, '12343', 'available', '2026-01-23 19:21:32', NULL, NULL),
(169, 34, '12344', 'available', '2026-01-23 19:21:32', NULL, NULL),
(170, 34, '12345', 'available', '2026-01-23 19:21:32', NULL, NULL),
(171, 35, '12351', 'available', '2026-01-23 19:21:32', NULL, NULL),
(172, 35, '12352', 'available', '2026-01-23 19:21:32', NULL, NULL),
(173, 35, '12353', 'available', '2026-01-23 19:21:32', NULL, NULL),
(174, 35, '12354', 'available', '2026-01-23 19:21:32', NULL, NULL),
(175, 35, '12355', 'available', '2026-01-23 19:21:32', NULL, NULL),
(176, 36, '12361', 'available', '2026-01-23 19:21:32', NULL, NULL),
(177, 36, '12362', 'available', '2026-01-23 19:21:32', NULL, NULL),
(178, 36, '12363', 'available', '2026-01-23 19:21:32', NULL, NULL),
(179, 36, '12364', 'available', '2026-01-23 19:21:32', NULL, NULL),
(180, 36, '12365', 'available', '2026-01-23 19:21:32', NULL, NULL),
(181, 37, '13371', 'available', '2026-01-23 19:21:32', NULL, NULL),
(182, 37, '13372', 'available', '2026-01-23 19:21:32', NULL, NULL),
(183, 37, '13373', 'available', '2026-01-23 19:21:32', NULL, NULL),
(184, 37, '13374', 'available', '2026-01-23 19:21:32', NULL, NULL),
(185, 37, '13375', 'available', '2026-01-23 19:21:32', NULL, NULL),
(186, 38, '13381', 'available', '2026-01-23 19:21:32', NULL, NULL),
(187, 38, '13382', 'available', '2026-01-23 19:21:32', NULL, NULL),
(188, 38, '13383', 'available', '2026-01-23 19:21:32', NULL, NULL),
(189, 38, '13384', 'available', '2026-01-23 19:21:32', NULL, NULL),
(190, 38, '13385', 'available', '2026-01-23 19:21:32', NULL, NULL),
(191, 39, '13391', 'available', '2026-01-23 19:21:32', NULL, NULL),
(192, 39, '13392', 'available', '2026-01-23 19:21:32', NULL, NULL),
(193, 39, '13393', 'available', '2026-01-23 19:21:32', NULL, NULL),
(194, 39, '13394', 'available', '2026-01-23 19:21:32', NULL, NULL),
(195, 39, '13395', 'available', '2026-01-23 19:21:32', NULL, NULL),
(196, 40, '14401', 'available', '2026-01-23 19:21:32', NULL, NULL),
(197, 40, '14402', 'available', '2026-01-23 19:21:32', NULL, NULL),
(198, 40, '14403', 'available', '2026-01-23 19:21:32', NULL, NULL),
(199, 40, '14404', 'available', '2026-01-23 19:21:32', NULL, NULL),
(200, 40, '14405', 'available', '2026-01-23 19:21:32', NULL, NULL),
(201, 41, '14411', 'available', '2026-01-23 19:21:32', NULL, NULL),
(202, 41, '14412', 'available', '2026-01-23 19:21:32', NULL, NULL),
(203, 41, '14413', 'available', '2026-01-23 19:21:32', NULL, NULL),
(204, 41, '14414', 'available', '2026-01-23 19:21:32', NULL, NULL),
(205, 41, '14415', 'available', '2026-01-23 19:21:32', NULL, NULL),
(206, 42, '14421', 'available', '2026-01-23 19:21:32', NULL, NULL),
(207, 42, '14422', 'available', '2026-01-23 19:21:32', NULL, NULL),
(208, 42, '14423', 'available', '2026-01-23 19:21:32', NULL, NULL),
(209, 42, '14424', 'available', '2026-01-23 19:21:32', NULL, NULL),
(210, 42, '14425', 'available', '2026-01-23 19:21:32', NULL, NULL),
(211, 43, '15431', 'available', '2026-01-23 19:21:32', NULL, NULL),
(212, 43, '15432', 'occupied', '2026-01-23 19:21:32', NULL, NULL),
(213, 43, '15433', 'occupied', '2026-01-23 19:21:32', NULL, NULL),
(214, 43, '15434', 'available', '2026-01-23 19:21:32', NULL, NULL),
(215, 43, '15435', 'available', '2026-01-23 19:21:32', NULL, NULL),
(216, 44, '15441', 'available', '2026-01-23 19:21:32', NULL, NULL),
(217, 44, '15442', 'available', '2026-01-23 19:21:32', NULL, NULL),
(218, 44, '15443', 'available', '2026-01-23 19:21:32', NULL, NULL),
(219, 44, '15444', 'available', '2026-01-23 19:21:32', NULL, NULL),
(220, 44, '15445', 'available', '2026-01-23 19:21:32', NULL, NULL),
(221, 45, '15451', 'available', '2026-01-23 19:21:32', NULL, NULL),
(222, 45, '15452', 'available', '2026-01-23 19:21:32', NULL, NULL),
(223, 45, '15453', 'available', '2026-01-23 19:21:32', NULL, NULL),
(224, 45, '15454', 'available', '2026-01-23 19:21:32', NULL, NULL),
(225, 45, '15455', 'available', '2026-01-23 19:21:32', NULL, NULL),
(226, 46, '16461', 'available', '2026-01-23 19:21:32', NULL, NULL),
(227, 46, '16462', 'available', '2026-01-23 19:21:32', NULL, NULL),
(228, 46, '16463', 'available', '2026-01-23 19:21:32', NULL, NULL),
(229, 46, '16464', 'available', '2026-01-23 19:21:32', NULL, NULL),
(230, 46, '16465', 'available', '2026-01-23 19:21:32', NULL, NULL),
(231, 47, '16471', 'available', '2026-01-23 19:21:32', NULL, NULL),
(232, 47, '16472', 'available', '2026-01-23 19:21:32', NULL, NULL),
(233, 47, '16473', 'available', '2026-01-23 19:21:32', NULL, NULL),
(234, 47, '16474', 'available', '2026-01-23 19:21:32', NULL, NULL),
(235, 47, '16475', 'available', '2026-01-23 19:21:32', NULL, NULL),
(236, 48, '16481', 'available', '2026-01-23 19:21:32', NULL, NULL),
(237, 48, '16482', 'available', '2026-01-23 19:21:32', NULL, NULL),
(238, 48, '16483', 'available', '2026-01-23 19:21:32', NULL, NULL),
(239, 48, '16484', 'available', '2026-01-23 19:21:32', NULL, NULL),
(240, 48, '16485', 'available', '2026-01-23 19:21:32', NULL, NULL),
(241, 49, '17491', 'available', '2026-01-23 19:21:32', NULL, NULL),
(242, 49, '17492', 'available', '2026-01-23 19:21:32', NULL, NULL),
(243, 49, '17493', 'available', '2026-01-23 19:21:32', NULL, NULL),
(244, 49, '17494', 'available', '2026-01-23 19:21:32', NULL, NULL),
(245, 49, '17495', 'available', '2026-01-23 19:21:32', NULL, NULL),
(246, 50, '17501', 'available', '2026-01-23 19:21:32', NULL, NULL),
(247, 50, '17502', 'available', '2026-01-23 19:21:32', NULL, NULL),
(248, 50, '17503', 'available', '2026-01-23 19:21:32', NULL, NULL),
(249, 50, '17504', 'available', '2026-01-23 19:21:32', NULL, NULL),
(250, 50, '17505', 'available', '2026-01-23 19:21:32', NULL, NULL),
(251, 51, '17511', 'available', '2026-01-23 19:21:32', NULL, NULL),
(252, 51, '17512', 'available', '2026-01-23 19:21:32', NULL, NULL),
(253, 51, '17513', 'available', '2026-01-23 19:21:32', NULL, NULL),
(254, 51, '17514', 'available', '2026-01-23 19:21:32', NULL, NULL),
(255, 51, '17515', 'available', '2026-01-23 19:21:32', NULL, NULL),
(256, 52, '18521', 'available', '2026-01-23 19:21:32', NULL, NULL),
(257, 52, '18522', 'available', '2026-01-23 19:21:32', NULL, NULL),
(258, 52, '18523', 'available', '2026-01-23 19:21:32', NULL, NULL),
(259, 52, '18524', 'available', '2026-01-23 19:21:32', NULL, NULL),
(260, 52, '18525', 'available', '2026-01-23 19:21:32', NULL, NULL),
(261, 53, '18531', 'available', '2026-01-23 19:21:32', NULL, NULL),
(262, 53, '18532', 'available', '2026-01-23 19:21:32', NULL, NULL),
(263, 53, '18533', 'available', '2026-01-23 19:21:32', NULL, NULL),
(264, 53, '18534', 'available', '2026-01-23 19:21:32', NULL, NULL),
(265, 53, '18535', 'available', '2026-01-23 19:21:32', NULL, NULL),
(266, 54, '18541', 'available', '2026-01-23 19:21:32', NULL, NULL),
(267, 54, '18542', 'available', '2026-01-23 19:21:32', NULL, NULL),
(268, 54, '18543', 'available', '2026-01-23 19:21:32', NULL, NULL),
(269, 54, '18544', 'available', '2026-01-23 19:21:32', NULL, NULL),
(270, 54, '18545', 'available', '2026-01-23 19:21:32', NULL, NULL),
(271, 55, '19551', 'occupied', '2026-01-23 19:21:32', NULL, NULL),
(272, 55, '19552', 'available', '2026-01-23 19:21:32', NULL, NULL),
(273, 55, '19553', 'available', '2026-01-23 19:21:32', NULL, NULL),
(274, 55, '19554', 'available', '2026-01-23 19:21:32', NULL, NULL),
(275, 55, '19555', 'available', '2026-01-23 19:21:32', NULL, NULL),
(276, 56, '19561', 'available', '2026-01-23 19:21:32', NULL, NULL),
(277, 56, '19562', 'available', '2026-01-23 19:21:32', NULL, NULL),
(278, 56, '19563', 'available', '2026-01-23 19:21:32', NULL, NULL),
(279, 56, '19564', 'available', '2026-01-23 19:21:32', NULL, NULL),
(280, 56, '19565', 'available', '2026-01-23 19:21:32', NULL, NULL),
(281, 57, '19571', 'available', '2026-01-23 19:21:32', NULL, NULL),
(282, 57, '19572', 'available', '2026-01-23 19:21:32', NULL, NULL),
(283, 57, '19573', 'available', '2026-01-23 19:21:32', NULL, NULL),
(284, 57, '19574', 'available', '2026-01-23 19:21:32', NULL, NULL),
(285, 57, '19575', 'available', '2026-01-23 19:21:32', NULL, NULL),
(286, 58, '20581', 'occupied', '2026-01-23 19:21:32', NULL, NULL),
(287, 58, '20582', 'available', '2026-01-23 19:21:32', NULL, NULL),
(288, 58, '20583', 'available', '2026-01-23 19:21:32', NULL, NULL),
(289, 58, '20584', 'available', '2026-01-23 19:21:32', NULL, NULL),
(290, 58, '20585', 'available', '2026-01-23 19:21:32', NULL, NULL),
(291, 59, '20591', 'occupied', '2026-01-23 19:21:32', NULL, NULL),
(292, 59, '20592', 'occupied', '2026-01-23 19:21:32', NULL, NULL),
(293, 59, '20593', 'available', '2026-01-23 19:21:32', NULL, NULL),
(294, 59, '20594', 'available', '2026-01-23 19:21:32', NULL, NULL),
(295, 59, '20595', 'available', '2026-01-23 19:21:32', NULL, NULL),
(296, 60, '20601', 'available', '2026-01-23 19:21:32', NULL, NULL),
(297, 60, '20602', 'available', '2026-01-23 19:21:32', NULL, NULL),
(298, 60, '20603', 'available', '2026-01-23 19:21:32', NULL, NULL),
(299, 60, '20604', 'available', '2026-01-23 19:21:32', NULL, NULL),
(300, 60, '20605', 'available', '2026-01-23 19:21:32', NULL, NULL),
(301, 61, '33', 'available', '2026-01-25 22:10:29', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `room_amenities`
--

CREATE TABLE `room_amenities` (
  `id` int(11) NOT NULL,
  `room_type_id` int(11) NOT NULL,
  `amenity_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_amenities`
--

INSERT INTO `room_amenities` (`id`, `room_type_id`, `amenity_name`, `created_at`) VALUES
(1, 5, 'AC', '2026-01-19 17:24:39'),
(2, 5, 'Hot Water', '2026-01-19 17:24:39'),
(3, 5, 'Television', '2026-01-19 17:24:39');

-- --------------------------------------------------------

--
-- Table structure for table `room_types`
--

CREATE TABLE `room_types` (
  `id` int(11) NOT NULL,
  `hotel_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `base_price_per_hour` decimal(10,2) DEFAULT NULL,
  `daily_rate` decimal(10,2) DEFAULT NULL,
  `emergency_rate_multiplier` decimal(3,2) DEFAULT 1.50,
  `capacity` int(11) DEFAULT 2,
  `bed_type` enum('single','double','queen','king','twin') DEFAULT 'double',
  `max_adults` int(11) DEFAULT 2,
  `max_children` int(11) DEFAULT 1,
  `room_size_sqm` decimal(5,2) DEFAULT NULL,
  `has_private_bathroom` tinyint(4) DEFAULT 1,
  `has_balcony` tinyint(4) DEFAULT 0,
  `has_tv` tinyint(4) DEFAULT 1,
  `has_minibar` tinyint(4) DEFAULT 0,
  `has_safe` tinyint(4) DEFAULT 0,
  `has_workspace` tinyint(4) DEFAULT 0,
  `is_available` tinyint(4) DEFAULT 1,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `room_types`
--

INSERT INTO `room_types` (`id`, `hotel_id`, `name`, `description`, `base_price_per_hour`, `daily_rate`, `emergency_rate_multiplier`, `capacity`, `bed_type`, `max_adults`, `max_children`, `room_size_sqm`, `has_private_bathroom`, `has_balcony`, `has_tv`, `has_minibar`, `has_safe`, `has_workspace`, `is_available`, `image_url`, `created_at`) VALUES
(1, 1, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(2, 1, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(3, 1, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(4, 2, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(5, 2, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(6, 2, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(7, 3, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(8, 3, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(9, 3, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(10, 4, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(11, 4, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(12, 4, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(13, 5, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(14, 5, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:31'),
(15, 5, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(16, 6, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(17, 6, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(18, 6, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(19, 7, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(20, 7, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(21, 7, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(22, 8, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(23, 8, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(24, 8, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(25, 9, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(26, 9, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(27, 9, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(28, 10, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(29, 10, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(30, 10, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(31, 11, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(32, 11, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(33, 11, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(34, 12, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(35, 12, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(36, 12, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(37, 13, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(38, 13, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(39, 13, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(40, 14, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(41, 14, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(42, 14, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(43, 15, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(44, 15, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(45, 15, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(46, 16, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(47, 16, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(48, 16, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(49, 17, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(50, 17, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(51, 17, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(52, 18, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(53, 18, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(54, 18, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(55, 19, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(56, 19, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(57, 19, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(58, 20, 'Single Room', NULL, 1200.00, 28800.00, 1.50, 1, 'double', 1, 0, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(59, 20, 'Double Room', NULL, 1800.00, 43200.00, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(60, 20, 'Suite', NULL, 2800.00, 67200.00, 1.50, 4, 'double', 4, 3, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-23 19:21:32'),
(61, 20, 'ss', NULL, 3.00, NULL, 1.50, 2, 'double', 2, 1, NULL, 1, 0, 1, 0, 0, 0, 1, NULL, '2026-01-25 22:10:17');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `type` enum('payment','refund','commission','payout','deposit') NOT NULL,
  `status` enum('pending','completed','failed') DEFAULT 'completed',
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `booking_id`, `amount`, `type`, `status`, `description`, `created_at`) VALUES
(1, 15, 119, -1200.00, 'payment', 'completed', 'Booking #119 Payment', '2026-01-25 21:42:18'),
(2, 1, 119, 120.00, 'commission', 'completed', 'Commission from Booking #119', '2026-01-25 21:42:18'),
(3, 2, 119, 1080.00, 'payout', 'completed', 'Payout for Booking #119', '2026-01-25 21:42:18'),
(4, 15, 119, 1200.00, 'refund', 'completed', 'Refund for Booking #119', '2026-01-25 21:42:28'),
(5, 2, 119, -1080.00, 'payout', 'completed', 'Refund clawback for Booking #119', '2026-01-25 21:42:28'),
(6, 1, 119, -120.00, 'commission', 'completed', 'Commission Refund for Booking #119', '2026-01-25 21:42:28'),
(7, 15, 120, -1300.00, 'payment', 'completed', 'Booking #120 Payment', '2026-01-25 21:43:31'),
(8, 1, 120, 130.00, 'commission', 'completed', 'Commission from Booking #120', '2026-01-25 21:43:31'),
(9, 2, 120, 1170.00, 'payout', 'completed', 'Payout for Booking #120', '2026-01-25 21:43:31'),
(10, 15, 121, -1200.00, 'payment', 'completed', 'Booking #121 Payment', '2026-01-25 22:08:29'),
(11, 1, 121, 120.00, 'commission', 'completed', 'Commission from Booking #121', '2026-01-25 22:08:29'),
(12, 2, 121, 1080.00, 'payout', 'completed', 'Payout for Booking #121', '2026-01-25 22:08:29'),
(13, 15, 120, 1300.00, 'refund', 'completed', 'Refund for Booking #120', '2026-01-25 22:09:19'),
(14, 2, 120, -1170.00, 'payout', 'completed', 'Refund clawback for Booking #120', '2026-01-25 22:09:19'),
(15, 1, 120, -130.00, 'commission', 'completed', 'Commission Refund for Booking #120', '2026-01-25 22:09:19'),
(16, 15, 122, -3.00, 'payment', 'completed', 'Booking #122 Payment', '2026-01-25 22:10:44'),
(17, 1, 122, 0.30, 'commission', 'completed', 'Commission from Booking #122', '2026-01-25 22:10:44'),
(18, 2, 122, 2.70, 'payout', 'completed', 'Payout for Booking #122', '2026-01-25 22:10:44'),
(19, 15, NULL, 5000.00, 'deposit', 'completed', 'Admin manual adjustment: credited ৳5000', '2026-01-26 00:50:16'),
(20, 15, 123, -2500.00, 'payment', 'completed', 'Booking #123 Payment', '2026-01-26 08:10:24'),
(21, 1, 123, 250.00, 'commission', 'completed', 'Commission from Booking #123', '2026-01-26 08:10:24'),
(22, 2, 123, 2250.00, 'payout', 'completed', 'Payout for Booking #123', '2026-01-26 08:10:24'),
(23, 15, 123, 2500.00, 'refund', 'completed', 'Refund for Booking #123', '2026-01-26 08:10:42'),
(24, 2, 123, -2250.00, 'payout', 'completed', 'Refund clawback for Booking #123', '2026-01-26 08:10:42'),
(25, 1, 123, -250.00, 'commission', 'completed', 'Commission Refund for Booking #123', '2026-01-26 08:10:42'),
(26, 15, 124, -1200.00, 'payment', 'completed', 'Booking #124 Payment', '2026-01-26 09:22:39'),
(27, 1, 124, 120.00, 'commission', 'completed', 'Commission from Booking #124', '2026-01-26 09:22:39'),
(28, 2, 124, 1080.00, 'payout', 'completed', 'Payout for Booking #124', '2026-01-26 09:22:39'),
(29, 15, 125, -2800.00, 'payment', 'completed', 'Booking #125 Payment', '2026-01-26 10:28:42'),
(30, 1, 125, 280.00, 'commission', 'completed', 'Commission from Booking #125', '2026-01-26 10:28:42'),
(31, 2, 125, 2520.00, 'payout', 'completed', 'Payout for Booking #125', '2026-01-26 10:28:42'),
(32, 15, 125, 2800.00, 'refund', 'completed', 'Refund for Booking #125', '2026-01-26 10:28:47'),
(33, 2, 125, -2520.00, 'payout', 'completed', 'Refund clawback for Booking #125', '2026-01-26 10:28:47'),
(34, 1, 125, -280.00, 'commission', 'completed', 'Commission Refund for Booking #125', '2026-01-26 10:28:47'),
(35, 15, 124, 1200.00, 'refund', 'completed', 'Refund for Booking #124', '2026-01-26 10:28:52'),
(36, 2, 124, -1080.00, 'payout', 'completed', 'Refund clawback for Booking #124', '2026-01-26 10:28:52'),
(37, 1, 124, -120.00, 'commission', 'completed', 'Commission Refund for Booking #124', '2026-01-26 10:28:52'),
(38, 15, 126, -1800.00, 'payment', 'completed', 'Booking #126 Payment', '2026-01-26 10:41:50'),
(39, 1, 126, 180.00, 'commission', 'completed', 'Commission from Booking #126', '2026-01-26 10:41:50'),
(40, 2, 126, 1620.00, 'payout', 'completed', 'Payout for Booking #126', '2026-01-26 10:41:50'),
(41, 15, 126, 1800.00, 'refund', 'completed', 'Refund for Booking #126', '2026-01-26 10:41:57'),
(42, 2, 126, -1620.00, 'payout', 'completed', 'Refund clawback for Booking #126', '2026-01-26 10:41:57'),
(43, 1, 126, -180.00, 'commission', 'completed', 'Commission Refund for Booking #126', '2026-01-26 10:41:57'),
(44, 16, NULL, 50000.00, 'deposit', 'completed', 'Admin manual adjustment: credited ৳50000', '2026-01-27 12:14:05'),
(45, 16, 127, -1200.00, 'payment', 'completed', 'Booking #127 Payment', '2026-01-27 12:14:20'),
(46, 1, 127, 120.00, 'commission', 'completed', 'Commission from Booking #127', '2026-01-27 12:14:20'),
(47, 2, 127, 1080.00, 'payout', 'completed', 'Payout for Booking #127', '2026-01-27 12:14:20'),
(48, 18, NULL, 5000.00, 'deposit', 'completed', 'Admin manual adjustment: credited ৳5000', '2026-01-27 14:21:43'),
(49, 17, NULL, 69.00, 'deposit', 'completed', 'Admin manual adjustment: credited ৳69', '2026-01-27 14:21:52'),
(50, 19, 131, -1200.00, 'payment', 'completed', 'Booking #131 Payment', '2026-01-27 15:49:50'),
(51, 1, 131, 120.00, 'commission', 'completed', 'Commission from Booking #131', '2026-01-27 15:49:50'),
(52, 2, 131, 1080.00, 'payout', 'completed', 'Payout for Booking #131', '2026-01-27 15:49:50'),
(53, 19, 131, 1200.00, 'refund', 'completed', 'Refund for Booking #131', '2026-01-27 16:07:08'),
(54, 2, 131, -1080.00, 'payout', 'completed', 'Refund clawback for Booking #131', '2026-01-27 16:07:08'),
(55, 1, 131, -120.00, 'commission', 'completed', 'Commission Refund for Booking #131', '2026-01-27 16:07:08'),
(56, 15, 132, -3.00, 'payment', 'completed', 'Booking #132 Payment', '2026-01-27 16:07:34'),
(57, 1, 132, 0.30, 'commission', 'completed', 'Commission from Booking #132', '2026-01-27 16:07:34'),
(58, 2, 132, 2.70, 'payout', 'completed', 'Payout for Booking #132', '2026-01-27 16:07:34'),
(59, 15, 132, 3.00, 'refund', 'completed', 'Refund for Booking #132', '2026-01-27 16:07:45'),
(60, 2, 132, -2.70, 'payout', 'completed', 'Refund clawback for Booking #132', '2026-01-27 16:07:45'),
(61, 1, 132, -0.30, 'commission', 'completed', 'Commission Refund for Booking #132', '2026-01-27 16:07:45'),
(62, 20, 133, -3.00, 'payment', 'completed', 'Booking #133 Payment', '2026-01-27 16:12:32'),
(63, 1, 133, 0.30, 'commission', 'completed', 'Commission from Booking #133', '2026-01-27 16:12:32'),
(64, 2, 133, 2.70, 'payout', 'completed', 'Payout for Booking #133', '2026-01-27 16:12:32'),
(65, 20, 133, 3.00, 'refund', 'completed', 'Refund for Booking #133', '2026-01-27 16:12:46'),
(66, 2, 133, -2.70, 'payout', 'completed', 'Refund clawback for Booking #133', '2026-01-27 16:12:46'),
(67, 1, 133, -0.30, 'commission', 'completed', 'Commission Refund for Booking #133', '2026-01-27 16:12:46'),
(68, 20, 134, -1200.00, 'payment', 'completed', 'Booking #134 Payment', '2026-01-27 16:17:47'),
(69, 1, 134, 120.00, 'commission', 'completed', 'Commission from Booking #134', '2026-01-27 16:17:47'),
(70, 2, 134, 1080.00, 'payout', 'completed', 'Payout for Booking #134', '2026-01-27 16:17:47'),
(71, 20, 134, 1200.00, 'refund', 'completed', 'Refund for Booking #134', '2026-01-27 16:17:51'),
(72, 2, 134, -1080.00, 'payout', 'completed', 'Refund clawback for Booking #134', '2026-01-27 16:17:51'),
(73, 1, 134, -120.00, 'commission', 'completed', 'Commission Refund for Booking #134', '2026-01-27 16:17:51'),
(74, 20, 135, -2400.00, 'payment', 'completed', 'Booking #135 Payment', '2026-01-27 16:18:25'),
(75, 1, 135, 240.00, 'commission', 'completed', 'Commission from Booking #135', '2026-01-27 16:18:25'),
(76, 2, 135, 2160.00, 'payout', 'completed', 'Payout for Booking #135', '2026-01-27 16:18:25'),
(77, 21, 136, -1300.00, 'payment', 'completed', 'Booking #136 Payment', '2026-01-27 18:40:38'),
(78, 1, 136, 130.00, 'commission', 'completed', 'Commission from Booking #136', '2026-01-27 18:40:38'),
(79, 2, 136, 1170.00, 'payout', 'completed', 'Payout for Booking #136', '2026-01-27 18:40:38'),
(80, 21, 137, -2400.00, 'payment', 'completed', 'Booking #137 Payment', '2026-01-27 18:41:59'),
(81, 1, 137, 240.00, 'commission', 'completed', 'Commission from Booking #137', '2026-01-27 18:41:59'),
(82, 2, 137, 2160.00, 'payout', 'completed', 'Payout for Booking #137', '2026-01-27 18:41:59'),
(83, 20, 135, 2400.00, 'refund', 'completed', 'Refund for Booking #135', '2026-01-27 18:58:41'),
(84, 2, 135, -2160.00, 'payout', 'completed', 'Refund clawback for Booking #135', '2026-01-27 18:58:41'),
(85, 1, 135, -240.00, 'commission', 'completed', 'Commission Refund for Booking #135', '2026-01-27 18:58:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `user_type` enum('customer','rider','vendor','admin') NOT NULL,
  `admin_role` varchar(50) DEFAULT NULL,
  `is_verified` tinyint(4) DEFAULT 0,
  `profile_photo` varchar(255) DEFAULT NULL,
  `is_active` tinyint(4) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `online_status` enum('offline','online','busy') DEFAULT 'offline',
  `last_lat` decimal(10,8) DEFAULT NULL,
  `last_lng` decimal(11,8) DEFAULT NULL,
  `vehicle_model` varchar(255) DEFAULT NULL,
  `number_plate` varchar(100) DEFAULT NULL,
  `max_passengers` int(11) DEFAULT 2,
  `luggage_support` tinyint(4) DEFAULT 0,
  `rating_avg` decimal(3,2) DEFAULT 5.00,
  `total_earnings` decimal(12,2) DEFAULT 0.00,
  `is_blocked` tinyint(4) DEFAULT 0,
  `vehicle_number` varchar(50) DEFAULT NULL,
  `wallet_balance` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `phone`, `user_type`, `admin_role`, `is_verified`, `profile_photo`, `is_active`, `created_at`, `online_status`, `last_lat`, `last_lng`, `vehicle_model`, `number_plate`, `max_passengers`, `luggage_support`, `rating_avg`, `total_earnings`, `is_blocked`, `vehicle_number`, `wallet_balance`) VALUES
(1, 'System Admin', 'admin@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000000', 'admin', 'super_admin', 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5610.30),
(2, 'Dhaka Hotel Partner', 'vendor@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000001', 'vendor', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 10492.70),
(3, 'Rider User 1', 'rider1@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000002', 'rider', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'busy', 23.79931183, 90.42857080, '', '', 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(4, 'Rider User 2', 'rider2@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000003', 'rider', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(5, 'Rider User 3', 'rider3@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000004', 'rider', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(6, 'Rider User 4', 'rider4@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000005', 'rider', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(7, 'Rider User 5', 'rider5@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000006', 'rider', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(8, 'Customer User 1', 'customer1@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000007', 'customer', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(9, 'Customer User 2', 'customer2@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000008', 'customer', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(10, 'Customer User 3', 'customer3@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000009', 'customer', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(11, 'Customer User 4', 'customer4@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000010', 'customer', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(12, 'Customer User 5', 'customer5@rentify.com', '$2y$10$yWfnrDeMZ2WN6bUgGKPVMOX.EIacQYGpxpEofp2VK.C1QgLLSWqQO', '01700000011', 'customer', NULL, 1, NULL, 1, '2026-01-23 19:21:31', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(13, 'Demo User', 'demo_12345@test.com', '$2y$10$AvFQJY590shnmSy3Hu2cFexCdb.LdlHwxIQ9edimEzIL8xv5qCO6e', NULL, 'customer', NULL, 1, NULL, 1, '2026-01-24 15:33:14', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(14, 'MD Alamin', 'alaminpma@gmail.com', '$2y$10$ppdBNWK/iU4haxfpOLI2JenIiSgwYQM.7WMp1On9CEuT.jASK7Bwu', NULL, 'customer', NULL, 1, NULL, 1, '2026-01-25 14:31:35', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(15, 's s', 'p@gmail.com', '$2y$10$EjaZ8FYEjr.xWrmemagkmuYdYSllzdd1c/VfwmseD4V0/DgJGH9q2', NULL, 'customer', NULL, 1, NULL, 1, '2026-01-25 15:31:43', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 8852.00),
(16, 'Alamin Mia', 'alamin@gmail.com', '$2y$10$N5KVqSMRi/492TfM0nWHT.y/wr7TIcfYnCqrIigj7haP/F5yfC7AG', NULL, 'customer', NULL, 1, NULL, 1, '2026-01-27 12:11:14', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 48800.00),
(17, 'aaa aa', 'aaaa@rentify.com', '$2y$10$s2DfqHVXyfXpVT4gV2/lqeZQ1IsCQDiOrESSNzVgUl4XOz34/63fS', NULL, 'customer', NULL, 1, NULL, 1, '2026-01-27 13:12:09', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 69.00),
(18, 'Koila Molla', 'koila@gmail.com', '$2y$10$fczMAmCfNxUi2eMwA4Ng4e8cNRToD86pVI8g/FWeOx06v7nsud7sW', NULL, 'customer', NULL, 1, NULL, 1, '2026-01-27 13:15:09', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(19, 'ewe dd', 'customer6@rentify.com', '$2y$10$GIrrnLf0m5exNgwQCqKgl.0cBCgry2bxCodcGj8FkDxqjwgMeI5ka', NULL, 'customer', NULL, 0, NULL, 1, '2026-01-27 15:49:44', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 5000.00),
(20, 'Moylaaasdd', 'ps@gmail.com', '$2y$10$IW7vInRsQZIS79gQra5WG.dlKjhvJreh6DqlTOoKBui4T8GVwINae', '01608963086', 'customer', NULL, 0, NULL, 1, '2026-01-27 16:12:27', 'offline', NULL, NULL, '', '', 1, 0, 5.00, 0.00, 0, NULL, 5000.00),
(21, 'MD Alamin', 'alamins@gmail.com', '$2y$10$HtXPer5ZK3fJ2L89nfVrQ.GiDkT1oeJEfIe4ZYbO9Gx6FRWJ2caj2', NULL, 'customer', NULL, 1, NULL, 1, '2026-01-27 18:40:13', 'offline', NULL, NULL, NULL, NULL, 2, 0, 5.00, 0.00, 0, NULL, 1300.00);

-- --------------------------------------------------------

--
-- Table structure for table `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `transaction_type` enum('credit','debit') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_before` decimal(12,2) DEFAULT NULL,
  `balance_after` decimal(12,2) DEFAULT NULL,
  `reference_id` varchar(100) DEFAULT NULL,
  `reference_type` enum('earning','withdrawal','refund','bonus','penalty') DEFAULT 'earning',
  `description` text DEFAULT NULL,
  `status` enum('pending','completed','failed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `withdrawal_requests`
--

CREATE TABLE `withdrawal_requests` (
  `id` int(11) NOT NULL,
  `rider_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `ifsc_code` varchar(20) DEFAULT NULL,
  `status` enum('pending','approved','processing','completed','rejected') DEFAULT 'pending',
  `requested_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `processed_at` timestamp NULL DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `transaction_reference` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `booking_status` (`booking_status`);

--
-- Indexes for table `booking_extensions`
--
ALTER TABLE `booking_extensions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `cancellation_penalties`
--
ALTER TABLE `cancellation_penalties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ride_id` (`ride_id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `cms_content`
--
ALTER TABLE `cms_content`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `content_key` (`content_key`);

--
-- Indexes for table `food_items`
--
ALTER TABLE `food_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`hotel_id`);

--
-- Indexes for table `food_orders`
--
ALTER TABLE `food_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`),
  ADD KEY `is_verified` (`is_verified`);

--
-- Indexes for table `hotel_reviews`
--
ALTER TABLE `hotel_reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD KEY `property_id` (`hotel_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `journey_requests`
--
ALTER TABLE `journey_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`property_id`);

--
-- Indexes for table `rider_availability`
--
ALTER TABLE `rider_availability`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rider_id` (`rider_id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_is_online` (`is_online`),
  ADD KEY `idx_location` (`current_location_lat`,`current_location_lng`);

--
-- Indexes for table `rider_documents`
--
ALTER TABLE `rider_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `verified_by` (`verified_by`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_is_verified` (`is_verified`);

--
-- Indexes for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ride_id` (`ride_id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_payment_status` (`payment_status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `rider_location_history`
--
ALTER TABLE `rider_location_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_ride_id` (`ride_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_location` (`latitude`,`longitude`);

--
-- Indexes for table `rider_notifications`
--
ALTER TABLE `rider_notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `rider_profiles`
--
ALTER TABLE `rider_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `vehicle_number` (`vehicle_number`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_vehicle_number` (`vehicle_number`),
  ADD KEY `idx_is_approved` (`is_approved`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `rider_ratings`
--
ALTER TABLE `rider_ratings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ride_rating` (`ride_id`,`user_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_rating` (`rating`);

--
-- Indexes for table `rider_settings`
--
ALTER TABLE `rider_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `rider_wallet`
--
ALTER TABLE `rider_wallet`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rider_id` (`rider_id`),
  ADD KEY `idx_rider_id` (`rider_id`);

--
-- Indexes for table `rides`
--
ALTER TABLE `rides`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `rider_id` (`rider_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `ride_assignment_queue`
--
ALTER TABLE `ride_assignment_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assigned_rider_id` (`assigned_rider_id`),
  ADD KEY `idx_ride_id` (`ride_id`),
  ADD KEY `idx_offer_status` (`offer_status`);

--
-- Indexes for table `ride_history`
--
ALTER TABLE `ride_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ride_id` (`ride_id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_type_id` (`room_type_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indexes for table `room_types`
--
ALTER TABLE `room_types`
  ADD PRIMARY KEY (`id`),
  ADD KEY `property_id` (`hotel_id`),
  ADD KEY `idx_is_available` (`is_available`),
  ADD KEY `idx_bed_type` (`bed_type`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `email_2` (`email`),
  ADD KEY `user_type` (`user_type`);

--
-- Indexes for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `processed_by` (`processed_by`),
  ADD KEY `idx_rider_id` (`rider_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_requested_at` (`requested_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=138;

--
-- AUTO_INCREMENT for table `booking_extensions`
--
ALTER TABLE `booking_extensions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `cancellation_penalties`
--
ALTER TABLE `cancellation_penalties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cms_content`
--
ALTER TABLE `cms_content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `food_items`
--
ALTER TABLE `food_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=161;

--
-- AUTO_INCREMENT for table `food_orders`
--
ALTER TABLE `food_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `hotel_reviews`
--
ALTER TABLE `hotel_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `journey_requests`
--
ALTER TABLE `journey_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=409;

--
-- AUTO_INCREMENT for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_availability`
--
ALTER TABLE `rider_availability`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_documents`
--
ALTER TABLE `rider_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_location_history`
--
ALTER TABLE `rider_location_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_notifications`
--
ALTER TABLE `rider_notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_profiles`
--
ALTER TABLE `rider_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_ratings`
--
ALTER TABLE `rider_ratings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rider_settings`
--
ALTER TABLE `rider_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `rider_wallet`
--
ALTER TABLE `rider_wallet`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rides`
--
ALTER TABLE `rides`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ride_assignment_queue`
--
ALTER TABLE `ride_assignment_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ride_history`
--
ALTER TABLE `ride_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=302;

--
-- AUTO_INCREMENT for table `room_amenities`
--
ALTER TABLE `room_amenities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `room_types`
--
ALTER TABLE `room_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=86;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `booking_extensions`
--
ALTER TABLE `booking_extensions`
  ADD CONSTRAINT `booking_extensions_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cancellation_penalties`
--
ALTER TABLE `cancellation_penalties`
  ADD CONSTRAINT `cancellation_penalties_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cancellation_penalties_ibfk_2` FOREIGN KEY (`ride_id`) REFERENCES `ride_history` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `food_items`
--
ALTER TABLE `food_items`
  ADD CONSTRAINT `food_items_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`);

--
-- Constraints for table `food_orders`
--
ALTER TABLE `food_orders`
  ADD CONSTRAINT `food_orders_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  ADD CONSTRAINT `food_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `hotels`
--
ALTER TABLE `hotels`
  ADD CONSTRAINT `hotels_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `hotel_reviews`
--
ALTER TABLE `hotel_reviews`
  ADD CONSTRAINT `hotel_reviews_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_reviews_ibfk_3` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `journey_requests`
--
ALTER TABLE `journey_requests`
  ADD CONSTRAINT `journey_requests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD CONSTRAINT `maintenance_logs_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pricing_rules`
--
ALTER TABLE `pricing_rules`
  ADD CONSTRAINT `pricing_rules_ibfk_1` FOREIGN KEY (`property_id`) REFERENCES `hotels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_availability`
--
ALTER TABLE `rider_availability`
  ADD CONSTRAINT `rider_availability_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_documents`
--
ALTER TABLE `rider_documents`
  ADD CONSTRAINT `rider_documents_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_documents_ibfk_2` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rider_earnings`
--
ALTER TABLE `rider_earnings`
  ADD CONSTRAINT `rider_earnings_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_earnings_ibfk_2` FOREIGN KEY (`ride_id`) REFERENCES `ride_history` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_location_history`
--
ALTER TABLE `rider_location_history`
  ADD CONSTRAINT `rider_location_history_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_location_history_ibfk_2` FOREIGN KEY (`ride_id`) REFERENCES `ride_history` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `rider_notifications`
--
ALTER TABLE `rider_notifications`
  ADD CONSTRAINT `rider_notifications_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_profiles`
--
ALTER TABLE `rider_profiles`
  ADD CONSTRAINT `rider_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_ratings`
--
ALTER TABLE `rider_ratings`
  ADD CONSTRAINT `rider_ratings_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_ratings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `rider_ratings_ibfk_3` FOREIGN KEY (`ride_id`) REFERENCES `ride_history` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rider_wallet`
--
ALTER TABLE `rider_wallet`
  ADD CONSTRAINT `rider_wallet_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rides`
--
ALTER TABLE `rides`
  ADD CONSTRAINT `rides_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `rides_ibfk_2` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `ride_assignment_queue`
--
ALTER TABLE `ride_assignment_queue`
  ADD CONSTRAINT `ride_assignment_queue_ibfk_1` FOREIGN KEY (`ride_id`) REFERENCES `ride_history` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ride_assignment_queue_ibfk_2` FOREIGN KEY (`assigned_rider_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ride_history`
--
ALTER TABLE `ride_history`
  ADD CONSTRAINT `ride_history_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ride_history_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`);

--
-- Constraints for table `room_amenities`
--
ALTER TABLE `room_amenities`
  ADD CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `room_types`
--
ALTER TABLE `room_types`
  ADD CONSTRAINT `room_types_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `wallet_transactions_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `withdrawal_requests`
--
ALTER TABLE `withdrawal_requests`
  ADD CONSTRAINT `withdrawal_requests_ibfk_1` FOREIGN KEY (`rider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `withdrawal_requests_ibfk_2` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
