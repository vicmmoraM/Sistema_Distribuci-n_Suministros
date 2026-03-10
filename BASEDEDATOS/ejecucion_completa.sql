-- Script unificado de base de datos
-- Incluye estructura base, datos semilla y migraciones acumuladas

-- ============================================================
-- 1) ESTRUCTURA BASE
-- ============================================================
DROP DATABASE IF EXISTS DB_SupplyChain;
CREATE DATABASE DB_SupplyChain CHARACTER SET UTF8MB4 COLLATE UTF8MB4_SPANISH_CI;
USE DB_SupplyChain;

DROP USER IF EXISTS 'dbSystemSC'@'%';
CREATE USER 'dbSystemSC'@'%' IDENTIFIED BY 'C0n3x10nSC2024';
GRANT ALL PRIVILEGES ON DB_SupplyChain.* TO 'dbSystemSC'@'%';
FLUSH PRIVILEGES;

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

CREATE TABLE regiones (
    id_region INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(20) NULL
) ENGINE=INNODB;

CREATE TABLE ciudades (
    id_ciudad INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_region INT NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    codigo VARCHAR(20) NULL,
    CONSTRAINT fk_ciudad_region FOREIGN KEY (id_region) REFERENCES regiones (id_region),
    UNIQUE KEY uq_ciudad_region (descripcion, id_region)
) ENGINE=INNODB;

CREATE TABLE supervisores (
    id_supervisor INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    email VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=INNODB;

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
    password VARCHAR(255) NULL,
    nombres VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_depto FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento),
    CONSTRAINT fk_user_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE=INNODB;

