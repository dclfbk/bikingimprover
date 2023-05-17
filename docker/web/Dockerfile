FROM node:14

COPY AllNeededDirectories/bicycle-osm-app/package*.json ./

# install project dependencies
RUN npm install

WORKDIR /app

# copy the entire app
# TODO: specify which directories are actually needed
COPY AllNeededDirectories/bicycle-osm-app/ ./


# build app for production with minification
# TODO: split frontend and backend to lighten the image sizes
#       at the moment frontend dependecies are installed also when using only the backend
RUN npm run build

COPY docker/web/entrypoint.sh /entrypoint
RUN chmod +x /entrypoint

EXPOSE 8080

ENTRYPOINT ["/entrypoint"]
