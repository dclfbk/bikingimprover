```
cd docker
cp example.env .env
cp web/auth0-conf.example.js web/auth0-conf.js

docker compose --profile setup build
# solo la prima volta
docker compose --profile setup up -d

# successive modifiche
docker compose up -d
```