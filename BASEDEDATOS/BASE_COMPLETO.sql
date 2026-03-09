-- =====================================================
-- BASE DE DATOS COMPLETA: Sistema de Distribución de Suministros
-- Fundación Crisfe
-- Fecha: 2026-03-09
-- INCLUYE TODAS LAS MEJORAS: Regiones, Ciudades, Supervisores, Observaciones
-- =====================================================

DROP DATABASE IF EXISTS DB_SupplyChain;
CREATE DATABASE DB_SupplyChain CHARACTER SET UTF8MB4 COLLATE UTF8MB4_SPANISH_CI;
USE DB_SupplyChain;

DROP USER IF EXISTS 'dbSystemSC'@'%';
CREATE USER 'dbSystemSC'@'%' IDENTIFIED BY 'C0n3x10nSC2024';
GRANT ALL PRIVILEGES ON DB_SupplyChain.* TO 'dbSystemSC'@'%';
FLUSH PRIVILEGES;

-- =====================================================
-- CAPA 1: TABLAS INDEPENDIENTES (Maestras base)
-- =====================================================

CREATE TABLE tipo_suministros (
    id_tipo_suministro INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(60) NOT NULL
) ENGINE=INNODB;

CREATE TABLE estado_suministros (
    id_estado_suministro INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(30) NOT NULL
) ENGINE=INNODB;

CREATE TABLE estado_pedidos (
    id_estado_pedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(30) NOT NULL
) ENGINE=INNODB;

CREATE TABLE estado_pdvs (
    id_estado_pdv INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(30) NOT NULL
) ENGINE=INNODB;

CREATE TABLE grupo_pdvs (
    id_grupo_pdv INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(30) NOT NULL,
    monto_autorizado DECIMAL(12, 2) NOT NULL DEFAULT 0.00
) ENGINE=INNODB;

CREATE TABLE departamentos (
    id_departamento INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
) ENGINE=INNODB;

CREATE TABLE presupuesto_departamentos (
    id_presupuesto_departamento INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT NOT NULL,
    monto_autorizado DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_pres_depto FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento),
    UNIQUE KEY uq_presupuesto_depto (id_departamento)
) ENGINE=INNODB;

CREATE TABLE roles (
    id_rol INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
) ENGINE=INNODB;

