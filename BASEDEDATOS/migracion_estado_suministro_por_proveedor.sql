-- Migracion: disponibilidad por proveedor
-- Objetivo: que el estado (Disponible/No Disponible) sea por (id_suministro, id_proveedor)

START TRANSACTION;

-- Evita Error 1175 en clientes con SQL_SAFE_UPDATES = 1 (ej. MySQL Workbench)
SET @OLD_SQL_SAFE_UPDATES = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

-- 1) Agregar columna de estado por proveedor
SET @col_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'suministro_proveedor_stock'
    AND COLUMN_NAME = 'id_estado_suministro'
);
SET @sql_col := IF(
  @col_exists = 0,
  'ALTER TABLE suministro_proveedor_stock ADD COLUMN id_estado_suministro INT NULL AFTER stock',
  'SELECT 1'
);
PREPARE stmt_col FROM @sql_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

-- 2) Migrar estado global actual hacia cada relacion proveedor
UPDATE suministro_proveedor_stock sps
INNER JOIN suministros s ON s.id_suministro = sps.id_suministro
SET sps.id_estado_suministro = s.id_estado_suministro
WHERE sps.id_estado_suministro IS NULL;

-- 3) Endurecer regla y crear FK
ALTER TABLE suministro_proveedor_stock
  MODIFY COLUMN id_estado_suministro INT NOT NULL DEFAULT 1;

-- Crear indice solo si no existe
SET @idx_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'suministro_proveedor_stock'
    AND INDEX_NAME = 'idx_stock_estado_suministro'
);
SET @sql_idx := IF(
  @idx_exists = 0,
  'ALTER TABLE suministro_proveedor_stock ADD KEY idx_stock_estado_suministro (id_estado_suministro)',
  'SELECT 1'
);
PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Crear FK solo si no existe
SET @fk_exists := (
  SELECT COUNT(1)
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'suministro_proveedor_stock'
    AND CONSTRAINT_NAME = 'fk_stock_estado_suministro'
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @sql_fk := IF(
  @fk_exists = 0,
  'ALTER TABLE suministro_proveedor_stock ADD CONSTRAINT fk_stock_estado_suministro FOREIGN KEY (id_estado_suministro) REFERENCES estado_suministros (id_estado_suministro) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT 1'
);
PREPARE stmt_fk FROM @sql_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

COMMIT;

-- Restaurar configuracion original del cliente
SET SQL_SAFE_UPDATES = @OLD_SQL_SAFE_UPDATES;

-- Validacion sugerida:
-- SELECT sps.id_suministro, sps.id_proveedor, sps.stock, sps.id_estado_suministro, es.descripcion
-- FROM suministro_proveedor_stock sps
-- INNER JOIN estado_suministros es ON es.id_estado_suministro = sps.id_estado_suministro
-- LIMIT 20;
