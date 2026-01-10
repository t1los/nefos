-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: pms_users
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `pms_users`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `pms_users` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `pms_users`;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `role` enum('ADMIN','TEAM_LEADER','MEMBER') DEFAULT 'MEMBER',
  `isActive` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'superadmin','super@admin.com','$2a$10$nU6ddyslpacDLELe4ANkXeVLRc9uUkwdVdEyCda7uX1A1mWf9rClC','Super','Man','ADMIN',1,'2025-12-26 19:16:08','2025-12-26 19:16:08'),(8,'eataman','eataman@gmail.com','$2a$10$g6G97wArGCyUy/sPSkdGwuRtGOcv3t2lciEZeaMrfLOE0MHcUgc8y','Ergin','Ataman','TEAM_LEADER',1,'2026-01-07 18:53:37','2026-01-07 18:57:05'),(9,'ksloukas10','ksloukas10@gmail.com','$2a$10$MyL.VvqrCsUNPwJJK1W4j.V2A5Q7oPepyleLzCeKmDxPGs46Fm.8S','Kostas','Sloukas','MEMBER',1,'2026-01-07 18:54:06','2026-01-07 18:56:46'),(10,'knunn25','knunn25@gmail.com','$2a$10$yZOYZ7I8kJ0eDbHvv23vN./lTX/cYWZjmGlae2EItF20e7S1CsBWa','Kendrick','Nunn','MEMBER',1,'2026-01-07 18:54:35','2026-01-07 18:56:48'),(11,'rbenitez','rbenitez@gmail.com','$2a$10$FCiHdiBuODREcCaq3ySuzeg80HMJBtalbEuiJ.JB9LXRJry69ev/u','Rafa','Benitez','TEAM_LEADER',1,'2026-01-07 18:55:04','2026-01-07 18:57:10'),(12,'vtaborda20','vtaborda20@gmail.com','$2a$10$VjzlHBmXbVk3AHFQ0VJlHeC8d5Hj/O8O.HzJNsCyr1UQWTB4rEjGa','Vicente','Taborda','MEMBER',1,'2026-01-07 18:55:51','2026-01-07 18:56:51'),(13,'tbakasetas11','tbakasetas11@gmail.com','$2a$10$Yr7kMkVqaOwMcztCLlSF7OqkEwzJDKY8PCdgGsmuil1g4EjHH2TDq','Tasos','Bakasetas','MEMBER',1,'2026-01-07 18:56:25','2026-01-07 18:56:53');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-10 15:26:29
