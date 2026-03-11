CREATE DATABASE  IF NOT EXISTS `db_supplychain` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `db_supplychain`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: db_supplychain
-- ------------------------------------------------------
-- Server version	8.0.44

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

--
-- Table structure for table `cabecera_pedidos`
--

DROP TABLE IF EXISTS `cabecera_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cabecera_pedidos` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_pdv` int DEFAULT NULL,
  `id_estado_pedido` int NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observaciones_aprobacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  `motivo_rechazo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci,
  PRIMARY KEY (`id_pedido`),
  KEY `idx_pedido_fecha` (`fecha_registro`),
  KEY `idx_pedido_usuario` (`id_usuario`),
  KEY `idx_pedido_pdv` (`id_pdv`),
  KEY `idx_pedido_estado` (`id_estado_pedido`),
  CONSTRAINT `fk_cab_est` FOREIGN KEY (`id_estado_pedido`) REFERENCES `estado_pedidos` (`id_estado_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_cab_pdv` FOREIGN KEY (`id_pdv`) REFERENCES `pdvs` (`id_pdv`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_cab_user` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cabecera_pedidos`
--

LOCK TABLES `cabecera_pedidos` WRITE;
/*!40000 ALTER TABLE `cabecera_pedidos` DISABLE KEYS */;
INSERT INTO `cabecera_pedidos` VALUES (1,1,NULL,1,'2026-03-10 08:36:42',NULL,NULL);
/*!40000 ALTER TABLE `cabecera_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ciudades`
--

DROP TABLE IF EXISTS `ciudades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ciudades` (
  `id_ciudad` int NOT NULL AUTO_INCREMENT,
  `id_region` int NOT NULL,
  `descripcion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_ciudad`),
  UNIQUE KEY `uq_ciudad_region` (`descripcion`,`id_region`),
  KEY `idx_ciudad_region` (`id_region`),
  CONSTRAINT `fk_ciudad_region` FOREIGN KEY (`id_region`) REFERENCES `regiones` (`id_region`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Nivel 2 de la jerarquía geográfica';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ciudades`
--

LOCK TABLES `ciudades` WRITE;
/*!40000 ALTER TABLE `ciudades` DISABLE KEYS */;
INSERT INTO `ciudades` VALUES (1,1,'BALZAR','BLZ'),(2,1,'DURAN','DRN'),(3,1,'GUAYAQUIL','GYE'),(4,2,'QUITO','UIO'),(5,2,'CUENCA','CUE'),(6,5,'Sin Ciudad','N/A'),(7,2,'AMBATO',NULL),(8,1,'BABA',NULL),(9,1,'BABAHOYO',NULL),(10,1,'BAGATELA',NULL),(11,1,'BALAO',NULL),(12,3,'BAÑOS DE AGUA SANTA',NULL),(13,1,'CALUMA',NULL),(14,2,'CAYAMBE',NULL),(15,1,'DAULE',NULL),(16,1,'ECHEANDIA',NULL),(17,2,'IBARRA',NULL),(18,1,'JUJAN',NULL),(19,2,'LATACUNGA',NULL),(20,1,'MOCACHE',NULL),(21,1,'NARANJAL',NULL),(22,1,'PALENQUE',NULL),(23,3,'PELILEO',NULL),(24,2,'PILLARO',NULL),(25,1,'PUEBLO VIEJO',NULL),(26,2,'PUJILI',NULL),(27,3,'PUYO',NULL),(28,1,'QUEVEDO',NULL),(29,2,'RIOBAMBA',NULL),(30,2,'RUMIÑAHUI',NULL),(31,2,'SALCEDO',NULL),(32,1,'SANTO DOMINGO',NULL),(33,2,'SAQUISILI',NULL),(34,3,'TENA',NULL),(35,1,'URDANETA',NULL),(36,1,'VALENCIA',NULL),(37,1,'VENTANAS',NULL),(38,1,'VINCES',NULL);
/*!40000 ALTER TABLE `ciudades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamento_proveedores_rotacion`
--

DROP TABLE IF EXISTS `departamento_proveedores_rotacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamento_proveedores_rotacion` (
  `id_rotacion` int NOT NULL AUTO_INCREMENT,
  `id_departamento` int NOT NULL,
  `id_proveedor` int NOT NULL,
  `orden_rotacion` int NOT NULL,
  PRIMARY KEY (`id_rotacion`),
  UNIQUE KEY `uq_dept_orden` (`id_departamento`,`orden_rotacion`),
  KEY `fk_rot_prov` (`id_proveedor`),
  CONSTRAINT `fk_rot_dept` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_rot_prov` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamento_proveedores_rotacion`
--

LOCK TABLES `departamento_proveedores_rotacion` WRITE;
/*!40000 ALTER TABLE `departamento_proveedores_rotacion` DISABLE KEYS */;
INSERT INTO `departamento_proveedores_rotacion` VALUES (1,1,2,1),(2,1,1,2);
/*!40000 ALTER TABLE `departamento_proveedores_rotacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamento_suministros`
--

DROP TABLE IF EXISTS `departamento_suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamento_suministros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_departamento` int NOT NULL,
  `id_suministro` int NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_dpto_sum` (`id_departamento`,`id_suministro`),
  KEY `fk_ds_sum` (`id_suministro`),
  CONSTRAINT `fk_ds_dpto` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ds_sum` FOREIGN KEY (`id_suministro`) REFERENCES `suministros` (`id_suministro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Suministros permitidos por departamento';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamento_suministros`
--

LOCK TABLES `departamento_suministros` WRITE;
/*!40000 ALTER TABLE `departamento_suministros` DISABLE KEYS */;
INSERT INTO `departamento_suministros` VALUES (2,11,176,'2026-03-10 21:43:30'),(3,11,177,'2026-03-10 21:43:30');
/*!40000 ALTER TABLE `departamento_suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos` (
  `id_departamento` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,'Administracion'),(2,'Auditoria'),(3,'Comercial'),(4,'Contabilidad'),(5,'Directorio'),(6,'Financiero'),(7,'Mantenimiento'),(8,'Procesos BI'),(9,'Supply Chain'),(10,'Talento Humano'),(11,'Tecnologia'),(12,'Tesoreria'),(13,'Trade Marketing'),(14,'Control Financiero y Regulatorio'),(15,'Inteligencia Comercial'),(16,'Gente y Cultura'),(17,'Estrategia y Excelencia'),(18,'Estrategia y Excelencia Corporativa');
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_pedidos`
--

DROP TABLE IF EXISTS `detalle_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_pedidos` (
  `id_detalle_pedido` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `id_suministro` int NOT NULL,
  `id_proveedor` int DEFAULT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id_detalle_pedido`),
  KEY `fk_det_prov` (`id_proveedor`),
  KEY `idx_det_pedido` (`id_pedido`),
  KEY `idx_det_suministro` (`id_suministro`),
  CONSTRAINT `fk_det_ped` FOREIGN KEY (`id_pedido`) REFERENCES `cabecera_pedidos` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_det_prov` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_det_sum` FOREIGN KEY (`id_suministro`) REFERENCES `suministros` (`id_suministro`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_pedidos`
--

LOCK TABLES `detalle_pedidos` WRITE;
/*!40000 ALTER TABLE `detalle_pedidos` DISABLE KEYS */;
INSERT INTO `detalle_pedidos` VALUES (1,1,22,2,1,0.40);
/*!40000 ALTER TABLE `detalle_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_pdvs`
--

DROP TABLE IF EXISTS `estado_pdvs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_pdvs` (
  `id_estado_pdv` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_estado_pdv`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_pdvs`
--

LOCK TABLES `estado_pdvs` WRITE;
/*!40000 ALTER TABLE `estado_pdvs` DISABLE KEYS */;
INSERT INTO `estado_pdvs` VALUES (1,'Activo'),(2,'Inactivo');
/*!40000 ALTER TABLE `estado_pdvs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_pedidos`
--

DROP TABLE IF EXISTS `estado_pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_pedidos` (
  `id_estado_pedido` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_estado_pedido`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_pedidos`
--

LOCK TABLES `estado_pedidos` WRITE;
/*!40000 ALTER TABLE `estado_pedidos` DISABLE KEYS */;
INSERT INTO `estado_pedidos` VALUES (1,'En espera'),(2,'Aprobado'),(3,'Rechazado');
/*!40000 ALTER TABLE `estado_pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_suministros`
--

DROP TABLE IF EXISTS `estado_suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_suministros` (
  `id_estado_suministro` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_estado_suministro`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_suministros`
--

LOCK TABLES `estado_suministros` WRITE;
/*!40000 ALTER TABLE `estado_suministros` DISABLE KEYS */;
INSERT INTO `estado_suministros` VALUES (1,'Disponible'),(2,'No Disponible');
/*!40000 ALTER TABLE `estado_suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupo_pdvs`
--

DROP TABLE IF EXISTS `grupo_pdvs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo_pdvs` (
  `id_grupo_pdv` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `monto_autorizado` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_grupo_pdv`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupo_pdvs`
--

LOCK TABLES `grupo_pdvs` WRITE;
/*!40000 ALTER TABLE `grupo_pdvs` DISABLE KEYS */;
INSERT INTO `grupo_pdvs` VALUES (1,'PEQUENO A',15.00),(2,'PEQUENO B',18.00),(3,'MEDIANO',20.00),(4,'GRANDE',25.00),(5,'ESPECIAL',35.00);
/*!40000 ALTER TABLE `grupo_pdvs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pdv_suministros`
--

DROP TABLE IF EXISTS `pdv_suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pdv_suministros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_pdv` int NOT NULL,
  `id_suministro` int NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_pdv_sum` (`id_pdv`,`id_suministro`),
  KEY `fk_ps_sum` (`id_suministro`),
  CONSTRAINT `fk_ps_pdv` FOREIGN KEY (`id_pdv`) REFERENCES `pdvs` (`id_pdv`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ps_sum` FOREIGN KEY (`id_suministro`) REFERENCES `suministros` (`id_suministro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Suministros permitidos por PDV individual (sobreescribe zona y región)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pdv_suministros`
--

LOCK TABLES `pdv_suministros` WRITE;
/*!40000 ALTER TABLE `pdv_suministros` DISABLE KEYS */;
/*!40000 ALTER TABLE `pdv_suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pdvs`
--

DROP TABLE IF EXISTS `pdvs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pdvs` (
  `id_pdv` int NOT NULL AUTO_INCREMENT,
  `id_grupo_pdv` int NOT NULL,
  `id_estado_pdv` int NOT NULL,
  `id_zona_comercial` int NOT NULL,
  `id_ciudad` int DEFAULT NULL,
  `id_proveedor_principal` int DEFAULT NULL,
  `id_supervisor` int DEFAULT NULL,
  `codigo_centro_costo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL COMMENT 'Identificador único del PDV',
  `direccion` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_pdv`),
  UNIQUE KEY `uq_pdv_codigo` (`codigo_centro_costo`),
  KEY `fk_pdv_grupo` (`id_grupo_pdv`),
  KEY `fk_pdv_estado` (`id_estado_pdv`),
  KEY `fk_pdv_prov` (`id_proveedor_principal`),
  KEY `idx_pdv_zona` (`id_zona_comercial`),
  KEY `idx_pdv_supervisor` (`id_supervisor`),
  KEY `idx_pdv_codigo` (`codigo_centro_costo`),
  KEY `fk_pdv_ciudad` (`id_ciudad`),
  CONSTRAINT `fk_pdv_ciudad` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudades` (`id_ciudad`),
  CONSTRAINT `fk_pdv_estado` FOREIGN KEY (`id_estado_pdv`) REFERENCES `estado_pdvs` (`id_estado_pdv`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pdv_grupo` FOREIGN KEY (`id_grupo_pdv`) REFERENCES `grupo_pdvs` (`id_grupo_pdv`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pdv_prov` FOREIGN KEY (`id_proveedor_principal`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pdv_supervisor` FOREIGN KEY (`id_supervisor`) REFERENCES `supervisores` (`id_supervisor`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_pdv_zona` FOREIGN KEY (`id_zona_comercial`) REFERENCES `zonas_comerciales` (`id_zona_comercial`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=341 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='PDV como entidad de identidad. Región/ciudad deducibles por JOIN.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pdvs`
--

LOCK TABLES `pdvs` WRITE;
/*!40000 ALTER TABLE `pdvs` DISABLE KEYS */;
INSERT INTO `pdvs` VALUES (1,2,1,1,1,2,1,'FC004','BAL ROMULO RENDON Y VINCES CALLE ROMULO RENDON Y VINCES FRENTE A ALMACEN MIGUELITO'),(2,1,1,1,1,2,1,'FC005','BAL AV DAULE Y OLMEDO CALLE DAULE Y OLMEDO DIAGONAL AL HOTEL AZUAY'),(3,1,1,1,1,2,1,'FC006','BAL AV DAULE Y VINCES AV DAULE Y VINCES REFERENCIA LAS 4 ESQUINAS'),(4,2,1,1,8,2,1,'FC095','BAA AV. GUAYAQUIL AV GUAYAQUIL SUCRE'),(5,1,1,1,8,2,1,'FC096','ISL AV PRINCIPAL AV. PRINCIPAL S/N'),(6,2,1,1,8,2,1,'FC097','BAA AV. GUAYAQUIL Y SUCRE Y 9 DE OCT'),(7,1,1,1,9,2,1,'FC098','BAB CALLE G Y PRIMERA PIMOCHA CALLE G Y PRIMERA'),(8,2,1,1,22,2,1,'FC099','PAL BOLIVAR Y NICOLAS INFANTE CALLE BOLIVAR Y NICOLAS INFANTE'),(9,1,1,1,22,2,1,'FC100','PAL BOLIVAR Y 10 DE SEPTIEMBRE CALLE BOLIVAR Y 10 DE SEPT'),(10,4,1,1,38,2,1,'FC101','VCE BOLIVAR Y CALLEJON VERA BOLIVAR Y 10 DE AGOSTO'),(11,4,1,1,38,2,1,'FC102','VCE 10 DE AGOSTO Y 9 DE OCTUBRE CALLE 10 DE AGOSTO S/N 9 DE OCTUBRE'),(12,4,1,1,38,2,1,'FC103','VCE 24 DE MAYO Y SUCRE SUCRE S/N24 MAYO'),(13,4,1,1,38,2,1,'FC104','VCE BOLIVAR Y SUCRE BOLIVAR S/N SUCRE'),(14,4,1,1,38,2,1,'FC105','VCE JOSE GOMEZ CARBO Y MEXICO JOSE GOMEZ CARBO S/N Y MEXICO'),(15,1,1,1,38,2,1,'FC106','VCE BOLIVAR Y CORDOVA BOLIVAR S/N Y CORDOVA'),(16,1,1,1,38,2,1,'FC107','VCE MI COMISARIATO VINCES CALLE CORDOVA Y HERBERTH'),(17,3,1,1,38,2,1,'FC108','VCE AV. AQUILES CARRIEL Y CALLE MOCACHE'),(18,1,1,1,38,2,1,'FC109','VCE 10 DE AGOSTO Y 13 DE ENERO CALLES 10 DE AGOSTO Y 13 DE ENERO'),(19,1,1,1,38,2,1,'FC110','VCE 10 DE AGOSTO SECTOR NICARAGUA CALLE 10 DE AGOS REF'),(20,1,1,5,2,1,2,'FC007','GONZALO APARICIO SOLAR 7 Y ABEL GILBERT TRES'),(21,2,1,5,2,1,2,'FC008','GONZALO APARICIO SOLAR 16 Y ABEL GILBERT TRES'),(22,1,1,5,2,1,2,'FC009','LEON FEBRES CORDERO SOLAR 6 Y PRMAVERA DOS SECTOR 2 C'),(23,1,1,5,2,1,2,'FC010','AV. JAIME ROLDOS AGUILERA SOLAR 5 Y JAIME ROLDOS MZ 51'),(24,3,1,5,2,1,2,'FC011','VIA DURAN BOLICHE SOLAR 1-2 Y ORAMAS GONZALEZ'),(25,1,1,5,2,1,2,'FC012','AV AMAZONAS SOLAR 16 Y ABEL GILBERT PONTON UNO MZ 18'),(26,1,1,5,2,1,2,'FC013','COOP. HECTOR COBOS ETAPA II MZ E SL 1'),(27,2,1,5,2,1,2,'FC014','AV JAIME ROLDOS SOLAR 10 Y ABEL GILBERT PONTON 1 MZ 47'),(28,1,1,5,2,1,2,'FC015','AV AMAZONAS SOLAR 1 Y ORAMAS GONZALEZ MZ 21 SL 1'),(29,1,1,5,2,1,2,'FC016','MERA SOLAR 1 Y ELSA BUCARAM MZ 3'),(30,2,1,5,2,1,2,'FC017','AV SAMUEL CISNEROS SL 40 Y AV PEDRO VICENTE MALDONADO'),(31,2,1,5,2,1,2,'FC018','COOP. 2 DE MAYO MZ 1 SL 6 (LOS HELECHOS)'),(32,2,1,5,2,1,2,'FC019','AV. JAIME ROLDOS SOLAR 1 MZ A'),(33,5,1,5,2,1,2,'FC020','SAMUEL CISNEROS 14 Y SAMUEL CISNEROS'),(34,1,1,5,2,1,2,'FC021','COOP ABEL G PONTON 2 SOLAR 3 Y DIVINO NIÑO MZ 24'),(35,1,1,5,2,1,2,'FC022','ORAMAS GONZALEZ 40 MZ 8'),(36,2,1,5,2,1,2,'FC023','CA DUR RECREO 4 ETAPA M428'),(37,1,1,5,2,1,2,'FC024','CA CDLA EL RECREO 4 ETAPA M430 SL 1'),(38,1,1,5,2,1,2,'FC025','CDLA. ANA MARIA DE OLMEDO MZ. 41 SOLAR 01'),(39,1,1,5,2,1,2,'FC026','EL RECREO ETAPA I 01  MZ 119 CC MINI RECREO'),(40,1,1,5,2,1,2,'FC027','SAMUEL CISNEROS SOLAR 6 Y DIVINO NIÑO'),(41,1,1,5,2,1,2,'FC028','COOP UNION Y PROGRESO SOLAR 18 MZ M'),(42,1,1,5,2,1,2,'FC029','COOP VIVIENDA 10 DE ENERO SOLAR 1 Y EL RECREO'),(43,2,1,5,2,1,2,'FC030','COOPERATIVA CINCO DE JUNIO BLOQUE G3 MZ. A SL. 1'),(44,1,1,5,2,1,2,'FC031','LOS HELECHOS SL 11 Y SECTOR 2 MZ D5'),(45,1,1,5,2,1,2,'FC032','COOPERATIVA CARLOS CARRERA MZ. E SL. 4, PARROQUIA DIVINO NIÑO'),(46,1,1,5,2,1,2,'FC033','CA DUR EL RECREO III 30 MZ 307 LOCAL 2'),(47,1,1,5,11,2,2,'FC035','BAL CABECERA CANTONAL RECINTO SAN CARLOS'),(48,1,1,5,21,2,2,'FC042','NAR 10 DE AGOSTO CALLE 10 DE AGO Y EUGENIO ESPEJO'),(49,1,1,5,21,2,2,'FC043','NAR GUAYAQUIL Y CUENCA CALLES GUAYAQUIL # 113 Y CUENCA'),(50,1,1,6,15,2,3,'FC034','DAU AV. JUAN B. AGUIRRE Y CARLOS LUIS PLAZA DAÑIN'),(51,1,1,6,15,2,3,'FC036','SAL VIA SALITRE URB L´OGARE # 6'),(52,1,1,6,15,2,3,'FC037','DAU LA T VIA A SALITRE SECTOR LA T SOLAR 20 B MZ 30'),(53,1,1,6,3,1,3,'FC044','JOSE MARIA EGAS SOLAR 13 Y ALBORADA TERCERA ETAPA MZ BK'),(54,2,1,6,3,1,3,'FC045','AV FRANCISCO DE ORELLANA SOLAR 1 Y SAMANES SIETE'),(55,1,1,6,3,1,3,'FC046','CDLA ATARAZANA 1 MZ 45'),(56,1,1,7,3,1,4,'FC038','CHG PAQUISHA CDLA COMUNA CHONGON CALLE PAQUISHA MZ 34 # 2B'),(57,1,1,7,3,1,4,'FC039','CHG VIA A LA COSTA KM 24 VIA A LA COSTA KM 24 MZ 138 SL 10'),(58,1,1,7,3,1,4,'FC040','GYE PROGRESO BARRIO EL CONTROL BARRIO EL CONTROL'),(59,2,1,7,3,2,4,'FC041','GYE PIAZA CEIBOS AV DEL BOMBERO  KM 6.5 NUM A - 26'),(60,1,1,7,3,1,4,'FC050','GARCIA MORENO SOLAR 8 MZ M'),(61,1,1,7,3,1,4,'FC051','10 DE AGOSTO 3618 Y DECIMA'),(62,2,1,7,3,1,4,'FC055','COLON 736 Y GUERRERO MARTI+E53+E57'),(63,1,1,10,14,2,5,'FC074','CA AV. NATALIA JARRIN, N1-09 Y LIBERTAD'),(64,1,1,10,17,2,5,'FC081','IBA CALLE SAN FRANCISCO #5-98 Y RIO PATATE'),(65,1,1,10,14,2,5,'FC165','CAY CALLE RESTAURACION ENTRE JUNIN Y SUCRE CALLES RESTAURACION S1-12'),(66,1,1,10,4,2,5,'FC166','UIO CALLE CUSUBAMBA OE4-394 Y PENIPE CALLE CUSUBAMBA # OE4394 Y PENIPE'),(67,1,1,10,4,2,5,'FC167','UIO AV MARTHA BUCARAM # 241-109 Y CALLE 10  REF'),(68,1,1,10,4,2,5,'FC168','UIO LUIS LOPEZ N125Y MARISCAL SUCRE CALLES LUIS LOPEZ # N125 Y MARISCAL SUCRE'),(69,1,1,10,4,2,5,'FC169','UIO AV ILALO Y ALONDRAS AV ILALO Y ALONDRAS EDIF CENTRO COMERCIAL LAS ALONDRAS'),(70,1,1,10,4,2,5,'FC170','UIO AV ELOY ALFARO Y CALLE JUAN MOLINEROS URB RON MUÑOZ II AV ELOY ALFARO Y JUAN MOLINEROS'),(71,1,1,10,4,2,5,'FC171','UIO AV AMAZONAS Y TOMAS DE BERLANGA AV AMAZONAS 42-104 Y TOMAS DE BERLANGA'),(72,1,1,10,4,2,5,'FC172','UIO CALLES S7F Y PASAJE E15A PASAJE 715A  E15-31 Y PASAJE E15A'),(73,1,1,10,4,2,5,'FC173','UIO AV 6 DE DIC Y PASAJE CALIFORNIA CALLES AV 6 DE DIC N36-131 Y PASAJE CALIFORNIA REF'),(74,1,1,10,4,2,5,'FC174','UIO REPUBLICA DOMINICANA Y ANTONIO RUIZ REPUBLICA DOMINICANA 82-04 Y ANTONIO RUIZ'),(75,1,1,10,4,2,5,'FC176','UIO AV MARISCAL SUCRE Y MANUEL CORONADO AV MARISCAL SUCRE Y MANUEL CORONADO'),(76,1,1,10,4,2,5,'FC177','UIO VOZ ANDES Y AV AMÉRICA CALLE VOZ ANDES 231 Y AV AMÉRICA'),(77,1,1,10,30,2,5,'FC178','UIO AV GENERAL ENRIQUEZ 4-25 Y PASAJE TOLITA AV. GENERAL ENRIQUEZ 4-25 Y PASAJE TOLITA'),(78,1,1,10,30,2,5,'FC179','RUM AV MARIANA DE JESUS Y PAZALEO CALLES : AV MARIANA DE JESUS Y PAZALEO'),(79,1,1,10,30,2,5,'FC180','RUM AV GRAL ENRIQUEZ Y SUCRE AV. GRAL ENRIQUEZ 3259 Y SUCRE'),(80,1,1,9,7,1,9,'FC181','AVENIDA BOLIVARIANA Y JULIO JARAMILLO'),(81,1,1,9,7,1,9,'FC182','CESAR AUGUSTO SALAZAR SN Y PEDRO VASCONES SEVILLA'),(82,1,1,9,7,1,9,'FC183','AV LOS GUAYTAMBOS Y PASAJE LAS PIÑAS'),(83,1,1,9,7,1,9,'FC184','SERGIO NUÑEZ Y ANTONIO CLAVIJO'),(84,1,1,9,7,1,9,'FC185','AV ATAHUALPA 615 Y IMBABURA'),(85,1,1,9,24,1,9,'FC190','BOLIVAR B279 Y NARVAEZ'),(86,2,1,9,24,1,9,'FC191','ROCAFUERTE 155 Y SUCREPILLARO'),(87,2,1,9,19,1,9,'FC192','AV UNIDAD NACIONAL SN Y ATAHUALPA'),(88,3,1,9,29,1,9,'FC212','AVENIDA DANIEL LEON B SN Y AV CARLOS ZAMBRANO'),(89,1,1,8,12,1,10,'FC186','ROCAFUERTE Y ELOY ALFARO'),(90,2,1,8,12,1,10,'FC187','AMBATO SN Y PASAJE ERMITA DE LA VIRGEN'),(91,1,1,8,12,1,10,'FC189','AMBATO SN Y OSCAR EFREN REYES'),(92,1,1,8,27,1,10,'FC205','CESLAO MARIN SN AV ALBERTO ZAMBRANO'),(93,1,1,8,27,1,10,'FC206','20 DE JULIO SN Y CESLAO MARIN'),(94,1,1,8,27,1,10,'FC207','MANABI SN Y PASAJE'),(95,3,1,8,27,1,10,'FC211','ORELLANA SN Y 27 DE FEBRERO'),(139,1,1,6,3,1,3,'FC047','COLINA DEL HIPODROMO SOLAR 1 Y SN'),(140,1,1,6,3,1,3,'FC048','AV. CARLOS JULIO AROSEMENA SOLAR 6'),(141,1,1,6,3,1,3,'FC049','EL LIMONAL SL 2 Y AUTOPISTA NARCISA DE JESUS MZ 2372'),(144,1,1,7,3,1,4,'FC052','CRISTOBAL COLON 3105 Y CALLE 11'),(145,2,1,7,3,1,4,'FC053','PORTETE 2302 Y TULCAN'),(146,1,1,7,3,1,4,'FC054','LA 27 AVA SN Y LA E'),(148,1,1,7,3,1,4,'FC056','CAPITAN NAJERA 504 A Y FEDERICO GODIN (LA ONCE)'),(149,1,1,7,3,1,4,'FC057','38AVA 2629 Y CALLE C'),(150,2,1,7,3,1,4,'FC058','38 AVA. 2201 Y FRANCISCO SEGURA'),(151,1,1,7,3,1,4,'FC059','25 AVA 1515 Y FRANCISCO DE SEGURA'),(152,1,1,7,3,1,4,'FC060','29AVA 1401 ENTRE PORTETE VENEZUELA'),(153,1,1,7,3,1,4,'FC061','25 AVA SN Y CALLE CH'),(154,1,1,7,3,1,4,'FC062','LIZARDO GARCIA N6 Y EL ORO MZ 13'),(155,1,1,7,3,1,4,'FC063','38 AVA 741 Y PORTETE MZ 1357'),(156,2,1,7,3,1,4,'FC064','4 DE NOVIEMBRE 3600 Y LA 11AVA.'),(157,1,1,7,3,1,4,'FC065','HUANCAVILCA 2107 Y LOS RIOS'),(158,1,1,7,3,1,4,'FC066','26 AVA SOL 23 Y CALLE N MZ 1287 SL 23'),(159,1,1,7,3,1,4,'FC067','24 AVA Y GOMEZ RENDON ESQUINA'),(160,1,1,7,3,1,4,'FC068','PORTETE SN Y CALLE 34AVA'),(161,2,1,7,3,1,4,'FC069','PEDRO MONCAYO 2701 Y GOMEZ RENDON'),(162,1,1,7,3,1,4,'FC070','VENEZUELA 2423 Y TUNGURAHUA'),(163,1,1,7,3,1,4,'FC071','COOP ACCION 5 Y CIVISMO Y LIBERTAD MZ 1348'),(164,1,1,7,3,1,4,'FC072','CAPITAN NAJERA 3201 Y GALLEGOS LARA'),(165,1,1,7,3,1,4,'FC073','AVENIDA 9 DE OCTUBRE NUMERO 803B Y CALLE LOS RIOS'),(167,1,1,7,3,1,4,'FC075','FRANCISCO SEGURA 2519 Y GALLEGOS LARA'),(168,1,1,6,3,1,3,'FC076','AV DOMINGO COMIN SOLAR 23 Y LOS TULIPANES MZ 1136'),(169,1,1,6,3,1,3,'FC077','LOS RIOS SOLAR 1 Y LAS ACACIAS MZ E-3'),(170,1,1,6,3,1,3,'FC078','ROBERTO SERRANO R SOLAR 11 Y PRECOOP LOS ANGELES DEL GUASMO MZ 143 SOLAR 11'),(171,2,1,6,3,1,3,'FC079','AV. RAUL CLEMENTE HUERTA SOLAR 1 MZ 4 GUASMO CENTRAL'),(172,2,1,6,3,1,3,'FC080','AV ABDON CALDERON SOLAR 1 Y GUASMO MZ 244 GUASMO SUR'),(174,1,1,6,3,1,3,'FC082','GUASMO SUR CAUSA PROLETARIA MZ. 3496 SOLAR 16'),(175,3,1,2,16,2,6,'FC083','CALLE GONZALEZ SUAREZ Y CALLE SIMON BOLIVAR'),(176,1,1,6,3,1,3,'FC084','GUASMO CENTRAL PRECOOPERATIVA CIUDAD DE VENECIA MZ. A SL. 11'),(177,1,1,6,3,1,3,'FC085','GUASMO CENTRAL MZ. 1454 SOLAR 12 COOPERATIVA SIETE LAGOS'),(178,1,1,6,3,1,3,'FC086','COOPERATIVA MARÍA TORAL MZ. 4267 SOLAR 25 (LAS MALVINAS)'),(179,1,1,6,3,1,3,'FC087','GUASMO SUR COOPERATIVA GUAYAS Y QUIL II, SOLAR 12, MZ. 2416'),(180,1,1,6,3,1,3,'FC088','ISLA TRINITARIA, COOPERATIVA ELOY ALFARO MZ. 714 SOLAR 1, LOCAL 2 Y 3'),(181,1,1,6,3,1,3,'FC089','COOP. UNIÓN DE BANANEROS ETAPA II MZ.2724 SL. 8A ETAPA 2'),(182,1,1,6,3,1,3,'FC090','GUASMO CENTRAL SOLAR 8 Y SUR MZ 1772'),(183,1,1,6,3,1,3,'FC091','GUASMO SUR CIUDADELA COOPERATIVA CAUSA PROLETARIA MZ. 4 CALLE ABDON CALDERON MUÑOZ SL. 1'),(184,1,1,6,3,1,3,'FC092','COOPERATIVA NUEVO GUAYAQUIL SL.5 MZ. A, ISLA TRINITARIA, PARROQUIA XIMENA'),(185,1,1,6,3,1,3,'FC093','COOP CASITAS DEL GUASMO MZ 29 SL 2 GUASMO NORTE'),(186,1,1,4,18,2,7,'FC094','JUJ SUDAMERICANA CALLE 16 DE FEBRERO Y JAIME ROLDOS'),(203,1,1,2,25,2,6,'FC111','SJU CALLE AURORA ESTRADA # 2 CALLE AURORA ESTRADA'),(204,1,1,2,25,2,6,'FC112','PVJ DIVINO NINO FERMÍN CHAVEZ #: S/N INTERSECCIÓN: 7 DE FEBRERO'),(205,2,1,2,35,2,6,'FC113','RIC AV PINARGOTE II AV. PINARGOTE S/N Y LEONIDAS ICAZA'),(206,1,1,2,9,2,6,'FC114','BAB ABRAHAM FREYRE Y PRIMERA TRANSVERSAL'),(207,2,1,2,9,2,6,'FC115','BAB ABRAHAN FREIRE EN 5 DE JUN Y AV URRUTIA'),(208,1,1,2,25,2,6,'FC116','SJU AURORA ESTRADA AURORA ESTRADA S/N'),(209,1,1,2,25,2,6,'FC117','PVJ FERMIN CHAVEZ AV. FERMIN CHAVEZ Y AV. PANAMERICANA'),(210,1,1,2,35,2,6,'FC118','RIC AV PINARGOTE AV.PINARGOTE'),(211,1,1,2,35,2,6,'FC119','URD CARLO TOLA Y JUSTINO LANDIVAR BARRIO LA ROTONDA'),(212,4,1,2,37,2,6,'FC120','VTA BOLIVAR Y 10 DE AGOSTO CALLE BOLIVAR Y 10 DE AGOSTO'),(213,1,1,2,37,2,6,'FC121','VTA 10 DE NOVIEMBRE Y 28 DE MAYO CALLE 10 DE NOV Y 28 DE MAYO'),(214,1,1,2,37,2,6,'FC122','VTA QUITO Y ANTONIO JOSE DE SUCRE CALLES QUITO Y A JOSE DE SUCRE'),(215,1,1,2,37,2,6,'FC123','VTA 9 DE OCTUBRE Y JOSE MARIA VELASCO IBARRA CALLE 9 DE OCT Y JOSE MA VELASCO IBARRA'),(216,1,1,2,37,2,6,'FC124','VTA AV. SEMINARIO Y 28 DE MAYO CALLES AVE SEMINARIO Y 28 DE MAYO  REF'),(217,2,1,3,28,2,8,'FC125','QUE AV QUITO # 401 AV QUITO 401 Y CALLE PRINCIPAL'),(218,1,1,3,28,2,8,'FC126','QUE VIA PRINCIPAL COMUNA LA ESPERANZA CALLE 3ERA Y CALLE G'),(219,1,1,3,20,2,8,'FC127','MOC 28 DE MAYO Y SEGUNDA CALLE 28 DE MAYO Y SEGUNDA'),(220,1,1,3,20,2,8,'FC128','MOC 28 DE MAYO 503 Y SUCRE CALLES 28 DE MAYO # 503 Y SUCRE'),(221,4,1,3,28,2,8,'FC129','QUE 7 DE OCTUBRE Y SEPTIMA CALLE AV 7 DE OCTUBRE Y 7MA'),(222,4,1,3,28,2,8,'FC130','QUE CALLE BOLIVAR Y SEXTA CALLE BOLIVAR Y SEXTA'),(223,1,1,3,28,2,8,'FC131','QUE R. PAREDES ENTRE LIB NAC Y UNI POPULAR'),(224,1,1,3,28,2,8,'FC132','QUE JAIME ROLDOS SL18 CALLE 29 Y CALLE 30'),(225,3,1,3,28,2,8,'FC133','QUE 7 DE OCTUBRE Y SEXTA CALLE 7 DE OCT # 600 Y SEXTA'),(226,1,1,3,28,2,8,'FC134','QUE NUEVA ESPERANZA MZ 1 SL 02 Y 10 DE AGOSTO'),(227,1,1,3,28,2,8,'FC135','QUE SIETE DE OCTUBRE Y DECIMA PRIMERA CALLES 7 DE OCTUBRE Y DECIMA PRIMERA'),(228,1,1,3,28,2,8,'FC136','QUE AV CARLOS JULIO AROSEMENA Y WALTER ANDRADE AV CARLOS JULIO AROSEMENA SL  # 7 Y WALTER ANDRADE'),(229,1,1,3,28,2,8,'FC137','QUE AV WALTER ANDRADE AV WALTER ANDRADE 1613 Y CALLE 3ERA Y CALLE 4TA'),(230,1,1,3,36,2,8,'FC138','VAL PISTA ATERRIZAJE EL VERGEL'),(231,1,1,3,36,2,8,'FC139','VAL 13 DE DICIEMBRE Y QUEVEDO AV 13 DE DIC Y QUEVEDO'),(232,1,1,4,9,2,7,'FC140','BAB MALECON Y RICAURTE MALECON 9 DE OCT # 1301 Y RICAURTE'),(233,1,1,4,9,2,7,'FC141','BAB CLEMENTE BAQUERIZO Y V MACHUCA CLEMENTE BAQUERIZO S/N VARGAS MACHUCA'),(234,1,1,4,9,2,7,'FC142','BAB 5 DE JUNIO Y 9 DE NOVIEMBRE 5 DE JUNIO 1703 Y 9 DE NOVIEMBRE'),(235,2,1,4,9,2,7,'FC143','BAB LA AVENTURA LA VENTURA AV BENETAZZO S/N F/ POLICIA JUDICIAL'),(236,1,1,4,9,2,7,'FC144','BAB 5 DE JUNIO Y 27 DE MAYO 5 DE JUNIO 413 Y 27 DE MAYO'),(237,4,1,4,9,2,7,'FC145','BAB AV 25 DE JUNIO Y AV BY PASS AV 25 DE JUNIO S/N INTERSECCIÓN Y  AV.  BY PASS'),(238,1,1,4,9,2,7,'FC146','BAB GENERAL BARONA Y SUCRE GENERAL BARONA  S/N SUCRE,'),(239,1,1,4,9,2,7,'FC147','BAB 5 JUNIO Y CALDERON 5 DE JUNIO S/N Y CALDERON'),(240,1,1,4,9,2,7,'FC148','BAB OLMEDO Y 5 DE JUNIO OLMEDO S/N Y 5 DE JUNIO'),(241,4,1,4,9,2,7,'FC149','BAB MI AHORRO 5 5 DE JUNIO Y 27 DE MAYO'),(242,1,1,4,9,2,7,'FC150','BAB 10 AGOSTO Y M.ICAZA 10 DE AGOSTO Y MARTIN ICAZA'),(243,2,1,4,9,2,7,'FC151','BAB P CARBO ENTRE 10 DE AGO Y 5 DE JUN'),(244,1,1,4,9,2,7,'FC152','BAB MARTIN ICAZA Y GENERAL BARONA REF'),(245,1,1,4,9,2,7,'FC153','BAB JUAN X MARCOS Y MARTIN ICAZA JUAN X MARCOSY MARTIN ICAZA'),(246,1,1,4,9,2,7,'FC154','BAB CALDERON Y 5 DE JUNIO CALDERON Y 5 DE JUNIO'),(247,2,1,4,9,2,7,'FC155','BAB AV BENETAZZO Y CALLE N CALLE AV BENETAZZO Y CALLE N'),(248,1,1,4,9,2,7,'FC156','BAB AV. 2 DE AGOSTO Y LOS ANGELES PUEBLO NUEVO'),(249,1,1,4,9,2,7,'FC157','BAB. FEBRES CORDERO Y 9 DE OCTUBRE RECINTO MATA DE CACAO'),(250,1,1,4,9,2,7,'FC158','BAB FLORES Y GENERAL BARONA'),(251,1,1,4,9,2,7,'FC159','BAB 10 DE AGOSTO Y MEJIA CALLE 10 DE AGOSTO Y MEJIA'),(252,1,1,4,9,2,7,'FC160','BAB AV 6 DE OCTUBRE AV 6 DE OCTUBRE # 115 Y CLEMENTE BAQUERIZO'),(253,1,1,4,9,2,7,'FC161','BAB 10 DE AGOSTO Y RICAURTE CALLES 10 DE AGOSTO # 310 Y RICAURTE'),(254,1,1,4,9,2,7,'FC162','BAB MEJIA Y GENERAL BARONA CALLE MEJIA #11 Y GENERAL BARONA'),(255,1,1,4,9,2,7,'FC163','BAB JUAN X MARCOS Y MEJIA CALLE JUAN MARCOS Y MEJIA Y OLMEDO'),(256,1,1,4,9,2,7,'FC164','BAB 27 DE MAYO Y CUSTODIO SANCHEZ 27 DE MAYO Y CIUSTODIO SANCHEZ'),(283,1,1,9,19,1,9,'FC193','SAN SILVESTRE SN Y COOP 15 DE AGOSTO'),(284,1,1,9,19,1,9,'FC194','AVENIDA AMAZONAS 47-72 Y GUAYAQUIL'),(285,1,1,9,19,1,9,'FC195','QUIJANO SN Y ORDOÑEZ Y TARQUI'),(286,1,1,9,19,1,9,'FC196','24 DE MAYO SN Y 24 DE JUNIO'),(287,1,1,9,31,1,9,'FC197','CA SALC  GARCIA MORENO 5-34'),(288,2,1,9,31,1,9,'FC198','CA SALC  GARCIA MORENO Y ROCAFUERTE'),(289,1,1,9,31,1,9,'FC199','CA SALC  GARCIA MORENO Y SN SUCRE'),(290,1,1,9,31,1,9,'FC200','CA SALC  BELISARIO QUEVEDO S/N VICENTE MALDONADO'),(291,1,1,9,31,1,9,'FC201','CA SALC  RICARDO GARCES SN SUCRE'),(292,1,1,10,4,2,5,'FC202','UIO AVENIDA LA PRENSA N63-218 Y N63C Y CALLE MANTA'),(293,1,1,9,33,1,9,'FC203','CA SAQ  24 DE MAYO 8-14 Y CARCHI'),(297,1,1,8,27,1,10,'FC208','AV ALBERTO ZAMBRANO SN Y VIA TARQUI'),(298,1,1,8,27,1,10,'FC209','AMAZONAS SN Y FCO DE ORELLANA'),(299,1,1,8,27,1,10,'FC210','AV ALBERTO ZAMBRANO SN  (ALB)'),(302,1,1,9,29,1,9,'FC213','CALLE FEBRES CORDERO 1922 Y ESPEJO'),(303,1,1,9,29,1,9,'FC214','AVENIDA LIZARZABURU L20 Y MF'),(304,2,1,9,29,1,9,'FC215','CALLE GUAYAQUIL 21-60 Y PICHINCHA'),(305,1,1,9,29,1,9,'FC216','AVENIDA DANIEL LEON B 44 47 Y EPICLACHIMA'),(306,2,1,8,34,1,10,'FC217','15 DE NOVIEMBRE SN Y RIOBAMBA'),(307,2,1,8,34,1,10,'FC218','EDWIN ENRIQUEZ SN Y AV 15 DE NOVIEMBRE'),(308,1,1,8,34,1,10,'FC219','AV 15 DE NOV SN Y MARIANA MONTESDEOCA'),(309,1,1,8,34,1,10,'FC220','BARRIO CENTRAL 323 Y SIMON BOLIVAR Y GARCIA MORENO'),(310,1,1,10,4,2,5,'FC221','TARQUI SN Y GUAMOTE'),(311,2,1,3,32,2,8,'FC222','SDO AV RÍO TOACHI 631 Y ABRAHAM CALAZACÓN'),(312,1,1,2,13,2,6,'FC223','CLU LAS NARANJAS Y HEROES DEL CENEPA CALLE AV LAS NARANJAS Y HEROES DEL CENEPA'),(313,1,1,10,17,2,5,'FC224','IBA AV JAIME ROLDOS Y ANGEL MENESES AV JAIME ROLDOS Y ANGEL MENESES'),(314,1,1,10,17,2,5,'FC225','IBA SANCHEZ Y CIFUENTES 15-15 Y ZENON CALLES SANCHEZ CIFUENTES 15-15 Y ZENON VILLACIS'),(315,1,1,10,17,2,5,'FC226','IBA AV RETORNO Y LA CALLE RIO CURARAY CALLES AV RETORNO 805 Y RIO CURARAY'),(316,1,1,3,32,2,8,'FC227','LOJA S/N Y AV. 29 DE MAYO'),(317,1,1,3,28,2,8,'FC228','MEXICO N8 Y AV. GUAYAQUIL MZ 15'),(318,1,1,3,28,2,8,'FC229','CALLE SANTA MARIA Y OTTO AROSEMENA'),(319,2,1,3,28,2,8,'FC230','CALLE 7 DE OCTUBRE 8AVA Y EDIFICIO HOTEL CONTINENTAL MZ 1 SL 1'),(320,1,1,2,25,2,6,'FC231','PVJ SAN JUAN CALLE AURORA ESTRADA Y SEMINARIO'),(321,1,1,8,34,1,10,'FC232','VICTOR H SAN MIGUEL SN Y AV 15 DE NOVIEMBRE'),(322,1,1,10,4,2,5,'FC233','PANZALEO E14-05 Y CAÑARIS'),(323,1,1,10,14,2,5,'FC234','CA VIVAR OE 052 ASCAZUBI - NAZACOTA PUENTO'),(324,1,1,10,4,2,5,'FC235','CALLE E13 ISLA MARCHENA  NUMERO N41 -31 Y AVENIDA LOS GRANADOS'),(325,1,1,2,25,2,6,'FC236','PVJ AVENIDA 8 DE AGOSTO NUMERO 1 PURETO PECHICHE'),(326,1,1,7,15,2,3,'FC237','CALLE LAS LOJAS NUMERO 7 Y LA AURORA'),(327,1,1,4,9,2,7,'FC238','CALLE CLEMENTE BAQUERIZO CDLA EL MAMEY'),(328,1,1,9,23,1,10,'FC239','CALLE JORGE CHACON CALICUCHIMA Y CALLE SAN PEDRO'),(329,1,1,9,26,1,9,'FC240','CALLE SIMON BOLIVAR Y AVENIDA VELASCO IBARRA'),(330,1,1,8,27,1,10,'FC241','CALLE 9 DE OCTUBRE Y FRANCISCO DE ORELLANA'),(331,1,1,9,19,1,9,'FC242','CALLE FELIX VALENCIA  NUMERO 7-13 Y 2 DE MAYO'),(332,1,1,2,16,2,6,'FC243','LOT MERCEDES VISCARRA Y AVENIDA MAGISTERIO'),(333,1,1,10,4,2,5,'FC244','AVENIDA AMARU ÑAN NUMERO OE 333 Y AVENIDA QUITUMBE'),(334,1,1,4,9,2,7,'FC245','CALLE MALECON Y CALLE 3ERA'),(335,4,1,8,12,1,10,'FC246','AVENIDA PEDRO VICENTE MALDONADO Y AVENIDA AMAZONAS'),(336,1,1,1,38,2,1,'FC247','CALLE EMANUEL SN  COOP BAGATELA  DIAGONALAL COLEGIO FRANCISCO XAVIER AGUIRRE ABAD'),(337,1,1,7,3,2,4,'FC248','CHONGON SECTOR 1 SL 01 MZ 41 FRENTE A FARMACIAS KEYLA'),(338,1,2,11,NULL,2,NULL,'FC175',NULL),(339,1,2,11,NULL,1,NULL,'FC188',NULL),(340,1,2,11,NULL,NULL,NULL,'FC204',NULL);
/*!40000 ALTER TABLE `pdvs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `descripcion` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `uq_permiso_codigo` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Catálogo maestro de permisos. Extensible sin ALTER TABLE.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES (1,'PEDIDOS','Puede crear y gestionar pedidos propios'),(2,'REPORTES','Puede visualizar reportes globales'),(3,'APROBACION','Puede aprobar o rechazar pedidos de otros'),(4,'CONFIGURACION','Puede acceder a la configuración del sistema');
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `presupuesto_departamentos`
--

DROP TABLE IF EXISTS `presupuesto_departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `presupuesto_departamentos` (
  `id_presupuesto_departamento` int NOT NULL AUTO_INCREMENT,
  `id_departamento` int NOT NULL,
  `periodo_anio` smallint NOT NULL COMMENT 'Ej: 2024, 2025',
  `periodo_mes` tinyint NOT NULL COMMENT '1..12; 0 = presupuesto anual',
  `monto_autorizado` decimal(12,2) NOT NULL DEFAULT '0.00',
  `monto_ejecutado` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT 'Actualizado al aprobar pedidos; evita SUM() en cada consulta',
  PRIMARY KEY (`id_presupuesto_departamento`),
  UNIQUE KEY `uq_pres_depto_periodo` (`id_departamento`,`periodo_anio`,`periodo_mes`),
  KEY `idx_pres_periodo` (`periodo_anio`,`periodo_mes`),
  CONSTRAINT `fk_pres_depto` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_mes` CHECK ((`periodo_mes` between 0 and 12))
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Un registro por departamento/periodo. Sin reset manual de montos.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `presupuesto_departamentos`
--

LOCK TABLES `presupuesto_departamentos` WRITE;
/*!40000 ALTER TABLE `presupuesto_departamentos` DISABLE KEYS */;
INSERT INTO `presupuesto_departamentos` VALUES (1,1,2026,0,0.00,0.00),(2,2,2026,0,0.00,0.00),(3,3,2026,0,0.00,0.00),(4,4,2026,0,0.00,0.00),(5,5,2026,0,0.00,0.00),(6,6,2026,0,35.00,0.00),(7,7,2026,0,0.00,0.00),(8,8,2026,0,0.00,0.00),(9,9,2026,0,60.00,0.00),(10,10,2026,0,0.00,0.00),(11,11,2026,0,15.00,0.00),(12,12,2026,0,0.00,0.00),(13,13,2026,0,0.00,0.00),(17,14,2026,0,0.00,0.00),(18,15,2026,0,35.00,0.00),(19,16,2026,0,50.00,0.00),(20,17,2026,0,0.00,0.00),(21,18,2026,0,0.00,0.00);
/*!40000 ALTER TABLE `presupuesto_departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proveedores` (
  `id_proveedor` int NOT NULL AUTO_INCREMENT,
  `nombre_proveedor` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_proveedor`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proveedores`
--

LOCK TABLES `proveedores` WRITE;
/*!40000 ALTER TABLE `proveedores` DISABLE KEYS */;
INSERT INTO `proveedores` VALUES (1,'Insumos Iris'),(2,'Insumos Orieta');
/*!40000 ALTER TABLE `proveedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `region_suministros`
--

DROP TABLE IF EXISTS `region_suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `region_suministros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_region` int NOT NULL,
  `id_suministro` int NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_region_sum` (`id_region`,`id_suministro`),
  KEY `fk_rs_sum` (`id_suministro`),
  CONSTRAINT `fk_rs_region` FOREIGN KEY (`id_region`) REFERENCES `regiones` (`id_region`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rs_sum` FOREIGN KEY (`id_suministro`) REFERENCES `suministros` (`id_suministro`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Suministros permitidos a nivel de región (heredable)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `region_suministros`
--

LOCK TABLES `region_suministros` WRITE;
/*!40000 ALTER TABLE `region_suministros` DISABLE KEYS */;
/*!40000 ALTER TABLE `region_suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regiones`
--

DROP TABLE IF EXISTS `regiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regiones` (
  `id_region` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  PRIMARY KEY (`id_region`),
  UNIQUE KEY `uq_region_desc` (`descripcion`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Nivel 1 de la jerarquía geográfica';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regiones`
--

LOCK TABLES `regiones` WRITE;
/*!40000 ALTER TABLE `regiones` DISABLE KEYS */;
INSERT INTO `regiones` VALUES (1,'Costa','CST'),(2,'Sierra','SRR'),(3,'Oriente','ORT'),(4,'Insular','INS'),(5,'Sin Region','N/A');
/*!40000 ALTER TABLE `regiones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_has_permisos`
--

DROP TABLE IF EXISTS `rol_has_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_has_permisos` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `fk_rhp_permiso` (`id_permiso`),
  CONSTRAINT `fk_rhp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_rhp_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_has_permisos`
--

LOCK TABLES `rol_has_permisos` WRITE;
/*!40000 ALTER TABLE `rol_has_permisos` DISABLE KEYS */;
INSERT INTO `rol_has_permisos` VALUES (1,1),(2,1),(3,1),(2,2),(3,2),(2,3),(3,3),(3,4);
/*!40000 ALTER TABLE `rol_has_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Solicitador'),(2,'Aprobador'),(3,'Administrador');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suministro_proveedor_stock`
--

DROP TABLE IF EXISTS `suministro_proveedor_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suministro_proveedor_stock` (
  `id_suministro` int NOT NULL,
  `id_proveedor` int NOT NULL,
  `stock` int NOT NULL DEFAULT '0',
  `id_estado_suministro` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_suministro`,`id_proveedor`),
  KEY `fk_stock_prov` (`id_proveedor`),
  KEY `idx_stock_estado_suministro` (`id_estado_suministro`),
  CONSTRAINT `fk_stock_estado_suministro` FOREIGN KEY (`id_estado_suministro`) REFERENCES `estado_suministros` (`id_estado_suministro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_prov` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_stock_sum` FOREIGN KEY (`id_suministro`) REFERENCES `suministros` (`id_suministro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_stock_positivo` CHECK ((`stock` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Stock actual por proveedor. Mutable. Descontado al aprobar pedido.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suministro_proveedor_stock`
--

LOCK TABLES `suministro_proveedor_stock` WRITE;
/*!40000 ALTER TABLE `suministro_proveedor_stock` DISABLE KEYS */;
INSERT INTO `suministro_proveedor_stock` VALUES (1,1,100,1),(1,2,100,1),(3,1,100,1),(3,2,100,1),(9,1,100,1),(9,2,100,1),(11,1,100,1),(11,2,100,1),(12,1,100,1),(12,2,100,1),(13,1,100,1),(13,2,100,1),(14,1,100,1),(14,2,100,1),(15,1,100,1),(15,2,100,1),(16,1,100,1),(16,2,100,1),(17,1,100,1),(17,2,100,1),(18,1,100,1),(18,2,100,1),(19,1,100,1),(19,2,100,1),(20,1,100,1),(20,2,100,1),(21,1,100,1),(21,2,100,1),(22,1,100,1),(22,2,100,1),(23,1,100,1),(23,2,100,1),(24,1,100,1),(24,2,100,1),(25,1,100,1),(25,2,100,1),(26,1,100,1),(26,2,100,1),(27,1,100,1),(27,2,100,1),(28,1,100,1),(28,2,100,1),(29,1,100,1),(29,2,100,1),(30,1,100,1),(30,2,100,1),(31,1,100,1),(31,2,100,1),(32,1,100,1),(32,2,100,1),(33,1,100,1),(33,2,100,1),(34,1,100,1),(34,2,100,1),(35,1,100,1),(35,2,100,1),(36,1,100,1),(36,2,100,1),(37,1,100,1),(37,2,100,1),(38,1,100,1),(38,2,100,1),(39,1,100,1),(39,2,100,1),(40,1,100,1),(41,1,100,1),(42,2,100,1),(43,2,100,1),(44,1,100,1),(45,1,100,1),(46,1,100,1),(47,2,100,1),(48,1,100,1),(59,2,100,1),(60,2,100,1),(61,2,100,1),(62,1,100,1),(69,2,100,1),(70,1,100,1),(71,1,100,1),(72,2,100,1),(73,1,100,1),(80,1,100,1),(81,1,100,1),(81,2,100,1),(82,1,100,1),(82,2,100,1),(83,1,100,1),(83,2,100,1),(84,1,100,1),(84,2,100,1),(85,1,100,1),(86,1,100,1),(87,1,100,1),(88,1,100,1),(88,2,100,1),(89,2,100,1),(90,1,100,1),(90,2,100,1),(91,1,100,1),(91,2,100,1),(93,1,100,1),(93,2,100,1),(108,1,100,1),(108,2,100,1),(109,1,100,1),(109,2,100,1),(110,1,100,1),(111,1,100,1),(111,2,100,1),(115,1,100,1),(115,2,100,1),(116,1,100,1),(116,2,100,1),(117,1,100,1),(117,2,100,1),(118,1,100,1),(118,2,100,1),(119,1,100,1),(119,2,100,1),(120,2,100,1),(123,1,100,1),(123,2,100,1),(124,1,100,1),(124,2,100,1),(125,1,100,1),(125,2,100,1),(126,2,100,1),(127,1,100,1),(127,2,100,1),(129,1,100,1),(129,2,100,1),(130,1,100,1),(130,2,100,1),(131,1,100,1),(131,2,100,1),(132,1,100,1),(132,2,100,1),(133,1,100,1),(133,2,100,1),(135,1,100,1),(138,1,100,1),(138,2,100,1),(140,2,100,1),(174,2,100,1),(176,2,100,1),(177,2,100,1),(178,1,100,1),(179,1,100,1),(180,1,100,1),(180,2,100,1),(181,1,100,1),(181,2,100,1),(182,1,100,1),(182,2,100,1),(183,2,100,1),(184,2,100,1),(185,2,100,1),(186,1,100,1),(187,1,100,1),(187,2,100,1),(188,1,100,1),(188,2,100,1),(192,2,100,1),(213,1,100,1),(214,2,100,1),(215,2,100,1),(216,1,100,1),(217,2,100,1),(218,1,100,1);
/*!40000 ALTER TABLE `suministro_proveedor_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suministros`
--

DROP TABLE IF EXISTS `suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suministros` (
  `id_suministro` int NOT NULL AUTO_INCREMENT,
  `id_tipo_suministro` int NOT NULL,
  `id_estado_suministro` int NOT NULL,
  `descripcion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `fecha_actualizacion` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_suministro`),
  KEY `fk_sum_tipo` (`id_tipo_suministro`),
  KEY `fk_sum_estado` (`id_estado_suministro`),
  KEY `idx_sum_descripcion` (`descripcion`),
  CONSTRAINT `fk_sum_estado` FOREIGN KEY (`id_estado_suministro`) REFERENCES `estado_suministros` (`id_estado_suministro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_sum_tipo` FOREIGN KEY (`id_tipo_suministro`) REFERENCES `tipo_suministros` (`id_tipo_suministro`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suministros`
--

LOCK TABLES `suministros` WRITE;
/*!40000 ALTER TABLE `suministros` DISABLE KEYS */;
INSERT INTO `suministros` VALUES (1,2,1,'AMBIENTAL EN PASTILLA','2026-03-10 12:32:08'),(3,2,1,'DESINFECTANTE GALON','2026-03-10 08:29:12'),(9,2,1,'FUNDA 18\"X22\" PAQUETE NEGRA','2026-03-10 20:59:09'),(11,2,1,'FUNDA 38\"X55\" NEGRA MUERTO 10U','2026-03-10 08:29:12'),(12,2,1,'JABON LIQUIDO','2026-03-10 08:29:12'),(13,2,1,'JERGA TRAPEADOR','2026-03-10 08:29:12'),(14,2,1,'LIMPIAVIDRIO S/ATOMIZADOR','2026-03-10 08:29:12'),(15,2,1,'LUSTRE VERDE','2026-03-10 08:29:12'),(16,2,1,'MANO DE OSO','2026-03-10 08:29:12'),(17,2,1,'PAPEL HIGIENICO P/DISPENSADOR','2026-03-10 08:29:12'),(18,2,1,'TOALLA DE MANO RECTANGULARES','2026-03-10 08:29:12'),(19,2,1,'VALDE 12L','2026-03-10 08:29:12'),(20,2,1,'WIPE','2026-03-10 08:29:12'),(21,1,1,'BOLIGRAFO BIC P/MEDIO AZUL','2026-03-10 08:29:12'),(22,1,1,'BOLIGRAFO BIC P/MEDIO NEGRO','2026-03-10 08:29:12'),(23,1,1,'BOLIGRAFO BIC P/MEDIO ROJO','2026-03-10 08:29:12'),(24,1,1,'CAJA DE GRAPAS 26/6','2026-03-10 08:29:12'),(25,1,1,'CALCULADORA','2026-03-10 08:29:12'),(26,1,1,'CINTA DE EMBALAJE','2026-03-10 08:29:12'),(27,1,1,'CUADERNO UNIVERSITARIO CUADRO 100H','2026-03-10 08:29:12'),(28,1,1,'FOLDER ARCHIVADOR','2026-03-10 08:29:12'),(29,1,1,'GRAPADORA','2026-03-10 08:29:12'),(30,1,1,'MARCADOR BORRABLE AZUL','2026-03-10 08:29:12'),(31,1,1,'MARCADOR BORRABLE NEGRO','2026-03-10 08:29:12'),(32,1,1,'MARCADOR BORRABLE ROJO','2026-03-10 08:29:12'),(33,1,1,'MARCADOR PERMANENTE AZUL','2026-03-10 08:29:12'),(34,1,1,'MARCADOR PERMANENTE NEGRO','2026-03-10 08:29:12'),(35,1,1,'MARCADOR PERMANENTE ROJO','2026-03-10 08:29:12'),(36,1,1,'RESALTADOR','2026-03-10 08:29:12'),(37,1,1,'RESMA 75G PAPEL BOND A4 REPORT/NORMA','2026-03-10 08:29:12'),(38,1,1,'SOBRE MANILA A4 F3','2026-03-10 08:29:12'),(39,1,1,'TIJERAS 5\" PUNTA REDONDA','2026-03-10 08:29:12'),(40,3,1,'AZUCAR EN SOBRES 100 UNID','2026-03-10 19:54:21'),(41,3,1,'AZÚCAR BLANCA KILO','2026-03-10 19:54:21'),(42,3,1,'CAFÉ EN GRANO GARDELLA','2026-03-10 19:54:21'),(43,3,1,'CAFÉ INSTANTÁNEO NESCAFE','2026-03-10 19:54:21'),(44,3,1,'CUCHARA PLASTICA BLANCA 50 UNID','2026-03-10 19:54:21'),(45,3,1,'CUCHARITAS PARA TORTA 50 UNID','2026-03-10 19:54:21'),(46,3,1,'ESPONJA LAVAPLATOS COCINA','2026-03-10 19:54:21'),(47,3,1,'GALLETA CLUB SOCIAL','2026-03-10 19:54:21'),(48,3,1,'PALITOS/CAFÉ SORBETE 100 UNID','2026-03-10 19:54:21'),(49,3,1,'PLATOS P/TORTA 25 UNID','2026-03-10 19:54:21'),(50,3,1,'SERVILLETAS 75U','2026-03-10 19:54:21'),(51,3,1,'TE JAMAICA NATURES HEART','2026-03-10 19:54:21'),(52,3,1,'TE MANZANILLA CON MIEL NATURES HEART','2026-03-10 19:54:21'),(53,3,1,'TOALLA MICROFIBRA COCINA','2026-03-10 19:54:21'),(54,3,1,'TÉ ANIS NATURES HEART','2026-03-10 19:54:21'),(55,3,1,'TÉ JENGIBRE NATURES HEART','2026-03-10 19:54:21'),(56,3,1,'TÉ MANZANILLA NATURES HEART','2026-03-10 19:54:21'),(57,3,1,'VASO PLASTICO 7 OZ','2026-03-10 19:54:21'),(58,3,1,'VASO TÉRMICO 6OZ','2026-03-10 19:54:21'),(59,2,1,'CLORO','2026-03-10 19:54:21'),(60,2,1,'DESINFECTANTE FABULOSO 2LTS','2026-03-10 19:54:21'),(61,2,1,'DETERGENTE','2026-03-10 19:54:21'),(62,2,1,'FUNDA 18X22 PAQUETE 10U BLANCA','2026-03-10 19:54:21'),(64,2,1,'LAVATODO','2026-03-10 19:54:21'),(65,2,1,'PAPEL HIGIENICO ROLLO PEQUEÑO','2026-03-10 19:54:21'),(66,2,1,'TOALLA DE MANO Z/DISPENSADOR BLANCHY','2026-03-10 19:54:21'),(67,2,1,'TOALLAS/COCINA LAVABLE','2026-03-10 19:54:21'),(68,2,1,'TRAPEADOR MICROFIBRA','2026-03-10 19:54:21'),(69,1,1,'ALMOHADILLA DACTIL NEGRO','2026-03-10 19:54:21'),(70,1,1,'CAJA CLIPS PEQUEÑOS','2026-03-10 19:54:21'),(71,1,1,'CARTULINA BLANCA A4 X 25','2026-03-10 19:54:21'),(72,1,1,'ESTILETE','2026-03-10 19:54:21'),(73,1,1,'LÁPIZ','2026-03-10 19:54:21'),(74,1,1,'PAPEL PERIODICO','2026-03-10 19:54:21'),(75,1,1,'PILAS DOBLE A X 4','2026-03-10 19:54:21'),(76,1,1,'PILAS TRIPLE A X 4','2026-03-10 19:54:21'),(77,1,1,'POST IT TIPO FLECHA','2026-03-10 19:54:21'),(78,1,1,'POST IT X 5','2026-03-10 19:54:21'),(79,1,1,'PROTECTOR DE HOJAS GRUESAS','2026-03-10 19:54:21'),(80,1,1,'VALES DE CAJA','2026-03-10 19:54:21'),(81,2,1,'ACIDO','2026-03-10 20:11:16'),(82,2,1,'AROMATIZANTE SPRAY','2026-03-10 20:11:16'),(83,2,1,'BICARBONATO FUNDA GRANDE','2026-03-10 20:11:16'),(84,2,1,'CEPILLO SANITARIO','2026-03-10 20:11:16'),(85,2,1,'CLORO','2026-03-10 20:11:16'),(86,2,1,'DESINFECTANTE FABULOSO 2LTS','2026-03-10 20:11:16'),(87,2,1,'DETERGENTE','2026-03-10 20:11:16'),(88,2,1,'FRANELA','2026-03-10 20:11:16'),(89,2,1,'FUNDA 18X22 PAQUETE 10U BLANCA','2026-03-10 20:11:16'),(90,2,1,'GUANTES DE CAUCHO','2026-03-10 20:11:16'),(91,2,1,'INSECTICIDA EN AEROSOL','2026-03-10 20:11:16'),(93,2,1,'JABON LIQUIDO DISPENSADOR CLEAN','2026-03-10 20:11:16'),(94,2,1,'LAVATODO','2026-03-10 20:11:16'),(95,2,1,'LIJA','2026-03-10 20:11:16'),(96,2,1,'LIMPIADOR DE MUEBLES','2026-03-10 20:11:16'),(97,2,1,'LIMPIAVIDRIO','2026-03-10 20:11:16'),(98,2,1,'PAPEL HIGIENICO ROLLO PEQUEÑO','2026-03-10 20:11:16'),(99,2,1,'RAID','2026-03-10 20:11:16'),(100,2,1,'RECOGEDOR DE BASURA','2026-03-10 20:11:16'),(101,2,1,'ROLLO TOALLAS DE COCINA','2026-03-10 20:11:16'),(102,2,1,'TOALLA DE MANO Z/DISPENSADOR BLANCHY','2026-03-10 20:11:16'),(103,2,1,'TOALLAS/COCINA LAVABLE','2026-03-10 20:11:16'),(104,2,1,'TRAPEADOR MICROFIBRA','2026-03-10 20:11:16'),(105,2,1,'VALDE 10LT','2026-03-10 20:11:16'),(106,2,1,'VINAGRE GALON','2026-03-10 20:11:16'),(107,2,1,'WAIPE','2026-03-10 20:11:16'),(108,1,1,'ALCOHOL GALON','2026-03-10 20:11:16'),(109,1,1,'ALMOHADILLA DACTIL AZUL','2026-03-10 20:11:16'),(110,1,1,'ALMOHADILLA DACTIL NEGRO','2026-03-10 20:11:16'),(111,1,1,'BLANDER TIPO CLIP MARIPOSA','2026-03-10 20:11:16'),(115,1,1,'BOLIGRAFO JEFF PUNTA FINA AZUL','2026-03-10 20:11:16'),(116,1,1,'BOLIGRAFO JEFF PUNTA FINA NEGRO','2026-03-10 20:11:16'),(117,1,1,'BOLIGRAFO JEFF PUNTA FINA ROJO','2026-03-10 20:11:16'),(118,1,1,'BORRADOR','2026-03-10 20:11:16'),(119,1,1,'BORRADOR PIZARRA PLASTICO','2026-03-10 20:11:16'),(120,1,1,'CAJA CLIPS PEQUEÑOS','2026-03-10 20:11:16'),(123,1,1,'CARPETA COLGANTE VERDE X 25U','2026-03-10 20:11:16'),(124,1,1,'CARPETA MANILA','2026-03-10 20:11:16'),(125,1,1,'CARPETA PORTADOCUMENTOS PLASTICO NEGRA','2026-03-10 20:11:16'),(126,1,1,'CARTULINA BLANCA A4 X 25','2026-03-10 20:11:16'),(127,1,1,'CARTULINA TIPO OPALINA 150G','2026-03-10 20:11:16'),(129,1,1,'CINTA DOBLE FAZ 18MMX5MTS','2026-03-10 20:11:16'),(130,1,1,'CINTA MASKING 24MM X 40','2026-03-10 20:11:16'),(131,1,1,'CINTA MASKING 48MM X 40YD','2026-03-10 20:11:16'),(132,1,1,'CINTA PAPEL MASKING','2026-03-10 20:11:16'),(133,1,1,'CINTA SCOTCH','2026-03-10 20:11:16'),(135,1,1,'ESTILETE','2026-03-10 20:11:16'),(138,1,1,'GRAPADORA MEDIANA','2026-03-10 20:11:16'),(139,1,1,'LAPICERO CON MINAS','2026-03-10 20:11:16'),(140,1,1,'LAPIZ','2026-03-10 20:11:16'),(141,1,1,'LIQUID PAPER','2026-03-10 20:11:16'),(142,1,1,'MALETIN PORTADOCUMENTOS PLASTICO NEGRO','2026-03-10 20:11:16'),(149,1,1,'PAPEL PERIODICO','2026-03-10 20:11:16'),(150,1,1,'PAPELERA 2 PISOS','2026-03-10 20:11:16'),(151,1,1,'PERFORADORA','2026-03-10 20:11:16'),(152,1,1,'PILAS DOBLE A X 4','2026-03-10 20:11:16'),(153,1,1,'PILAS TRIPLE A X 4','2026-03-10 20:11:16'),(154,1,1,'PORTA LAPIZ','2026-03-10 20:11:16'),(155,1,1,'POST IT TIPO FLECHA','2026-03-10 20:11:16'),(156,1,1,'POST IT X 5','2026-03-10 20:11:16'),(157,1,1,'PROTECTOR DE HOJAS GRUESAS','2026-03-10 20:11:16'),(158,1,1,'REGLA','2026-03-10 20:11:16'),(159,1,1,'RESALTADOR','2026-03-10 20:11:16'),(160,1,1,'RESMA DE HOJAS A4','2026-03-10 20:11:16'),(161,1,1,'ROLLO FILM ENVOLVENTE 25CM STRECH FILM','2026-03-10 20:11:16'),(162,1,1,'ROLLOS PIOLAS POLIALGODÓN 95M #18 200GR','2026-03-10 20:11:16'),(163,1,1,'SACAGRAPA','2026-03-10 20:11:16'),(164,1,1,'SACAPUNTAS','2026-03-10 20:11:16'),(165,1,1,'SEPARADOR DE HOJAS','2026-03-10 20:11:16'),(166,1,1,'SOBRE MANILA A4 F3','2026-03-10 20:11:16'),(167,1,1,'SOBRE MANILA F1','2026-03-10 20:11:16'),(168,1,1,'SOBRE MANILA F5','2026-03-10 20:11:16'),(169,1,1,'TACHO DE BASURA P/OFICINA','2026-03-10 20:11:16'),(170,1,1,'TIJERAS 5 PUNTA REDONDA','2026-03-10 20:11:16'),(171,1,1,'TINTA PARA SELLO COLOR AZUL','2026-03-10 20:11:16'),(172,1,1,'TINTA PARA SELLO COLOR NEGRA','2026-03-10 20:11:16'),(173,1,1,'TINTA PARA SELLO COLOR ROJA','2026-03-10 20:11:16'),(174,1,1,'VALES DE CAJA','2026-03-10 20:11:16'),(175,1,1,'VINCHAS METALICAS','2026-03-10 20:11:16'),(176,3,1,'AZUCAR BLANCA KILO','2026-03-10 20:11:16'),(177,3,1,'AZUCAR EN SOBRES 100 UNID','2026-03-10 20:11:16'),(178,3,1,'CAFE EN GRANO GARDELLA','2026-03-10 20:11:16'),(179,3,1,'CAFE INSTANTANEO NESCAFE','2026-03-10 20:11:16'),(180,3,1,'CAFE MOLIDO MINERVA','2026-03-10 20:11:16'),(181,3,1,'CAFE SOLUBLE','2026-03-10 20:11:16'),(182,3,1,'CUCHARA P/TORTA 50 UNID','2026-03-10 20:11:16'),(183,3,1,'CUCHARA PLASTICA BLANCA 50 UNID','2026-03-10 20:11:16'),(184,3,1,'CUCHARITAS PARA TORTA 50 UNID','2026-03-10 20:11:16'),(185,3,1,'ESPONJA LAVAPLATOS COCINA','2026-03-10 20:11:16'),(186,3,1,'GALLETA CLUB SOCIAL','2026-03-10 20:11:16'),(187,3,1,'GOTERO DE STEVIA','2026-03-10 20:11:16'),(188,3,1,'GOTERO MONKFRUIT','2026-03-10 20:11:16'),(189,3,1,'MANI CRIS DELI MIX FUNDAS 100GR','2026-03-10 20:11:16'),(190,3,1,'MANI SALADO 250GR','2026-03-10 20:11:16'),(191,3,1,'MERMELADA FRUTILLA','2026-03-10 20:11:16'),(192,3,1,'PALITOS/CAFE SORBETE 100 UNID','2026-03-10 20:11:16'),(193,3,1,'PAQUETES VASO ACRILICO 3 ONZAS','2026-03-10 20:11:16'),(194,3,1,'PLATOS GRANDES 9 ALEGRIA 25 UNID','2026-03-10 20:11:16'),(195,3,1,'PLATOS P/TORTA 25 UNID','2026-03-10 20:11:16'),(196,3,1,'SERVILLETAS','2026-03-10 20:11:16'),(197,3,1,'SERVILLETAS 75U','2026-03-10 20:11:16'),(198,3,1,'SORBETES PLASTICOS TRANSPARENTES','2026-03-10 20:11:16'),(199,3,1,'STEVIA SOBRES 100 UNID','2026-03-10 20:11:16'),(200,3,1,'TE ANIS NATURES HEART','2026-03-10 20:11:16'),(201,3,1,'TE JAMAICA NATURES HEART','2026-03-10 20:11:16'),(202,3,1,'TE JAMAICA + TE VERDE NATURES HEART','2026-03-10 20:11:16'),(203,3,1,'TE JENGIBRE NATURES HEART','2026-03-10 20:11:16'),(204,3,1,'TE MANZANILLA CON MIEL NATURES HEART','2026-03-10 20:11:16'),(205,3,1,'TE MANZANILLA NATURES HEART','2026-03-10 20:11:16'),(206,3,1,'TOALLA MICROFIBRA COCINA','2026-03-10 20:11:16'),(207,3,1,'VASO PLASTICO','2026-03-10 20:11:16'),(208,3,1,'VASO PLASTICO 7 OZ','2026-03-10 20:11:16'),(209,3,1,'VASO TERMICO','2026-03-10 20:11:16'),(210,3,1,'VASO TERMICO 6OZ','2026-03-10 20:11:16'),(211,3,1,'VASOS PLASTICOS 10 OZ 50U','2026-03-10 20:11:16'),(212,3,1,'VASOS PLASTICOS 7 OZ 50U','2026-03-10 20:11:16'),(213,2,1,'DILUYENTE','2026-03-10 20:51:51'),(214,2,1,'DILUYENTE','2026-03-10 20:52:11'),(215,2,1,'ESCOBA','2026-03-10 20:53:15'),(216,2,1,'ESCOBA','2026-03-10 20:54:19'),(217,2,1,'ESPONJA LAVAPLATOS ','2026-03-10 20:56:21'),(218,2,1,'ESPONJA LAVAPLATOS','2026-03-10 20:56:51');
/*!40000 ALTER TABLE `suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suministros_precios`
--

DROP TABLE IF EXISTS `suministros_precios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suministros_precios` (
  `id_suministro_precio` int NOT NULL AUTO_INCREMENT,
  `id_suministro` int NOT NULL,
  `id_proveedor` int NOT NULL,
  `precio_compra` decimal(12,2) NOT NULL,
  `fecha_vigencia_desde` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_vigencia_hasta` datetime DEFAULT NULL COMMENT 'NULL = precio vigente actualmente',
  `registrado_por` int DEFAULT NULL,
  PRIMARY KEY (`id_suministro_precio`),
  KEY `fk_pre_prov` (`id_proveedor`),
  KEY `fk_pre_user` (`registrado_por`),
  KEY `idx_precio_vigente` (`id_suministro`,`id_proveedor`,`fecha_vigencia_hasta`),
  KEY `idx_precio_historico` (`id_suministro`,`fecha_vigencia_desde`),
  CONSTRAINT `fk_pre_prov` FOREIGN KEY (`id_proveedor`) REFERENCES `proveedores` (`id_proveedor`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pre_sum` FOREIGN KEY (`id_suministro`) REFERENCES `suministros` (`id_suministro`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_pre_user` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=505 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Append-only. Precio vigente = fecha_vigencia_hasta IS NULL.';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suministros_precios`
--

LOCK TABLES `suministros_precios` WRITE;
/*!40000 ALTER TABLE `suministros_precios` DISABLE KEYS */;
INSERT INTO `suministros_precios` VALUES (1,1,1,1.42,'2026-03-10 08:29:12','2026-03-10 12:30:00',NULL),(2,1,2,1.47,'2026-03-10 08:29:12',NULL,NULL),(5,3,1,3.42,'2026-03-10 08:29:12','2026-03-10 20:49:05',NULL),(6,3,2,3.42,'2026-03-10 08:29:12','2026-03-10 20:49:15',NULL),(17,9,1,0.49,'2026-03-10 08:29:12','2026-03-10 20:59:09',NULL),(18,9,2,0.83,'2026-03-10 08:29:12','2026-03-10 20:59:20',NULL),(21,11,1,3.09,'2026-03-10 08:29:12','2026-03-10 21:01:10',NULL),(22,11,2,3.09,'2026-03-10 08:29:12','2026-03-10 21:01:17',NULL),(23,12,1,3.56,'2026-03-10 08:29:12',NULL,NULL),(24,12,2,1.20,'2026-03-10 08:29:12',NULL,NULL),(25,13,1,3.58,'2026-03-10 08:29:12',NULL,NULL),(26,13,2,4.32,'2026-03-10 08:29:12',NULL,NULL),(27,14,1,2.83,'2026-03-10 08:29:12',NULL,NULL),(28,14,2,0.56,'2026-03-10 08:29:12',NULL,NULL),(29,15,1,0.73,'2026-03-10 08:29:12',NULL,NULL),(30,15,2,0.63,'2026-03-10 08:29:12',NULL,NULL),(31,16,1,3.74,'2026-03-10 08:29:12',NULL,NULL),(32,16,2,2.48,'2026-03-10 08:29:12',NULL,NULL),(33,17,1,3.33,'2026-03-10 08:29:12',NULL,NULL),(34,17,2,3.39,'2026-03-10 08:29:12',NULL,NULL),(35,18,1,3.21,'2026-03-10 08:29:12',NULL,NULL),(36,18,2,3.21,'2026-03-10 08:29:12',NULL,NULL),(37,19,1,4.59,'2026-03-10 08:29:12',NULL,NULL),(38,19,2,3.60,'2026-03-10 08:29:12',NULL,NULL),(39,20,1,1.50,'2026-03-10 08:29:12',NULL,NULL),(40,20,2,0.78,'2026-03-10 08:29:12',NULL,NULL),(41,21,1,0.41,'2026-03-10 08:29:12','2026-03-10 20:24:26',NULL),(42,21,2,0.40,'2026-03-10 08:29:12','2026-03-10 20:24:18',NULL),(43,22,1,0.41,'2026-03-10 08:29:12','2026-03-10 20:24:52',NULL),(44,22,2,0.40,'2026-03-10 08:29:12','2026-03-10 20:24:48',NULL),(45,23,1,0.41,'2026-03-10 08:29:12','2026-03-10 20:27:09',NULL),(46,23,2,0.40,'2026-03-10 08:29:13','2026-03-10 20:27:03',NULL),(47,24,1,1.44,'2026-03-10 08:29:13','2026-03-10 20:34:52',NULL),(48,24,2,1.11,'2026-03-10 08:29:13','2026-03-10 20:34:59',NULL),(49,25,1,5.79,'2026-03-10 08:29:13','2026-03-10 20:39:18',NULL),(50,25,2,9.22,'2026-03-10 08:29:13','2026-03-10 20:39:14',NULL),(51,26,1,1.44,'2026-03-10 08:29:13','2026-03-10 20:41:08',NULL),(52,26,2,1.44,'2026-03-10 08:29:13','2026-03-10 20:41:13',NULL),(53,27,1,1.82,'2026-03-10 08:29:13','2026-03-10 20:46:47',NULL),(54,27,2,1.82,'2026-03-10 08:29:13','2026-03-10 20:46:51',NULL),(55,28,1,3.49,'2026-03-10 08:29:13',NULL,NULL),(56,28,2,2.70,'2026-03-10 08:29:13',NULL,NULL),(57,29,1,4.43,'2026-03-10 08:29:13','2026-03-10 21:02:32',NULL),(58,29,2,3.38,'2026-03-10 08:29:13','2026-03-10 21:02:36',NULL),(59,30,1,0.75,'2026-03-10 08:29:13',NULL,NULL),(60,30,2,0.84,'2026-03-10 08:29:13',NULL,NULL),(61,31,1,0.75,'2026-03-10 08:29:13',NULL,NULL),(62,31,2,0.84,'2026-03-10 08:29:13',NULL,NULL),(63,32,1,0.75,'2026-03-10 08:29:13',NULL,NULL),(64,32,2,0.84,'2026-03-10 08:29:13',NULL,NULL),(65,33,1,0.65,'2026-03-10 08:29:13',NULL,NULL),(66,33,2,0.65,'2026-03-10 08:29:13',NULL,NULL),(67,34,1,0.65,'2026-03-10 08:29:13',NULL,NULL),(68,34,2,0.65,'2026-03-10 08:29:13',NULL,NULL),(69,35,1,0.65,'2026-03-10 08:29:13',NULL,NULL),(70,35,2,0.65,'2026-03-10 08:29:13',NULL,NULL),(71,36,1,0.71,'2026-03-10 08:29:13',NULL,NULL),(72,36,2,0.64,'2026-03-10 08:29:13',NULL,NULL),(73,37,1,3.80,'2026-03-10 08:29:13',NULL,NULL),(74,37,2,3.54,'2026-03-10 08:29:13',NULL,NULL),(75,38,1,0.18,'2026-03-10 08:29:13',NULL,NULL),(76,38,2,0.12,'2026-03-10 08:29:13',NULL,NULL),(77,39,1,0.73,'2026-03-10 08:29:13',NULL,NULL),(78,39,2,0.46,'2026-03-10 08:29:13',NULL,NULL),(79,1,1,1.42,'2026-03-10 12:30:00','2026-03-10 12:30:06',1),(80,1,1,1.42,'2026-03-10 12:30:06','2026-03-10 12:32:03',1),(81,1,1,1.42,'2026-03-10 12:32:03','2026-03-10 12:32:08',1),(82,1,1,1.42,'2026-03-10 12:32:08',NULL,1),(83,81,1,3.50,'2026-03-10 20:11:16','2026-03-10 20:36:46',NULL),(84,1,1,1.23,'2026-03-10 20:11:16',NULL,NULL),(85,82,1,2.43,'2026-03-10 20:11:16','2026-03-10 20:37:36',NULL),(86,83,1,2.12,'2026-03-10 20:11:16','2026-03-10 20:37:45',NULL),(87,84,1,3.25,'2026-03-10 20:11:16','2026-03-10 20:40:43',NULL),(88,3,1,2.97,'2026-03-10 20:11:16','2026-03-10 20:49:05',NULL),(92,88,1,0.89,'2026-03-10 20:11:16','2026-03-10 21:00:11',NULL),(94,90,1,2.25,'2026-03-10 20:11:16','2026-03-10 21:03:02',NULL),(95,91,1,5.22,'2026-03-10 20:11:16','2026-03-10 21:03:12',NULL),(96,93,1,7.59,'2026-03-10 20:11:16','2026-03-10 21:06:53',NULL),(97,13,1,3.11,'2026-03-10 20:11:16',NULL,NULL),(98,95,1,0.53,'2026-03-10 20:11:16',NULL,NULL),(99,96,1,6.21,'2026-03-10 20:11:16',NULL,NULL),(100,97,1,2.43,'2026-03-10 20:11:16',NULL,NULL),(101,15,1,0.63,'2026-03-10 20:11:16',NULL,NULL),(102,16,1,3.25,'2026-03-10 20:11:16',NULL,NULL),(103,17,1,2.89,'2026-03-10 20:11:16',NULL,NULL),(104,99,1,5.22,'2026-03-10 20:11:16',NULL,NULL),(105,100,1,1.63,'2026-03-10 20:11:16',NULL,NULL),(106,101,1,2.59,'2026-03-10 20:11:16',NULL,NULL),(107,105,1,3.99,'2026-03-10 20:11:16',NULL,NULL),(108,106,1,3.29,'2026-03-10 20:11:16',NULL,NULL),(109,107,1,1.03,'2026-03-10 20:11:16',NULL,NULL),(110,108,1,9.48,'2026-03-10 20:11:16','2026-03-10 20:37:05',NULL),(111,109,1,1.27,'2026-03-10 20:11:16','2026-03-10 20:37:20',NULL),(112,111,1,2.92,'2026-03-10 20:11:16','2026-03-10 20:37:56',NULL),(113,115,1,0.30,'2026-03-10 20:11:16','2026-03-10 20:27:25',NULL),(114,116,1,0.30,'2026-03-10 20:11:16','2026-03-10 20:27:35',NULL),(115,117,1,0.30,'2026-03-10 20:11:16','2026-03-10 20:38:07',NULL),(116,118,1,0.25,'2026-03-10 20:11:16','2026-03-10 20:38:16',NULL),(117,119,1,2.25,'2026-03-10 20:11:16','2026-03-10 20:38:24',NULL),(118,123,1,18.45,'2026-03-10 20:11:16','2026-03-10 20:39:33',NULL),(119,124,1,0.08,'2026-03-10 20:11:16','2026-03-10 20:39:42',NULL),(120,125,1,4.23,'2026-03-10 20:11:16','2026-03-10 20:39:55',NULL),(121,127,1,0.15,'2026-03-10 20:11:16','2026-03-10 20:40:31',NULL),(122,129,1,5.37,'2026-03-10 20:11:16','2026-03-10 20:41:20',NULL),(123,130,1,1.13,'2026-03-10 20:11:16','2026-03-10 20:41:31',NULL),(124,131,1,2.65,'2026-03-10 20:11:16','2026-03-10 20:41:50',NULL),(125,132,1,2.55,'2026-03-10 20:11:16','2026-03-10 20:42:00',NULL),(126,133,1,0.35,'2026-03-10 20:11:16','2026-03-10 20:42:10',NULL),(127,138,1,2.50,'2026-03-10 20:11:16','2026-03-10 21:02:48',NULL),(128,139,1,2.52,'2026-03-10 20:11:16',NULL,NULL),(129,141,1,0.50,'2026-03-10 20:11:16',NULL,NULL),(130,142,1,4.23,'2026-03-10 20:11:16',NULL,NULL),(131,150,1,33.44,'2026-03-10 20:11:16',NULL,NULL),(132,151,1,5.00,'2026-03-10 20:11:16',NULL,NULL),(133,154,1,1.50,'2026-03-10 20:11:16',NULL,NULL),(134,158,1,1.09,'2026-03-10 20:11:16',NULL,NULL),(135,160,1,3.80,'2026-03-10 20:11:16',NULL,NULL),(136,161,1,7.90,'2026-03-10 20:11:16',NULL,NULL),(137,162,1,5.85,'2026-03-10 20:11:16',NULL,NULL),(138,163,1,0.75,'2026-03-10 20:11:16',NULL,NULL),(139,164,1,0.30,'2026-03-10 20:11:16',NULL,NULL),(140,165,1,1.11,'2026-03-10 20:11:16',NULL,NULL),(141,167,1,0.07,'2026-03-10 20:11:16',NULL,NULL),(142,168,1,0.20,'2026-03-10 20:11:16',NULL,NULL),(143,169,1,5.75,'2026-03-10 20:11:16',NULL,NULL),(144,170,1,0.63,'2026-03-10 20:11:16',NULL,NULL),(145,171,1,0.89,'2026-03-10 20:11:16',NULL,NULL),(146,172,1,0.89,'2026-03-10 20:11:16',NULL,NULL),(147,173,1,0.89,'2026-03-10 20:11:16',NULL,NULL),(148,175,1,1.55,'2026-03-10 20:11:16',NULL,NULL),(149,180,1,6.74,'2026-03-10 20:11:16','2026-03-10 20:30:49',NULL),(150,181,1,8.86,'2026-03-10 20:11:16','2026-03-10 20:31:06',NULL),(151,182,1,0.69,'2026-03-10 20:11:16','2026-03-10 20:47:03',NULL),(152,187,1,8.01,'2026-03-10 20:11:16','2026-03-10 21:01:48',NULL),(153,188,1,7.00,'2026-03-10 20:11:16','2026-03-10 21:02:03',NULL),(154,189,1,1.33,'2026-03-10 20:11:16',NULL,NULL),(155,190,1,2.48,'2026-03-10 20:11:16',NULL,NULL),(156,191,1,2.07,'2026-03-10 20:11:16',NULL,NULL),(157,193,1,0.94,'2026-03-10 20:11:16',NULL,NULL),(158,194,1,2.00,'2026-03-10 20:11:16',NULL,NULL),(159,196,1,0.52,'2026-03-10 20:11:16',NULL,NULL),(160,198,1,0.90,'2026-03-10 20:11:16',NULL,NULL),(161,199,1,8.88,'2026-03-10 20:11:16',NULL,NULL),(162,202,1,2.27,'2026-03-10 20:11:16',NULL,NULL),(163,207,1,0.70,'2026-03-10 20:11:16',NULL,NULL),(164,209,1,1.43,'2026-03-10 20:11:16',NULL,NULL),(165,211,1,0.89,'2026-03-10 20:11:16',NULL,NULL),(166,212,1,0.70,'2026-03-10 20:11:16',NULL,NULL),(226,81,2,3.66,'2026-03-10 20:11:16','2026-03-10 20:36:51',NULL),(227,1,2,1.27,'2026-03-10 20:11:16',NULL,NULL),(228,82,2,2.43,'2026-03-10 20:11:16','2026-03-10 20:37:40',NULL),(229,83,2,2.12,'2026-03-10 20:11:16','2026-03-10 20:37:50',NULL),(230,84,2,2.15,'2026-03-10 20:11:16','2026-03-10 20:40:48',NULL),(231,3,2,2.97,'2026-03-10 20:11:16','2026-03-10 20:49:15',NULL),(235,88,2,0.85,'2026-03-10 20:11:16','2026-03-10 21:00:15',NULL),(237,90,2,2.25,'2026-03-10 20:11:16','2026-03-10 21:03:05',NULL),(238,91,2,5.22,'2026-03-10 20:11:16','2026-03-10 21:03:15',NULL),(239,93,2,4.22,'2026-03-10 20:11:16','2026-03-10 21:06:56',NULL),(240,13,2,3.75,'2026-03-10 20:11:16',NULL,NULL),(241,95,2,0.53,'2026-03-10 20:11:16',NULL,NULL),(242,96,2,6.21,'2026-03-10 20:11:16',NULL,NULL),(243,97,2,0.48,'2026-03-10 20:11:16',NULL,NULL),(244,15,2,0.54,'2026-03-10 20:11:16',NULL,NULL),(245,16,2,2.15,'2026-03-10 20:11:16',NULL,NULL),(246,17,2,2.99,'2026-03-10 20:11:16',NULL,NULL),(247,99,2,5.22,'2026-03-10 20:11:16',NULL,NULL),(248,100,2,2.14,'2026-03-10 20:11:16',NULL,NULL),(249,101,2,1.43,'2026-03-10 20:11:16',NULL,NULL),(250,105,2,3.13,'2026-03-10 20:11:16',NULL,NULL),(251,106,2,3.66,'2026-03-10 20:11:16',NULL,NULL),(252,107,2,0.70,'2026-03-10 20:11:16',NULL,NULL),(253,108,2,8.28,'2026-03-10 20:11:16','2026-03-10 20:37:11',NULL),(254,109,2,1.60,'2026-03-10 20:11:16','2026-03-10 20:37:29',NULL),(255,111,2,2.92,'2026-03-10 20:11:16','2026-03-10 20:38:00',NULL),(256,115,2,0.30,'2026-03-10 20:11:16','2026-03-10 20:27:30',NULL),(257,116,2,0.30,'2026-03-10 20:11:16','2026-03-10 20:27:47',NULL),(258,117,2,0.30,'2026-03-10 20:11:16','2026-03-10 20:38:11',NULL),(259,118,2,0.30,'2026-03-10 20:11:16','2026-03-10 20:38:20',NULL),(260,119,2,2.25,'2026-03-10 20:11:16','2026-03-10 20:38:26',NULL),(261,123,2,18.45,'2026-03-10 20:11:16','2026-03-10 20:39:36',NULL),(262,124,2,0.08,'2026-03-10 20:11:16','2026-03-10 20:39:46',NULL),(263,125,2,4.23,'2026-03-10 20:11:16','2026-03-10 20:39:58',NULL),(264,127,2,0.15,'2026-03-10 20:11:16','2026-03-10 20:40:35',NULL),(265,129,2,5.37,'2026-03-10 20:11:16','2026-03-10 20:41:24',NULL),(266,130,2,1.13,'2026-03-10 20:11:16','2026-03-10 20:41:34',NULL),(267,131,2,4.48,'2026-03-10 20:11:16','2026-03-10 20:41:53',NULL),(268,132,2,2.55,'2026-03-10 20:11:16','2026-03-10 20:42:03',NULL),(269,133,2,0.30,'2026-03-10 20:11:16','2026-03-10 20:42:14',NULL),(270,138,2,3.33,'2026-03-10 20:11:16','2026-03-10 21:02:52',NULL),(271,139,2,2.52,'2026-03-10 20:11:16',NULL,NULL),(272,141,2,0.56,'2026-03-10 20:11:16',NULL,NULL),(273,142,2,6.75,'2026-03-10 20:11:16',NULL,NULL),(274,150,2,11.25,'2026-03-10 20:11:16',NULL,NULL),(275,151,2,4.30,'2026-03-10 20:11:16',NULL,NULL),(276,154,2,1.44,'2026-03-10 20:11:16',NULL,NULL),(277,158,2,1.09,'2026-03-10 20:11:16',NULL,NULL),(278,160,2,3.54,'2026-03-10 20:11:16',NULL,NULL),(279,161,2,7.71,'2026-03-10 20:11:16',NULL,NULL),(280,162,2,4.07,'2026-03-10 20:11:16',NULL,NULL),(281,163,2,0.75,'2026-03-10 20:11:16',NULL,NULL),(282,165,2,0.80,'2026-03-10 20:11:16',NULL,NULL),(283,167,2,0.07,'2026-03-10 20:11:16',NULL,NULL),(284,168,2,0.20,'2026-03-10 20:11:16',NULL,NULL),(285,169,2,5.75,'2026-03-10 20:11:16',NULL,NULL),(286,170,2,0.40,'2026-03-10 20:11:16',NULL,NULL),(287,171,2,0.48,'2026-03-10 20:11:16',NULL,NULL),(288,172,2,0.48,'2026-03-10 20:11:16',NULL,NULL),(289,173,2,0.48,'2026-03-10 20:11:16',NULL,NULL),(290,175,2,1.55,'2026-03-10 20:11:16',NULL,NULL),(291,180,2,6.74,'2026-03-10 20:11:16','2026-03-10 20:30:53',NULL),(292,181,2,8.86,'2026-03-10 20:11:16','2026-03-10 20:31:11',NULL),(293,182,2,0.69,'2026-03-10 20:11:16','2026-03-10 20:47:07',NULL),(294,187,2,4.35,'2026-03-10 20:11:16','2026-03-10 21:01:52',NULL),(295,188,2,7.00,'2026-03-10 20:11:16','2026-03-10 21:02:06',NULL),(296,189,2,1.33,'2026-03-10 20:11:16',NULL,NULL),(297,190,2,2.48,'2026-03-10 20:11:16',NULL,NULL),(298,191,2,2.07,'2026-03-10 20:11:16',NULL,NULL),(299,193,2,0.94,'2026-03-10 20:11:16',NULL,NULL),(300,194,2,2.00,'2026-03-10 20:11:16',NULL,NULL),(301,196,2,0.52,'2026-03-10 20:11:16',NULL,NULL),(302,198,2,1.00,'2026-03-10 20:11:16',NULL,NULL),(303,199,2,8.88,'2026-03-10 20:11:16',NULL,NULL),(304,202,2,2.03,'2026-03-10 20:11:16',NULL,NULL),(305,207,2,0.70,'2026-03-10 20:11:16',NULL,NULL),(306,209,2,1.43,'2026-03-10 20:11:16',NULL,NULL),(307,211,2,0.91,'2026-03-10 20:11:16',NULL,NULL),(308,212,2,0.70,'2026-03-10 20:11:16',NULL,NULL),(368,140,2,0.19,'2026-03-10 20:13:29',NULL,1),(369,73,1,0.31,'2026-03-10 20:13:47',NULL,1),(370,110,1,1.27,'2026-03-10 20:20:26',NULL,1),(371,69,2,1.60,'2026-03-10 20:20:41',NULL,1),(372,176,2,1.35,'2026-03-10 20:22:12',NULL,1),(373,41,1,1.35,'2026-03-10 20:22:25',NULL,1),(374,177,2,2.42,'2026-03-10 20:22:46',NULL,1),(375,40,1,2.42,'2026-03-10 20:22:56',NULL,1),(376,21,2,0.34,'2026-03-10 20:24:18',NULL,1),(377,21,1,0.35,'2026-03-10 20:24:26',NULL,1),(378,22,2,0.34,'2026-03-10 20:24:48',NULL,1),(379,22,1,0.35,'2026-03-10 20:24:52',NULL,1),(380,23,2,0.34,'2026-03-10 20:27:03',NULL,1),(381,23,1,0.35,'2026-03-10 20:27:09',NULL,1),(382,115,1,0.30,'2026-03-10 20:27:25',NULL,1),(383,115,2,0.30,'2026-03-10 20:27:30',NULL,1),(384,116,1,0.30,'2026-03-10 20:27:35','2026-03-10 20:27:38',1),(385,116,1,0.30,'2026-03-10 20:27:38',NULL,1),(386,116,2,0.30,'2026-03-10 20:27:47',NULL,1),(387,178,1,13.68,'2026-03-10 20:29:36','2026-03-10 20:29:49',1),(388,42,2,13.68,'2026-03-10 20:29:42','2026-03-10 20:29:56',1),(389,178,1,13.68,'2026-03-10 20:29:49',NULL,1),(390,42,2,13.68,'2026-03-10 20:29:56',NULL,1),(391,179,1,8.86,'2026-03-10 20:30:27',NULL,1),(392,43,2,8.86,'2026-03-10 20:30:38',NULL,1),(393,180,1,6.74,'2026-03-10 20:30:49',NULL,1),(394,180,2,6.74,'2026-03-10 20:30:53',NULL,1),(395,181,1,8.86,'2026-03-10 20:31:06',NULL,1),(396,181,2,8.86,'2026-03-10 20:31:11',NULL,1),(397,192,2,1.25,'2026-03-10 20:31:29',NULL,1),(398,48,1,1.25,'2026-03-10 20:31:36',NULL,1),(399,120,2,0.50,'2026-03-10 20:33:27',NULL,1),(400,70,1,0.42,'2026-03-10 20:33:39',NULL,1),(401,24,1,1.25,'2026-03-10 20:34:52',NULL,1),(402,24,2,0.96,'2026-03-10 20:34:59',NULL,1),(403,174,2,0.69,'2026-03-10 20:35:47',NULL,1),(404,80,1,0.75,'2026-03-10 20:35:57',NULL,1),(405,81,1,3.50,'2026-03-10 20:36:46','2026-03-10 22:29:45',1),(406,81,2,3.66,'2026-03-10 20:36:51',NULL,1),(407,108,1,9.48,'2026-03-10 20:37:05',NULL,1),(408,108,2,8.28,'2026-03-10 20:37:11',NULL,1),(409,109,1,1.27,'2026-03-10 20:37:20',NULL,1),(410,109,2,1.60,'2026-03-10 20:37:29',NULL,1),(411,82,1,2.43,'2026-03-10 20:37:36',NULL,1),(412,82,2,2.43,'2026-03-10 20:37:40',NULL,1),(413,83,1,2.12,'2026-03-10 20:37:45',NULL,1),(414,83,2,2.12,'2026-03-10 20:37:50',NULL,1),(415,111,1,2.92,'2026-03-10 20:37:56',NULL,1),(416,111,2,2.92,'2026-03-10 20:38:00',NULL,1),(417,117,1,0.30,'2026-03-10 20:38:07',NULL,1),(418,117,2,0.30,'2026-03-10 20:38:11',NULL,1),(419,118,1,0.25,'2026-03-10 20:38:16',NULL,1),(420,118,2,0.30,'2026-03-10 20:38:20',NULL,1),(421,119,1,2.25,'2026-03-10 20:38:24',NULL,1),(422,119,2,2.25,'2026-03-10 20:38:26',NULL,1),(423,25,2,5.03,'2026-03-10 20:39:14',NULL,1),(424,25,1,5.03,'2026-03-10 20:39:18',NULL,1),(425,123,1,18.45,'2026-03-10 20:39:33',NULL,1),(426,123,2,18.45,'2026-03-10 20:39:36',NULL,1),(427,124,1,0.08,'2026-03-10 20:39:42',NULL,1),(428,124,2,0.08,'2026-03-10 20:39:46',NULL,1),(429,125,1,4.23,'2026-03-10 20:39:55',NULL,1),(430,125,2,4.23,'2026-03-10 20:39:58',NULL,1),(431,126,2,1.63,'2026-03-10 20:40:10',NULL,1),(432,71,1,1.45,'2026-03-10 20:40:22',NULL,1),(433,127,1,0.15,'2026-03-10 20:40:31',NULL,1),(434,127,2,0.15,'2026-03-10 20:40:35',NULL,1),(435,84,1,3.25,'2026-03-10 20:40:43',NULL,1),(436,84,2,2.15,'2026-03-10 20:40:48',NULL,1),(437,26,1,1.25,'2026-03-10 20:41:08',NULL,1),(438,26,2,1.24,'2026-03-10 20:41:13',NULL,1),(439,129,1,5.37,'2026-03-10 20:41:20',NULL,1),(440,129,2,5.37,'2026-03-10 20:41:24',NULL,1),(441,130,1,1.13,'2026-03-10 20:41:31',NULL,1),(442,130,2,1.13,'2026-03-10 20:41:34',NULL,1),(443,131,1,2.65,'2026-03-10 20:41:50',NULL,1),(444,131,2,4.48,'2026-03-10 20:41:53',NULL,1),(445,132,1,2.55,'2026-03-10 20:42:00',NULL,1),(446,132,2,2.55,'2026-03-10 20:42:03',NULL,1),(447,133,1,0.35,'2026-03-10 20:42:10',NULL,1),(448,133,2,0.30,'2026-03-10 20:42:14',NULL,1),(449,85,1,1.96,'2026-03-10 20:45:06',NULL,1),(450,59,2,1.96,'2026-03-10 20:45:12',NULL,1),(453,27,1,1.58,'2026-03-10 20:46:47',NULL,1),(454,27,2,1.58,'2026-03-10 20:46:51',NULL,1),(455,182,1,0.69,'2026-03-10 20:47:03',NULL,1),(456,182,2,0.69,'2026-03-10 20:47:07',NULL,1),(457,183,2,0.79,'2026-03-10 20:47:25',NULL,1),(458,44,1,0.75,'2026-03-10 20:47:40',NULL,1),(459,184,2,0.69,'2026-03-10 20:48:01',NULL,1),(460,45,1,0.69,'2026-03-10 20:48:12',NULL,1),(461,86,1,5.12,'2026-03-10 20:48:32',NULL,1),(462,60,2,5.12,'2026-03-10 20:48:52',NULL,1),(463,3,1,2.97,'2026-03-10 20:49:05',NULL,1),(464,3,2,2.97,'2026-03-10 20:49:15',NULL,1),(465,61,2,2.25,'2026-03-10 20:49:44',NULL,1),(466,87,1,2.25,'2026-03-10 20:49:54',NULL,1),(468,213,1,3.33,'2026-03-10 20:51:51',NULL,1),(469,214,2,1.06,'2026-03-10 20:52:11',NULL,1),(470,215,2,2.17,'2026-03-10 20:53:15','2026-03-10 20:54:31',1),(471,216,1,2.17,'2026-03-10 20:54:19',NULL,1),(472,215,2,2.64,'2026-03-10 20:54:31',NULL,1),(473,185,2,0.77,'2026-03-10 20:54:44',NULL,1),(474,46,1,0.63,'2026-03-10 20:54:54',NULL,1),(475,217,2,0.34,'2026-03-10 20:56:21',NULL,1),(476,218,1,0.63,'2026-03-10 20:56:51',NULL,1),(477,135,1,1.85,'2026-03-10 20:57:49',NULL,1),(478,72,2,1.14,'2026-03-10 20:57:58',NULL,1),(479,9,1,0.83,'2026-03-10 20:59:09',NULL,1),(480,9,2,0.64,'2026-03-10 20:59:20',NULL,1),(481,88,1,0.89,'2026-03-10 21:00:11',NULL,1),(482,88,2,0.85,'2026-03-10 21:00:15',NULL,1),(483,62,1,0.42,'2026-03-10 21:00:37',NULL,1),(484,89,2,0.58,'2026-03-10 21:00:48',NULL,1),(485,11,1,2.68,'2026-03-10 21:01:10',NULL,1),(486,11,2,2.67,'2026-03-10 21:01:17',NULL,1),(487,186,1,3.14,'2026-03-10 21:01:28',NULL,1),(488,47,2,3.14,'2026-03-10 21:01:37',NULL,1),(489,187,1,8.01,'2026-03-10 21:01:48',NULL,1),(490,187,2,4.35,'2026-03-10 21:01:52',NULL,1),(491,188,1,7.00,'2026-03-10 21:02:03',NULL,1),(492,188,2,7.00,'2026-03-10 21:02:06',NULL,1),(493,29,1,5.29,'2026-03-10 21:02:32',NULL,1),(494,29,2,5.29,'2026-03-10 21:02:36',NULL,1),(495,138,1,2.50,'2026-03-10 21:02:48',NULL,1),(496,138,2,3.33,'2026-03-10 21:02:52',NULL,1),(497,90,1,2.25,'2026-03-10 21:03:02',NULL,1),(498,90,2,2.25,'2026-03-10 21:03:05',NULL,1),(499,91,1,5.22,'2026-03-10 21:03:12',NULL,1),(500,91,2,5.22,'2026-03-10 21:03:15',NULL,1),(501,93,1,7.59,'2026-03-10 21:06:53',NULL,1),(502,93,2,4.22,'2026-03-10 21:06:56',NULL,1),(503,81,1,3.50,'2026-03-10 22:29:45','2026-03-10 22:29:53',1),(504,81,1,3.50,'2026-03-10 22:29:53',NULL,1);
/*!40000 ALTER TABLE `suministros_precios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supervisores`
--

DROP TABLE IF EXISTS `supervisores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supervisores` (
  `id_supervisor` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_supervisor`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supervisores`
--

LOCK TABLES `supervisores` WRITE;
/*!40000 ALTER TABLE `supervisores` DISABLE KEYS */;
INSERT INTO `supervisores` VALUES (1,'Ligia Rodriguez','ligia.rodriguez@fundacioncrisfe.org',NULL,1,'2026-03-10 08:29:12'),(2,'Fernando Vera','fernando.vera@fundacioncrisfe.org',NULL,1,'2026-03-10 08:29:12'),(3,'Lorena Velasco',NULL,NULL,1,'2026-03-10 08:29:17'),(4,'Roy Dougherty',NULL,NULL,1,'2026-03-10 08:29:17'),(5,'Alexander Aman',NULL,NULL,1,'2026-03-10 08:29:17'),(6,'Lady Garcia',NULL,NULL,1,'2026-03-10 08:29:17'),(7,'Narcisa León',NULL,NULL,1,'2026-03-10 08:29:17'),(8,'Mary Oyague',NULL,NULL,1,'2026-03-10 08:29:17'),(9,'Lorena  Granda',NULL,NULL,1,'2026-03-10 08:29:17'),(10,'Dario Sanchez',NULL,NULL,1,'2026-03-10 08:29:17');
/*!40000 ALTER TABLE `supervisores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_suministros`
--

DROP TABLE IF EXISTS `tipo_suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_suministros` (
  `id_tipo_suministro` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_tipo_suministro`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_suministros`
--

LOCK TABLES `tipo_suministros` WRITE;
/*!40000 ALTER TABLE `tipo_suministros` DISABLE KEYS */;
INSERT INTO `tipo_suministros` VALUES (1,'Oficina'),(2,'Limpieza'),(3,'Cafetería');
/*!40000 ALTER TABLE `tipo_suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `id_departamento` int NOT NULL,
  `id_rol` int NOT NULL,
  `login` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci DEFAULT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `uq_usuario_login` (`login`),
  UNIQUE KEY `uq_usuario_email` (`email`),
  KEY `fk_user_depto` (`id_departamento`),
  KEY `fk_user_rol` (`id_rol`),
  KEY `idx_usuario_login` (`login`),
  CONSTRAINT `fk_user_depto` FOREIGN KEY (`id_departamento`) REFERENCES `departamentos` (`id_departamento`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_user_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,11,3,'pasante.desarrollo','$2b$12$AEQvkSe8txqIsyzLEFDrq.tWTuAsOuXp2nIVtMBhym2XXC7Qzx/7.','pasante.desarrollo','pasante.desarrollo@farmcorp.com.ec',1,'2026-03-10 08:29:13'),(2,3,1,'fc081',NULL,'FC081','fc081@farmcorp.com.ec',1,'2026-03-10 08:30:02'),(3,3,1,'fc009','$2b$12$glf6ejK1lgOnSyuA68BmzOGmhA4SXTf8lkiIKjr5pgt7B2NGmNAvG','FC009','FC009@farmcorp.com.ec',1,'2026-03-10 09:30:05'),(4,3,1,'fc181','$2b$12$RyS4WmQvNO7Zfm1Eixobw.1KeUqE4RuVz5p9x6aIHewA6JHjbISua','FC181','f181@farmcorp.com.ec',1,'2026-03-10 09:31:34'),(5,14,3,'estrella.cantos',NULL,'Estrella M. Cantos Merelo','estrella.cantos@farmcorp.com.ec',1,'2026-03-10 11:11:01');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `v_catalogo_disponible`
--

DROP TABLE IF EXISTS `v_catalogo_disponible`;
/*!50001 DROP VIEW IF EXISTS `v_catalogo_disponible`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_catalogo_disponible` AS SELECT 
 1 AS `id_suministro`,
 1 AS `suministro`,
 1 AS `tipo`,
 1 AS `id_proveedor`,
 1 AS `nombre_proveedor`,
 1 AS `precio_vigente`,
 1 AS `stock`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_pdv_ubicacion`
--

DROP TABLE IF EXISTS `v_pdv_ubicacion`;
/*!50001 DROP VIEW IF EXISTS `v_pdv_ubicacion`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_pdv_ubicacion` AS SELECT 
 1 AS `id_pdv`,
 1 AS `codigo_centro_costo`,
 1 AS `direccion`,
 1 AS `zona_comercial`,
 1 AS `ciudad`,
 1 AS `region`,
 1 AS `grupo`,
 1 AS `monto_grupo`,
 1 AS `estado`,
 1 AS `supervisor`,
 1 AS `email_supervisor`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_precio_vigente`
--

DROP TABLE IF EXISTS `v_precio_vigente`;
/*!50001 DROP VIEW IF EXISTS `v_precio_vigente`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_precio_vigente` AS SELECT 
 1 AS `id_suministro`,
 1 AS `suministro`,
 1 AS `id_proveedor`,
 1 AS `nombre_proveedor`,
 1 AS `precio_compra`,
 1 AS `fecha_vigencia_desde`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_presupuesto_actual`
--

DROP TABLE IF EXISTS `v_presupuesto_actual`;
/*!50001 DROP VIEW IF EXISTS `v_presupuesto_actual`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_presupuesto_actual` AS SELECT 
 1 AS `departamento`,
 1 AS `periodo_anio`,
 1 AS `periodo_mes`,
 1 AS `monto_autorizado`,
 1 AS `monto_ejecutado`,
 1 AS `saldo`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_rol_permisos`
--

DROP TABLE IF EXISTS `v_rol_permisos`;
/*!50001 DROP VIEW IF EXISTS `v_rol_permisos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_rol_permisos` AS SELECT 
 1 AS `id_rol`,
 1 AS `rol`,
 1 AS `permiso`,
 1 AS `descripcion_permiso`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_suministros_efectivos_pdv`
--

DROP TABLE IF EXISTS `v_suministros_efectivos_pdv`;
/*!50001 DROP VIEW IF EXISTS `v_suministros_efectivos_pdv`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_suministros_efectivos_pdv` AS SELECT 
 1 AS `id_pdv`,
 1 AS `codigo_pdv`,
 1 AS `id_suministro`,
 1 AS `suministro`,
 1 AS `tipo_suministro`,
 1 AS `origen_permiso`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `v_suministros_por_departamento`
--

DROP TABLE IF EXISTS `v_suministros_por_departamento`;
/*!50001 DROP VIEW IF EXISTS `v_suministros_por_departamento`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_suministros_por_departamento` AS SELECT 
 1 AS `id_departamento`,
 1 AS `departamento`,
 1 AS `id_suministro`,
 1 AS `suministro`,
 1 AS `tipo_suministro`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `zona_suministros`
--

DROP TABLE IF EXISTS `zona_suministros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zona_suministros` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_zona_comercial` int NOT NULL,
  `id_suministro` int NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_zona_sum` (`id_zona_comercial`,`id_suministro`),
  KEY `fk_zs_sum` (`id_suministro`),
  CONSTRAINT `fk_zs_sum` FOREIGN KEY (`id_suministro`) REFERENCES `suministros` (`id_suministro`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_zs_zona` FOREIGN KEY (`id_zona_comercial`) REFERENCES `zonas_comerciales` (`id_zona_comercial`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Suministros permitidos por zona comercial (sobreescribe región)';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zona_suministros`
--

LOCK TABLES `zona_suministros` WRITE;
/*!40000 ALTER TABLE `zona_suministros` DISABLE KEYS */;
/*!40000 ALTER TABLE `zona_suministros` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zona_ventanas_pedido`
--

DROP TABLE IF EXISTS `zona_ventanas_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zona_ventanas_pedido` (
  `id_ventana` int unsigned NOT NULL AUTO_INCREMENT,
  `id_zona_comercial` int NOT NULL,
  `dia_inicio` tinyint unsigned NOT NULL COMMENT 'Día del mes desde el que se puede pedir (1-31)',
  `dia_fin` tinyint unsigned NOT NULL COMMENT 'Día del mes hasta el que se puede pedir (1-31)',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ventana`),
  UNIQUE KEY `uq_zona_activa` (`id_zona_comercial`,`activo`),
  CONSTRAINT `fk_ventana_zona` FOREIGN KEY (`id_zona_comercial`) REFERENCES `zonas_comerciales` (`id_zona_comercial`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_dia_fin` CHECK ((`dia_fin` between 1 and 31)),
  CONSTRAINT `chk_dia_inicio` CHECK ((`dia_inicio` between 1 and 31)),
  CONSTRAINT `chk_rango_dias` CHECK ((`dia_fin` >= `dia_inicio`))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zona_ventanas_pedido`
--

LOCK TABLES `zona_ventanas_pedido` WRITE;
/*!40000 ALTER TABLE `zona_ventanas_pedido` DISABLE KEYS */;
INSERT INTO `zona_ventanas_pedido` VALUES (1,1,1,3,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(2,2,1,3,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(3,3,1,3,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(4,4,1,3,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(5,5,1,3,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(6,6,1,3,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(7,7,1,3,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(8,9,12,15,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(9,10,12,15,1,'2026-03-10 08:29:19','2026-03-10 08:29:19'),(10,8,12,15,1,'2026-03-10 08:29:19','2026-03-10 08:29:19');
/*!40000 ALTER TABLE `zona_ventanas_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `zonas_comerciales`
--

DROP TABLE IF EXISTS `zonas_comerciales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zonas_comerciales` (
  `id_zona_comercial` int NOT NULL AUTO_INCREMENT,
  `id_ciudad` int NOT NULL,
  `zona` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  `codigo_zona` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish_ci NOT NULL,
  PRIMARY KEY (`id_zona_comercial`),
  UNIQUE KEY `uq_zona_codigo` (`codigo_zona`),
  KEY `idx_zona_ciudad` (`id_ciudad`),
  CONSTRAINT `fk_zona_ciudad` FOREIGN KEY (`id_ciudad`) REFERENCES `ciudades` (`id_ciudad`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci COMMENT='Nivel 3 de la jerarquía geográfica';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `zonas_comerciales`
--

LOCK TABLES `zonas_comerciales` WRITE;
/*!40000 ALTER TABLE `zonas_comerciales` DISABLE KEYS */;
INSERT INTO `zonas_comerciales` VALUES (1,3,'COSTA_CENTRO_1','COSTCENT1'),(2,3,'COSTA_CENTRO_2','COSTCENT2'),(3,3,'COSTA_NORTE','COSTNORT'),(4,3,'COSTA_SUR','COSTSUR'),(5,2,'DURAN','DURAN'),(6,3,'GUAYAS_1','GUAYAS1'),(7,3,'GUAYAS_2','GUAYAS2'),(8,1,'ORIENTE','ORIENTE'),(9,5,'SIERRA_CENTRO','SIERCENT'),(10,4,'SIERRA_NORTE','SIERNORT'),(11,6,'CERRADA','CERRADA');
/*!40000 ALTER TABLE `zonas_comerciales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'db_supplychain'
--

--
-- Dumping routines for database 'db_supplychain'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_actualizar_precio` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_actualizar_precio`(
    IN p_id_suministro INT,
    IN p_id_proveedor  INT,
    IN p_precio_nuevo  DECIMAL(12,2),
    IN p_usuario       INT
)
BEGIN
    DECLARE v_ahora DATETIME DEFAULT NOW();

    UPDATE suministros_precios
    SET    fecha_vigencia_hasta = v_ahora
    WHERE  id_suministro        = p_id_suministro
      AND  id_proveedor         = p_id_proveedor
      AND  fecha_vigencia_hasta IS NULL;

    INSERT INTO suministros_precios
        (id_suministro, id_proveedor, precio_compra, fecha_vigencia_desde, registrado_por)
    VALUES
        (p_id_suministro, p_id_proveedor, p_precio_nuevo, v_ahora, p_usuario);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_aprobar_pedido` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_aprobar_pedido`(
    IN p_id_pedido   INT,
    IN p_id_usuario  INT,
    IN p_observacion TEXT
)
BEGIN
    DECLARE v_stock_actual INT;
    DECLARE v_falta        VARCHAR(200);
    DECLARE done           INT DEFAULT 0;
    DECLARE v_id_sum       INT;
    DECLARE v_id_prov      INT;
    DECLARE v_cantidad     INT;

    DECLARE cur CURSOR FOR
        SELECT id_suministro, id_proveedor, cantidad
        FROM   detalle_pedidos
        WHERE  id_pedido = p_id_pedido;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    START TRANSACTION;

    -- Verificar stock suficiente para cada línea
    OPEN cur;
    check_loop: LOOP
        FETCH cur INTO v_id_sum, v_id_prov, v_cantidad;
        IF done THEN LEAVE check_loop; END IF;

        SELECT stock INTO v_stock_actual
        FROM   suministro_proveedor_stock
        WHERE  id_suministro = v_id_sum
          AND  id_proveedor  = v_id_prov
        FOR UPDATE;

        IF v_stock_actual IS NULL OR v_stock_actual < v_cantidad THEN
            SET v_falta = CONCAT('Stock insuficiente: suministro ', v_id_sum,
                                 ' / proveedor ', v_id_prov,
                                 ' (disponible: ', COALESCE(v_stock_actual, 0),
                                 ', requerido: ', v_cantidad, ')');
            ROLLBACK;
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_falta;
        END IF;
    END LOOP;
    CLOSE cur;

    -- Descontar stock
    UPDATE suministro_proveedor_stock sps
    JOIN   detalle_pedidos dp
           ON  dp.id_suministro = sps.id_suministro
           AND dp.id_proveedor  = sps.id_proveedor
    SET    sps.stock = sps.stock - dp.cantidad
    WHERE  dp.id_pedido = p_id_pedido;

    -- Cambiar estado del pedido
    UPDATE cabecera_pedidos
    SET    id_estado_pedido         = (SELECT id_estado_pedido FROM estado_pedidos WHERE descripcion = 'Aprobado' LIMIT 1),
           observaciones_aprobacion = p_observacion
    WHERE  id_pedido = p_id_pedido;

    COMMIT;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `v_catalogo_disponible`
--

/*!50001 DROP VIEW IF EXISTS `v_catalogo_disponible`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_catalogo_disponible` AS select `s`.`id_suministro` AS `id_suministro`,`s`.`descripcion` AS `suministro`,`ts`.`descripcion` AS `tipo`,`p`.`id_proveedor` AS `id_proveedor`,`p`.`nombre_proveedor` AS `nombre_proveedor`,`sp`.`precio_compra` AS `precio_vigente`,`sps`.`stock` AS `stock` from ((((`suministros` `s` join `tipo_suministros` `ts` on((`ts`.`id_tipo_suministro` = `s`.`id_tipo_suministro`))) join `suministro_proveedor_stock` `sps` on((`sps`.`id_suministro` = `s`.`id_suministro`))) join `proveedores` `p` on((`p`.`id_proveedor` = `sps`.`id_proveedor`))) join `suministros_precios` `sp` on(((`sp`.`id_suministro` = `s`.`id_suministro`) and (`sp`.`id_proveedor` = `sps`.`id_proveedor`) and (`sp`.`fecha_vigencia_hasta` is null)))) where (`sps`.`stock` > 0) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_pdv_ubicacion`
--

/*!50001 DROP VIEW IF EXISTS `v_pdv_ubicacion`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_pdv_ubicacion` AS select `pdv`.`id_pdv` AS `id_pdv`,`pdv`.`codigo_centro_costo` AS `codigo_centro_costo`,`pdv`.`direccion` AS `direccion`,`z`.`zona` AS `zona_comercial`,`c`.`descripcion` AS `ciudad`,`r`.`descripcion` AS `region`,`gp`.`descripcion` AS `grupo`,`gp`.`monto_autorizado` AS `monto_grupo`,`ep`.`descripcion` AS `estado`,`s`.`nombres` AS `supervisor`,`s`.`email` AS `email_supervisor` from ((((((`pdvs` `pdv` join `zonas_comerciales` `z` on((`z`.`id_zona_comercial` = `pdv`.`id_zona_comercial`))) join `ciudades` `c` on((`c`.`id_ciudad` = `z`.`id_ciudad`))) join `regiones` `r` on((`r`.`id_region` = `c`.`id_region`))) join `grupo_pdvs` `gp` on((`gp`.`id_grupo_pdv` = `pdv`.`id_grupo_pdv`))) join `estado_pdvs` `ep` on((`ep`.`id_estado_pdv` = `pdv`.`id_estado_pdv`))) left join `supervisores` `s` on((`s`.`id_supervisor` = `pdv`.`id_supervisor`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_precio_vigente`
--

/*!50001 DROP VIEW IF EXISTS `v_precio_vigente`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_precio_vigente` AS select `sp`.`id_suministro` AS `id_suministro`,`s`.`descripcion` AS `suministro`,`sp`.`id_proveedor` AS `id_proveedor`,`p`.`nombre_proveedor` AS `nombre_proveedor`,`sp`.`precio_compra` AS `precio_compra`,`sp`.`fecha_vigencia_desde` AS `fecha_vigencia_desde` from ((`suministros_precios` `sp` join `suministros` `s` on((`s`.`id_suministro` = `sp`.`id_suministro`))) join `proveedores` `p` on((`p`.`id_proveedor` = `sp`.`id_proveedor`))) where (`sp`.`fecha_vigencia_hasta` is null) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_presupuesto_actual`
--

/*!50001 DROP VIEW IF EXISTS `v_presupuesto_actual`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_presupuesto_actual` AS select `d`.`descripcion` AS `departamento`,`pd`.`periodo_anio` AS `periodo_anio`,`pd`.`periodo_mes` AS `periodo_mes`,`pd`.`monto_autorizado` AS `monto_autorizado`,`pd`.`monto_ejecutado` AS `monto_ejecutado`,(`pd`.`monto_autorizado` - `pd`.`monto_ejecutado`) AS `saldo` from (`presupuesto_departamentos` `pd` join `departamentos` `d` on((`d`.`id_departamento` = `pd`.`id_departamento`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_rol_permisos`
--

/*!50001 DROP VIEW IF EXISTS `v_rol_permisos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_rol_permisos` AS select `r`.`id_rol` AS `id_rol`,`r`.`descripcion` AS `rol`,`p`.`codigo` AS `permiso`,`p`.`descripcion` AS `descripcion_permiso` from ((`rol_has_permisos` `rhp` join `roles` `r` on((`r`.`id_rol` = `rhp`.`id_rol`))) join `permisos` `p` on((`p`.`id_permiso` = `rhp`.`id_permiso`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_suministros_efectivos_pdv`
--

/*!50001 DROP VIEW IF EXISTS `v_suministros_efectivos_pdv`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_suministros_efectivos_pdv` AS select `x`.`id_pdv` AS `id_pdv`,`p`.`codigo_centro_costo` AS `codigo_pdv`,`x`.`id_suministro` AS `id_suministro`,`s`.`descripcion` AS `suministro`,`ts`.`descripcion` AS `tipo_suministro`,`x`.`origen_permiso` AS `origen_permiso` from ((((select `ps`.`id_pdv` AS `id_pdv`,`ps`.`id_suministro` AS `id_suministro`,'PDV' AS `origen_permiso` from `pdv_suministros` `ps` union all select `p`.`id_pdv` AS `id_pdv`,`zs`.`id_suministro` AS `id_suministro`,'Zona' AS `origen_permiso` from (`pdvs` `p` join `zona_suministros` `zs` on((`zs`.`id_zona_comercial` = `p`.`id_zona_comercial`))) where exists(select 1 from `pdv_suministros` `ps2` where (`ps2`.`id_pdv` = `p`.`id_pdv`)) is false union all select `p`.`id_pdv` AS `id_pdv`,`rs`.`id_suministro` AS `id_suministro`,'Region' AS `origen_permiso` from (((`pdvs` `p` join `zonas_comerciales` `zc` on((`zc`.`id_zona_comercial` = `p`.`id_zona_comercial`))) join `ciudades` `c` on((`c`.`id_ciudad` = `zc`.`id_ciudad`))) join `region_suministros` `rs` on((`rs`.`id_region` = `c`.`id_region`))) where (exists(select 1 from `pdv_suministros` `ps2` where (`ps2`.`id_pdv` = `p`.`id_pdv`)) is false and exists(select 1 from `zona_suministros` `zs2` where (`zs2`.`id_zona_comercial` = `p`.`id_zona_comercial`)) is false)) `x` join `pdvs` `p` on((`p`.`id_pdv` = `x`.`id_pdv`))) join `suministros` `s` on((`s`.`id_suministro` = `x`.`id_suministro`))) join `tipo_suministros` `ts` on((`ts`.`id_tipo_suministro` = `s`.`id_tipo_suministro`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `v_suministros_por_departamento`
--

/*!50001 DROP VIEW IF EXISTS `v_suministros_por_departamento`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_suministros_por_departamento` AS select `d`.`id_departamento` AS `id_departamento`,`d`.`descripcion` AS `departamento`,`s`.`id_suministro` AS `id_suministro`,`s`.`descripcion` AS `suministro`,`ts`.`descripcion` AS `tipo_suministro` from (((`departamento_suministros` `ds` join `departamentos` `d` on((`d`.`id_departamento` = `ds`.`id_departamento`))) join `suministros` `s` on((`s`.`id_suministro` = `ds`.`id_suministro`))) join `tipo_suministros` `ts` on((`ts`.`id_tipo_suministro` = `s`.`id_tipo_suministro`))) order by `d`.`descripcion`,`ts`.`descripcion`,`s`.`descripcion` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-10 23:27:00
