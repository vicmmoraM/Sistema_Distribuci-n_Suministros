-- ============================================================
-- SEED PDVs — generado desde DETALLE_PDV.xlsx
-- 242 PDVs activos | 3 cerrados | 32 ciudades nuevas | 10 supervisores nuevos
-- Idempotente: ON DUPLICATE KEY UPDATE / INSERT IGNORE
-- ============================================================
-- ---- Zona especial para PDVs cerrados ----
-- Requiere una ciudad/región ficticia como ancla
INSERT IGNORE INTO regiones (descripcion, codigo) VALUES ('Sin Region', 'N/A');
INSERT IGNORE INTO ciudades (id_region, descripcion, codigo)
VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sin Region'), 'Sin Ciudad', 'N/A');

INSERT IGNORE INTO zonas_comerciales (id_ciudad, zona, codigo_zona)
VALUES (
    (SELECT id_ciudad FROM ciudades WHERE descripcion='Sin Ciudad'),
    'CERRADA',
    'CERRADA'
);
-- ---- Ciudades nuevas ----
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'AMBATO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'BABA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'BABAHOYO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'BAGATELA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'BALAO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Oriente'), 'BAÑOS DE AGUA SANTA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'CALUMA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'CAYAMBE');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'DAULE');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'ECHEANDIA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'IBARRA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'JUJAN');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'LATACUNGA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'MOCACHE');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'NARANJAL');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'PALENQUE');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Oriente'), 'PELILEO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'PILLARO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'PUEBLO VIEJO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'PUJILI');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Oriente'), 'PUYO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'QUEVEDO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'RIOBAMBA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'RUMIÑAHUI');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'SALCEDO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'SANTO DOMINGO');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Sierra'), 'SAQUISILI');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Oriente'), 'TENA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'URDANETA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'VALENCIA');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'VENTANAS');
INSERT IGNORE INTO ciudades (id_region, descripcion) VALUES ((SELECT id_region FROM regiones WHERE descripcion='Costa'), 'VINCES');

-- ---- Supervisores nuevos ----
INSERT IGNORE INTO supervisores (nombres) VALUES ('Lorena Velasco');
INSERT IGNORE INTO supervisores (nombres) VALUES ('Roy Dougherty');
INSERT IGNORE INTO supervisores (nombres) VALUES ('Alexander Aman');
INSERT IGNORE INTO supervisores (nombres) VALUES ('Lady Garcia');
INSERT IGNORE INTO supervisores (nombres) VALUES ('Narcisa León');
INSERT IGNORE INTO supervisores (nombres) VALUES ('Mary Oyague');
INSERT IGNORE INTO supervisores (nombres) VALUES ('Lorena  Granda');
INSERT IGNORE INTO supervisores (nombres) VALUES ('Dario Sanchez');

