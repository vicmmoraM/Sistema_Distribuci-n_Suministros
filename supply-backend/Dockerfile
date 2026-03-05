# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile - Supply Chain Backend (Node.js + Express)
# ─────────────────────────────────────────────────────────────────────────────

FROM node:18-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production

# Copiar el código de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 3001

# Variables de entorno por defecto
# Estas pueden ser sobrescritas en docker run o docker-compose.yml
ENV NODE_ENV=production
ENV PORT=3001
ENV CORS_ORIGIN=http://localhost:5173

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Comando de inicio
CMD ["node", "src/index.js"]