CREATE TABLE pdvs (
    id_pdv INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_grupo_pdv INT NOT NULL,
    id_estado_pdv INT NOT NULL,
    id_zona_comercial INT NOT NULL,
    id_proveedor_principal INT,
    codigo_centro_costo VARCHAR(20) NULL UNIQUE COMMENT 'Codigo del centro de costo (ej: FC004, FC005)',
    id_ciudad INT NULL,
    id_supervisor INT NULL,
    descripcion VARCHAR(60) NOT NULL,
    direccion VARCHAR(200),
    CONSTRAINT fk_pdv_grupo FOREIGN KEY (id_grupo_pdv) REFERENCES grupo_pdvs (id_grupo_pdv),
    CONSTRAINT fk_pdv_estado FOREIGN KEY (id_estado_pdv) REFERENCES estado_pdvs (id_estado_pdv),
    CONSTRAINT fk_pdv_zona FOREIGN KEY (id_zona_comercial) REFERENCES zonas_comerciales (id_zona_comercial),
    CONSTRAINT fk_pdv_prov FOREIGN KEY (id_proveedor_principal) REFERENCES proveedores (id_proveedor),
    CONSTRAINT fk_pdv_ciudad FOREIGN KEY (id_ciudad) REFERENCES ciudades (id_ciudad),
    CONSTRAINT fk_pdv_supervisor FOREIGN KEY (id_supervisor) REFERENCES supervisores (id_supervisor),
    INDEX idx_pdv_ciudad (id_ciudad),
    INDEX idx_pdv_supervisor (id_supervisor)
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

CREATE TABLE cabecera_pedidos (
    id_pedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_pdv INT NULL,
    id_estado_pedido INT NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones_aprobacion TEXT NULL DEFAULT NULL COMMENT 'Observaciones o comentarios al aprobar el pedido',
    motivo_rechazo TEXT NULL DEFAULT NULL COMMENT 'Motivo especificado al rechazar el pedido',
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

-- ============================================================
-- 2) DATOS SEMILLA
-- ============================================================
USE db_supplychain;

INSERT INTO tipo_suministros (descripcion) VALUES ('Oficina');
INSERT INTO tipo_suministros (descripcion) VALUES ('Limpieza');

INSERT INTO estado_suministros (descripcion) VALUES ('Disponible');
INSERT INTO estado_suministros (descripcion) VALUES ('No Disponible');

INSERT INTO estado_pedidos (descripcion) VALUES ('En espera');
INSERT INTO estado_pedidos (descripcion) VALUES ('Aprobado');
INSERT INTO estado_pedidos (descripcion) VALUES ('Rechazado');

INSERT INTO estado_pdvs (descripcion) VALUES ('Activo');
INSERT INTO estado_pdvs (descripcion) VALUES ('Inactivo');

INSERT INTO grupo_pdvs (descripcion, monto_autorizado) VALUES 
('PEQUENO A', 15.00),
('PEQUENO B', 18.00),
('MEDIANO', 20.00),
('GRANDE', 25.00),
('ESPECIAL', 35.00);

INSERT INTO departamentos (descripcion) VALUES ('Administracion');
INSERT INTO departamentos (descripcion) VALUES ('Auditoria');
INSERT INTO departamentos (descripcion) VALUES ('Comercial');
INSERT INTO departamentos (descripcion) VALUES ('Contabilidad');
INSERT INTO departamentos (descripcion) VALUES ('Directorio');
INSERT INTO departamentos (descripcion) VALUES ('Financiero');
INSERT INTO departamentos (descripcion) VALUES ('Mantenimiento');
INSERT INTO departamentos (descripcion) VALUES ('Procesos BI');
INSERT INTO departamentos (descripcion) VALUES ('Supply Chain');
INSERT INTO departamentos (descripcion) VALUES ('Talento Humano');
INSERT INTO departamentos (descripcion) VALUES ('Tecnologia');
INSERT INTO departamentos (descripcion) VALUES ('Tesoreria');
INSERT INTO departamentos (descripcion) VALUES ('Trade Marketing');

INSERT INTO presupuesto_departamentos (id_departamento, monto_autorizado)
SELECT
    d.id_departamento,
    CASE WHEN d.descripcion = 'Tecnologia' THEN 50.00 ELSE 0.00 END AS monto_autorizado
FROM departamentos d;

INSERT INTO roles (descripcion) VALUES ('Solicitador');
INSERT INTO roles (descripcion) VALUES ('Aprobador');
INSERT INTO roles (descripcion) VALUES ('Administrador');

INSERT INTO rol_permisos (id_rol, puede_pedidos, puede_reportes, puede_aprobacion, puede_configuracion)
SELECT
    r.id_rol,
    1,
    CASE WHEN LOWER(r.descripcion) IN ('aprobador', 'administrador') THEN 1 ELSE 0 END,
    CASE WHEN LOWER(r.descripcion) IN ('aprobador', 'administrador') THEN 1 ELSE 0 END,
    CASE WHEN LOWER(r.descripcion) = 'administrador' THEN 1 ELSE 0 END
FROM roles r;

INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('COSTA_CENTRO_1','COSTCENT1');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('COSTA_CENTRO_2','COSTCENT2');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('COSTA_NORTE','COSTNORT');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('COSTA_SUR','COSTSUR');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('DURAN','DURAN');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('GUAYAS_1','GUAYAS1');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('GUAYAS_2','GUAYAS2');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('ORIENTE','ORIENTE');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('SIERRA_CENTRO','SIERCENT');
INSERT INTO zonas_comerciales (zona, codigo_zona) VALUES ('SIERRA_NORTE','SIERNORT');

INSERT INTO proveedores (nombre_proveedor) VALUES ('Insumos Iris');
INSERT INTO proveedores (nombre_proveedor) VALUES ('Insumos Orieta');

INSERT INTO suministros (id_tipo_suministro, id_estado_suministro, descripcion, stock) VALUES 
(2, 1, 'AMBIENTAL EN PASTILLA', 100),
(2, 1, 'CLORO AL 3% 1GL', 100),
(2, 1, 'DESINFECTANTE GALON', 100),
(2, 1, 'DETERGENTE EN POLVO 1kilo', 100),
(2, 1, 'DILUYENTE', 100),
(2, 1, 'ESCOBA', 100),
(2, 1, 'ESPONJA LAVAPLATOS', 100),
(2, 1, 'FRANELA 50X30', 100),
(2, 1, 'FUNDA 18"X22" PAQUETE 10U NEGRA', 100),
(2, 1, 'FUNDA 23X28 PAQUETE NEGRA', 100),
(2, 1, 'FUNDA 38"X55" NEGRA MUERTO 10U', 100),
(2, 1, 'JABON LIQUIDO', 100),
(2, 1, 'JERGA TRAPEADOR', 100),
(2, 1, 'LIMPIAVIDRIO S/ATOMIZADOR', 100),
(2, 1, 'LUSTRE VERDE', 100),
(2, 1, 'MANO DE OSO', 100),
(2, 1, 'PAPEL HIGIENICO P/DISPENSADOR', 100),
(2, 1, 'TOALLA DE MANO RECTANGULARES', 100),
(2, 1, 'VALDE 12L', 100),
(2, 1, 'WIPE', 100);

INSERT INTO suministros (id_tipo_suministro, id_estado_suministro, descripcion, stock) VALUES 
(1, 1, 'BOLIGRAFO BIC P/MEDIO AZUL', 100),
(1, 1, 'BOLIGRAFO BIC P/MEDIO NEGRO', 100),
(1, 1, 'BOLIGRAFO BIC P/MEDIO ROJO', 100),
(1, 1, 'CAJA DE GRAPAS 26/6', 100),
(1, 1, 'CALCULADORA', 100),
(1, 1, 'CINTA DE EMBALAJE', 100),
(1, 1, 'CUADERNO UNIVERSITARIO CUADRO 100H', 100),
(1, 1, 'FOLDER ARCHIVADOR', 100),
(1, 1, 'GRAPADORA', 100),
(1, 1, 'MARCADOR BORRABLE AZUL', 100),
(1, 1, 'MARCADOR BORRABLE NEGRO', 100),
(1, 1, 'MARCADOR BORRABLE ROJO', 100),
(1, 1, 'MARCADOR PERMANENTE AZUL', 100),
(1, 1, 'MARCADOR PERMANENTE NEGRO', 100),
(1, 1, 'MARCADOR PERMANENTE ROJO', 100),
(1, 1, 'RESALTADOR', 100),
(1, 1, 'RESMA 75G PAPEL BOND A4 REPORT/NORMA', 100),
(1, 1, 'SOBRE MANILA A4 F3', 100),
(1, 1, 'TIJERAS 5" PUNTA REDONDA', 100);

INSERT INTO pdvs (descripcion, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal) VALUES 
('FC004', 2, 1, 1, 2), ('FC005', 1, 1, 1, 2), ('FC006', 1, 1, 1, 2),
('FC095', 2, 1, 1, 2), ('FC096', 1, 1, 1, 2), ('FC097', 2, 1, 1, 2),
('FC098', 1, 1, 1, 2), ('FC099', 2, 1, 1, 2), ('FC100', 1, 1, 1, 2),
('FC101', 4, 1, 1, 2), ('FC102', 4, 1, 1, 2), ('FC103', 4, 1, 1, 2),
('FC104', 4, 1, 1, 2), ('FC105', 4, 1, 1, 2), ('FC106', 1, 1, 1, 2),
('FC107', 1, 1, 1, 2), ('FC108', 3, 1, 1, 2), ('FC109', 1, 1, 1, 2),
('FC110', 1, 1, 1, 2);

INSERT INTO pdvs (descripcion, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal) VALUES 
('FC007', 1, 1, 5, 1), ('FC008', 2, 1, 5, 1), ('FC009', 1, 1, 5, 1),
('FC010', 1, 1, 5, 1), ('FC011', 3, 1, 5, 1), ('FC012', 1, 1, 5, 1),
('FC013', 1, 1, 5, 1), ('FC014', 2, 1, 5, 1), ('FC015', 1, 1, 5, 1),
('FC016', 1, 1, 5, 1), ('FC017', 2, 1, 5, 1), ('FC018', 2, 1, 5, 1),
('FC019', 2, 1, 5, 1), ('FC020', 5, 1, 5, 1), ('FC021', 1, 1, 5, 1),
('FC022', 1, 1, 5, 1), ('FC023', 2, 1, 5, 1), ('FC024', 1, 1, 5, 1),
('FC025', 1, 1, 5, 1), ('FC026', 1, 1, 5, 1), ('FC027', 1, 1, 5, 1),
('FC028', 1, 1, 5, 1), ('FC029', 1, 1, 5, 1), ('FC030', 2, 1, 5, 1),
('FC031', 1, 1, 5, 1), ('FC032', 1, 1, 5, 1), ('FC033', 1, 1, 5, 1),
('FC035', 1, 1, 5, 1), ('FC042', 1, 1, 5, 1), ('FC043', 1, 1, 5, 1);

INSERT INTO pdvs (descripcion, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal) VALUES 
('FC034', 1, 1, 6, 1), ('FC036', 1, 1, 6, 1), ('FC037', 1, 1, 6, 1),
('FC044', 1, 1, 6, 1), ('FC045', 2, 1, 6, 1), ('FC046', 1, 1, 6, 1),
('FC038', 1, 1, 7, 1), ('FC039', 1, 1, 7, 1), ('FC040', 1, 1, 7, 1),
('FC041', 2, 1, 7, 1), ('FC050', 1, 1, 7, 1), ('FC051', 1, 1, 7, 1),
('FC055', 2, 1, 7, 1);

INSERT INTO pdvs (descripcion, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal) VALUES 
('FC074', 1, 1, 10, 2), ('FC081', 1, 1, 10, 2), ('FC165', 1, 1, 10, 2),
('FC166', 1, 1, 10, 2), ('FC167', 1, 1, 10, 2), ('FC168', 1, 1, 10, 2),
('FC169', 1, 1, 10, 2), ('FC170', 1, 1, 10, 2), ('FC171', 1, 1, 10, 2),
('FC172', 1, 1, 10, 2), ('FC173', 1, 1, 10, 2), ('FC174', 1, 1, 10, 2),
('FC176', 1, 1, 10, 2), ('FC177', 1, 1, 10, 2), ('FC178', 1, 1, 10, 2),
('FC179', 1, 1, 10, 2), ('FC180', 1, 1, 10, 2);

INSERT INTO pdvs (descripcion, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal) VALUES 
('FC181', 1, 1, 9, 1), ('FC182', 1, 1, 9, 1), ('FC183', 1, 1, 9, 1),
('FC184', 1, 1, 9, 1), ('FC185', 1, 1, 9, 1), ('FC190', 1, 1, 9, 1),
('FC191', 2, 1, 9, 1), ('FC192', 2, 1, 9, 1), ('FC212', 3, 1, 9, 1);

INSERT INTO pdvs (descripcion, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal) VALUES 
('FC186', 1, 1, 8, 1), ('FC187', 2, 1, 8, 1), ('FC189', 1, 1, 8, 1),
('FC205', 1, 1, 8, 1), ('FC206', 1, 1, 8, 1), ('FC207', 1, 1, 8, 1),
('FC211', 3, 1, 8, 1);

INSERT INTO suministros_precios (id_suministro, id_proveedor, precio_compra) VALUES 
((SELECT id_suministro FROM suministros WHERE descripcion = 'AMBIENTAL EN PASTILLA'), 1, 1.42),
((SELECT id_suministro FROM suministros WHERE descripcion = 'AMBIENTAL EN PASTILLA'), 2, 1.47),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CLORO AL 3% 1GL'), 1, 2.26),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CLORO AL 3% 1GL'), 2, 2.26),
((SELECT id_suministro FROM suministros WHERE descripcion = 'DESINFECTANTE GALON'), 1, 3.42),
((SELECT id_suministro FROM suministros WHERE descripcion = 'DESINFECTANTE GALON'), 2, 3.42),
((SELECT id_suministro FROM suministros WHERE descripcion = 'DETERGENTE EN POLVO 1kilo'), 1, 2.59),
((SELECT id_suministro FROM suministros WHERE descripcion = 'DETERGENTE EN POLVO 1kilo'), 2, 1.24),
((SELECT id_suministro FROM suministros WHERE descripcion = 'DILUYENTE'), 1, 3.83),
((SELECT id_suministro FROM suministros WHERE descripcion = 'DILUYENTE'), 2, 1.64),
((SELECT id_suministro FROM suministros WHERE descripcion = 'ESCOBA'), 1, 2.50),
((SELECT id_suministro FROM suministros WHERE descripcion = 'ESCOBA'), 2, 2.47),
((SELECT id_suministro FROM suministros WHERE descripcion = 'ESPONJA LAVAPLATOS'), 1, 0.73),
((SELECT id_suministro FROM suministros WHERE descripcion = 'ESPONJA LAVAPLATOS'), 2, 0.40),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FRANELA 50X30'), 1, 1.03),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FRANELA 50X30'), 2, 0.98),
((SELECT id_suministro FROM suministros WHERE descripcion = 'JABON LIQUIDO'), 1, 3.56),
((SELECT id_suministro FROM suministros WHERE descripcion = 'JABON LIQUIDO'), 2, 1.20),
((SELECT id_suministro FROM suministros WHERE descripcion = 'LIMPIAVIDRIO S/ATOMIZADOR'), 1, 2.83),
((SELECT id_suministro FROM suministros WHERE descripcion = 'LIMPIAVIDRIO S/ATOMIZADOR'), 2, 0.56),
((SELECT id_suministro FROM suministros WHERE descripcion = 'VALDE 12L'), 1, 4.59),
((SELECT id_suministro FROM suministros WHERE descripcion = 'VALDE 12L'), 2, 3.60),
((SELECT id_suministro FROM suministros WHERE descripcion = 'WIPE'), 1, 1.50),
((SELECT id_suministro FROM suministros WHERE descripcion = 'WIPE'), 2, 0.78);

