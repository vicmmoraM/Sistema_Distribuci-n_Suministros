-- ============================================================
-- DB_SupplyChain — Refactorización 3FN v2.0
-- Compatibilidad: MySQL 8.0+
-- ============================================================
-- CAMBIOS RESPECTO A v1:
--   - PDV: eliminado campo 'descripcion', queda solo 'codigo_centro_costo' NOT NULL
--   - Precio: tabla 'suministros_precios' es append-only puro (sin stock)
--   - Stock: tabla independiente 'suministro_proveedor_stock' (id_suministro, id_proveedor)
--   - Suministros: eliminado campo 'stock' global
-- ============================================================

DROP DATABASE IF EXISTS DB_SupplyChain;
CREATE DATABASE DB_SupplyChain
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_spanish_ci;
USE DB_SupplyChain;

DROP USER IF EXISTS 'dbSystemSC'@'%';
CREATE USER 'dbSystemSC'@'%' IDENTIFIED BY 'C0n3x10nSC2024';
GRANT ALL PRIVILEGES ON DB_SupplyChain.* TO 'dbSystemSC'@'%';
FLUSH PRIVILEGES;

-- ============================================================
-- BLOQUE 1 — GEOGRAFÍA (Región → Ciudad → Zona Comercial)
-- PDV apunta a zona_comercial; ciudad y región se deducen por JOIN.
-- ============================================================

CREATE TABLE regiones (
    id_region   INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL,
    codigo      VARCHAR(20) NULL,
    UNIQUE KEY uq_region_desc (descripcion)
) ENGINE=InnoDB COMMENT='Nivel 1 de la jerarquía geográfica';

CREATE TABLE ciudades (
    id_ciudad   INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_region   INT          NOT NULL,
    descripcion VARCHAR(100) NOT NULL,
    codigo      VARCHAR(20)  NULL,
    CONSTRAINT fk_ciudad_region
        FOREIGN KEY (id_region) REFERENCES regiones (id_region)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_ciudad_region (descripcion, id_region),
    INDEX idx_ciudad_region (id_region)
) ENGINE=InnoDB COMMENT='Nivel 2 de la jerarquía geográfica';

CREATE TABLE zonas_comerciales (
    id_zona_comercial INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_ciudad         INT         NOT NULL,
    zona              VARCHAR(50) NOT NULL,
    codigo_zona       VARCHAR(50) NOT NULL,
    CONSTRAINT fk_zona_ciudad
        FOREIGN KEY (id_ciudad) REFERENCES ciudades (id_ciudad)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_zona_codigo (codigo_zona),
    INDEX idx_zona_ciudad (id_ciudad)
) ENGINE=InnoDB COMMENT='Nivel 3 de la jerarquía geográfica';

-- ============================================================
-- BLOQUE 2 — CATÁLOGOS
-- ============================================================

