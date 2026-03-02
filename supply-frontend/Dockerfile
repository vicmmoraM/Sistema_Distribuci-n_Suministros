# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile - Supply Chain Frontend (React + Vite)
# Utiliza multi-stage build para optimizar el tamaño de la imagen
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Stage 2: Producción (servir con servidor estático)
FROM node:20-alpine

WORKDIR /app

# Instalar servidor HTTP ligero (serve para servir archivos estáticos)
RUN npm install -g serve

# Copiar los archivos compilados desde el stage anterior
COPY --from=builder /app/dist ./dist

# Exponer el puerto
EXPOSE 5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5173', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando de inicio (serve en puerto 5173)
CMD ["serve", "-s", "dist", "-l", "5173"]
