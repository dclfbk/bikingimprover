```
cd docker
cp example.env .env

docker compose --profile setup build
# solo la prima volta
docker compose --profile setup up -d

# successive modifiche
docker compose up -d
```