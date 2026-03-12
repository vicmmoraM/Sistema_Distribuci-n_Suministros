-- Seguimiento del periodo del cupo de PDVs para reinicio automatico mensual.

SET @db_name = DATABASE();

SET @has_cupo_periodo_anio = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'pdvs'
    AND COLUMN_NAME = 'cupo_periodo_anio'
);

SET @sql = IF(
  @has_cupo_periodo_anio = 0,
  'ALTER TABLE pdvs ADD COLUMN cupo_periodo_anio INT NULL AFTER cupo_disponible',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_cupo_periodo_mes = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'pdvs'
    AND COLUMN_NAME = 'cupo_periodo_mes'
);

SET @sql = IF(
  @has_cupo_periodo_mes = 0,
  'ALTER TABLE pdvs ADD COLUMN cupo_periodo_mes INT NULL AFTER cupo_periodo_anio',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE pdvs
SET cupo_periodo_anio = YEAR(CURDATE()),
    cupo_periodo_mes = MONTH(CURDATE())
WHERE cupo_periodo_anio IS NULL
   OR cupo_periodo_mes IS NULL;