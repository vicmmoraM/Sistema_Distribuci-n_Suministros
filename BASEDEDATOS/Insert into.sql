use db_supplychain;
-- SUMINISTROS FALTANTES DE LIMPIEZA D:
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

-- SUMINISTROS FALTANTES DE OFICINA D:
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

INSERT INTO supervisores (nombres) VALUES 
('Roy Dougherty'),
('Alexander Aman'),
('Erick Corozo'),
('Xavier Vaca'),
('Lissette Coronel'),
('Cesar Macias'),
('Galo Cevallos');

INSERT IGNORE INTO supervisores (nombres) VALUES 
('Roy Dougherty'), ('Alexander Aman'), ('Erick Corozo'), 
('Xavier Vaca'), ('Lissette Coronel'), ('Cesar Macias'), ('Galo Cevallos');

-- -----------------------------------------------------
-- ACTUALIZACIÓN MASIVA DE LOCALES (Basado en el PDF)
-- -----------------------------------------------------

-- BALZAR - Ligia Rodriguez
UPDATE pdvs 
SET id_ciudad = (SELECT id_ciudad FROM ciudades WHERE descripcion = 'BALZAR' LIMIT 1),
    id_supervisor = (SELECT id_supervisor FROM supervisores WHERE nombres = 'Ligia Rodriguez' LIMIT 1)
WHERE descripcion IN ('FC004', 'FC005', 'FC006', 'FC095', 'FC096', 'FC097', 'FC098', 'FC099', 'FC100', 'FC101', 'FC102', 'FC103', 'FC104', 'FC105', 'FC106', 'FC107', 'FC108', 'FC109', 'FC110');

-- DURAN - Fernando Vera
UPDATE pdvs 
SET id_ciudad = (SELECT id_ciudad FROM ciudades WHERE descripcion = 'DURAN' LIMIT 1),
    id_supervisor = (SELECT id_supervisor FROM supervisores WHERE nombres = 'Fernando Vera' LIMIT 1)
WHERE descripcion IN ('FC007', 'FC008', 'FC009', 'FC010', 'FC011', 'FC012', 'FC013', 'FC014', 'FC015', 'FC016', 'FC017', 'FC018', 'FC019', 'FC020', 'FC021', 'FC022', 'FC023', 'FC024', 'FC025', 'FC026', 'FC027', 'FC028', 'FC029', 'FC030', 'FC031', 'FC032', 'FC033', 'FC035', 'FC042', 'FC043');

-- GUAYAQUIL - Roy Dougherty (Guayas 1)
UPDATE pdvs 
SET id_ciudad = (SELECT id_ciudad FROM ciudades WHERE descripcion = 'GUAYAQUIL' LIMIT 1),
    id_supervisor = (SELECT id_supervisor FROM supervisores WHERE nombres = 'Roy Dougherty' LIMIT 1)
WHERE descripcion IN ('FC034', 'FC036', 'FC037', 'FC044', 'FC045', 'FC046');

-- GUAYAQUIL - Alexander Aman (Guayas 2)
UPDATE pdvs 
SET id_ciudad = (SELECT id_ciudad FROM ciudades WHERE descripcion = 'GUAYAQUIL' LIMIT 1),
    id_supervisor = (SELECT id_supervisor FROM supervisores WHERE nombres = 'Alexander Aman' LIMIT 1)
WHERE descripcion IN ('FC038', 'FC039', 'FC040', 'FC041', 'FC050', 'FC051', 'FC055');

SET SQL_SAFE_UPDATES = 1;