FROM node:14

RUN apt-get update && apt-get install --no-install-recommends -y \
  sqlite3 libsqlite3-mod-spatialite libsqlite3-dev \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY AllNeededDirectories/bicycle-osm-app/package*.json ./

# install project dependencies
RUN npm install

# copy the entire app
# TODO: specify which directories are actually needed
COPY --chown=node:node AllNeededDirectories/bicycle-osm-app/server.js  AllNeededDirectories/bicycle-osm-app/changesetLogic.js AllNeededDirectories/bicycle-osm-app/auth_config.js  ./
COPY --chown=node:node AllNeededDirectories/bicycle-osm-app/routes ./routes

COPY --chown=node:node docker/web/entrypoint.sh /entrypoint
RUN chmod +x /entrypoint

USER node

EXPOSE 8080

ENTRYPOINT ["/entrypoint"]
