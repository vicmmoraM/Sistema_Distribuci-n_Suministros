# 📦 Sistema de Distribución de Suministros — Manual de Usuario

> **Farmcorp** · Sistema interno de gestión de solicitudes de suministros para Puntos de Venta (PDV) y departamentos internos.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Roles de Usuario](#roles-de-usuario)
3. [Flujo Completo: Pedido de un PDV](#flujo-completo-pedido-de-un-pdv)
   - [Paso 1 – Inicio de Sesión](#paso-1--inicio-de-sesión)
   - [Paso 2 – Identificación del Punto de Venta](#paso-2--identificación-del-punto-de-venta)
   - [Paso 3 – Selección de Suministros](#paso-3--selección-de-suministros)
   - [Paso 4 – Revisión del Carrito](#paso-4--revisión-del-carrito)
   - [Paso 5 – Envío del Pedido](#paso-5--envío-del-pedido)
   - [Paso 6 – Confirmación y Notificación](#paso-6--confirmación-y-notificación)
4. [Seguimiento del Pedido (Mis Pedidos)](#seguimiento-del-pedido-mis-pedidos)
5. [Flujo de Aprobación (Rol Financiero / Tecnología)](#flujo-de-aprobación-rol-financiero--tecnología)
6. [Estados del Pedido](#estados-del-pedido)
7. [Validaciones Importantes](#validaciones-importantes)
8. [Restricciones de Ventana de Pedidos](#restricciones-de-ventana-de-pedidos)
9. [Preguntas Frecuentes (FAQ)](#preguntas-frecuentes-faq)

---

## 📌 Descripción General

El **Sistema de Distribución de Suministros** permite a los Puntos de Venta (PDV) y departamentos internos de Farmcorp solicitar suministros de oficina y limpieza de manera digital, respetando cupos asignados, ventanas de tiempo habilitadas y un flujo de aprobación centralizado.

```
PDV realiza pedido → Sistema valida cupo y ventana → Email automático → Aprobador revisa → Pedido Aprobado / Rechazado
```

---

## 👥 Roles de Usuario

| Rol | Descripción | Puede hacer pedidos | Puede aprobar |
|-----|-------------|:-------------------:|:-------------:|
| **Comercial (PDV)** | Usuario asignado a un Punto de Venta | ✅ | ❌ |
| **Departamento** | Usuario de área interna (RRHH, TI, etc.) | ✅ | ❌ |
| **Financiero / Tecnología** | Responsable de aprobar solicitudes | ❌ | ✅ |
| **Administrador** | Gestión completa del sistema | ✅ | ✅ |

---

## 🔄 Flujo Completo: Pedido de un PDV

### Paso 1 – Inicio de Sesión

1. Ingresar al sistema con las credenciales corporativas (usuario y contraseña).
2. El sistema detecta automáticamente el **rol** y el **punto de venta** asociado al usuario.
3. Si el usuario pertenece al departamento **Comercial**, el sistema asignará automáticamente su PDV con base en el nombre de usuario.

> ⚠️ **Si no aparece un PDV asignado**, contactar al administrador del sistema para vincular el PDV a su usuario.

---

### Paso 2 – Identificación del Punto de Venta

Al ingresar al módulo **Inicio / Nuevo Pedido**, se mostrará automáticamente:

| Campo | Descripción |
|-------|-------------|
| **PDV** | Código del punto de venta asignado al usuario |
| **Ciudad** | Ciudad donde se ubica el PDV |
| **Cupo disponible** | Monto máximo autorizado para el pedido actual |

El cupo se muestra como referencia. **El sistema bloqueará el pedido si el total lo supera.**

---

### Paso 3 – Selección de Suministros

1. **Seleccionar el Tipo de Suministro** en el desplegable:
   - 🗂️ Suministros de Oficina
   - 🧹 Suministros de Limpieza

2. **Buscar el suministro** escribiendo el nombre o proveedor en el campo de búsqueda.
   - El sistema mostrará hasta 12 coincidencias con nombre y precio unitario.

3. **Indicar la cantidad** deseada (mínimo: 1, máximo: 10 unidades por ítem).

4. Hacer clic en **`+ Agregar`** para añadir el ítem al carrito.

> 💡 Puedes agregar múltiples suministros de distintos tipos antes de enviar el pedido.

---

### Paso 4 – Revisión del Carrito

El carrito muestra un resumen con:

| Columna | Descripción |
|---------|-------------|
| Descripción | Nombre del suministro |
| Tipo | Categoría (Oficina / Limpieza) |
| Cantidad | Unidades solicitadas |
| P. Unitario | Precio por unidad (tomado desde la base de datos) |
| Total | Subtotal por ítem |

Al pie del carrito se visualizan:
- **Total Oficina** — suma de todos los suministros de esa categoría
- **Total Limpieza** — suma de todos los suministros de esa categoría
- **Total General** — monto total del pedido

#### ⚠️ Indicador de Cupo Excedido

Si el total supera el cupo asignado al PDV, el sistema mostrará una alerta roja con la etiqueta `EXCEDIDO` y **deshabilitará el botón de envío** hasta que se eliminen o reduzcan ítems.

Para eliminar un ítem del carrito, hacer clic en el botón **`×`** junto al artículo correspondiente.

---

### Paso 5 – Envío del Pedido

Una vez revisado el carrito:

1. Hacer clic en el botón **`Realizar Pedido`**.
2. El sistema ejecuta las siguientes validaciones en el servidor:

```
✔ El PDV está activo en el sistema
✔ La fecha actual está dentro de la ventana de pedidos de la zona
✔ Cada suministro está habilitado para este PDV
✔ Los precios se recalculan desde la base de datos (no se confía en datos del frontend)
✔ El total no supera el cupo del PDV
```

> 🔒 **Seguridad**: Los precios y totales son siempre recalculados en el servidor para evitar manipulaciones.

---

### Paso 6 – Confirmación y Notificación

Tras un pedido exitoso:

- El sistema **registra el pedido** en la base de datos con estado **Pendiente**.
- Se genera automáticamente un **archivo CSV** con el detalle del pedido.
- Se envía un **correo electrónico automático** al equipo responsable con el CSV adjunto.
- El usuario es redirigido a una pantalla de **confirmación** indicando si el email fue enviado.

---

## 🔍 Seguimiento del Pedido (Mis Pedidos)

Para consultar el historial de pedidos realizados:

1. En el menú lateral, hacer clic en **Inicio** y luego seleccionar la pestaña **Mis Pedidos** (o usar el enlace `#mis-pedidos`).

2. Se mostrará la tabla de pedidos con:

| Columna | Descripción |
|---------|-------------|
| ID Pedido | Identificador único del pedido |
| Fecha | Fecha de registro |
| Artículos | Número de ítems en el pedido |
| Total | Monto total del pedido |
| Estado | Estado actual (Pendiente / Aprobado / Rechazado) |

### Filtros disponibles

- 🔎 Búsqueda por ID de pedido o nombre de suministro
- 📅 Rango de fechas (desde / hasta)
- 💰 Rango de monto (mínimo / máximo)
- 📌 Estado del pedido (Todos / Pendientes / Aprobados / Rechazados)

### Ver Detalle de un Pedido

Hacer clic en el ícono 👁️ junto al pedido para ver:

- Fecha, estado y total
- Lista de suministros solicitados con cantidades y precios
- **Observaciones de aprobación** (si fue aprobado con comentarios)
- **Motivo de rechazo** (si fue rechazado)

---

## ✅ Flujo de Aprobación (Rol Financiero / Tecnología)

Los usuarios con rol aprobador gestionan los pedidos desde el módulo **Aprobaciones**.

### Visualización de Pedidos Pendientes

1. Ingresar a **Aprobaciones → Pedidos**.
2. Se listan todos los pedidos con estado Pendiente o En espera, con filtros por:
   - ID / nombre del solicitante
   - Departamento
   - Estado
   - Rango de fechas

### Acciones disponibles por pedido

| Acción | Descripción |
|--------|-------------|
| 👁️ **Ver Detalle** | Muestra información completa del pedido e ítems |
| ✏️ **Editar ítems** | Permite ajustar cantidades o eliminar ítems antes de aprobar |
| ✅ **Aprobar** | Confirma el pedido; se puede agregar una observación opcional |
| ❌ **Rechazar** | Rechaza el pedido; el motivo de rechazo es **obligatorio** |

### Proceso de Aprobación

```
1. Abrir detalle del pedido
2. (Opcional) Editar cantidades de ítems si es necesario y guardar
3. Hacer clic en "Aprobar"
4. Confirmar la acción en el modal (agregar observación si aplica)
5. El pedido cambia a estado "Aprobado"
```

### Proceso de Rechazo

```
1. Hacer clic en "Rechazar" (desde la tabla o el modal de detalle)
2. Ingresar el motivo del rechazo (campo obligatorio)
3. Confirmar → el pedido cambia a estado "Rechazado"
4. El PDV podrá ver el motivo en su historial "Mis Pedidos"
```

---

## 🏷️ Estados del Pedido

```
Pendiente ──→ Aprobado
     └──────→ Rechazado
```

| Estado | Color | Descripción |
|--------|-------|-------------|
| 🟡 **Pendiente** | Amarillo | El pedido fue enviado y espera revisión |
| 🟢 **Aprobado** | Verde | El pedido fue aprobado por el área responsable |
| 🔴 **Rechazado** | Rojo | El pedido fue rechazado (ver motivo en el detalle) |
| 🔵 **En espera** | Azul | El pedido está en un estado intermedio de revisión |
| ✅ **Entregado** | Verde oscuro | Los suministros han sido entregados al PDV |

---

## 🛡️ Validaciones Importantes

El sistema aplica las siguientes validaciones automáticas al momento de enviar un pedido:

| Validación | Descripción |
|------------|-------------|
| **PDV activo** | El punto de venta debe estar activo en el sistema |
| **Ventana de pedidos** | Solo se permite pedir en los días habilitados por zona |
| **Suministro permitido** | Solo se muestran y aceptan suministros habilitados para ese PDV |
| **Cantidad válida** | Mínimo 1, máximo 10 unidades por suministro |
| **Cupo no excedido** | El total del pedido no puede superar el cupo asignado al PDV |
| **Precios desde BD** | El servidor recalcula precios; no se aceptan valores del frontend |

---

## 📅 Restricciones de Ventana de Pedidos

Los pedidos **solo pueden realizarse en días específicos del mes**, configurados por zona comercial.

### Para PDVs Comerciales
- Cada zona tiene un rango de días configurado (ej.: del 1 al 5 de cada mes).
- Si se intenta hacer un pedido fuera de esos días, el sistema mostrará:
  > *"No se pudo realizar el pedido. Las fechas habilitadas para esta zona son del X al Y de cada mes."*

### Para Departamentos Internos
- Los departamentos tienen su propia ventana de pedidos (generalmente los primeros días del mes).
- Si se intenta pedir fuera de esa ventana:
  > *"Los departamentos solo pueden hacer pedidos del X al Y de cada mes."*

---

## ❓ Preguntas Frecuentes (FAQ)

**¿Por qué no puedo realizar un pedido hoy?**
> Es posible que estés fuera de la ventana de pedidos habilitada para tu zona. Revisa las fechas autorizadas con tu coordinador.

**¿Por qué el botón "Realizar Pedido" está deshabilitado?**
> Puede deberse a que: (1) el carrito está vacío, (2) no tienes un PDV asignado, o (3) el total supera el cupo disponible.

**¿Puedo cambiar un pedido después de enviarlo?**
> No. Una vez enviado, el pedido no puede modificarse desde el portal del PDV. El aprobador puede ajustar las cantidades antes de aprobar.

**¿Cómo sé si mi pedido fue aprobado?**
> En la sección **Mis Pedidos**, el estado del pedido cambiará de *Pendiente* a *Aprobado* o *Rechazado*. Si fue rechazado, podrás ver el motivo haciendo clic en el ícono de detalle.

**¿El precio que veo en pantalla es el precio final?**
> El precio mostrado es referencial. El sistema recalcula todos los precios desde la base de datos al momento de enviar el pedido.

**¿Qué pasa si el email no se envió?**
> El pedido queda registrado en el sistema igualmente. La pantalla de confirmación indicará si el correo fue enviado o no. El aprobador podrá ver el pedido en el módulo de Aprobaciones.

---

## 🧩 Arquitectura Resumida

```
supply-frontend/     → Interfaz React (Vite)
supply-backend/      → API REST Node.js + Express
BASEDEDATOS/         → Scripts SQL para MariaDB/MySQL
```

### Endpoints principales del proceso de pedido

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/catalogos/pdvs` | Obtiene la lista de PDVs disponibles |
| `GET` | `/api/catalogos/tipo-suministros` | Filtra tipos permitidos para el PDV |
| `GET` | `/api/catalogos/suministros` | Lista suministros por tipo y PDV |
| `POST` | `/api/pedidos` | Registra un nuevo pedido |
| `GET` | `/api/pedidos/aprobaciones` | Lista pedidos para aprobación |
| `POST` | `/api/pedidos/:id/aprobar` | Aprueba un pedido |
| `POST` | `/api/pedidos/:id/rechazar` | Rechaza un pedido con motivo |
| `GET` | `/api/reportes/pedidos` | Historial de pedidos del usuario |

---

*Documentación generada para el Sistema de Distribución de Suministros — Farmcorp. Para soporte técnico contactar al área de Tecnología.*