-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: localhost    Database: vendiman
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP USER IF EXISTS 'vendiman'@'localhost';
CREATE USER 'vendiman'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
GRANT ALL PRIVILEGES ON vendiman.* TO 'vendiman'@'localhost';

DROP DATABASE vendiman;
CREATE DATABASE IF NOT EXISTS vendiman;
use vendiman;

--
-- Table structure for table `climate_update`
--

DROP TABLE IF EXISTS `climate_update`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `climate_update` (
  `id` varchar(255) primary key,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `predition` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `climate_update`
--

LOCK TABLES `climate_update` WRITE;
/*!40000 ALTER TABLE `climate_update` DISABLE KEYS */;
/*!40000 ALTER TABLE `climate_update` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `items` (
  `id` varchar(255) primary key,
  `name` varchar(100) NOT NULL,
  `itemKey` varchar(100) NOT NULL,
  `size` decimal(10,2) DEFAULT 0,
  `container` varchar(255) DEFAULT 'plastic'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `machine_items`
--

DROP TABLE IF EXISTS `machine_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `machine_items` (
  `machine_id` varchar(255) NOT NULL,
  `item_id` varchar(255) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int DEFAULT NULL,
  `capacity` int DEFAULT NULL,
  PRIMARY KEY (`machine_id`,`item_id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `machine_items_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `vending_machines` (`id`),
  CONSTRAINT `machine_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company`
--


DROP TABLE IF EXISTS `company`;
CREATE TABLE IF NOT EXISTS company(
                                      id varchar(255) primary key,
                                      name varchar(255) not null
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `owner`
--
INSERT INTO `company` VALUES
    ('c37c3316-1b7d-4345-a915-f94b9db9a8f5', 'Test Company 1');

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE IF NOT EXISTS owner(
  id varchar(255) primary key, 
  email varchar(255) not null,
  company_id varchar(255) not null,
  password varchar(255) not null,
  name varchar(255) not null,
  role varchar(16) not null,
  UNIQUE (email),
  CONSTRAINT `owner_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner`
--

LOCK TABLES `owner` WRITE;
/*!40000 ALTER TABLE `owner` DISABLE KEYS */;
INSERT INTO `owner` VALUES 
  ('f43b629e-234e-4e9b-9532-58d8ac732854', '1234', 'c37c3316-1b7d-4345-a915-f94b9db9a8f5', '$2a$10$D2jlSzPLiLzoaoKTe4ulWeNCHYt9BJg94Y8cvPLNjzJMBuHOo8FwS', "Test User", "admin");
/*!40000 ALTER TABLE `owner` ENABLE KEYS */;
UNLOCK TABLES;




--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `payment_id` varchar(255) NOT NULL,
  `price` decimal(4,2) DEFAULT NULL,
  `credit_card_number` varchar(255) DEFAULT NULL,
  `p_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `machine_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `machine_id` (`machine_id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`machine_id`) REFERENCES `machine_items` (`machine_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `payment_item`;
CREATE TABLE `payment_item` (
  `payment_id` varchar(255) NOT NULL,
  `item_id` varchar(255) NOT NULL,
  `unit_price` decimal(4,2) NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`payment_id`, `item_id`),
  CONSTRAINT `payment_item_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`payment_id`),
  CONSTRAINT `payment_item_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

LOCK TABLES `payment_item` WRITE;
/*!40000 ALTER TABLE `payment_item` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vending_machines`
--

DROP TABLE IF EXISTS `vending_machines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vending_machines` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `floor` int NOT NULL,
  `machine_number` int NOT NULL,
  `company_id` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL DEFAULT 'N/A',
  `longitude` decimal(7, 4) NOT NULL DEFAULT 0,
  `latitude` decimal(7, 4) NOT NULL DEFAULT 0,
  `strategy` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `machines_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `company` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'vendiman'
--
/*!50003 DROP PROCEDURE IF EXISTS `nearestMachinecheck` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `nearestMachinecheck`(
productId varchar(255),
flr int)
BEGIN
select machine_number,floor from vending_machines
    where id in (select mi.machine_id from machine_items mi,vending_machines v where v.id =mi.machine_id and
     v.floor =flr and mi.item_id=productId and quantity>0)
    UNION
    (select machine_number,floor from vending_machines
    where  id in(select mi.machine_id from machine_items mi,vending_machines v where v.id =mi.machine_id and
     v.floor >flr  and mi.item_id=productID and quantity>0))
    UNION
    (select machine_number,floor from vending_machines
    where  id in(select mi.machine_id from machine_items mi,vending_machines v where v.id =mi.machine_id and
     v.floor <flr  and mi.item_id=productId and quantity>0))
    order by floor,machine_number asc
    limit 3;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `purchaseItems` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;

DROP PROCEDURE IF EXISTS `createPayment`;

DELIMITER ;;
CREATE  PROCEDURE `createPayment`(
paymentId varchar(255),
machineId varchar(255),
cost decimal(4,2),
card_number bigint)
BEGIN

insert into payments (payment_id,price,credit_card_number,machine_id)
values (paymentId,cost,card_number,machineId);

END ;;
DELIMITER ;




DELIMITER ;;
CREATE PROCEDURE `purchaseItems`(
paymentId varchar(255),
productId varchar(255),
machineId varchar(255),
unitPrice decimal(4,2),
count int)
BEGIN


insert into payment_item (payment_id, item_id, unit_price, quantity)
values (paymentId,productId, unitPrice, count);

UPDATE machine_items SET Quantity = quantity-count where machine_id=machineId and item_id=productId;




END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `quantityCheck` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE PROCEDURE `quantityCheck`(
m_id varchar(255),
p_id varchar(255),
count int)
BEGIN

SELECT quantity from machine_items where item_id =p_id and m_id=machine_id and quantity >=count;


END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-11-23 21:21:25