CREATE TABLE tipo_suministros (
    id_tipo_suministro INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion        VARCHAR(60) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE estado_suministros (
    id_estado_suministro INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion          VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE estado_pedidos (
    id_estado_pedido INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion      VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE estado_pdvs (
    id_estado_pdv INT         NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion   VARCHAR(30) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE grupo_pdvs (
    id_grupo_pdv     INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion      VARCHAR(30)   NOT NULL,
    monto_autorizado DECIMAL(12,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB;

CREATE TABLE departamentos (
    id_departamento INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion     VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE proveedores (
    id_proveedor     INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre_proveedor VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

-- ============================================================
-- BLOQUE 3 — ROLES Y PERMISOS DINÁMICOS
-- Agregar permiso = INSERT en 'permisos' + INSERT en 'rol_has_permisos'.
-- Sin ALTER TABLE, sin deploy de código.
-- ============================================================

CREATE TABLE roles (
    id_rol      INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE permisos (
    id_permiso  INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    codigo      VARCHAR(50)  NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    UNIQUE KEY uq_permiso_codigo (codigo)
) ENGINE=InnoDB COMMENT='Catálogo maestro de permisos. Extensible sin ALTER TABLE.';

CREATE TABLE rol_has_permisos (
    id_rol     INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    CONSTRAINT fk_rhp_rol
        FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rhp_permiso
        FOREIGN KEY (id_permiso) REFERENCES permisos (id_permiso)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- BLOQUE 4 — PRESUPUESTOS PERIÓDICOS
-- Un registro por (departamento, año, mes). Sin reset manual.
-- mes = 0 representa presupuesto anual consolidado.
-- ============================================================

CREATE TABLE presupuesto_departamentos (
    id_presupuesto_departamento INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_departamento             INT           NOT NULL,
    periodo_anio                SMALLINT      NOT NULL COMMENT 'Ej: 2024, 2025',
    periodo_mes                 TINYINT       NOT NULL COMMENT '1..12; 0 = presupuesto anual',
    monto_autorizado            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    monto_ejecutado             DECIMAL(12,2) NOT NULL DEFAULT 0.00
        COMMENT 'Actualizado al aprobar pedidos; evita SUM() en cada consulta',
    CONSTRAINT fk_pres_depto
        FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_pres_depto_periodo (id_departamento, periodo_anio, periodo_mes),
    INDEX idx_pres_periodo (periodo_anio, periodo_mes),
    CONSTRAINT chk_mes CHECK (periodo_mes BETWEEN 0 AND 12)
) ENGINE=InnoDB COMMENT='Un registro por departamento/periodo. Sin reset manual de montos.';

-- ============================================================
-- BLOQUE 5 — SUPERVISORES
-- ============================================================

CREATE TABLE supervisores (
    id_supervisor  INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombres        VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NULL,
    telefono       VARCHAR(20)  NULL,
    activo         TINYINT(1)   NOT NULL DEFAULT 1,
    fecha_registro DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- BLOQUE 6 — PDV (Punto de Venta)
-- 'codigo_centro_costo' es el único identificador del PDV.
-- 'descripcion' eliminada por ser alias redundante del código.
-- Ciudad y región se deducen: pdv → zona → ciudad → región.
-- ============================================================

CREATE TABLE pdvs (
    id_pdv                 INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_grupo_pdv           INT          NOT NULL,
    id_estado_pdv          INT          NOT NULL,
    id_zona_comercial      INT          NOT NULL,
    id_proveedor_principal INT          NULL,
    id_supervisor          INT          NULL,
    codigo_centro_costo    VARCHAR(20)  NOT NULL COMMENT 'Identificador único del PDV',
    direccion              VARCHAR(200) NULL,
    CONSTRAINT fk_pdv_grupo
        FOREIGN KEY (id_grupo_pdv) REFERENCES grupo_pdvs (id_grupo_pdv)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pdv_estado
        FOREIGN KEY (id_estado_pdv) REFERENCES estado_pdvs (id_estado_pdv)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pdv_zona
        FOREIGN KEY (id_zona_comercial) REFERENCES zonas_comerciales (id_zona_comercial)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pdv_prov
        FOREIGN KEY (id_proveedor_principal) REFERENCES proveedores (id_proveedor)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_pdv_supervisor
        FOREIGN KEY (id_supervisor) REFERENCES supervisores (id_supervisor)
        ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE KEY uq_pdv_codigo (codigo_centro_costo),
    INDEX idx_pdv_zona (id_zona_comercial),
    INDEX idx_pdv_supervisor (id_supervisor),
    INDEX idx_pdv_codigo (codigo_centro_costo)
) ENGINE=InnoDB COMMENT='PDV como entidad de identidad. Región/ciudad deducibles por JOIN.';

-- ============================================================
-- BLOQUE 7 — ROTACIÓN DE PROVEEDORES POR DEPARTAMENTO
-- ============================================================

CREATE TABLE departamento_proveedores_rotacion (
    id_rotacion     INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT NOT NULL,
    id_proveedor    INT NOT NULL,
    orden_rotacion  INT NOT NULL,
    CONSTRAINT fk_rot_dept
        FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_rot_prov
        FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_dept_orden (id_departamento, orden_rotacion)
) ENGINE=InnoDB;

-- ============================================================
-- BLOQUE 8 — USUARIOS
-- ============================================================

CREATE TABLE usuarios (
    id_usuario      INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_departamento INT          NOT NULL,
    id_rol          INT          NOT NULL,
    login           VARCHAR(60)  NOT NULL,
    password        VARCHAR(255) NULL,
    nombres         VARCHAR(100) NOT NULL,
    email           VARCHAR(100) NOT NULL,
    activo          TINYINT(1)   NOT NULL DEFAULT 1,
    fecha_registro  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_depto
        FOREIGN KEY (id_departamento) REFERENCES departamentos (id_departamento)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_user_rol
        FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    UNIQUE KEY uq_usuario_login (login),
    UNIQUE KEY uq_usuario_email (email),
    INDEX idx_usuario_login (login)
) ENGINE=InnoDB;

-- ============================================================
-- BLOQUE 9 — SUMINISTROS
-- Sin campo 'stock': el stock vive en suministro_proveedor_stock
-- porque es un atributo de la relación suministro+proveedor,
-- no del suministro en sí mismo.
-- ============================================================

CREATE TABLE suministros (
    id_suministro        INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_tipo_suministro   INT          NOT NULL,
    id_estado_suministro INT          NOT NULL,
    descripcion          VARCHAR(100) NOT NULL,
    fecha_actualizacion  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                      ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sum_tipo
        FOREIGN KEY (id_tipo_suministro) REFERENCES tipo_suministros (id_tipo_suministro)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_sum_estado
        FOREIGN KEY (id_estado_suministro) REFERENCES estado_suministros (id_estado_suministro)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_sum_descripcion (descripcion)
) ENGINE=InnoDB;

-- ============================================================
-- BLOQUE 10 — STOCK POR PROVEEDOR (mutable, independiente del precio)
-- Naturaleza: estado actual en tiempo real.
-- Se descuenta con UPDATE al aprobar un pedido.
-- No mezcla responsabilidades con el histórico de precios.
-- ============================================================

CREATE TABLE suministro_proveedor_stock (
    id_suministro INT NOT NULL,
    id_proveedor  INT NOT NULL,
    stock         INT NOT NULL DEFAULT 0,
    PRIMARY KEY (id_suministro, id_proveedor),
    CONSTRAINT fk_stock_sum
        FOREIGN KEY (id_suministro) REFERENCES suministros (id_suministro)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_stock_prov
        FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_stock_positivo CHECK (stock >= 0)
) ENGINE=InnoDB COMMENT='Stock actual por proveedor. Mutable. Descontado al aprobar pedido.';

-- ============================================================
-- BLOQUE 11 — HISTÓRICO DE PRECIOS (append-only, sin stock)
-- Precio vigente  = WHERE fecha_vigencia_hasta IS NULL
-- Precio histórico = todas las filas del suministro/proveedor
-- Nunca se hace UPDATE; se llama a sp_actualizar_precio().
-- ============================================================

CREATE TABLE suministros_precios (
    id_suministro_precio INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_suministro        INT           NOT NULL,
    id_proveedor         INT           NOT NULL,
    precio_compra        DECIMAL(12,2) NOT NULL,
    fecha_vigencia_desde DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_vigencia_hasta DATETIME      NULL DEFAULT NULL
        COMMENT 'NULL = precio vigente actualmente',
    registrado_por       INT           NULL,
    CONSTRAINT fk_pre_sum
        FOREIGN KEY (id_suministro) REFERENCES suministros (id_suministro)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pre_prov
        FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_pre_user
        FOREIGN KEY (registrado_por) REFERENCES usuarios (id_usuario)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_precio_vigente   (id_suministro, id_proveedor, fecha_vigencia_hasta),
    INDEX idx_precio_historico (id_suministro, fecha_vigencia_desde)
) ENGINE=InnoDB COMMENT='Append-only. Precio vigente = fecha_vigencia_hasta IS NULL.';

-- ============================================================
-- BLOQUE 12 — PEDIDOS
-- ============================================================

CREATE TABLE cabecera_pedidos (
    id_pedido                INT      NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario               INT      NOT NULL,
    id_pdv                   INT      NULL,
    id_estado_pedido         INT      NOT NULL,
    fecha_registro           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones_aprobacion TEXT     NULL,
    motivo_rechazo           TEXT     NULL,
    CONSTRAINT fk_cab_user
        FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_cab_pdv
        FOREIGN KEY (id_pdv) REFERENCES pdvs (id_pdv)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_cab_est
        FOREIGN KEY (id_estado_pedido) REFERENCES estado_pedidos (id_estado_pedido)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_pedido_fecha   (fecha_registro),
    INDEX idx_pedido_usuario (id_usuario),
    INDEX idx_pedido_pdv     (id_pdv),
    INDEX idx_pedido_estado  (id_estado_pedido)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedidos (
    id_detalle_pedido INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_pedido         INT           NOT NULL,
    id_suministro     INT           NOT NULL,
    id_proveedor      INT           NULL,
    cantidad          INT           NOT NULL,
    precio_unitario   DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_det_ped
        FOREIGN KEY (id_pedido) REFERENCES cabecera_pedidos (id_pedido)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_det_sum
        FOREIGN KEY (id_suministro) REFERENCES suministros (id_suministro)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_det_prov
        FOREIGN KEY (id_proveedor) REFERENCES proveedores (id_proveedor)
        ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_det_pedido     (id_pedido),
    INDEX idx_det_suministro (id_suministro)
) ENGINE=InnoDB;

-- ============================================================
-- BLOQUE 13 — PROCEDIMIENTOS ALMACENADOS
-- ============================================================

-- sp_actualizar_precio: append-only puro.
-- El backend llama este SP; nunca hace UPDATE/INSERT directo.
DELIMITER $$
CREATE PROCEDURE sp_actualizar_precio(
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
END$$
DELIMITER ;

-- sp_aprobar_pedido: descuenta stock y cambia estado en una sola transacción.
-- El backend llama este SP al aprobar; nunca maneja el stock manualmente.
DELIMITER $$
CREATE PROCEDURE sp_aprobar_pedido(
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
END$$
DELIMITER ;

-- ============================================================
-- BLOQUE 14 — VISTAS DE NEGOCIO
-- Eliminan lógica repetida en el backend.
-- ============================================================

-- Precio vigente por suministro/proveedor
CREATE OR REPLACE VIEW v_precio_vigente AS
SELECT
    sp.id_suministro,
    s.descripcion      AS suministro,
    sp.id_proveedor,
    p.nombre_proveedor,
    sp.precio_compra,
    sp.fecha_vigencia_desde
FROM suministros_precios sp
JOIN suministros s ON s.id_suministro = sp.id_suministro
JOIN proveedores  p ON p.id_proveedor  = sp.id_proveedor
WHERE sp.fecha_vigencia_hasta IS NULL;

-- Stock + precio vigente en una sola consulta
CREATE OR REPLACE VIEW v_catalogo_disponible AS
SELECT
    s.id_suministro,
    s.descripcion           AS suministro,
    ts.descripcion          AS tipo,
    p.id_proveedor,
    p.nombre_proveedor,
    sp.precio_compra        AS precio_vigente,
    sps.stock
FROM suministros s
JOIN tipo_suministros           ts  ON ts.id_tipo_suministro   = s.id_tipo_suministro
JOIN suministro_proveedor_stock sps ON sps.id_suministro        = s.id_suministro
JOIN proveedores                p   ON p.id_proveedor           = sps.id_proveedor
JOIN suministros_precios        sp  ON sp.id_suministro         = s.id_suministro
                                   AND sp.id_proveedor          = sps.id_proveedor
                                   AND sp.fecha_vigencia_hasta IS NULL
WHERE sps.stock > 0;

-- PDV con ubicación completa deducida por JOIN
CREATE OR REPLACE VIEW v_pdv_ubicacion AS
SELECT
    pdv.id_pdv,
    pdv.codigo_centro_costo,
    pdv.direccion,
    z.zona              AS zona_comercial,
    c.descripcion       AS ciudad,
    r.descripcion       AS region,
    gp.descripcion      AS grupo,
    gp.monto_autorizado AS monto_grupo,
    ep.descripcion      AS estado,
    s.nombres           AS supervisor,
    s.email             AS email_supervisor
FROM pdvs pdv
JOIN zonas_comerciales z   ON z.id_zona_comercial = pdv.id_zona_comercial
JOIN ciudades          c   ON c.id_ciudad          = z.id_ciudad
JOIN regiones          r   ON r.id_region          = c.id_region
JOIN grupo_pdvs        gp  ON gp.id_grupo_pdv      = pdv.id_grupo_pdv
JOIN estado_pdvs       ep  ON ep.id_estado_pdv     = pdv.id_estado_pdv
LEFT JOIN supervisores s   ON s.id_supervisor      = pdv.id_supervisor;

-- Presupuesto con saldo calculado
CREATE OR REPLACE VIEW v_presupuesto_actual AS
SELECT
    d.descripcion                                      AS departamento,
    pd.periodo_anio,
    pd.periodo_mes,
    pd.monto_autorizado,
    pd.monto_ejecutado,
    (pd.monto_autorizado - pd.monto_ejecutado)         AS saldo
FROM presupuesto_departamentos pd
JOIN departamentos d ON d.id_departamento = pd.id_departamento;

-- Permisos efectivos por rol
CREATE OR REPLACE VIEW v_rol_permisos AS
SELECT
    r.id_rol,
    r.descripcion  AS rol,
    p.codigo       AS permiso,
    p.descripcion  AS descripcion_permiso
FROM rol_has_permisos rhp
JOIN roles    r ON r.id_rol     = rhp.id_rol
JOIN permisos p ON p.id_permiso = rhp.id_permiso;

-- ============================================================
-- BLOQUE 15 — DATOS SEMILLA
-- ============================================================

INSERT INTO tipo_suministros (descripcion) VALUES ('Oficina'), ('Limpieza');
INSERT INTO estado_suministros (descripcion) VALUES ('Disponible'), ('No Disponible');
INSERT INTO estado_pedidos (descripcion) VALUES ('En espera'), ('Aprobado'), ('Rechazado');
INSERT INTO estado_pdvs (descripcion) VALUES ('Activo'), ('Inactivo');

INSERT INTO grupo_pdvs (descripcion, monto_autorizado) VALUES
('PEQUENO A', 15.00), ('PEQUENO B', 18.00), ('MEDIANO', 20.00),
('GRANDE', 25.00), ('ESPECIAL', 35.00);

INSERT INTO departamentos (descripcion) VALUES
('Administracion'), ('Auditoria'), ('Comercial'), ('Contabilidad'),
('Directorio'), ('Financiero'), ('Mantenimiento'), ('Procesos BI'),
('Supply Chain'), ('Talento Humano'), ('Tecnologia'), ('Tesoreria'),
('Trade Marketing');

INSERT INTO roles (descripcion) VALUES ('Solicitador'), ('Aprobador'), ('Administrador');

INSERT INTO permisos (codigo, descripcion) VALUES
('PEDIDOS',       'Puede crear y gestionar pedidos propios'),
('REPORTES',      'Puede visualizar reportes globales'),
('APROBACION',    'Puede aprobar o rechazar pedidos de otros'),
('CONFIGURACION', 'Puede acceder a la configuración del sistema');

-- Solicitador: solo PEDIDOS
INSERT INTO rol_has_permisos (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM roles r, permisos p
WHERE r.descripcion = 'Solicitador' AND p.codigo = 'PEDIDOS';

-- Aprobador: PEDIDOS + REPORTES + APROBACION
INSERT INTO rol_has_permisos (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM roles r, permisos p
WHERE r.descripcion = 'Aprobador' AND p.codigo IN ('PEDIDOS','REPORTES','APROBACION');

-- Administrador: todos los permisos
INSERT INTO rol_has_permisos (id_rol, id_permiso)
SELECT r.id_rol, p.id_permiso
FROM roles r, permisos p
WHERE r.descripcion = 'Administrador';

-- ---- Geografía ----
INSERT INTO regiones (descripcion, codigo) VALUES
('Costa', 'CST'), ('Sierra', 'SRR'), ('Oriente', 'ORT'), ('Insular', 'INS');

INSERT INTO ciudades (id_region, descripcion, codigo) VALUES
((SELECT id_region FROM regiones WHERE descripcion='Costa'),  'BALZAR',    'BLZ'),
((SELECT id_region FROM regiones WHERE descripcion='Costa'),  'DURAN',     'DRN'),
((SELECT id_region FROM regiones WHERE descripcion='Costa'),  'GUAYAQUIL', 'GYE'),
((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'QUITO',     'UIO'),
((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'CUENCA',    'CUE');

INSERT INTO zonas_comerciales (id_ciudad, zona, codigo_zona) VALUES
((SELECT id_ciudad FROM ciudades WHERE descripcion='GUAYAQUIL'), 'COSTA_CENTRO_1', 'COSTCENT1'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='GUAYAQUIL'), 'COSTA_CENTRO_2', 'COSTCENT2'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='GUAYAQUIL'), 'COSTA_NORTE',    'COSTNORT'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='GUAYAQUIL'), 'COSTA_SUR',      'COSTSUR'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='DURAN'),     'DURAN',          'DURAN'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='GUAYAQUIL'), 'GUAYAS_1',       'GUAYAS1'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='GUAYAQUIL'), 'GUAYAS_2',       'GUAYAS2'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='BALZAR'),    'ORIENTE',        'ORIENTE'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='CUENCA'),    'SIERRA_CENTRO',  'SIERCENT'),
((SELECT id_ciudad FROM ciudades WHERE descripcion='QUITO'),     'SIERRA_NORTE',   'SIERNORT');

INSERT INTO proveedores (nombre_proveedor) VALUES ('Insumos Iris'), ('Insumos Orieta');

INSERT INTO supervisores (nombres, email) VALUES
('Ligia Rodriguez', 'ligia.rodriguez@fundacioncrisfe.org'),
('Fernando Vera',   'fernando.vera@fundacioncrisfe.org');

-- ---- Suministros ----
INSERT INTO suministros (id_tipo_suministro, id_estado_suministro, descripcion) VALUES
(2,1,'AMBIENTAL EN PASTILLA'),
(2,1,'CLORO AL 3% 1GL'),
(2,1,'DESINFECTANTE GALON'),
(2,1,'DETERGENTE EN POLVO 1kilo'),
(2,1,'DILUYENTE'),
(2,1,'ESCOBA'),
(2,1,'ESPONJA LAVAPLATOS'),
(2,1,'FRANELA 50X30'),
(2,1,'FUNDA 18"X22" PAQUETE 10U NEGRA'),
(2,1,'FUNDA 23X28 PAQUETE NEGRA'),
(2,1,'FUNDA 38"X55" NEGRA MUERTO 10U'),
(2,1,'JABON LIQUIDO'),
(2,1,'JERGA TRAPEADOR'),
(2,1,'LIMPIAVIDRIO S/ATOMIZADOR'),
(2,1,'LUSTRE VERDE'),
(2,1,'MANO DE OSO'),
(2,1,'PAPEL HIGIENICO P/DISPENSADOR'),
(2,1,'TOALLA DE MANO RECTANGULARES'),
(2,1,'VALDE 12L'),
(2,1,'WIPE'),
(1,1,'BOLIGRAFO BIC P/MEDIO AZUL'),
(1,1,'BOLIGRAFO BIC P/MEDIO NEGRO'),
(1,1,'BOLIGRAFO BIC P/MEDIO ROJO'),
(1,1,'CAJA DE GRAPAS 26/6'),
(1,1,'CALCULADORA'),
(1,1,'CINTA DE EMBALAJE'),
(1,1,'CUADERNO UNIVERSITARIO CUADRO 100H'),
(1,1,'FOLDER ARCHIVADOR'),
(1,1,'GRAPADORA'),
(1,1,'MARCADOR BORRABLE AZUL'),
(1,1,'MARCADOR BORRABLE NEGRO'),
(1,1,'MARCADOR BORRABLE ROJO'),
(1,1,'MARCADOR PERMANENTE AZUL'),
(1,1,'MARCADOR PERMANENTE NEGRO'),
(1,1,'MARCADOR PERMANENTE ROJO'),
(1,1,'RESALTADOR'),
(1,1,'RESMA 75G PAPEL BOND A4 REPORT/NORMA'),
(1,1,'SOBRE MANILA A4 F3'),
(1,1,'TIJERAS 5" PUNTA REDONDA');

-- ---- Stock inicial por proveedor ----
INSERT INTO suministro_proveedor_stock (id_suministro, id_proveedor, stock)
SELECT s.id_suministro, p.id_proveedor, 100
FROM suministros s
CROSS JOIN proveedores p;

-- ---- Precios iniciales vía SP (garantiza integridad del histórico) ----
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='AMBIENTAL EN PASTILLA'),1,1.42,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='AMBIENTAL EN PASTILLA'),2,1.47,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CLORO AL 3% 1GL'),1,2.26,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CLORO AL 3% 1GL'),2,2.26,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='DESINFECTANTE GALON'),1,3.42,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='DESINFECTANTE GALON'),2,3.42,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='DETERGENTE EN POLVO 1kilo'),1,2.59,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='DETERGENTE EN POLVO 1kilo'),2,1.24,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='DILUYENTE'),1,3.83,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='DILUYENTE'),2,1.64,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='ESCOBA'),1,2.50,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='ESCOBA'),2,2.47,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='ESPONJA LAVAPLATOS'),1,0.73,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='ESPONJA LAVAPLATOS'),2,0.40,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FRANELA 50X30'),1,1.03,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FRANELA 50X30'),2,0.98,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FUNDA 18"X22" PAQUETE 10U NEGRA'),1,0.49,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FUNDA 18"X22" PAQUETE 10U NEGRA'),2,0.83,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FUNDA 23X28 PAQUETE NEGRA'),1,0.96,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FUNDA 23X28 PAQUETE NEGRA'),2,0.74,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FUNDA 38"X55" NEGRA MUERTO 10U'),1,3.09,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FUNDA 38"X55" NEGRA MUERTO 10U'),2,3.09,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='JABON LIQUIDO'),1,3.56,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='JABON LIQUIDO'),2,1.20,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='JERGA TRAPEADOR'),1,3.58,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='JERGA TRAPEADOR'),2,4.32,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='LIMPIAVIDRIO S/ATOMIZADOR'),1,2.83,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='LIMPIAVIDRIO S/ATOMIZADOR'),2,0.56,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='LUSTRE VERDE'),1,0.73,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='LUSTRE VERDE'),2,0.63,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MANO DE OSO'),1,3.74,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MANO DE OSO'),2,2.48,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='PAPEL HIGIENICO P/DISPENSADOR'),1,3.33,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='PAPEL HIGIENICO P/DISPENSADOR'),2,3.39,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='TOALLA DE MANO RECTANGULARES'),1,3.21,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='TOALLA DE MANO RECTANGULARES'),2,3.21,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='VALDE 12L'),1,4.59,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='VALDE 12L'),2,3.60,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='WIPE'),1,1.50,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='WIPE'),2,0.78,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='BOLIGRAFO BIC P/MEDIO AZUL'),1,0.41,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='BOLIGRAFO BIC P/MEDIO AZUL'),2,0.40,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='BOLIGRAFO BIC P/MEDIO NEGRO'),1,0.41,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='BOLIGRAFO BIC P/MEDIO NEGRO'),2,0.40,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='BOLIGRAFO BIC P/MEDIO ROJO'),1,0.41,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='BOLIGRAFO BIC P/MEDIO ROJO'),2,0.40,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CAJA DE GRAPAS 26/6'),1,1.44,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CAJA DE GRAPAS 26/6'),2,1.11,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CALCULADORA'),1,5.79,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CALCULADORA'),2,9.22,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CINTA DE EMBALAJE'),1,1.44,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CINTA DE EMBALAJE'),2,1.44,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CUADERNO UNIVERSITARIO CUADRO 100H'),1,1.82,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='CUADERNO UNIVERSITARIO CUADRO 100H'),2,1.82,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FOLDER ARCHIVADOR'),1,3.49,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='FOLDER ARCHIVADOR'),2,2.70,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='GRAPADORA'),1,4.43,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='GRAPADORA'),2,3.38,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR BORRABLE AZUL'),1,0.75,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR BORRABLE AZUL'),2,0.84,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR BORRABLE NEGRO'),1,0.75,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR BORRABLE NEGRO'),2,0.84,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR BORRABLE ROJO'),1,0.75,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR BORRABLE ROJO'),2,0.84,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR PERMANENTE AZUL'),1,0.65,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR PERMANENTE AZUL'),2,0.65,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR PERMANENTE NEGRO'),1,0.65,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR PERMANENTE NEGRO'),2,0.65,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR PERMANENTE ROJO'),1,0.65,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='MARCADOR PERMANENTE ROJO'),2,0.65,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='RESALTADOR'),1,0.71,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='RESALTADOR'),2,0.64,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='RESMA 75G PAPEL BOND A4 REPORT/NORMA'),1,3.80,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='RESMA 75G PAPEL BOND A4 REPORT/NORMA'),2,3.54,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='SOBRE MANILA A4 F3'),1,0.18,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='SOBRE MANILA A4 F3'),2,0.12,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='TIJERAS 5" PUNTA REDONDA'),1,0.73,NULL);
CALL sp_actualizar_precio((SELECT id_suministro FROM suministros WHERE descripcion='TIJERAS 5" PUNTA REDONDA'),2,0.46,NULL);

