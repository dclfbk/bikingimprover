# Deploy
Deployment is requires `docker compose`, the official images can be found on [Github](https://github.com/orgs/DigitalCommonsLab/packages?repo_name=bikingimprover).

## Directory structure
For a production deployment the following structure is advised:
```bash
.
├── docker-compose.yml
├── .env
├── gamification.env
└── volumes
    ├── auth0-conf.js
    ├── data
    │   └── [YOUR_CITY_NAME].xml
    ├── databases
    ├── engine-config
    │   └── users.yml
    ├── engine-logs
    ├── letsencrypt
    │   └── acme.json
    ├── mongo-data
    └── pbfFiles
```

The following `docker-compose.yml` could be used as template:
```yml
version: "3.9"

services:
  mongo:
    image: mongo:3.6.2-jessie
    volumes:
      - ./volumes/mongo-data:/data/db

  gamification-engine:
    image: ghcr.io/digitalcommonslab/gamification-engine:docker
    depends_on:
      - mongo
    links:
      - mongo:mongodb
    env_file: 
      - ./gamification.env
    volumes:
      - ./volumes/engine-logs:/app/game-engine.web/logs
      - ./volumes/engine-config:/app/config
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.gamification-engine.rule=Host(`gamification.bikingimprover.example.com`)"
      - "traefik.http.routers.gamification-engine.entrypoints=websecure"
      - "traefik.http.routers.gamification-engine.tls.certresolver=myresolver"
      - "traefik.http.services.gamification-engine.loadbalancer.server.port=8010"

  setup-gamification-engine:
    image: ghcr.io/digitalcommonslab/gamification-engine-setup:docker
    depends_on:
      - gamification-engine
    env_file: 
      - ./.env
    profiles:
      - setup

  web:
    image: ghcr.io/digitalcommonslab/bikingimprover:docker
    command: node server.js
    env_file:
      - ./.env
    volumes:
      - ./volumes/auth0-conf.js:/app/dist/auth0-conf.js
      - ./volumes/databases:/app/databases
      - ./volumes/pbfFiles:/app/pbfFiles
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`bikingimprover.example.com`)"
      - "traefik.http.routers.web.entrypoints=websecure"
      - "traefik.http.routers.web.tls.certresolver=myresolver"
      - "traefik.http.services.web.loadbalancer.server.port=8080"

  setup_web:
    profiles:
      - setup
    command: /data/[YOUR_CITY_NAME].xml
    image: ghcr.io/digitalcommonslab/bikingimprover-setup:docker
    env_file:
      - ./.env
    volumes:
      - ./volumes/data:/data
      - ./volumes/pbfFiles:/app/out/pbfFiles
      - ./volumes/databases:/app/out/databases

  traefik:
    image: "traefik:v2.9"
    container_name: "traefik"
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.myresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.myresolver.acme.email=[YOUR_EMAIL_ADDRESS]"
      - "--certificatesresolvers.myresolver.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "./volumes/letsencrypt:/letsencrypt"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
```

You can use as template to copy and customize the example files in the repository: `example.env`, `gamification.env` and `auth0-conf.example.js`.

## Loading Data and configuration
In order to populate the database with initial data and spatial datasets, you need to upload an openstreetmap XML export of a city inside the `volumes/data` folder. You should name it with the city name.

Inside `volumes/engine-config` put `users.yml` (you can get a copy from `docker/engine/config/users.yml`).

## Setup Phase
A first step is required to setup the system:
```bash
docker compose --profile setup pull
docker compose --profile setup up -d
```
Using the profile `setup` two more containers will be deployed:
- `setup-gamification-engine` will setup the gamification engine, check its log to get the `ID_GAME_ENGINE`, you have to put this value inside `.env`.
- `setup-web` will setup the app database and will create the `pbfFiles` needed by the application.

When both the containers ends processing - you can check using `docker compose --profile setup logs -f setup-web` - you can stop the process with `docker compose --profile setup stop`.

## Auth0 Setup
Refer to documentation specific to [auth0](./auth0.md)

## Execution Phase
Run the following command:
```bash
docker compose up -d
```

**NOTE**: Always use this command after first initialization 
