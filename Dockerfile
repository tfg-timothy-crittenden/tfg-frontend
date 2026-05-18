FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
RUN mkdir -p /run /var/cache/nginx \
      && chown -R 101:101 /run /var/cache/nginx
USER 101
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
