# CORS - Configuración en Docker

Guía completa sobre cómo configurar Cross-Origin Resource Sharing (CORS) en el backend con Docker.

## 🔍 ¿Qué es CORS?

CORS (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador que controla qué sitios pueden acceder a tu API. Es esencial para que el frontend y backend en dominios/puertos diferentes se comuniquen.

## 📍 ¿Dónde se configura CORS_ORIGIN?

Hay 4 lugares donde puedes configurar `CORS_ORIGIN`:

### 1. 🐳 **En el Dockerfile (Valor por defecto)**

```dockerfile
# supply-backend/Dockerfile

FROM node:18-alpine

# ... otros comandos ...

# Variable de entorno por defecto
ENV CORS_ORIGIN=http://localhost:5173

CMD ["node", "src/index.js"]
```

**Uso:** Se utiliza cuando no especificas la variable en docker-compose.yml o docker run
**Ventaja:** Proporciona un valor sensato por defecto

---

### 2. 🐙 **En docker-compose.yml (Opción más común para desarrollo)**

```yaml
# docker-compose.yml

services:
  backend:
    build:
      context: ./supply-backend
      dockerfile: Dockerfile
    environment:
      # Un solo origen
      - CORS_ORIGIN=http://localhost:5173
      
      # Múltiples orígenes
      # - CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
      
      # Con dominio de producción
      # - CORS_ORIGIN=http://localhost:5173,https://app.farmcorp.com.ec
```

**Uso:** `docker-compose up --build`
**Ventaja:** Cambios rápidos sin reconstruir la imagen
**Mejor para:** Desarrollo colaborativo

---

### 3. ⚡ **Con docker run (Para contenedores individuales)**

```bash
docker run -d \
  -p 3001:3001 \
  --name supply-backend \
  -e CORS_ORIGIN=http://localhost:5173 \
  supply-backend:latest
```

**Uso:** Cuando ejecutas contenedores sin docker-compose
**Ventaja:** Control total en línea de comandos
**Mejor para:** Testing rápido o scripts personalizados

---

### 4. 📄 **En archivo .env local (Luego cargado por docker-compose)**

```env
# supply-backend/.env

DB_HOST=10.101.183.40
DB_PORT=3306
DB_NAME=DB_SupplyChain
DB_USER=dbSystemSC
DB_PASS=C0n3x10nSC2024

# CORS 
CORS_ORIGIN=http://localhost:5173

NODE_ENV=production
```

Referenciarlo en docker-compose.yml:
```yaml
services:
  backend:
    build:
      context: ./supply-backend
      dockerfile: Dockerfile
    env_file:
      - ./supply-backend/.env
```

**Uso:** `docker-compose up --build`
**Ventaja:** Secretos locales no se comiten al repositorio
**Mejor para:** Producción y variables sensibles

---

## 📊 Prioridad de configuración

Cuando hay múltiples configuraciones, se aplica en este orden:

1. **docker run -e** (Línea de comandos) ← Máxima prioridad
2. **variables de entorno en docker-compose.yml** ← Muy alta
3. **archivo .env cargado por docker-compose**
4. **ENV en Dockerfile** ← Valor por defecto

---

## 📋 Ejemplos prácticos

### Ejemplo 1: Desarrollo local

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - CORS_ORIGIN=http://localhost:5173
```

```bash
docker-compose up --build
# Frontend accesible en: http://localhost:5173
# Backend accesible en: http://localhost:3001
```

### Ejemplo 2: Desarrollo en red local

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - CORS_ORIGIN=http://10.101.13.149:5173
```

```bash
docker-compose up --build
# Accesible desde otros equipos en: http://10.101.13.149:3001
```

### Ejemplo 3: Múltiples orígenes

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://10.101.13.149:5173
```

```bash
docker-compose up --build
# Permite acceso desde 3 orígenes diferentes
```

### Ejemplo 4: Desarrollo + Producción

```yaml
# docker-compose.yml
services:
  backend:
    environment:
      - CORS_ORIGIN=http://localhost:5173,https://app.farmcorp.com.ec
```

### Ejemplo 5: Con archivo .env

```env
# supply-backend/.env
CORS_ORIGIN=http://localhost:5173
DB_HOST=10.101.183.40
LDAP_URL=ldap://SRVDCR000.farmcorp.com.ec
```

```yaml
# docker-compose.yml
services:
  backend:
    build:
      context: ./supply-backend
    env_file:
      - ./supply-backend/.env
    ports:
      - "3001:3001"
```

---

## 🔧 Verificar la configuración actual

### Ver el valor actual de CORS_ORIGIN

```bash
# Una vez que el contenedor está corriendo
docker exec supply-backend env | grep CORS_ORIGIN
```

### Ver en los logs al iniciar

```bash
docker-compose logs backend | grep CORS

# Output esperado:
# 🛠️  CORS:    http://localhost:5173
```

### Desde dentro del contenedor

```bash
docker exec supply-backend sh

# Dentro del contenedor:
env | grep CORS_ORIGIN
```

---

## ⚠️ Errores comunes y soluciones

### Error: "Access to XMLHttpRequest blocked by CORS policy"

**Problema:** CORS_ORIGIN no incluye el origen del frontend

**Solución:**
```yaml
# INCORRECTO
- CORS_ORIGIN=localhost:5173  # Falta http://

# CORRECTO
- CORS_ORIGIN=http://localhost:5173
```

### Error: CORS_ORIGIN con espacios

**Problema:**
```env
# INCORRECTO - Espacio al inicio
CORS_ORIGIN= http://localhost:5173
```

**Solución:**
```env
# CORRECTO - Sin espacios
CORS_ORIGIN=http://localhost:5173
```

### Error: No reconoce cambios en CORS_ORIGIN

**Problema:** La imagen se construyó con valores antiguos

**Solución:**
```bash
# Reconstruir sin usar caché
docker-compose build --no-cache backend
docker-compose up
```

### Error: Múltiples orígenes no funcionan

**Problema:** Espacios adicionales entre orígenes
```env
# INCORRECTO
CORS_ORIGIN=http://localhost:5173, http://10.101.13.149:5173
#                                ↑ espacio aquí
```

**Solución:**
```env
# CORRECTO - Sin espacios
CORS_ORIGIN=http://localhost:5173,http://10.101.13.149:5173
```

---

## 🔐 Mejores prácticas

### ✅ Para desarrollo

```yaml
# docker-compose.yml
environment:
  - CORS_ORIGIN=http://localhost:5173
  - NODE_ENV=development
```

### ✅ Para producción

```yaml
# docker-compose.yml
environment:
  - CORS_ORIGIN=https://app.farmcorp.com.ec
  - NODE_ENV=production
```

```bash
# O usar variables de entorno
docker-compose --env-file .env.production up
```

### ❌ NO hagas esto en producción

```yaml
# ❌ INSEGURO - Permite cualquier origen
environment:
  - CORS_ORIGIN=*
```

---

## 📚 Configuración de CORS en el código Backend

El backend procesa `CORS_ORIGIN` de esta forma:

```javascript
// supply-backend/src/index.js

const corsOrigins = (process.env.CORS_ORIGIN || 'http://10.101.13.149:5173')
  .split(',')
  .map(origin => origin.trim());

app.use(cors({
  origin:      corsOrigins.length > 1 ? corsOrigins : corsOrigins[0],
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));
```

**Características:**
- ✅ Soporta un solo origen
- ✅ Soporta múltiples orígenes (separados por coma)
- ✅ Limpia espacios automáticamente
- ✅ Especifica métodos HTTP permitidos
- ✅ Configura headers permitidos

---

## 🧪 Testing de CORS

```bash
# Desde la terminal, verificar que CORS funciona
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:3001/api/health

# Debería responder con headers CORS:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH
```

---

## 📝 Resumen rápido

| Donde | Ejemplo | Prioridad |
|-------|---------|-----------|
| Dockerfile | `ENV CORS_ORIGIN=http://localhost:5173` | 4️⃣ Baja (default) |
| docker-compose.yml | `- CORS_ORIGIN=http://localhost:5173` | 2️⃣ Alta |
| docker run -e | `-e CORS_ORIGIN=...` | 1️⃣ Muy alta |
| .env + docker-compose | `env_file: - .env` | 3️⃣ Media-alta |

**Recomendación:** Usa docker-compose.yml para desarrollo y .env.production para producción.

---

## 🤔 Preguntas frecuentes

**P: ¿Puedo cambiar CORS_ORIGIN sin reconstruir la imagen?**
R: Sí, siempre que uses docker-compose.yml o docker run -e. Si cambias el Dockerfile, necesitas reconstruir.

**P: ¿Qué pasa si CORS_ORIGIN no se configura?**
R: Se usa el valor por defecto del Dockerfile: `http://10.101.13.149:5173`

**P: ¿Puedo usar CORS_ORIGIN=*?**
R: Técnicamente sí, pero es una mala práctica de seguridad. Evítalo en producción.

**P: ¿Cómo verifico que CORS está configurado correctamente?**
R: Mira los logs al iniciar: `docker-compose logs backend | grep CORS`

---

## 🔗 Referencias

- [MDN - CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- [Express CORS Middleware](https://github.com/expressjs/cors)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
