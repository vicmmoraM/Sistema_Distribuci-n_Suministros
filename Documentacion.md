# Documentación Arquitectura de Software
## Sistema de susministros de pedidos - Farmcorp

> **Versión:** 1.0.0  
> **Fecha:** 2026-02-24  
> **Autor:** Área de Tecnología — FarmCorp  
> **Estado:** En desarrollo
---

## Tabla de contenidos 
1. [Descripción General](#1-descripción-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Modelo Entidad–Relación (ERD)](#3-modelo-entidadrelación-erd)
4. [Diccionario de Datos](#4-diccionario-de-datos)
5. [Estándares de Desarrollo](#5-estándares-de-desarrollo)
6. [Documentación de API](#6-documentación-de-api)
7. [Manual de Usuario](#7-manual-de-usuario)
8. [Manual de Administración](#8-manual-de-administración)

## 1. Descripción General

### 1.1 Propósito

El **Sistema de Pedidos de Suministros** permite a los colaboradores de FarmCorp solicitar suministros de oficina y limpieza para los Puntos de Venta (PDVs) activos, respetando el cupo asignado por grupo. El sistema genera un registro en base de datos y notifica al responsable por correo electrónico con el detalle en formato CSV.
