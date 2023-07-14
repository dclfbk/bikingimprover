FROM node:16-alpine as base
USER node
WORKDIR /app
COPY --chown=node:node AllNeededDirectories/bicycle-osm-app/package.json AllNeededDirectories/bicycle-osm-app/package-lock.json ./
RUN npm install
COPY --chown=node:node ./AllNeededDirectories/bicycle-osm-app/ ./
CMD ["npm", "start"]

FROM base as build
RUN yarn build


FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
