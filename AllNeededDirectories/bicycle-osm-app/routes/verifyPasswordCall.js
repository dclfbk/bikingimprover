require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const auth_config = require("../auth_config.js")
const app_url = auth_config.app_url;

const client = jwksClient({
  jwksUri: app_url+".well-known/jwks.json" /*'https://prova-osm.eu.auth0.com/.well-known/jwks.json'*/
});

/*
In order to apply changes to data such as points and money I have to go through this function.
That way the user that knows the links cannot cheat to gain points because they don't know the password
*/

module.exports = function (req, res, next) {
  const token = req.get('pw_token');
  if (!token) {
    return res.status(401).send({ error: 'Missing token' });
  }
  try {
    const tokenWithoutBearer = token.replace('Bearer ', '');

    // Verify the token using the JWK public key
    jwt.verify(tokenWithoutBearer, getKey, (err, decodedToken) => {
      if (err) {
        throw err;
      }

      // Add the decoded token to the request object
      req.decodedToken = decodedToken;

      next();
    });
  } catch (error) {
    return res.status(403).send({ error: 'Invalid token' });
  }
};

// Function to retrieve the JWK public key
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const publicKey = key.publicKey || key.rsaPublicKey;
      callback(null, publicKey);
    }
  });
}