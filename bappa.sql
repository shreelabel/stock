-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 11, 2025 at 08:10 PM
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
-- Database: `bappa`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', '$2y$10$imWCQAueCYi3T/qwIKT4J.683ClES9jcJx.QOQg3JAzCGE6ghfh4W', '2025-06-01 07:20:05');

-- --------------------------------------------------------

--
-- Table structure for table `admin_settings`
--

CREATE TABLE `admin_settings` (
  `id` int(11) NOT NULL,
  `setting_name` varchar(50) NOT NULL,
  `setting_value` text NOT NULL,
  `date_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_settings`
--

INSERT INTO `admin_settings` (`id`, `setting_name`, `setting_value`, `date_updated`) VALUES
(1, 'admin_password', '$2y$10$DJQygU/kf5c5ZmXmlKjCIeOWHnr0eEJjREv5dX7EDfka/TVxpF11G', '2025-06-10 17:33:58');

-- --------------------------------------------------------

--
-- Table structure for table `rolls`
--

CREATE TABLE `rolls` (
  `id` int(11) NOT NULL,
  `rollnumber` varchar(100) NOT NULL,
  `mainrollnumber` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `papercompany` varchar(100) DEFAULT NULL,
  `gsm` int(11) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `length` int(11) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `lotno` varchar(50) DEFAULT 'N/A',
  `squaremeter` decimal(10,2) DEFAULT NULL,
  `rolltype` varchar(50) DEFAULT 'Main Roll',
  `status` varchar(50) DEFAULT 'Stock',
  `originalroll` varchar(100) DEFAULT NULL,
  `jobname` varchar(100) DEFAULT NULL,
  `jobno` varchar(100) DEFAULT NULL,
  `jobsize` varchar(100) DEFAULT NULL,
  `date_added` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rolls`
--

INSERT INTO `rolls` (`id`, `rollnumber`, `mainrollnumber`, `material`, `papercompany`, `gsm`, `width`, `length`, `weight`, `lotno`, `squaremeter`, `rolltype`, `status`, `originalroll`, `jobname`, `jobno`, `jobsize`, `date_added`) VALUES
(136, '123456', NULL, 'Art Paper', 'Sample Paper Co.', 170, 24, 800, 65.50, 'SAMPLE-001', 19.20, 'Main Roll', 'Stock', NULL, NULL, NULL, NULL, '2025-06-08 20:29:20'),
(249, 'SLC/Frst/001', 'SLC/Frst/001', 'Chromo', 'Camline', 120, 1000, 2000, 10.00, '20', 2000.00, 'Main Roll', 'Original', NULL, '', '', '', '2025-06-11 15:22:00'),
(254, 'SLC/Frst/001-A', NULL, 'Chromo', 'Camline', 120, 500, 2000, 5.00, '20', NULL, 'Slit Roll', 'Printing', NULL, '', '', '', '2025-06-11 15:34:27'),
(255, 'SLC/Frst/001-B', NULL, 'Chromo', 'Camline', 120, 300, 2000, 3.00, '20', NULL, 'Slit Roll', 'Printing', NULL, '', '', '', '2025-06-11 15:34:27'),
(256, 'SLC/Frst/001-C', NULL, 'Chromo', 'Camline', 120, 200, 2000, 2.00, '20', NULL, 'Slit Roll', 'Stock', NULL, '', '', '', '2025-06-11 15:34:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `admin_settings`
--
ALTER TABLE `admin_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_name` (`setting_name`);

--
-- Indexes for table `rolls`
--
ALTER TABLE `rolls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `rollnumber` (`rollnumber`),
  ADD KEY `idx_rollnumber` (`rollnumber`),
  ADD KEY `idx_material` (`material`),
  ADD KEY `idx_company` (`papercompany`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_rolltype` (`rolltype`),
  ADD KEY `idx_rolls_main` (`mainrollnumber`),
  ADD KEY `idx_rolls_date` (`date_added`),
  ADD KEY `idx_rolls_gsm` (`gsm`),
  ADD KEY `idx_rolls_width` (`width`),
  ADD KEY `idx_rolls_length` (`length`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `admin_settings`
--
ALTER TABLE `admin_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `rolls`
--
ALTER TABLE `rolls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=257;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
