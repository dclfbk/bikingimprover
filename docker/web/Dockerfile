FROM node:14

COPY AllNeededDirectories/bicycle-osm-app/package*.json ./

# install project dependencies
RUN npm install

# copy the entire app
# TODO: specify which directories are actually needed
COPY AllNeededDirectories/bicycle-osm-app/ ./

# COPY datavolume datavolume
# RUN mv datavolume/applicationValid.db /databases/applicationValid.db
# RUN mv datavolume/CenterGeojsonCittà/* /pbfFiles/CenterGeojson/
# RUN mv datavolume/allNodesGeojson.geojson /pbfFiles/allNodesGeojson.geojson 
# RUN mv datavolume/allWaysPbf/ /pbfFiles/
# RUN mv datavolume/allNodesPbf/ /pbfFiles/
# RUN mv datavolume/wayLayers.txt /pbfFiles/LayersNames/wayLayers.txt
# RUN mv datavolume/nodeLayers.txt /pbfFiles/LayersNames/nodeLayers.txt
# RUN rm -r datavolume 


# build app for production with minification
# TODO: split frontend and backend to lighten the image sizes
#       at the moment frontend dependecies are installed also when using only the backend
RUN npm run build

COPY docker/web/entrypoint.sh /entrypoint
RUN chmod +x /entrypoint

EXPOSE 8080

ENTRYPOINT ["/entrypoint"]
