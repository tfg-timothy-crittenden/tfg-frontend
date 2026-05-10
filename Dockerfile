FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
#COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# default (works in local docker-compose network)
ENV API_UPSTREAM=http://gateway:8080

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
