# LOAD TESTING
This folder contains code to load test the application.

## Setup
```bash
docker compose build
cp .env.example .env
```

Open the browser and login inside the instance you want to load test. Then open the Developer tools and extract the cookies for the given domain. The necessary cookies should have the following shape: `auth0.SOME_RANDOM_CHARACTERS.is.authenticated=true;_legacy_auth0.SOME_RANDOM_CHARACTERS.is.authenticated=true`

Set the `LOCUST_HOST` variable according to the instance you want to test.

## Execution
```bash
docker compose up -d
```

Open http://localhost:8089
