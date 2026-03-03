DROP DATABASE IF EXISTS DB_SupplyChain;
CREATE DATABASE DB_SupplyChain CHARACTER SET UTF8MB4 COLLATE UTF8MB4_SPANISH_CI;
USE DB_SupplyChain;

DROP USER IF EXISTS 'dbSystemSC'@'%';
CREATE USER 'dbSystemSC'@'%' IDENTIFIED BY 'C0n3x10nSC2024';
GRANT ALL PRIVILEGES ON DB_SupplyChain.* TO 'dbSystemSC'@'%';
FLUSH PRIVILEGES;
-- 2. CAPA 1: TABLAS INDEPENDIENTES (Maestras base)
-- Estas no tienen llaves foráneas, pueden crearse en cualquier orden.
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

CREATE TABLE roles (
    id_rol INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
) ENGINE=INNODB;

CREATE TABLE zonas_comerciales (
    id_zona_comercial INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    zona VARCHAR(50) NOT NULL,
    codigo_zona VARCHAR(50) NOT NULL
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
    stock INT NOT NULL DEFAULT 0, -- El stock es general, así que se queda aquí
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
    CONSTRAINT fk_user_depto FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento),
    CONSTRAINT fk_user_rol FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE=INNODB;


CREATE TABLE pdvs (
    id_pdv INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_grupo_pdv INT NOT NULL,
    id_estado_pdv INT NOT NULL,
    id_zona_comercial INT NOT NULL,
    id_proveedor_principal INT,
    descripcion VARCHAR(60) NOT NULL,
    direccion VARCHAR(200),
    CONSTRAINT fk_pdv_grupo FOREIGN KEY (id_grupo_pdv) REFERENCES grupo_pdvs (id_grupo_pdv),
    CONSTRAINT fk_pdv_estado FOREIGN KEY (id_estado_pdv) REFERENCES estado_pdvs (id_estado_pdv),
    CONSTRAINT fk_pdv_zona FOREIGN KEY (id_zona_comercial) REFERENCES zonas_comerciales (id_zona_comercial),
    CONSTRAINT fk_pdv_prov FOREIGN KEY (id_proveedor_principal) REFERENCES proveedores (id_proveedor)
) ENGINE=INNODB;


CREATE TABLE suministros_precios (
    id_suministro_precio INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_suministro INT NOT NULL,
    id_proveedor INT NOT NULL,
    precio_compra DECIMAL(12, 2) NOT NULL, -- Lo que te cobra el proveedor
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pre_sum FOREIGN KEY (id_suministro) REFERENCES suministros (id_suministro),
    CONSTRAINT fk_pre_prov FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor),
    -- Evitamos que un mismo proveedor tenga dos precios para el mismo producto
    UNIQUE KEY uq_suministro_proveedor (id_suministro, id_proveedor) 
) ENGINE=INNODB;


-- Cabecera de Pedidos (Depende de usuarios, pdvs y estado_pedidos)
CREATE TABLE cabecera_pedidos (
    id_pedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_pdv INT NOT NULL,
    id_estado_pedido INT NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cab_user FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
    CONSTRAINT fk_cab_pdv FOREIGN KEY (id_pdv) REFERENCES pdvs (id_pdv),
    CONSTRAINT fk_cab_est FOREIGN KEY (id_estado_pedido) REFERENCES estado_pedidos (id_estado_pedido)
) ENGINE=INNODB;

CREATE TABLE detalle_pedidos (
    id_detalle_pedido INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_suministro INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12, 2) NOT NULL,
    CONSTRAINT fk_det_ped FOREIGN KEY (id_pedido) REFERENCES cabecera_pedidos (id_pedido) ON DELETE CASCADE,
    CONSTRAINT fk_det_sum FOREIGN KEY (id_suministro) REFERENCES suministros (id_suministro)
) ENGINE=INNODB;
