-- ============================================================
-- Migración: seguimiento de cupos disponibles por PDV
--            y monto ejecutado por departamento
-- ============================================================

-- 1) Añadir cupo_disponible a pdvs (si no existe)
--    Se inicializa desde grupo_pdvs.monto_autorizado al ejecutarse.
SET @col_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'pdvs'
    AND COLUMN_NAME  = 'cupo_disponible'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE pdvs ADD COLUMN cupo_disponible DECIMAL(12,2) NULL DEFAULT NULL COMMENT ''Cupo restante del periodo actual; NULL = sin pedidos aún''',
  'SELECT ''columna cupo_disponible ya existe'' AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Inicializar cupo_disponible = grupo.monto_autorizado donde aún es NULL
UPDATE pdvs p
JOIN grupo_pdvs gp ON gp.id_grupo_pdv = p.id_grupo_pdv
SET p.cupo_disponible = gp.monto_autorizado
WHERE p.cupo_disponible IS NULL;

-- 2) Añadir monto_ejecutado a presupuesto_departamentos (si no existe)
SET @col2_exists = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'presupuesto_departamentos'
    AND COLUMN_NAME  = 'monto_ejecutado'
);

SET @sql2 = IF(@col2_exists = 0,
  'ALTER TABLE presupuesto_departamentos ADD COLUMN monto_ejecutado DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT ''Actualizado al crear pedidos; evita SUM() en cada consulta''',
  'SELECT ''columna monto_ejecutado ya existe'' AS info'
);
PREPARE stmt FROM @sql2; EXECUTE stmt; DEALLOCATE PREPARE stmt;