-- ---- PDVs ----
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal) VALUES
('FC004',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC005',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC006',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC095',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC096',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC097',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC098',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC099',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC100',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC101',4,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC102',4,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC103',4,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC104',4,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC105',4,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC106',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC107',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC108',3,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC109',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC110',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),2),
('FC007',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC008',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC009',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC010',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC011',3,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC012',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC013',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC014',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC015',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC016',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC017',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC018',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC019',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC020',5,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC021',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC022',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC023',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC024',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC025',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC026',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC027',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC028',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC029',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC030',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC031',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC032',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC033',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC035',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC042',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC043',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),1),
('FC034',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),1),
('FC036',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),1),
('FC037',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),1),
('FC044',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),1),
('FC045',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),1),
('FC046',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),1),
('FC038',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),1),
('FC039',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),1),
('FC040',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),1),
('FC041',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),1),
('FC050',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),1),
('FC051',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),1),
('FC055',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),1),
('FC074',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC081',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC165',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC166',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC167',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC168',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC169',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC170',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC171',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC172',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC173',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC174',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC176',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC177',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC178',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC179',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC180',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),2),
('FC181',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC182',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC183',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC184',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC185',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC190',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC191',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC192',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC212',3,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),1),
('FC186',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),1),
('FC187',2,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),1),
('FC189',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),1),
('FC205',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),1),
('FC206',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),1),
('FC207',1,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),1),
('FC211',3,1,(SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),1);

-- ---- Presupuestos iniciales (2024, periodo anual) ----
INSERT INTO presupuesto_departamentos (id_departamento, periodo_anio, periodo_mes, monto_autorizado)
SELECT
    d.id_departamento,
    2024,
    0,
    CASE WHEN d.descripcion = 'Tecnologia' THEN 50.00 ELSE 0.00 END
FROM departamentos d;

-- ---- Rotación de proveedores ----
INSERT INTO departamento_proveedores_rotacion (id_departamento, id_proveedor, orden_rotacion) VALUES
((SELECT id_departamento FROM departamentos WHERE descripcion='Administracion'), 2, 1),
((SELECT id_departamento FROM departamentos WHERE descripcion='Administracion'), 1, 2);

-- ---- Usuario admin inicial ----
INSERT INTO usuarios (id_departamento, id_rol, login, password, nombres, email, activo)
VALUES (
    (SELECT id_departamento FROM departamentos WHERE descripcion='Tecnologia' LIMIT 1),
    (SELECT id_rol FROM roles WHERE descripcion='Administrador' LIMIT 1),
    'pasante.desarrollo',
    '123456',
    'Pasante Desarrollo',
    'pasante.desarrollo@farmcorp.com.ec',
    1
);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================