INSERT INTO suministros_precios (id_suministro, id_proveedor, precio_compra) VALUES 
((SELECT id_suministro FROM suministros WHERE descripcion = 'BOLIGRAFO BIC P/MEDIO AZUL'), 1, 0.41),
((SELECT id_suministro FROM suministros WHERE descripcion = 'BOLIGRAFO BIC P/MEDIO AZUL'), 2, 0.40),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CAJA DE GRAPAS 26/6'), 1, 1.44),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CAJA DE GRAPAS 26/6'), 2, 1.11),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CALCULADORA'), 1, 5.79),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CALCULADORA'), 2, 9.22),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CINTA DE EMBALAJE'), 1, 1.44),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CINTA DE EMBALAJE'), 2, 1.44),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FOLDER ARCHIVADOR'), 1, 3.49),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FOLDER ARCHIVADOR'), 2, 2.70),
((SELECT id_suministro FROM suministros WHERE descripcion = 'RESMA 75G PAPEL BOND A4 REPORT/NORMA'), 1, 3.80),
((SELECT id_suministro FROM suministros WHERE descripcion = 'RESMA 75G PAPEL BOND A4 REPORT/NORMA'), 2, 3.54),
((SELECT id_suministro FROM suministros WHERE descripcion = 'TIJERAS 5" PUNTA REDONDA'), 1, 0.73),
((SELECT id_suministro FROM suministros WHERE descripcion = 'TIJERAS 5" punta REDONDA'), 2, 0.46);

