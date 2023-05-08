const process = require('process');

module.exports = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  audience: process.env.AUTH0_AUDIENCE,
  client_secret: process.env.AUTH0_CLIENT_SECRET,
  grant_type: 'client_credentials',
  client_id_api: process.env.AUTH0_CLIENT_ID_API,
  app_url: process.env.AUTH0_APP_URL,
};
