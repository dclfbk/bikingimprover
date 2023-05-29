FROM node:14

RUN apt-get update && apt-get install --no-install-recommends -y \
  sqlite3 libsqlite3-mod-spatialite libsqlite3-dev \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

COPY AllNeededDirectories/bicycle-osm-app/package*.json ./

# install project dependencies
RUN npm install

WORKDIR /app

# copy the entire app
# TODO: specify which directories are actually needed
COPY --chown=node:node AllNeededDirectories/bicycle-osm-app/ ./


# build app for production with minification
# TODO: split frontend and backend to lighten the image sizes
#       at the moment frontend dependecies are installed also when using only the backend
RUN npm install
RUN npm run build

COPY --chown=node:node docker/web/entrypoint.sh /entrypoint
RUN chmod +x /entrypoint

USER node

EXPOSE 8080

ENTRYPOINT ["/entrypoint"]