-- ============================================================
-- 3) AJUSTES ADICIONALES DE PRECIOS
-- ============================================================
INSERT INTO suministros_precios (id_suministro, id_proveedor, precio_compra) VALUES 
((SELECT id_suministro FROM suministros WHERE descripcion = 'FUNDA 18"X22" PAQUETE 10U NEGRA'),1,0.49),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FUNDA 18"X22" PAQUETE 10U NEGRA' ),2,0.83),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FUNDA 23X28 PAQUETE NEGRA'),1,0.96),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FUNDA 23X28 PAQUETE NEGRA'),2,0.74),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FUNDA 38"X55" NEGRA MUERTO 10U'),1,3.09),
((SELECT id_suministro FROM suministros WHERE descripcion = 'FUNDA 38"X55" NEGRA MUERTO 10U'),2,3.09),
((SELECT id_suministro FROM suministros WHERE descripcion = 'JERGA TRAPEADOR'),1,3.58),
((SELECT id_suministro FROM suministros WHERE descripcion = 'JERGA TRAPEADOR'),2,4.32),
((SELECT id_suministro FROM suministros WHERE descripcion = 'LUSTRE VERDE'),1,0.73),
((SELECT id_suministro FROM suministros WHERE descripcion = 'LUSTRE VERDE'),2,0.63),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MANO DE OSO'),1,3.74),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MANO DE OSO'),2,2.48),
((SELECT id_suministro FROM suministros WHERE descripcion = 'PAPEL HIGIENICO P/DISPENSADOR'),1,3.33),
((SELECT id_suministro FROM suministros WHERE descripcion = 'PAPEL HIGIENICO P/DISPENSADOR'),2,3.39),
((SELECT id_suministro FROM suministros WHERE descripcion = 'TOALLA DE MANO RECTANGULARES'),1,3.21),
((SELECT id_suministro FROM suministros WHERE descripcion = 'TOALLA DE MANO RECTANGULARES'),2,3.21);

