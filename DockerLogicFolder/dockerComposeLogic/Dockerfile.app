# Choose the Image which has Node installed already
FROM node:lts-alpine

# install simple http server for serving static content
RUN npm install -g http-server
#RUN npm install -g serve

#Copy only package.json
COPY AllNeededDirectories/bicycle-osm-app/package*.json ./

# install project dependencies
RUN npm install
RUN npm install dotenv
RUN npm install --save connect-history-api-fallback
RUN npm install request --save

#copy the entire app
COPY AllNeededDirectories/bicycle-osm-app/ ./

COPY datavolume datavolume

RUN mv datavolume/applicationValid.db /databases/applicationValid.db

RUN mv datavolume/CenterGeojsonCittà/* /pbfFiles/CenterGeojson/
RUN mv datavolume/allNodesGeojson.geojson /pbfFiles/allNodesGeojson.geojson 
RUN mv datavolume/allWaysPbf/ /pbfFiles/
RUN mv datavolume/allNodesPbf/ /pbfFiles/
RUN mv datavolume/wayLayers.txt /pbfFiles/LayersNames/wayLayers.txt
RUN mv datavolume/nodeLayers.txt /pbfFiles/LayersNames/nodeLayers.txt

RUN rm -r datavolume 
# build app for production with minification
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