CREATE TABLE rol_permisos (
    id_rol INT NOT NULL PRIMARY KEY,
    puede_pedidos TINYINT(1) NOT NULL DEFAULT 1,
    puede_reportes TINYINT(1) NOT NULL DEFAULT 0,
    puede_aprobacion TINYINT(1) NOT NULL DEFAULT 0,
    puede_configuracion TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_rol_perm FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE=INNODB;

-- =====================================================
-- NUEVAS TABLAS: REGIONES, CIUDADES Y SUPERVISORES
-- =====================================================

CREATE TABLE regiones (
    id_region INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE
) ENGINE=INNODB;

CREATE TABLE ciudades (
    id_ciudad INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_region INT NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    CONSTRAINT fk_ciudad_region FOREIGN KEY (id_region) REFERENCES regiones (id_region),
    UNIQUE KEY uq_ciudad_region (descripcion, id_region)
) ENGINE=INNODB;

CREATE TABLE supervisores (
    id_supervisor INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;

-- =====================================================
-- ZONAS COMERCIALES (CON REGIÓN)
-- =====================================================

CREATE TABLE zonas_comerciales (
    id_zona_comercial INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    zona VARCHAR(50) NOT NULL,
    codigo_zona VARCHAR(50) NOT NULL,
    id_region INT NULL,
    CONSTRAINT fk_zona_region FOREIGN KEY (id_region) REFERENCES regiones (id_region)
) ENGINE=INNODB;

CREATE TABLE proveedores (
    id_proveedor INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre_proveedor VARCHAR(100) NOT NULL
) ENGINE=INNODB;

-- =====================================================
-- SUMINISTROS
-- =====================================================

CREATE TABLE suministros (
    id_suministro INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_tipo_suministro INT NOT NULL,
    id_estado_suministro INT NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX (descripcion),
    CONSTRAINT fk_sum_tipo FOREIGN KEY (id_tipo_suministro) REFERENCES tipo_suministros (id_tipo_suministro),
    CONSTRAINT fk_sum_estado FOREIGN KEY (id_estado_suministro) REFERENCES estado_suministros (id_estado_suministro)
) ENGINE=INNODB;

CREATE TABLE usuarios (
    id_usuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT NOT NULL,
    id_rol INT NOT NULL,
    login VARCHAR(60) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_depto FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento),
    CONSTRAINT fk_user_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE=INNODB;

-- =====================================================
-- PDVS (CON CIUDAD, SUPERVISOR Y CÓDIGO CENTRO COSTO)
-- =====================================================

CREATE TABLE pdvs (
    id_pdv INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_grupo_pdv INT NOT NULL,
    id_estado_pdv INT NOT NULL,
    id_zona_comercial INT NOT NULL,
    id_proveedor_principal INT,
    id_ciudad INT NULL,
    id_supervisor INT NULL,
    descripcion VARCHAR(60) NOT NULL,
    direccion VARCHAR(200),
    -- codigo_centro_costo VARCHAR(20) NULL UNIQUE COMMENT 'Código del centro de costo (ej: FC004, FC005)',
    CONSTRAINT fk_pdv_grupo FOREIGN KEY (id_grupo_pdv) REFERENCES grupo_pdvs (id_grupo_pdv),
    CONSTRAINT fk_pdv_estado FOREIGN KEY (id_estado_pdv) REFERENCES estado_pdvs (id_estado_pdv),
    CONSTRAINT fk_pdv_zona FOREIGN KEY (id_zona_comercial) REFERENCES zonas_comerciales (id_zona_comercial),
    CONSTRAINT fk_pdv_prov FOREIGN KEY (id_proveedor_principal) REFERENCES proveedores (id_proveedor),
    CONSTRAINT fk_pdv_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudades (id_ciudad),
    CONSTRAINT fk_pdv_supervisor FOREIGN KEY (id_supervisor) REFERENCES supervisores (id_supervisor),
    INDEX idx_pdv_ciudad (id_ciudad),
    INDEX idx_pdv_supervisor (id_supervisor),
    --INDEX idx_pdv_centro_costo (codigo_centro_costo)
) ENGINE=INNODB;

CREATE TABLE suministros_precios (
    id_suministro_precio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_suministro INT NOT NULL,
    id_proveedor INT NOT NULL,
    precio_compra DECIMAL(12, 2) NOT NULL,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pre_sum FOREIGN KEY (id_suministro) REFERENCES suministros (id_suministro),
    CONSTRAINT fk_pre_prov FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor),
    UNIQUE KEY uq_suministro_proveedor (id_suministro, id_proveedor) 
) ENGINE=INNODB;

-- =====================================================
-- PEDIDOS (CON OBSERVACIONES Y MOTIVOS)
-- =====================================================

CREATE TABLE cabecera_pedidos (
    id_pedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_pdv INT NULL,
    id_estado_pedido INT NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones_aprobacion TEXT NULL COMMENT 'Observaciones al aprobar el pedido',
    motivo_rechazo TEXT NULL COMMENT 'Motivo al rechazar el pedido',
    CONSTRAINT fk_cab_user FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
    CONSTRAINT fk_cab_pdv FOREIGN KEY (id_pdv) REFERENCES pdvs (id_pdv),
    CONSTRAINT fk_cab_est FOREIGN KEY (id_estado_pedido) REFERENCES estado_pedidos (id_estado_pedido)
) ENGINE=INNODB;

CREATE TABLE detalle_pedidos (
    id_detalle_pedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_suministro INT NOT NULL,
    id_proveedor INT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_det_ped FOREIGN KEY (id_pedido) REFERENCES cabecera_pedidos (id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_det_sum FOREIGN KEY (id_suministro) REFERENCES suministros (id_suministro),
    CONSTRAINT fk_det_prov FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
) ENGINE=INNODB;

-- =====================================================
-- DATOS INICIALES: REGIONES
-- =====================================================

INSERT INTO regiones (descripcion) VALUES
('Costa'),
('Sierra'),
('Oriente'),
('Insular');

-- =====================================================
-- DATOS INICIALES: CIUDADES
-- =====================================================

INSERT INTO ciudades (id_region, descripcion) VALUES
(1, 'BALZAR'),
(1, 'DURAN'),
(1, 'GUAYAQUIL'),
(1, 'MILAGRO'),
(1, 'DAULE'),
(1, 'SAMBORONDON'),
(1, 'SALINAS'),
(1, 'MANTA'),
(1, 'PORTOVIEJO'),
(1, 'MACHALA'),
(2, 'QUITO'),
(2, 'CUENCA'),
(2, 'AMBATO'),
(2, 'RIOBAMBA'),
(2, 'LOJA'),
(2, 'IBARRA'),
(3, 'PUYO'),
(3, 'TENA'),
(3, 'LAGO AGRIO'),
(4, 'PUERTO BAQUERIZO MORENO');

-- =====================================================
-- DATOS INICIALES: SUPERVISORES
-- =====================================================

INSERT INTO supervisores (nombres) VALUES
('Ligia Rodriguez'),
('Fernando Vera');

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT 'BASE DE DATOS CREADA EXITOSAMENTE' AS resultado;
SELECT 'Tablas creadas con mejoras completas:' AS mensaje;
SELECT '- Regiones, Ciudades, Supervisores' AS feature1;
SELECT '- PDVs con código de centro de costo' AS feature2;
SELECT '- Pedidos con observaciones y motivos' AS feature3;