INSERT INTO suministros_precios (id_suministro, id_proveedor, precio_compra) VALUES
((SELECT id_suministro FROM suministros WHERE descripcion = 'BOLIGRAFO BIC P/MEDIO NEGRO'),1,0.41),
((SELECT id_suministro FROM suministros WHERE descripcion = 'BOLIGRAFO BIC P/MEDIO NEGRO'),2,0.40),
((SELECT id_suministro FROM suministros WHERE descripcion = 'BOLIGRAFO BIC P/MEDIO ROJO'),1,0.41),
((SELECT id_suministro FROM suministros WHERE descripcion = 'BOLIGRAFO BIC P/MEDIO ROJO'),2,0.40),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CUADERNO UNIVERSITARIO CUADRO 100H'),1,1.82),
((SELECT id_suministro FROM suministros WHERE descripcion = 'CUADERNO UNIVERSITARIO CUADRO 100H'),2,1.82),
((SELECT id_suministro FROM suministros WHERE descripcion = 'GRAPADORA'),1,4.43),
((SELECT id_suministro FROM suministros WHERE descripcion = 'GRAPADORA'),2,3.38),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR BORRABLE AZUL'),1,0.75),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR BORRABLE AZUL'),2,0.84),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR BORRABLE NEGRO'),1,0.75),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR BORRABLE NEGRO'),2,0.84),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR BORRABLE ROJO'),1,0.75),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR BORRABLE ROJO'),2,0.84),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR PERMANENTE AZUL'),1,0.65),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR PERMANENTE AZUL'),2,0.65),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR PERMANENTE NEGRO'),1,0.65),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR PERMANENTE NEGRO'),2,0.65),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR PERMANENTE ROJO'),1,0.65),
((SELECT id_suministro FROM suministros WHERE descripcion = 'MARCADOR PERMANENTE ROJO'),2,0.65),
((SELECT id_suministro FROM suministros WHERE descripcion = 'RESALTADOR'),1,0.71),
((SELECT id_suministro FROM suministros WHERE descripcion = 'RESALTADOR'),2,0.64),
((SELECT id_suministro FROM suministros WHERE descripcion = 'SOBRE MANILA A4 F3'),1,0.18),
((SELECT id_suministro FROM suministros WHERE descripcion = 'SOBRE MANILA A4 F3'),2,0.12);