-- ---- PDVs activos (242) ----
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC004', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'BAL ROMULO RENDON Y VINCES CALLE ROMULO RENDON Y VINCES FRENTE A ALMACEN MIGUELITO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC005', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'BAL AV DAULE Y OLMEDO CALLE DAULE Y OLMEDO DIAGONAL AL HOTEL AZUAY')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC006', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'BAL AV DAULE Y VINCES AV DAULE Y VINCES REFERENCIA LAS 4 ESQUINAS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC007', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'GONZALO APARICIO SOLAR 7 Y ABEL GILBERT TRES')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC008', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'GONZALO APARICIO SOLAR 16 Y ABEL GILBERT TRES')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC009', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'LEON FEBRES CORDERO SOLAR 6 Y PRMAVERA DOS SECTOR 2 C')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC010', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'AV. JAIME ROLDOS AGUILERA SOLAR 5 Y JAIME ROLDOS MZ 51')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC011', 3, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'VIA DURAN BOLICHE SOLAR 1-2 Y ORAMAS GONZALEZ')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC012', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'AV AMAZONAS SOLAR 16 Y ABEL GILBERT PONTON UNO MZ 18')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC013', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'COOP. HECTOR COBOS ETAPA II MZ E SL 1')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC014', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'AV JAIME ROLDOS SOLAR 10 Y ABEL GILBERT PONTON 1 MZ 47')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC015', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'AV AMAZONAS SOLAR 1 Y ORAMAS GONZALEZ MZ 21 SL 1')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC016', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'MERA SOLAR 1 Y ELSA BUCARAM MZ 3')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC017', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'AV SAMUEL CISNEROS SL 40 Y AV PEDRO VICENTE MALDONADO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC018', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'COOP. 2 DE MAYO MZ 1 SL 6 (LOS HELECHOS)')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC019', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'AV. JAIME ROLDOS SOLAR 1 MZ A')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC020', 5, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'SAMUEL CISNEROS 14 Y SAMUEL CISNEROS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC021', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'COOP ABEL G PONTON 2 SOLAR 3 Y DIVINO NIÑO MZ 24')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC022', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'ORAMAS GONZALEZ 40 MZ 8')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC023', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'CA DUR RECREO 4 ETAPA M428')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC024', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'CA CDLA EL RECREO 4 ETAPA M430 SL 1')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC025', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'CDLA. ANA MARIA DE OLMEDO MZ. 41 SOLAR 01')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC026', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'EL RECREO ETAPA I 01  MZ 119 CC MINI RECREO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC027', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'SAMUEL CISNEROS SOLAR 6 Y DIVINO NIÑO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC028', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'COOP UNION Y PROGRESO SOLAR 18 MZ M')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC029', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'COOP VIVIENDA 10 DE ENERO SOLAR 1 Y EL RECREO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC030', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'COOPERATIVA CINCO DE JUNIO BLOQUE G3 MZ. A SL. 1')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC031', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'LOS HELECHOS SL 11 Y SECTOR 2 MZ D5')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC032', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'COOPERATIVA CARLOS CARRERA MZ. E SL. 4, PARROQUIA DIVINO NIÑO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC033', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'CA DUR EL RECREO III 30 MZ 307 LOCAL 2')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC034', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'DAU AV. JUAN B. AGUIRRE Y CARLOS LUIS PLAZA DAÑIN')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC035', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'BAL CABECERA CANTONAL RECINTO SAN CARLOS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC036', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'SAL VIA SALITRE URB L´OGARE # 6')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC037', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'DAU LA T VIA A SALITRE SECTOR LA T SOLAR 20 B MZ 30')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC038', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'CHG PAQUISHA CDLA COMUNA CHONGON CALLE PAQUISHA MZ 34 # 2B')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC039', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'CHG VIA A LA COSTA KM 24 VIA A LA COSTA KM 24 MZ 138 SL 10')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC040', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'GYE PROGRESO BARRIO EL CONTROL BARRIO EL CONTROL')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC041', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'GYE PIAZA CEIBOS AV DEL BOMBERO  KM 6.5 NUM A - 26')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC042', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'NAR 10 DE AGOSTO CALLE 10 DE AGO Y EUGENIO ESPEJO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC043', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='DURAN'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Fernando Vera' LIMIT 1),
    'NAR GUAYAQUIL Y CUENCA CALLES GUAYAQUIL # 113 Y CUENCA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC044', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'JOSE MARIA EGAS SOLAR 13 Y ALBORADA TERCERA ETAPA MZ BK')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC045', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'AV FRANCISCO DE ORELLANA SOLAR 1 Y SAMANES SIETE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC046', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'CDLA ATARAZANA 1 MZ 45')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC047', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'COLINA DEL HIPODROMO SOLAR 1 Y SN')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC048', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'AV. CARLOS JULIO AROSEMENA SOLAR 6')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC049', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'EL LIMONAL SL 2 Y AUTOPISTA NARCISA DE JESUS MZ 2372')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC050', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'GARCIA MORENO SOLAR 8 MZ M')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC051', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '10 DE AGOSTO 3618 Y DECIMA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC052', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'CRISTOBAL COLON 3105 Y CALLE 11')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC053', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'PORTETE 2302 Y TULCAN')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC054', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'LA 27 AVA SN Y LA E')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC055', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'COLON 736 Y GUERRERO MARTI+E53+E57')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC056', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'CAPITAN NAJERA 504 A Y FEDERICO GODIN (LA ONCE)')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC057', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '38AVA 2629 Y CALLE C')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC058', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '38 AVA. 2201 Y FRANCISCO SEGURA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC059', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '25 AVA 1515 Y FRANCISCO DE SEGURA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC060', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '29AVA 1401 ENTRE PORTETE VENEZUELA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC061', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '25 AVA SN Y CALLE CH')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC062', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'LIZARDO GARCIA N6 Y EL ORO MZ 13')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC063', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '38 AVA 741 Y PORTETE MZ 1357')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC064', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '4 DE NOVIEMBRE 3600 Y LA 11AVA.')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC065', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'HUANCAVILCA 2107 Y LOS RIOS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC066', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '26 AVA SOL 23 Y CALLE N MZ 1287 SL 23')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC067', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '24 AVA Y GOMEZ RENDON ESQUINA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC068', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'PORTETE SN Y CALLE 34AVA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC069', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'PEDRO MONCAYO 2701 Y GOMEZ RENDON')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC070', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'VENEZUELA 2423 Y TUNGURAHUA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC071', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'COOP ACCION 5 Y CIVISMO Y LIBERTAD MZ 1348')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC072', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'CAPITAN NAJERA 3201 Y GALLEGOS LARA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC073', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'AVENIDA 9 DE OCTUBRE NUMERO 803B Y CALLE LOS RIOS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC074', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'CA AV. NATALIA JARRIN, N1-09 Y LIBERTAD')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC075', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    'FRANCISCO SEGURA 2519 Y GALLEGOS LARA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC076', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'AV DOMINGO COMIN SOLAR 23 Y LOS TULIPANES MZ 1136')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC077', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'LOS RIOS SOLAR 1 Y LAS ACACIAS MZ E-3')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC078', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'ROBERTO SERRANO R SOLAR 11 Y PRECOOP LOS ANGELES DEL GUASMO MZ 143 SOLAR 11')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC079', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'AV. RAUL CLEMENTE HUERTA SOLAR 1 MZ 4 GUASMO CENTRAL')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC080', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'AV ABDON CALDERON SOLAR 1 Y GUASMO MZ 244 GUASMO SUR')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC081', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'IBA CALLE SAN FRANCISCO #5-98 Y RIO PATATE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC082', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'GUASMO SUR CAUSA PROLETARIA MZ. 3496 SOLAR 16')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC083', 3, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'CALLE GONZALEZ SUAREZ Y CALLE SIMON BOLIVAR')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC084', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'GUASMO CENTRAL PRECOOPERATIVA CIUDAD DE VENECIA MZ. A SL. 11')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC085', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'GUASMO CENTRAL MZ. 1454 SOLAR 12 COOPERATIVA SIETE LAGOS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC086', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'COOPERATIVA MARÍA TORAL MZ. 4267 SOLAR 25 (LAS MALVINAS)')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC087', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'GUASMO SUR COOPERATIVA GUAYAS Y QUIL II, SOLAR 12, MZ. 2416')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC088', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'ISLA TRINITARIA, COOPERATIVA ELOY ALFARO MZ. 714 SOLAR 1, LOCAL 2 Y 3')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC089', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'COOP. UNIÓN DE BANANEROS ETAPA II MZ.2724 SL. 8A ETAPA 2')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC090', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'GUASMO CENTRAL SOLAR 8 Y SUR MZ 1772')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC091', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'GUASMO SUR CIUDADELA COOPERATIVA CAUSA PROLETARIA MZ. 4 CALLE ABDON CALDERON MUÑOZ SL. 1')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC092', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'COOPERATIVA NUEVO GUAYAQUIL SL.5 MZ. A, ISLA TRINITARIA, PARROQUIA XIMENA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC093', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'COOP CASITAS DEL GUASMO MZ 29 SL 2 GUASMO NORTE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC094', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'JUJ SUDAMERICANA CALLE 16 DE FEBRERO Y JAIME ROLDOS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC095', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'BAA AV. GUAYAQUIL AV GUAYAQUIL SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC096', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'ISL AV PRINCIPAL AV. PRINCIPAL S/N')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC097', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'BAA AV. GUAYAQUIL Y SUCRE Y 9 DE OCT')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC098', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'BAB CALLE G Y PRIMERA PIMOCHA CALLE G Y PRIMERA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC099', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'PAL BOLIVAR Y NICOLAS INFANTE CALLE BOLIVAR Y NICOLAS INFANTE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC100', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'PAL BOLIVAR Y 10 DE SEPTIEMBRE CALLE BOLIVAR Y 10 DE SEPT')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC101', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE BOLIVAR Y CALLEJON VERA BOLIVAR Y 10 DE AGOSTO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC102', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE 10 DE AGOSTO Y 9 DE OCTUBRE CALLE 10 DE AGOSTO S/N 9 DE OCTUBRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC103', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE 24 DE MAYO Y SUCRE SUCRE S/N24 MAYO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC104', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE BOLIVAR Y SUCRE BOLIVAR S/N SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC105', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE JOSE GOMEZ CARBO Y MEXICO JOSE GOMEZ CARBO S/N Y MEXICO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC106', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE BOLIVAR Y CORDOVA BOLIVAR S/N Y CORDOVA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC107', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE MI COMISARIATO VINCES CALLE CORDOVA Y HERBERTH')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC108', 3, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE AV. AQUILES CARRIEL Y CALLE MOCACHE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC109', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE 10 DE AGOSTO Y 13 DE ENERO CALLES 10 DE AGOSTO Y 13 DE ENERO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC110', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    'VCE 10 DE AGOSTO SECTOR NICARAGUA CALLE 10 DE AGOS REF')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC111', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'SJU CALLE AURORA ESTRADA # 2 CALLE AURORA ESTRADA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC112', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'PVJ DIVINO NINO FERMÍN CHAVEZ #: S/N INTERSECCIÓN: 7 DE FEBRERO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC113', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'RIC AV PINARGOTE II AV. PINARGOTE S/N Y LEONIDAS ICAZA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC114', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'BAB ABRAHAM FREYRE Y PRIMERA TRANSVERSAL')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC115', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'BAB ABRAHAN FREIRE EN 5 DE JUN Y AV URRUTIA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC116', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'SJU AURORA ESTRADA AURORA ESTRADA S/N')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC117', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'PVJ FERMIN CHAVEZ AV. FERMIN CHAVEZ Y AV. PANAMERICANA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC118', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'RIC AV PINARGOTE AV.PINARGOTE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC119', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'URD CARLO TOLA Y JUSTINO LANDIVAR BARRIO LA ROTONDA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC120', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'VTA BOLIVAR Y 10 DE AGOSTO CALLE BOLIVAR Y 10 DE AGOSTO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC121', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'VTA 10 DE NOVIEMBRE Y 28 DE MAYO CALLE 10 DE NOV Y 28 DE MAYO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC122', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'VTA QUITO Y ANTONIO JOSE DE SUCRE CALLES QUITO Y A JOSE DE SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC123', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'VTA 9 DE OCTUBRE Y JOSE MARIA VELASCO IBARRA CALLE 9 DE OCT Y JOSE MA VELASCO IBARRA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC124', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'VTA AV. SEMINARIO Y 28 DE MAYO CALLES AVE SEMINARIO Y 28 DE MAYO  REF')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC125', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE AV QUITO # 401 AV QUITO 401 Y CALLE PRINCIPAL')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC126', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE VIA PRINCIPAL COMUNA LA ESPERANZA CALLE 3ERA Y CALLE G')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC127', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'MOC 28 DE MAYO Y SEGUNDA CALLE 28 DE MAYO Y SEGUNDA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC128', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'MOC 28 DE MAYO 503 Y SUCRE CALLES 28 DE MAYO # 503 Y SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC129', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE 7 DE OCTUBRE Y SEPTIMA CALLE AV 7 DE OCTUBRE Y 7MA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC130', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE CALLE BOLIVAR Y SEXTA CALLE BOLIVAR Y SEXTA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC131', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE R. PAREDES ENTRE LIB NAC Y UNI POPULAR')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC132', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE JAIME ROLDOS SL18 CALLE 29 Y CALLE 30')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC133', 3, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE 7 DE OCTUBRE Y SEXTA CALLE 7 DE OCT # 600 Y SEXTA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC134', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE NUEVA ESPERANZA MZ 1 SL 02 Y 10 DE AGOSTO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC135', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE SIETE DE OCTUBRE Y DECIMA PRIMERA CALLES 7 DE OCTUBRE Y DECIMA PRIMERA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC136', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE AV CARLOS JULIO AROSEMENA Y WALTER ANDRADE AV CARLOS JULIO AROSEMENA SL  # 7 Y WALTER ANDRADE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC137', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'QUE AV WALTER ANDRADE AV WALTER ANDRADE 1613 Y CALLE 3ERA Y CALLE 4TA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC138', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'VAL PISTA ATERRIZAJE EL VERGEL')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC139', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'VAL 13 DE DICIEMBRE Y QUEVEDO AV 13 DE DIC Y QUEVEDO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC140', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB MALECON Y RICAURTE MALECON 9 DE OCT # 1301 Y RICAURTE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC141', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB CLEMENTE BAQUERIZO Y V MACHUCA CLEMENTE BAQUERIZO S/N VARGAS MACHUCA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC142', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB 5 DE JUNIO Y 9 DE NOVIEMBRE 5 DE JUNIO 1703 Y 9 DE NOVIEMBRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC143', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB LA AVENTURA LA VENTURA AV BENETAZZO S/N F/ POLICIA JUDICIAL')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC144', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB 5 DE JUNIO Y 27 DE MAYO 5 DE JUNIO 413 Y 27 DE MAYO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC145', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB AV 25 DE JUNIO Y AV BY PASS AV 25 DE JUNIO S/N INTERSECCIÓN Y  AV.  BY PASS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC146', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB GENERAL BARONA Y SUCRE GENERAL BARONA  S/N SUCRE,')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC147', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB 5 JUNIO Y CALDERON 5 DE JUNIO S/N Y CALDERON')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC148', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB OLMEDO Y 5 DE JUNIO OLMEDO S/N Y 5 DE JUNIO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC149', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB MI AHORRO 5 5 DE JUNIO Y 27 DE MAYO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC150', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB 10 AGOSTO Y M.ICAZA 10 DE AGOSTO Y MARTIN ICAZA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC151', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB P CARBO ENTRE 10 DE AGO Y 5 DE JUN')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC152', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB MARTIN ICAZA Y GENERAL BARONA REF')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC153', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB JUAN X MARCOS Y MARTIN ICAZA JUAN X MARCOSY MARTIN ICAZA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC154', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB CALDERON Y 5 DE JUNIO CALDERON Y 5 DE JUNIO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC155', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB AV BENETAZZO Y CALLE N CALLE AV BENETAZZO Y CALLE N')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC156', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB AV. 2 DE AGOSTO Y LOS ANGELES PUEBLO NUEVO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC157', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB. FEBRES CORDERO Y 9 DE OCTUBRE RECINTO MATA DE CACAO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC158', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB FLORES Y GENERAL BARONA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC159', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB 10 DE AGOSTO Y MEJIA CALLE 10 DE AGOSTO Y MEJIA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC160', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB AV 6 DE OCTUBRE AV 6 DE OCTUBRE # 115 Y CLEMENTE BAQUERIZO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC161', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB 10 DE AGOSTO Y RICAURTE CALLES 10 DE AGOSTO # 310 Y RICAURTE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC162', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB MEJIA Y GENERAL BARONA CALLE MEJIA #11 Y GENERAL BARONA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC163', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB JUAN X MARCOS Y MEJIA CALLE JUAN MARCOS Y MEJIA Y OLMEDO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC164', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'BAB 27 DE MAYO Y CUSTODIO SANCHEZ 27 DE MAYO Y CIUSTODIO SANCHEZ')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC165', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'CAY CALLE RESTAURACION ENTRE JUNIN Y SUCRE CALLES RESTAURACION S1-12')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC166', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO CALLE CUSUBAMBA OE4-394 Y PENIPE CALLE CUSUBAMBA # OE4394 Y PENIPE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC167', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AV MARTHA BUCARAM # 241-109 Y CALLE 10  REF')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC168', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO LUIS LOPEZ N125Y MARISCAL SUCRE CALLES LUIS LOPEZ # N125 Y MARISCAL SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC169', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AV ILALO Y ALONDRAS AV ILALO Y ALONDRAS EDIF CENTRO COMERCIAL LAS ALONDRAS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC170', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AV ELOY ALFARO Y CALLE JUAN MOLINEROS URB RON MUÑOZ II AV ELOY ALFARO Y JUAN MOLINEROS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC171', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AV AMAZONAS Y TOMAS DE BERLANGA AV AMAZONAS 42-104 Y TOMAS DE BERLANGA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC172', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO CALLES S7F Y PASAJE E15A PASAJE 715A  E15-31 Y PASAJE E15A')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC173', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AV 6 DE DIC Y PASAJE CALIFORNIA CALLES AV 6 DE DIC N36-131 Y PASAJE CALIFORNIA REF')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC174', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO REPUBLICA DOMINICANA Y ANTONIO RUIZ REPUBLICA DOMINICANA 82-04 Y ANTONIO RUIZ')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC176', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AV MARISCAL SUCRE Y MANUEL CORONADO AV MARISCAL SUCRE Y MANUEL CORONADO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC177', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO VOZ ANDES Y AV AMÉRICA CALLE VOZ ANDES 231 Y AV AMÉRICA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC178', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AV GENERAL ENRIQUEZ 4-25 Y PASAJE TOLITA AV. GENERAL ENRIQUEZ 4-25 Y PASAJE TOLITA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC179', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'RUM AV MARIANA DE JESUS Y PAZALEO CALLES : AV MARIANA DE JESUS Y PAZALEO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC180', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'RUM AV GRAL ENRIQUEZ Y SUCRE AV. GRAL ENRIQUEZ 3259 Y SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC181', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AVENIDA BOLIVARIANA Y JULIO JARAMILLO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC182', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CESAR AUGUSTO SALAZAR SN Y PEDRO VASCONES SEVILLA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC183', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AV LOS GUAYTAMBOS Y PASAJE LAS PIÑAS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC184', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'SERGIO NUÑEZ Y ANTONIO CLAVIJO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC185', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AV ATAHUALPA 615 Y IMBABURA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC186', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'ROCAFUERTE Y ELOY ALFARO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC187', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'AMBATO SN Y PASAJE ERMITA DE LA VIRGEN')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC189', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'AMBATO SN Y OSCAR EFREN REYES')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC190', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'BOLIVAR B279 Y NARVAEZ')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC191', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'ROCAFUERTE 155 Y SUCREPILLARO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC192', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AV UNIDAD NACIONAL SN Y ATAHUALPA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC193', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'SAN SILVESTRE SN Y COOP 15 DE AGOSTO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC194', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AVENIDA AMAZONAS 47-72 Y GUAYAQUIL')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC195', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'QUIJANO SN Y ORDOÑEZ Y TARQUI')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC196', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    '24 DE MAYO SN Y 24 DE JUNIO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC197', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CA SALC  GARCIA MORENO 5-34')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC198', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CA SALC  GARCIA MORENO Y ROCAFUERTE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC199', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CA SALC  GARCIA MORENO Y SN SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC200', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CA SALC  BELISARIO QUEVEDO S/N VICENTE MALDONADO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC201', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CA SALC  RICARDO GARCES SN SUCRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC202', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'UIO AVENIDA LA PRENSA N63-218 Y N63C Y CALLE MANTA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC203', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CA SAQ  24 DE MAYO 8-14 Y CARCHI')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC205', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'CESLAO MARIN SN AV ALBERTO ZAMBRANO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC206', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    '20 DE JULIO SN Y CESLAO MARIN')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC207', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'MANABI SN Y PASAJE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC208', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'AV ALBERTO ZAMBRANO SN Y VIA TARQUI')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC209', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'AMAZONAS SN Y FCO DE ORELLANA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC210', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'AV ALBERTO ZAMBRANO SN  (ALB)')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC211', 3, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'ORELLANA SN Y 27 DE FEBRERO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC212', 3, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AVENIDA DANIEL LEON B SN Y AV CARLOS ZAMBRANO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC213', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CALLE FEBRES CORDERO 1922 Y ESPEJO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC214', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AVENIDA LIZARZABURU L20 Y MF')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC215', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CALLE GUAYAQUIL 21-60 Y PICHINCHA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC216', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'AVENIDA DANIEL LEON B 44 47 Y EPICLACHIMA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC217', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    '15 DE NOVIEMBRE SN Y RIOBAMBA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC218', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'EDWIN ENRIQUEZ SN Y AV 15 DE NOVIEMBRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC219', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'AV 15 DE NOV SN Y MARIANA MONTESDEOCA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC220', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'BARRIO CENTRAL 323 Y SIMON BOLIVAR Y GARCIA MORENO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC221', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'TARQUI SN Y GUAMOTE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC222', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'SDO AV RÍO TOACHI 631 Y ABRAHAM CALAZACÓN')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC223', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'CLU LAS NARANJAS Y HEROES DEL CENEPA CALLE AV LAS NARANJAS Y HEROES DEL CENEPA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC224', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'IBA AV JAIME ROLDOS Y ANGEL MENESES AV JAIME ROLDOS Y ANGEL MENESES')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC225', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'IBA SANCHEZ Y CIFUENTES 15-15 Y ZENON CALLES SANCHEZ CIFUENTES 15-15 Y ZENON VILLACIS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC226', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'IBA AV RETORNO Y LA CALLE RIO CURARAY CALLES AV RETORNO 805 Y RIO CURARAY')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC227', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'LOJA S/N Y AV. 29 DE MAYO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC228', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'MEXICO N8 Y AV. GUAYAQUIL MZ 15')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC229', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'CALLE SANTA MARIA Y OTTO AROSEMENA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC230', 2, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Mary Oyague' LIMIT 1),
    'CALLE 7 DE OCTUBRE 8AVA Y EDIFICIO HOTEL CONTINENTAL MZ 1 SL 1')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC231', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'PVJ SAN JUAN CALLE AURORA ESTRADA Y SEMINARIO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC232', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'VICTOR H SAN MIGUEL SN Y AV 15 DE NOVIEMBRE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC233', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'PANZALEO E14-05 Y CAÑARIS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC234', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'CA VIVAR OE 052 ASCAZUBI - NAZACOTA PUENTO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC235', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'CALLE E13 ISLA MARCHENA  NUMERO N41 -31 Y AVENIDA LOS GRANADOS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC236', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'PVJ AVENIDA 8 DE AGOSTO NUMERO 1 PURETO PECHICHE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC237', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='GUAYAS2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena Velasco' LIMIT 1),
    'CALLE LAS LOJAS NUMERO 7 Y LA AURORA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC238', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'CALLE CLEMENTE BAQUERIZO CDLA EL MAMEY')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC239', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'CALLE JORGE CHACON CALICUCHIMA Y CALLE SAN PEDRO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC240', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CALLE SIMON BOLIVAR Y AVENIDA VELASCO IBARRA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC241', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'CALLE 9 DE OCTUBRE Y FRANCISCO DE ORELLANA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC242', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERCENT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lorena  Granda' LIMIT 1),
    'CALLE FELIX VALENCIA  NUMERO 7-13 Y 2 DE MAYO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC243', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT2'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Lady Garcia' LIMIT 1),
    'LOT MERCEDES VISCARRA Y AVENIDA MAGISTERIO')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC244', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='SIERNORT'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Alexander Aman' LIMIT 1),
    'AVENIDA AMARU ÑAN NUMERO OE 333 Y AVENIDA QUITUMBE')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC245', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTSUR'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Narcisa León' LIMIT 1),
    'CALLE MALECON Y CALLE 3ERA')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC246', 4, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='ORIENTE'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Dario Sanchez' LIMIT 1),
    'AVENIDA PEDRO VICENTE MALDONADO Y AVENIDA AMAZONAS')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC247', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Ligia Rodriguez' LIMIT 1),
    '')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC248', 1, 1,
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='COSTCENT1'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    (SELECT id_supervisor FROM supervisores WHERE nombres='Roy Dougherty' LIMIT 1),
    '')
