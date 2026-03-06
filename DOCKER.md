# Docker - Sistema de Distribución de Suministros

Guía para construir y ejecutar la aplicación usando Docker.

## 📋 Requisitos Previos

- Docker Desktop instalado ([descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido en Docker Desktop)

## 🚀 Inicio Rápido

### Opción 1: Ejecutar con Docker Compose (Recomendado)

```bash
# Situarse en la raíz del proyecto
cd Sistema_Distribucion_Suministros

# Construir y ejecutar todos los servicios
docker-compose up --build

# O ejecutar en segundo plano
docker-compose up -d --build
```

Acceso:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

### Opción 2: Construir imágenes por separado

#### Backend

```bash
cd supply-backend

# Construir la imagen
docker build -t supply-backend:latest .

# Ejecutar el contenedor
docker run -d \
  -p 3001:3001 \
  --name supply-backend \
  -e DB_HOST=10.101.183.40 \
  -e DB_PORT=3306 \
  -e DB_NAME=DB_SupplyChain \
  -e DB_USER=dbSystemSC \
  -e DB_PASS=C0n3x10nSC2024 \
  -e CORS_ORIGIN=http://localhost:5173 \
  supply-backend:latest
```

#### Frontend

```bash
cd supply-frontend

# Construir la imagen
docker build -t supply-frontend:latest .

# Ejecutar el contenedor
docker run -d \
  -p 5173:5173 \
  --name supply-frontend \
  -e VITE_API_URL=http://localhost:3001 \
  supply-frontend:latest
```

## 🛑 Detener los servicios

```bash
# Con Docker Compose
docker-compose down

# O eliminar también volúmenes
docker-compose down -v

# Contenedores individuales
docker stop supply-backend supply-frontend
docker rm supply-backend supply-frontend
```

## 📊 Comandos útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Ver estado de contenedores
docker-compose ps

# Ejecutar comando en un contenedor activo
docker exec -it supply-backend sh
docker exec -it supply-frontend sh

# Reconstruir sin usar caché
docker-compose build --no-cache
```

## ⚙️ Configuración de Variables de Entorno

### Configuración de CORS_ORIGIN

La variable **CORS_ORIGIN** controla qué orígenes pueden acceder a la API. Se configura en tres formas:

#### 1. **En el Dockerfile (Valor por defecto)**
```dockerfile
# supply-backend/Dockerfile
ENV CORS_ORIGIN=http://localhost:5173
```

#### 2. **En docker-compose.yml (Opción más común)**
```yaml
backend:
  environment:
    # Un solo origen
    - CORS_ORIGIN=http://localhost:5173
    
    # Múltiples orígenes (separados por coma)
    - CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
    
    # Múltiples orígenes con dominio
    - CORS_ORIGIN=http://localhost:5173,https://app.farmcorp.com.ec
```

#### 3. **Con docker run (Línea de comandos)**
```bash
docker run -d \
  -p 3001:3001 \
  --name supply-backend \
  -e CORS_ORIGIN=http://localhost:5173 \
  supply-backend:latest
```

#### 4. **Crear archivo .env local**
```env
# supply-backend/.env
DB_HOST=10.101.183.40
DB_PORT=3306
DB_NAME=DB_SupplyChain
DB_USER=dbSystemSC
DB_PASS=C0n3x10nSC2024
LDAP_URL=ldap://SRVDCR000.farmcorp.com.ec
CORS_ORIGIN=http://localhost:5173
NODE_ENV=production
```

Luego ejecutar:
```bash
docker-compose up --build
```

### Ejemplos de configuración CORS_ORIGIN

| Escenario | Valor |
|-----------|-------|
| Desarrollo local | `http://localhost:5173` |
| Desarrollo en red | `http://10.101.13.149:5173` |
| Múltiples locales | `http://localhost:5173,http://127.0.0.1:5173` |
| Desarrollo + Producción | `http://localhost:5173,https://app.farmcorp.com.ec` |
| Sin restricción* | `*` |

*⚠️ **No recomendado en producción**

### Backend - Variables de Entorno Completas

```env
# --- BASE DE DATOS ---
DB_HOST=10.101.183.40
DB_PORT=3306
DB_NAME=DB_SupplyChain
DB_USER=dbSystemSC
DB_PASS=C0n3x10nSC2024

# --- LDAP ---
LDAP_URL=ldap://SRVDCR000.farmcorp.com.ec
LDAP_HOST=LDAP://SRVDCR000.farmcorp.com.ec
LDAP_SERVICE_DN=src_TI_ldap@farmcorp.com.ec
LDAP_SERVICE_PASS=Farmc0rp*
LDAP_BASE_OU=ou=usuarios,ou=farmcorp,dc=farmcorp,dc=com,dc=ec

# --- SERVIDOR ---
PORT=3001
NODE_ENV=production

# --- SESIONES ---
SESSION_SECRET=FarmcorpSupplyChain2024SecretKey
SESSION_MAX_AGE=28800000

# --- CORS (IMPORTANTE) ---
CORS_ORIGIN=http://localhost:5173

# --- EMAIL ---
MAIL_ENABLED=true
MAIL_HOST=chimborazo.ecuahosting.net
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USER=reqsuministros@farmcorp.com.ec
MAIL_PASS=Sumin!str0sFC024
```

### Frontend

Se puede usar un archivo `.env` o `.env.production`:

```env
VITE_API_URL=http://localhost:3001
```

## 📦 Estructura de las imágenes

### Backend Dockerfile
- Imagen base: `node:18-alpine` (ligera)
- Puerto: 3001
- Health check incluido

### Frontend Dockerfile
- Build multi-stage para optimizar tamaño
- Imagen base: `node:18-alpine`
- Servidor estático: `serve`
- Puerto: 5173
- Health check incluido

## 🔧 Solución de problemas

### Error de CORS (Errores de origen bloqueado)

Si ves errores como `Access to XMLHttpRequest has been blocked by CORS policy`:

```bash
# 1. Verifica la variable CORS_ORIGIN en docker-compose.yml
docker-compose config | grep CORS_ORIGIN

# 2. Actualiza el valor si es necesario
# En docker-compose.yml:
environment:
  - CORS_ORIGIN=http://localhost:5173

# 3. Reinicia el servicio
docker-compose restart backend

# 4. Verifica en los logs
docker-compose logs -f backend | grep CORS
```

**Checklist CORS:**
- ✅ Verificar que CORS_ORIGIN coincida exactamente con la URL del frontend (protocolo, dominio y puerto)
- ✅ No debe haber espacios en blanco antes/después de la URL
- ✅ Usar `http://` para desarrollo y `https://` para producción
- ✅ Si usas múltiples orígenes, separarlos con coma: `http://localhost:5173,https://app.example.com`

### Error de puerto en uso

```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3002:3001"  # Frontend externo: 3002, interno: 3001
```

### Error de conexión a base de datos

Verificar que:
1. La BD está accesible desde Docker (IP `10.101.183.40`)
2. Las credenciales son correctas
3. El firewall permite la conexión

### Verificar logs

```bash
docker-compose logs backend
docker-compose logs frontend
```

### Limpiar todo (para reiniciar)

```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 🔐 Seguridad

Para producción:
1. No incluir credenciales en `docker-compose.yml`
2. Usar archivos `.env` o secrets de Docker
3. Cambiar `SESSION_SECRET`
4. Habilitar HTTPS en el frontend
5. Usar variables de entorno para CORS_ORIGIN

Ejemplo con variables de entorno:

```bash
docker-compose up --env-file .env.production
```

## 📝 Notas

- Asegúrate de que el puerto 3001 y 5173 no estén en uso
- La BD MySQL está comentada en `docker-compose.yml`; descomenta si deseas ejecutarla en Docker
- Los health checks se ejecutan cada 30 segundos
