-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2026 at 09:00 PM
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
-- Database: `assessify_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','super_admin') DEFAULT 'admin',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `full_name`, `email`, `password`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Assessify Admin', 'admin@assessify.com', '$2y$10$AF99v50LPB/inCXBzXCY7.fASAsNJZPL5TDumUIUwdETEERrM6REu', 'super_admin', 1, '2026-05-03 16:14:14', '2026-05-03 16:14:14'),
(3, 'System Administrator', 'assessify.admin@gmail.com', '$2y$10$F.84jWFPXeV.KyqpTNEb1.gFgHbZHAtHq/UuJFye6N1Mu30lUKceq', 'super_admin', 1, '2026-05-10 14:19:00', '2026-05-10 15:34:53');

-- --------------------------------------------------------

--
-- Table structure for table `ai_explanations`
--

CREATE TABLE `ai_explanations` (
  `id` int(11) NOT NULL,
  `result_id` int(11) NOT NULL,
  `explanation` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ai_explanations`
--

INSERT INTO `ai_explanations` (`id`, `result_id`, `explanation`, `created_at`) VALUES
(1, 1, 'Based on your assessment answers, your highest match is BSIT - Bachelor of Science in Information Technology with a 100% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-03 16:08:39'),
(2, 2, 'Based on your assessment answers, your highest match is BSED - Bachelor of Secondary Education with a 90% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-08 13:58:55'),
(3, 3, 'Based on your assessment answers, your highest match is BSED - Bachelor of Secondary Education with a 65% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-08 14:00:26'),
(4, 4, 'Based on your assessment answers, your highest match is BSED - Bachelor of Secondary Education with a 40% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-08 14:03:24'),
(5, 5, 'Based on your assessment answers, your highest match is BSIT - Bachelor of Science in Information Technology with a 45% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-09 08:31:38'),
(6, 6, 'Based on your assessment answers, your highest match is BSED - Bachelor of Secondary Education with a 65% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-09 08:57:23'),
(7, 7, 'Based on your assessment answers, your highest match is BSED - Bachelor of Secondary Education with a 75% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-09 15:06:44'),
(8, 8, 'Based on your assessment answers and selected strand (ABM), your highest match is BSCS - Bachelor of Science in Computer Science with a 40% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 07:34:55'),
(9, 9, 'Based on your assessment answers and selected strand (STEM), your highest match is BSIT - Bachelor of Science in Information Technology with a 40% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 07:39:22'),
(10, 10, 'Based on your assessment answers and selected strand (STEM), your highest match is BSIT - Bachelor of Science in Information Technology with a 40% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 07:43:35'),
(11, 11, 'Based on your assessment answers and selected strand (STEM), your highest match is BSED - Bachelor of Secondary Education with a 52% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 07:46:22'),
(12, 12, 'Based on your assessment answers and selected strand (STEM), your highest match is BSED - Bachelor of Secondary Education with a 52% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 07:47:29'),
(13, 13, 'Based on your assessment answers and selected strand (STEM), your highest match is BSED - Bachelor of Secondary Education with a 72% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 07:51:26'),
(14, 14, 'Based on your assessment answers and selected strand (TVL-HE), your highest match is BSED - Bachelor of Secondary Education with a 72% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 13:40:39'),
(15, 15, 'Based on your assessment answers and selected strand (Other), your highest match is BSED - Bachelor of Secondary Education with a 72% match. This result was calculated using the system\'s rule-based scoring engine.', '2026-05-10 16:02:22');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_answers`
--

CREATE TABLE `assessment_answers` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `choice_id` int(11) DEFAULT NULL,
  `text_answer` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_answers`
--

