-- Migración: Agregar estructura de regiones, ciudades y supervisores
-- Fecha: 2026-03-09
-- Descripción: Agrega tablas y campos para gestionar regiones, ciudades y supervisores

USE DB_SupplyChain;

-- =====================================================
-- 1. CREAR TABLA DE REGIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS regiones (
    id_region INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(20) NULL
) ENGINE=INNODB;

-- Insertar regiones básicas de Ecuador
INSERT INTO regiones (descripcion, codigo) VALUES
('Costa', 'CST'),
('Sierra', 'SRR'),
('Oriente', 'ORT'),
('Insular', 'INS')
ON DUPLICATE KEY UPDATE descripcion=descripcion;

-- =====================================================
-- 2. CREAR TABLA DE CIUDADES
-- =====================================================
CREATE TABLE IF NOT EXISTS ciudades (
    id_ciudad INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_region INT NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NULL,
    CONSTRAINT fk_ciudad_region FOREIGN KEY (id_region) REFERENCES regiones (id_region),
    UNIQUE KEY uq_ciudad_region (descripcion, id_region)
) ENGINE=INNODB;

-- Insertar ciudades de ejemplo (puedes agregar más después)
INSERT INTO ciudades (id_region, descripcion, codigo) VALUES
((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'BALZAR', 'BLZ'),
((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'DURAN', 'DRN'),
((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'GUAYAQUIL', 'GYE'),
((SELECT id_region FROM regiones WHERE descripcion = 'Sierra'), 'QUITO', 'UIO'),
((SELECT id_region FROM regiones WHERE descripcion = 'Sierra'), 'CUENCA', 'CUE')
ON DUPLICATE KEY UPDATE descripcion=descripcion;

-- =====================================================
-- 3. CREAR TABLA DE SUPERVISORES
-- =====================================================
CREATE TABLE IF NOT EXISTS supervisores (
    id_supervisor INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    email VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;

-- Insertar supervisores de ejemplo
INSERT INTO supervisores (nombres, email) VALUES
('Ligia Rodriguez', 'ligia.rodriguez@fundacioncrisfe.org'),
('Fernando Vera', 'fernando.vera@fundacioncrisfe.org')
ON DUPLICATE KEY UPDATE nombres=nombres;

-- =====================================================
-- 4. ACTUALIZAR TABLA ZONAS_COMERCIALES
-- =====================================================
-- Agregar campo de región a zonas comerciales (solo región)
ALTER TABLE zonas_comerciales 
ADD COLUMN id_region INT NULL,
ADD CONSTRAINT fk_zona_region FOREIGN KEY (id_region) REFERENCES regiones (id_region);

-- =====================================================
-- 5. ACTUALIZAR TABLA PDVS
-- =====================================================
-- Agregar campos: código de centro de costo, ciudad y supervisor
ALTER TABLE pdvs 
ADD COLUMN codigo_centro_costo VARCHAR(20) NULL UNIQUE COMMENT 'Código del centro de costo (ej: FC004, FC005)',
ADD COLUMN id_ciudad INT NULL,
ADD COLUMN id_supervisor INT NULL,
ADD CONSTRAINT fk_pdv_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudades (id_ciudad),
ADD CONSTRAINT fk_pdv_supervisor FOREIGN KEY (id_supervisor) REFERENCES supervisores (id_supervisor);

-- Crear índices para mejorar búsquedas
CREATE INDEX idx_pdv_ciudad ON pdvs(id_ciudad);
CREATE INDEX idx_pdv_supervisor ON pdvs(id_supervisor);
CREATE INDEX idx_pdv_centro_costo ON pdvs(codigo_centro_costo);

-- =====================================================
-- VERIFICAR CAMBIOS
-- =====================================================
SELECT 'Verificando estructura de tablas creadas:' AS mensaje;
DESCRIBE regiones;
DESCRIBE ciudades;
DESCRIBE supervisores;
DESCRIBE zonas_comerciales;
DESCRIBE pdvs;

-- Ver datos insertados
SELECT * FROM regiones;
SELECT * FROM ciudades;
SELECT * FROM supervisores;
