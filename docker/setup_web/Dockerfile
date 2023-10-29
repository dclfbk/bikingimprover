FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=nonintercative

# Installing dependencies
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - 
RUN apt-get update \
    && apt-get -y install git sqlite3 libsqlite3-mod-spatialite nodejs npm python3 pip build-essential libsqlite3-dev zlib1g-dev

RUN npm install -g @mapbox/geojson-merge

WORKDIR /tippecanoe
RUN git clone https://github.com/mapbox/tippecanoe.git
WORKDIR "tippecanoe"
RUN make -j
RUN make install


WORKDIR /app
COPY docker/setup_web/requirements.txt .
RUN pip install -r requirements.txt

COPY docker/setup_web/main.py .
COPY docker/setup_web/bikingimprover bikingimprover
COPY  docker/setup_web/resources resources

COPY docker/setup_web/setup.sh /setup
RUN chmod +x /setup

ENTRYPOINT ["/setup"]