INSERT INTO `assessment_answers` (`id`, `session_id`, `question_id`, `choice_id`, `text_answer`, `created_at`) VALUES
(1, 1, 1, 1, NULL, '2026-05-03 16:08:39'),
(2, 1, 2, 7, NULL, '2026-05-03 16:08:39'),
(3, 1, 3, 11, NULL, '2026-05-03 16:08:39'),
(4, 1, 4, 16, NULL, '2026-05-03 16:08:39'),
(5, 1, 5, NULL, 'I want to build apps, solve problems, and work with computers.', '2026-05-03 16:08:39'),
(6, 2, 1, 4, NULL, '2026-05-08 13:58:55'),
(7, 2, 2, 9, NULL, '2026-05-08 13:58:55'),
(8, 2, 3, 14, NULL, '2026-05-08 13:58:55'),
(9, 2, 4, 19, NULL, '2026-05-08 13:58:55'),
(10, 2, 5, NULL, 'good', '2026-05-08 13:58:55'),
(11, 3, 1, 1, NULL, '2026-05-08 14:00:26'),
(12, 3, 2, 9, NULL, '2026-05-08 14:00:26'),
(13, 3, 3, 14, NULL, '2026-05-08 14:00:26'),
(14, 3, 4, 19, NULL, '2026-05-08 14:00:26'),
(15, 3, 5, NULL, 'mali', '2026-05-08 14:00:26'),
(16, 4, 1, 1, NULL, '2026-05-08 14:03:24'),
(17, 4, 2, 9, NULL, '2026-05-08 14:03:24'),
(18, 4, 3, 13, NULL, '2026-05-08 14:03:24'),
(19, 4, 4, 19, NULL, '2026-05-08 14:03:24'),
(20, 4, 5, NULL, 'asdada', '2026-05-08 14:03:24'),
(21, 5, 1, 1, NULL, '2026-05-09 08:31:38'),
(22, 5, 2, 9, NULL, '2026-05-09 08:31:38'),
(23, 5, 3, 14, NULL, '2026-05-09 08:31:38'),
(24, 5, 4, 17, NULL, '2026-05-09 08:31:38'),
(25, 5, 5, NULL, 'sdad', '2026-05-09 08:31:38'),
(26, 6, 1, 1, NULL, '2026-05-09 08:57:23'),
(27, 6, 2, 9, NULL, '2026-05-09 08:57:23'),
(28, 6, 3, 14, NULL, '2026-05-09 08:57:23'),
(29, 6, 4, 19, NULL, '2026-05-09 08:57:23'),
(30, 6, 5, NULL, 'adadad', '2026-05-09 08:57:23'),
(31, 7, 1, 4, NULL, '2026-05-09 15:06:44'),
(32, 7, 2, 7, NULL, '2026-05-09 15:06:44'),
(33, 7, 3, 14, NULL, '2026-05-09 15:06:44'),
(34, 7, 4, 19, NULL, '2026-05-09 15:06:44'),
(35, 7, 5, NULL, 'asdadada', '2026-05-09 15:06:44'),
(36, 8, 1, 1, NULL, '2026-05-10 07:34:55'),
(37, 8, 2, 6, NULL, '2026-05-10 07:34:55'),
(38, 8, 3, 14, NULL, '2026-05-10 07:34:55'),
(39, 8, 4, 19, NULL, '2026-05-10 07:34:55'),
(40, 8, 5, 21, NULL, '2026-05-10 07:34:55'),
(41, 9, 1, 1, NULL, '2026-05-10 07:39:22'),
(42, 9, 2, 7, NULL, '2026-05-10 07:39:22'),
(43, 9, 3, 14, NULL, '2026-05-10 07:39:22'),
(44, 9, 4, 19, NULL, '2026-05-10 07:39:22'),
(45, 9, 5, 24, NULL, '2026-05-10 07:39:22'),
(46, 10, 1, 1, NULL, '2026-05-10 07:43:35'),
(47, 10, 2, 7, NULL, '2026-05-10 07:43:35'),
(48, 10, 3, 14, NULL, '2026-05-10 07:43:35'),
(49, 10, 4, 19, NULL, '2026-05-10 07:43:35'),
(50, 10, 5, 23, NULL, '2026-05-10 07:43:35'),
(51, 11, 1, 1, NULL, '2026-05-10 07:46:22'),
(52, 11, 2, 9, NULL, '2026-05-10 07:46:22'),
(53, 11, 3, 14, NULL, '2026-05-10 07:46:22'),
(54, 11, 4, 19, NULL, '2026-05-10 07:46:22'),
(55, 11, 5, 24, NULL, '2026-05-10 07:46:22'),
(56, 12, 1, 3, NULL, '2026-05-10 07:47:29'),
(57, 12, 2, 9, NULL, '2026-05-10 07:47:29'),
(58, 12, 3, 14, NULL, '2026-05-10 07:47:29'),
(59, 12, 4, 19, NULL, '2026-05-10 07:47:29'),
(60, 12, 5, 24, NULL, '2026-05-10 07:47:29'),
(61, 13, 1, 4, NULL, '2026-05-10 07:51:26'),
(62, 13, 2, 9, NULL, '2026-05-10 07:51:26'),
(63, 13, 3, 14, NULL, '2026-05-10 07:51:26'),
(64, 13, 4, 19, NULL, '2026-05-10 07:51:26'),
(65, 13, 5, 24, NULL, '2026-05-10 07:51:26'),
(66, 14, 1, 4, NULL, '2026-05-10 13:40:39'),
(67, 14, 2, 9, NULL, '2026-05-10 13:40:39'),
(68, 14, 3, 14, NULL, '2026-05-10 13:40:39'),
(69, 14, 4, 19, NULL, '2026-05-10 13:40:39'),
(70, 14, 5, 24, NULL, '2026-05-10 13:40:39'),
(71, 15, 1, 4, NULL, '2026-05-10 16:02:22'),
(72, 15, 2, 9, NULL, '2026-05-10 16:02:22'),
(73, 15, 3, 14, NULL, '2026-05-10 16:02:22'),
(74, 15, 4, 19, NULL, '2026-05-10 16:02:22'),
(75, 15, 5, 24, NULL, '2026-05-10 16:02:22');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_questions`
--

CREATE TABLE `assessment_questions` (
  `id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','short_text') NOT NULL DEFAULT 'multiple_choice',
  `category` varchar(100) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_required` tinyint(1) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_questions`
