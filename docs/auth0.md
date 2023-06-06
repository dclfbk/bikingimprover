# AUTH0 Setup
The web app uses auth0 in order to handle the user authentication. In order to create the web app it is necessary to create an auth0 account or to use an existing one (https://auth0.com/). 
Login to auth0, go to your dashboard, create an application and configure it for the vue.js use following the guide in the quick start section.You just have to create an application and an api giving them names.
Inside the populate `auth0-config.js` and `.env` with the following data:
- `domain`: The domain used by the created application (can be found in the settings section of the app)
- `clientId`: The client ID used by the created application (can be found in the settings section of the app)
- `audience`: The api identifier found in the api section.
- `client_secret`: The client_secret of the app (can be found in the api settings inside the auth0 application)
- `grant_type`: "client_credentials",
- `client_id_api`: The api id of the application (can be found in the api settings inside Auth0)
- `app_url`: The application's url (it's the same as the domain but with the addition of "https://")


Add the next urls to the callback urls inside the application in auth0: http://localhost:8080/callback, http://localhost:8080/myTiles. Add http://localhost:8080 in the callback, logout, weborigins, allowed origins fields in the settings of the application on Auth0. Check the guidelines of Auth0 if you want to change them.

**NOTE**: if you are deploying on a custom domain, replace `http://localhost:8000` with your actual domain.

In the Dashboard of the application linked to Auth0 you'll have to add a custom action called `storeFirstNickName` that needs to be called during the login. This action will create a field called `signUpName` inside the user data so that it is associated to the user in the gamification engine. The code for the custom action in the dashboard is this:
```js
exports.onExecutePostLogin = async (event, api) => { 
  if (event.user.user_metadata.signUpName!=null) { 
    console.log(Skipping the expensive task because it already occurred for ${event.user.email}.); 
    return; 
  } // do and expensive task 
  api.user.setUserMetadata("signUpName", event.user.nickname); 
};
```

Then you have to add a second action called `saveUserSignUpName` with code:
```js
exports.onExecutePreUserRegistration = async (event, api) => { 
  //console.log(event.user)
  api.user.setAppMetadata("signUpName", event.user.nickname)
  console.log(api.user); 
};
```
Then you have to add a rule that lets auth0 get the metadata `signUpName` every time you want to get the user info. This rule has the code:
```js
function (user, context, callback) {
  const namespace = 'myUserID'; 
  user.user_metadata = user.user_metadata || {}; 
  user.user_metadata.signUpName = user.user_metadata.signUpName || null; 
  context.idToken[${namespace}signUpName] = user.user_metadata.signUpName; 
  callback(null, user, context);
}
```

Inside the section `Actions/flow` inside auth0 you can go to login and add the rule and the action `storeFirstNickName` created.
Insite the section `Actions/flow/PreuserRegistration` add the action `saveUserSignUpName`.

If you'd like to activate the email verification you can just go in the `authGuard.js` file and remove the comment from line 9 to 28.
