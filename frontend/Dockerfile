# Etapa 1: Construcción (Build)
FROM node:20-slim AS build

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código y compilamos
COPY . .
RUN npm run build

# Etapa 2: Servidor de producción (Nginx)
FROM nginx:stable-alpine

# Copiamos los archivos compilados desde la etapa anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos una configuración personalizada de Nginx (la crearemos en el siguiente paso)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]