--

INSERT INTO `assessment_questions` (`id`, `question_text`, `question_type`, `category`, `display_order`, `is_required`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Which activity do you enjoy the most?', 'multiple_choice', 'interest', 1, 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(2, 'Which subject area do you feel strongest in?', 'multiple_choice', 'skills', 2, 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(3, 'What kind of work environment do you prefer?', 'multiple_choice', 'work_style', 3, 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(4, 'Which task sounds most interesting to you?', 'multiple_choice', 'career_interest', 4, 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(5, 'Which career path are you most interested in?', 'multiple_choice', 'career_goal', 5, 1, 1, '2026-05-03 15:33:34', '2026-05-10 07:34:32');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_results`
--

CREATE TABLE `assessment_results` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `top_program_id` int(11) DEFAULT NULL,
  `total_possible_score` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_results`
--

INSERT INTO `assessment_results` (`id`, `session_id`, `user_id`, `top_program_id`, `total_possible_score`, `created_at`) VALUES
(1, 1, 1, 1, 20, '2026-05-03 16:08:39'),
(2, 2, 2, 6, 20, '2026-05-08 13:58:55'),
(3, 3, 2, 6, 20, '2026-05-08 14:00:26'),
(4, 4, 2, 6, 20, '2026-05-08 14:03:24'),
(5, 5, 3, 1, 20, '2026-05-09 08:31:38'),
(6, 6, 4, 6, 20, '2026-05-09 08:57:23'),
(7, 7, 4, 6, 20, '2026-05-09 15:06:44'),
(8, 8, 4, 2, 25, '2026-05-10 07:34:55'),
(9, 9, 4, 1, 25, '2026-05-10 07:39:22'),
(10, 10, 4, 1, 25, '2026-05-10 07:43:35'),
(11, 11, 4, 6, 25, '2026-05-10 07:46:22'),
(12, 12, 4, 6, 25, '2026-05-10 07:47:29'),
(13, 13, 4, 6, 25, '2026-05-10 07:51:26'),
(14, 14, 4, 6, 25, '2026-05-10 13:40:39'),
(15, 15, 4, 6, 25, '2026-05-10 16:02:22');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_sessions`
--

CREATE TABLE `assessment_sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `strand` varchar(100) DEFAULT NULL,
  `status` enum('in_progress','completed') DEFAULT 'in_progress',
  `started_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assessment_sessions`
--

INSERT INTO `assessment_sessions` (`id`, `user_id`, `strand`, `status`, `started_at`, `completed_at`) VALUES
(1, 1, NULL, 'completed', '2026-05-03 16:08:39', '2026-05-03 16:08:39'),
(2, 2, NULL, 'completed', '2026-05-08 13:58:55', '2026-05-08 13:58:55'),
(3, 2, NULL, 'completed', '2026-05-08 14:00:26', '2026-05-08 14:00:26'),
(4, 2, NULL, 'completed', '2026-05-08 14:03:24', '2026-05-08 14:03:24'),
(5, 3, NULL, 'completed', '2026-05-09 08:31:38', '2026-05-09 08:31:38'),
(6, 4, NULL, 'completed', '2026-05-09 08:57:23', '2026-05-09 08:57:23'),
(7, 4, NULL, 'completed', '2026-05-09 15:06:44', '2026-05-09 15:06:44'),
(8, 4, 'ABM', 'completed', '2026-05-10 07:34:55', '2026-05-10 07:34:55'),
(9, 4, 'STEM', 'completed', '2026-05-10 07:39:22', '2026-05-10 07:39:22'),
(10, 4, 'STEM', 'completed', '2026-05-10 07:43:35', '2026-05-10 07:43:35'),
(11, 4, 'STEM', 'completed', '2026-05-10 07:46:22', '2026-05-10 07:46:22'),
(12, 4, 'STEM', 'completed', '2026-05-10 07:47:29', '2026-05-10 07:47:29'),
(13, 4, 'STEM', 'completed', '2026-05-10 07:51:26', '2026-05-10 07:51:26'),
(14, 4, 'TVL-HE', 'completed', '2026-05-10 13:40:39', '2026-05-10 13:40:39'),
(15, 4, 'Other', 'completed', '2026-05-10 16:02:22', '2026-05-10 16:02:22');

-- --------------------------------------------------------

--
-- Table structure for table `choice_program_scores`
--

CREATE TABLE `choice_program_scores` (
  `id` int(11) NOT NULL,
  `choice_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `score` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `choice_program_scores`
--

INSERT INTO `choice_program_scores` (`id`, `choice_id`, `program_id`, `score`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(2, 1, 2, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(3, 1, 3, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(4, 2, 1, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(5, 2, 8, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(6, 3, 4, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(7, 3, 5, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(8, 3, 3, 2, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(9, 4, 6, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(10, 4, 7, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(11, 4, 8, 2, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(12, 5, 8, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(13, 5, 6, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(14, 5, 4, 2, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(15, 6, 2, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(16, 6, 1, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(17, 6, 5, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(18, 7, 1, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(19, 7, 2, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(20, 7, 3, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(21, 8, 4, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(22, 8, 5, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(23, 8, 3, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(24, 9, 8, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(25, 9, 6, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(26, 9, 7, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(27, 10, 6, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(28, 10, 7, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(29, 10, 8, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(30, 11, 1, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(31, 11, 2, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(32, 11, 3, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(33, 12, 8, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(34, 12, 6, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(35, 12, 4, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(36, 13, 5, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(37, 13, 4, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(38, 13, 3, 2, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(39, 14, 6, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(40, 14, 7, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(41, 15, 4, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(42, 15, 5, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(43, 15, 3, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(44, 16, 1, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(45, 16, 2, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(46, 16, 3, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(47, 17, 3, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(48, 17, 2, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(49, 17, 1, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(50, 17, 4, 2, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(51, 18, 5, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(52, 18, 4, 4, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(53, 19, 6, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(54, 19, 7, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(55, 20, 8, 5, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(56, 20, 4, 3, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(57, 20, 6, 2, '2026-05-03 15:33:34', '2026-05-03 15:33:34');

-- --------------------------------------------------------

--
-- Table structure for table `programs`
--

CREATE TABLE `programs` (
  `id` int(11) NOT NULL,
  `program_code` varchar(50) NOT NULL,
  `program_name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `college_department` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programs`
--

INSERT INTO `programs` (`id`, `program_code`, `program_name`, `description`, `college_department`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'BSIT', 'Bachelor of Science in Information Technology', 'A program focused on software development, networking, database systems, and information technology solutions.', 'College of Computer Studies', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(2, 'BSCS', 'Bachelor of Science in Computer Science', 'A program focused on algorithms, programming, software engineering, data structures, and computing theories.', 'College of Computer Studies', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(3, 'BSIS', 'Bachelor of Science in Information Systems', 'A program focused on business processes, systems analysis, database management, and IT-based organizational solutions.', 'College of Computer Studies', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(4, 'BSBA', 'Bachelor of Science in Business Administration', 'A program focused on business management, entrepreneurship, marketing, and organizational operations.', 'College of Business and Accountancy', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(5, 'BSA', 'Bachelor of Science in Accountancy', 'A program focused on accounting, auditing, taxation, financial reporting, and business law.', 'College of Business and Accountancy', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(6, 'BSED', 'Bachelor of Secondary Education', 'A program focused on teaching, curriculum development, classroom management, and educational foundations.', 'College of Education', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(7, 'BEED', 'Bachelor of Elementary Education', 'A program focused on elementary teaching, child development, and basic education instruction.', 'College of Education', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(8, 'BACOMM', 'Bachelor of Arts in Communication', 'A program focused on communication, media, writing, public speaking, and digital content production.', 'College of Arts and Sciences', 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34');

-- --------------------------------------------------------

--
-- Table structure for table `question_choices`
--

CREATE TABLE `question_choices` (
  `id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `choice_text` text NOT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_choices`
--

INSERT INTO `question_choices` (`id`, `question_id`, `choice_text`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Solving logic problems and coding', 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(2, 1, 'Designing digital content or media', 2, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(3, 1, 'Managing money or business activities', 3, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(4, 1, 'Teaching or helping others learn', 4, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(5, 1, 'Writing, speaking, or presenting ideas', 5, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(6, 2, 'Mathematics and problem solving', 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(7, 2, 'Computer and technology subjects', 2, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(8, 2, 'Business and entrepreneurship', 3, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(9, 2, 'English, communication, and writing', 4, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(10, 2, 'Teaching and social interaction', 5, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(11, 3, 'Working with computers and technical systems', 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(12, 3, 'Working with people and communication tasks', 2, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(13, 3, 'Working with numbers, reports, and financial records', 3, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(14, 3, 'Working in classrooms or learning environments', 4, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(15, 3, 'Working on business planning and management', 5, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(16, 4, 'Building an application or website', 1, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(17, 4, 'Analyzing data and improving systems', 2, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(18, 4, 'Preparing financial reports', 3, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(19, 4, 'Creating lesson plans and teaching students', 4, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(20, 4, 'Creating campaigns, speeches, or media content', 5, 1, '2026-05-03 15:33:34', '2026-05-03 15:33:34'),
(21, 5, 'Software development or app building', 1, 1, '2026-05-10 07:34:48', '2026-05-10 07:34:48'),
(22, 5, 'Business, entrepreneurship, or management', 2, 1, '2026-05-10 07:34:48', '2026-05-10 07:34:48'),
(23, 5, 'Accounting, finance, or auditing', 3, 1, '2026-05-10 07:34:48', '2026-05-10 07:34:48'),
(24, 5, 'Teaching or helping students learn', 4, 1, '2026-05-10 07:34:48', '2026-05-10 07:34:48'),
(25, 5, 'Communication, media, or public speaking', 5, 1, '2026-05-10 07:34:48', '2026-05-10 07:34:48');

-- --------------------------------------------------------

--
-- Table structure for table `result_recommendations`
--

CREATE TABLE `result_recommendations` (
  `id` int(11) NOT NULL,
  `result_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `raw_score` int(11) NOT NULL DEFAULT 0,
  `percentage` decimal(5,2) NOT NULL DEFAULT 0.00,
  `recommendation_rank` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `result_recommendations`
--

INSERT INTO `result_recommendations` (`id`, `result_id`, `program_id`, `raw_score`, `percentage`, `recommendation_rank`, `created_at`) VALUES
(1, 1, 1, 20, 100.00, 1, '2026-05-03 16:08:39'),
(2, 1, 2, 19, 95.00, 2, '2026-05-03 16:08:39'),
(3, 1, 3, 18, 90.00, 3, '2026-05-03 16:08:39'),
(4, 2, 6, 18, 90.00, 1, '2026-05-08 13:58:55'),
(5, 2, 7, 18, 90.00, 2, '2026-05-08 13:58:55'),
(6, 2, 8, 7, 35.00, 3, '2026-05-08 13:58:55'),
(7, 3, 6, 13, 65.00, 1, '2026-05-08 14:00:26'),
(8, 3, 7, 13, 65.00, 2, '2026-05-08 14:00:26'),
(9, 3, 1, 5, 25.00, 3, '2026-05-08 14:00:26'),
(10, 4, 6, 8, 40.00, 1, '2026-05-08 14:03:24'),
(11, 4, 7, 8, 40.00, 2, '2026-05-08 14:03:24'),
(12, 4, 3, 6, 30.00, 3, '2026-05-08 14:03:24'),
(13, 5, 1, 9, 45.00, 1, '2026-05-09 08:31:38'),
(14, 5, 2, 9, 45.00, 2, '2026-05-09 08:31:38'),
(15, 5, 3, 9, 45.00, 3, '2026-05-09 08:31:38'),
(16, 6, 6, 13, 65.00, 1, '2026-05-09 08:57:23'),
(17, 6, 7, 13, 65.00, 2, '2026-05-09 08:57:23'),
(18, 6, 1, 5, 25.00, 3, '2026-05-09 08:57:23'),
(19, 7, 6, 15, 75.00, 1, '2026-05-09 15:06:44'),
(20, 7, 7, 15, 75.00, 2, '2026-05-09 15:06:44'),
(21, 7, 1, 5, 25.00, 3, '2026-05-09 15:06:44'),
(22, 8, 2, 10, 40.00, 1, '2026-05-10 07:34:55'),
(23, 8, 6, 10, 40.00, 2, '2026-05-10 07:34:55'),
(24, 8, 7, 10, 40.00, 3, '2026-05-10 07:34:55'),
(25, 9, 1, 10, 40.00, 1, '2026-05-10 07:39:22'),
(26, 9, 2, 10, 40.00, 2, '2026-05-10 07:39:22'),
(27, 9, 6, 10, 40.00, 3, '2026-05-10 07:39:22'),
(28, 10, 1, 10, 40.00, 1, '2026-05-10 07:43:35'),
(29, 10, 2, 10, 40.00, 2, '2026-05-10 07:43:35'),
(30, 10, 6, 10, 40.00, 3, '2026-05-10 07:43:35'),
(31, 11, 6, 13, 52.00, 1, '2026-05-10 07:46:22'),
(32, 11, 7, 13, 52.00, 2, '2026-05-10 07:46:22'),
(33, 11, 1, 5, 20.00, 3, '2026-05-10 07:46:22'),
(34, 12, 6, 13, 52.00, 1, '2026-05-10 07:47:29'),
(35, 12, 7, 13, 52.00, 2, '2026-05-10 07:47:29'),
(36, 12, 4, 5, 20.00, 3, '2026-05-10 07:47:29'),
(37, 13, 6, 18, 72.00, 1, '2026-05-10 07:51:26'),
(38, 13, 7, 18, 72.00, 2, '2026-05-10 07:51:26'),
(39, 13, 8, 7, 28.00, 3, '2026-05-10 07:51:26'),
(40, 14, 6, 18, 72.00, 1, '2026-05-10 13:40:39'),
(41, 14, 7, 18, 72.00, 2, '2026-05-10 13:40:39'),
(42, 14, 8, 7, 28.00, 3, '2026-05-10 13:40:39'),
(43, 15, 6, 18, 72.00, 1, '2026-05-10 16:02:22'),
(44, 15, 7, 18, 72.00, 2, '2026-05-10 16:02:22'),
(45, 15, 8, 7, 28.00, 3, '2026-05-10 16:02:22');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `updated_at`) VALUES
(1, 'assessment_title', 'Assessify Academic Program Suitability Assessment', '2026-05-03 15:33:34'),
(2, 'max_score_per_question', '5', '2026-05-03 15:33:34'),
(3, 'show_top_recommendations', '3', '2026-05-03 15:33:34'),
(4, 'ai_explanation_enabled', 'false', '2026-05-03 15:33:34');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `applicant_number` varchar(50) DEFAULT NULL,
  `strand` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `verification_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `middle_name`, `last_name`, `full_name`, `email`, `password`, `applicant_number`, `strand`, `is_active`, `created_at`, `updated_at`, `email_verified`) VALUES
(1, NULL, NULL, NULL, 'Test Student', 'test@student.com', '$2y$10$Q0Goil06pYwkZY79Z8SXP.tchSisUhNRy3kWvJuDRZPsY/H2E1cii', 'APP-001', NULL, 1, '2026-05-03 16:05:17', '2026-05-03 16:05:17', 0),
(2, NULL, NULL, NULL, 'test33@gmail.com', 'test33@gmail.com', '$2y$10$lavszYAE6N13pn3wdLS4GO/dzScMKU5MxJV8.k6pj1NFN/UJP4bO2', 'APP-8068', NULL, 1, '2026-05-08 13:50:24', '2026-05-08 13:50:24', 0),
(3, NULL, NULL, NULL, 'Noel Justin Notario', 'test22@gmail.com', '$2y$10$Gj6geUOkPzJv3J/lRbPHj.ExjqKyGf4yY//9rEc/JZhch31fygf1S', 'APP-2855', 'STEM', 1, '2026-05-09 08:30:48', '2026-05-09 08:30:48', 0),
(4, NULL, NULL, NULL, 'Noel Justin Notario', 'test11@gmail.com', '$2y$10$k3UJJ1yvpwB31MV0jwpJaOvkR4quNjSLP6GWVPebg6gQAw1zbOTYG', 'APP-1032', 'TVL-ICT', 1, '2026-05-09 08:54:36', '2026-05-09 08:54:36', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_logs_admin` (`admin_id`);

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `ai_explanations`
--
ALTER TABLE `ai_explanations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ai_result` (`result_id`);

--
-- Indexes for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_answers_session` (`session_id`),
  ADD KEY `fk_answers_question` (`question_id`),
  ADD KEY `fk_answers_choice` (`choice_id`);

--
-- Indexes for table `assessment_questions`
--
ALTER TABLE `assessment_questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assessment_results`
--
ALTER TABLE `assessment_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_results_session` (`session_id`),
  ADD KEY `fk_results_user` (`user_id`),
  ADD KEY `fk_results_top_program` (`top_program_id`);

--
-- Indexes for table `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sessions_user` (`user_id`);

--
-- Indexes for table `choice_program_scores`
--
ALTER TABLE `choice_program_scores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_choice_program` (`choice_id`,`program_id`),
  ADD KEY `fk_scores_program` (`program_id`);

--
-- Indexes for table `programs`
--
ALTER TABLE `programs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `program_code` (`program_code`);

--
-- Indexes for table `question_choices`
--
ALTER TABLE `question_choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_choices_question` (`question_id`);

--
-- Indexes for table `result_recommendations`
--
ALTER TABLE `result_recommendations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_recommendations_result` (`result_id`),
  ADD KEY `fk_recommendations_program` (`program_id`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ai_explanations`
--
ALTER TABLE `ai_explanations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `assessment_questions`
--
ALTER TABLE `assessment_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `assessment_results`
--
ALTER TABLE `assessment_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `choice_program_scores`
--
ALTER TABLE `choice_program_scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `programs`
--
ALTER TABLE `programs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `question_choices`
--
ALTER TABLE `question_choices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `result_recommendations`
--
ALTER TABLE `result_recommendations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `fk_logs_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `ai_explanations`
--
ALTER TABLE `ai_explanations`
  ADD CONSTRAINT `fk_ai_result` FOREIGN KEY (`result_id`) REFERENCES `assessment_results` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_answers`
--
ALTER TABLE `assessment_answers`
  ADD CONSTRAINT `fk_answers_choice` FOREIGN KEY (`choice_id`) REFERENCES `question_choices` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_answers_session` FOREIGN KEY (`session_id`) REFERENCES `assessment_sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_results`
--
ALTER TABLE `assessment_results`
  ADD CONSTRAINT `fk_results_session` FOREIGN KEY (`session_id`) REFERENCES `assessment_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_results_top_program` FOREIGN KEY (`top_program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_results_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assessment_sessions`
--
ALTER TABLE `assessment_sessions`
  ADD CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `choice_program_scores`
--
ALTER TABLE `choice_program_scores`
  ADD CONSTRAINT `fk_scores_choice` FOREIGN KEY (`choice_id`) REFERENCES `question_choices` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_scores_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `question_choices`
--
ALTER TABLE `question_choices`
  ADD CONSTRAINT `fk_choices_question` FOREIGN KEY (`question_id`) REFERENCES `assessment_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `result_recommendations`
--
ALTER TABLE `result_recommendations`
  ADD CONSTRAINT `fk_recommendations_program` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_recommendations_result` FOREIGN KEY (`result_id`) REFERENCES `assessment_results` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