ON DUPLICATE KEY UPDATE
    id_grupo_pdv=VALUES(id_grupo_pdv), id_zona_comercial=VALUES(id_zona_comercial),
    id_proveedor_principal=VALUES(id_proveedor_principal), id_supervisor=VALUES(id_supervisor),
    direccion=VALUES(direccion);

-- ---- PDVs cerrados → estado Inactivo ----
INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC175', 1,
    (SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion='Inactivo'),
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='CERRADA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Orieta'),
    NULL, NULL)
ON DUPLICATE KEY UPDATE id_estado_pdv=(SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion='Inactivo');

INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC188', 1,
    (SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion='Inactivo'),
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='CERRADA'),
    (SELECT id_proveedor FROM proveedores WHERE nombre_proveedor='Insumos Iris'),
    NULL, NULL)
ON DUPLICATE KEY UPDATE id_estado_pdv=(SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion='Inactivo');

INSERT INTO pdvs (codigo_centro_costo, id_grupo_pdv, id_estado_pdv, id_zona_comercial, id_proveedor_principal, id_supervisor, direccion)
VALUES ('FC204', 1,
    (SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion='Inactivo'),
    (SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona='CERRADA'),
    NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE id_estado_pdv=(SELECT id_estado_pdv FROM estado_pdvs WHERE descripcion='Inactivo');

CREATE TABLE zona_ventanas_pedido (
    id_ventana        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_zona_comercial INT NOT NULL,
    dia_inicio        TINYINT UNSIGNED NOT NULL COMMENT 'Día del mes desde el que se puede pedir (1-31)',
    dia_fin           TINYINT UNSIGNED NOT NULL COMMENT 'Día del mes hasta el que se puede pedir (1-31)',
    activo            TINYINT(1) NOT NULL DEFAULT 1,
    creado_en         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ventana_zona
        FOREIGN KEY (id_zona_comercial)
        REFERENCES zonas_comerciales(id_zona_comercial)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_dia_inicio CHECK (dia_inicio BETWEEN 1 AND 31),
    CONSTRAINT chk_dia_fin    CHECK (dia_fin    BETWEEN 1 AND 31),
    CONSTRAINT chk_rango_dias CHECK (dia_fin >= dia_inicio),

    -- Una zona solo puede tener una ventana activa a la vez
    UNIQUE KEY uq_zona_activa (id_zona_comercial, activo)
);


-- ------------------------------------------------------------
-- 3. SEED ventanas de pedido
-- Fuente: columna REGION de DETALLE_PDV.xlsx
-- COSTA  (COSTCENT1, COSTCENT2, COSTNORT, COSTSUR, DURAN, GUAYAS1, GUAYAS2): del 1 al 3
-- SIERRA (SIERCENT, SIERNORT) y ORIENTE: del 12 al 15
-- ------------------------------------------------------------
INSERT INTO zona_ventanas_pedido (id_zona_comercial, dia_inicio, dia_fin)
VALUES
    -- COSTA
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'COSTCENT1'),  1,  3),
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'COSTCENT2'),  1,  3),
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'COSTNORT'),   1,  3),
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'COSTSUR'),    1,  3),
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'DURAN'),      1,  3),
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'GUAYAS1'),    1,  3),
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'GUAYAS2'),    1,  3),

    -- SIERRA
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'SIERCENT'), 12, 15),
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'SIERNORT'), 12, 15),

    -- ORIENTE
    ((SELECT id_zona_comercial FROM zonas_comerciales WHERE codigo_zona = 'ORIENTE'),  12, 15);