-- ============================================================
-- 4) DATOS COMPLEMENTARIOS (REGIONES/CIUDADES/SUPERVISORES)
-- ============================================================
INSERT INTO regiones (descripcion, codigo) VALUES
('Costa', 'CST'),
('Sierra', 'SRR'),
('Oriente', 'ORT'),
('Insular', 'INS');

INSERT INTO ciudades (id_region, descripcion, codigo) VALUES
((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'BALZAR', 'BLZ'),
((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'DURAN', 'DRN'),
((SELECT id_region FROM regiones WHERE descripcion = 'Costa'), 'GUAYAQUIL', 'GYE'),
((SELECT id_region FROM regiones WHERE descripcion = 'Sierra'), 'QUITO', 'UIO'),
((SELECT id_region FROM regiones WHERE descripcion = 'Sierra'), 'CUENCA', 'CUE');

INSERT INTO supervisores (nombres, email) VALUES
('Ligia Rodriguez', 'ligia.rodriguez@fundacioncrisfe.org'),
('Fernando Vera', 'fernando.vera@fundacioncrisfe.org');

UPDATE zonas_comerciales
SET id_region = (SELECT id_region FROM regiones WHERE descripcion = 'Costa' LIMIT 1)
WHERE zona IN ('COSTA_CENTRO_1', 'COSTA_CENTRO_2', 'COSTA_NORTE', 'COSTA_SUR', 'DURAN', 'GUAYAS_1', 'GUAYAS_2');

UPDATE zonas_comerciales
SET id_region = (SELECT id_region FROM regiones WHERE descripcion = 'Sierra' LIMIT 1)
WHERE zona IN ('SIERRA_CENTRO', 'SIERRA_NORTE');

UPDATE zonas_comerciales
SET id_region = (SELECT id_region FROM regiones WHERE descripcion = 'Oriente' LIMIT 1)
WHERE zona = 'ORIENTE';

UPDATE pdvs
SET codigo_centro_costo = descripcion;

-- ============================================================
-- 5) USUARIO ADMIN INICIAL
-- ============================================================
INSERT INTO usuarios (id_departamento, id_rol, login, password, nombres, email, activo)
VALUES (
        (SELECT id_departamento FROM departamentos WHERE descripcion = 'Tecnologia' LIMIT 1),
        (SELECT id_rol FROM roles WHERE descripcion = 'Administrador' LIMIT 1),
        'pasante.desarrollo',
        '123456',
        'Pasante Desarrollo',
        'pasante.desarrollo@farmcorp.com.ec',
        1
);

-- ============================================================
-- 6) ROTACION DE PROVEEDORES POR DEPARTAMENTO
-- ============================================================
CREATE TABLE departamento_proveedores_rotacion (
        id_rotacion INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        id_departamento INT NOT NULL,
        id_proveedor INT NOT NULL,
        orden_rotacion INT NOT NULL,
        CONSTRAINT fk_rot_dept FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento),
        CONSTRAINT fk_rot_prov FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor),
        CONSTRAINT uq_dept_orden UNIQUE (id_departamento, orden_rotacion)
) ENGINE=INNODB;

INSERT INTO departamento_proveedores_rotacion (id_departamento, id_proveedor, orden_rotacion) VALUES
(1, 2, 1),
(1, 1, 2);
