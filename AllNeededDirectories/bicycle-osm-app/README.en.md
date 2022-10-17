# How Does It Work?

## Language
Is it possible to add languages just by modifying the translations.js file inside the src/utils folder. You have to keep the same structure of the languages already in there. You have to keep the same name of the variables and write the translation for the seleted language.

## .env Variables
In the project base directory you have to add a .env file if not already present. The .env file needs to contains these variables:
- ID_GAME_USER : The id with which you login in the gamification engine
- ID_GAME_ENGINE: The id of the application used inside of the gamification engine
- PW_GAME_ENGINE: The password with which you login to the gamification engine
- REST_PASSWORD: The password that has to be verified for every rest call. You can choose whichever password you'd like
- VUE_APP_EMAIL_JS_SERVICE_ID: The id of the emailjs service
- VUE_APP_EMAIL_JS_TEMPLATE_ID: The id of the emailjs template
- VUE_APP_EMAIL_JS_PUBLIC_KEY: The public key given by emailjs
- VUE_APP_EMAIL_JS_USER_ID: The id of the user subscribed to the emailjs service
- VUE_APP_REST_PASSWORD: password that is the same as REST_PASSWORD


## Auth0
Inside the src/utils folder there are the auth.js and authGuard.js files that handle the login signup and logout using Auth0. If you'd like to change the redirect login url and the callback with new urls then it is necessary to add these also inside the application of Auth0. In order to add the new urls in Auth0 you need to be part of this application: https://manage.auth0.com/dashboard/eu/prova-osm/applications/0jQ1kV47wtmoOUrNJgcvvPCzGPwDxEmk/settings.
Also when the application gets added to a domain, there's the need to change the $api_url variable inside the file main.js.
If you cannot access the link written above, you can create an account in Auth0, create a new application inside of auth0 and configure it via vue.js (you have to add all the necessary data inside of auth.config.js too). In thsi case you need to write the callback and login redirect inside the Auth0 app too in order for everyting to work.
If you need to recreate the login inside of auth0:

- In the Dashboard of the application linked to Auth0 you'll have to add a custom action that needs to be called during the login. This action will create a field called signUpName inside the user data so that it is associated to the user in the gamification engine. The code for the custom action in the dashboard is this:</br>
exports.onExecutePostLogin = async (event, api) => {
  if (event.user.user_metadata.signUpName!=null) {
    console.log(`Skipping the expensive task because it already occurred for ${event.user.email}.`);
    return;
  }
  // do and expensive task
  api.user.setUserMetadata("signUpName", event.user.nickname);
};</br>
Then you have to add a rule that lets auth0 get the metadata signUpName every time you want to get the user info. This rule has the code:</br>
function (user, context, callback) {
  const namespace = 'myUserID';
  user.user_metadata = user.user_metadata || {};
  user.user_metadata.signUpName = user.user_metadata.signUpName || null;
  context.idToken[`${namespace}signUpName`] = user.user_metadata.signUpName;
  callback(null, user, context);
}</br>
Inside the section Actions/flow inside auth0 you can go to login and add the rule and the action created.

If you'd like to activate the email verification you can just go in the authGuard.js file and remove the comment from line 9 to 28. 

## Structure
- The "databases" folder contains the database containing all the data regarding ways/nodes and the questions.
- The routes folder contains all the files that handles the rest calls
- The src folder contains all the files regarding the frontend component of the web-app. Inside the src/assets/css folder there's a .css file containing part of the css application that is globally read. This css file also contains the variables used to change the theme of the app. Inside the src/images folder there are all the images used in the app.
  - src/views contains all the main pages of the application
  - src/components contains all the components used by the main pages
  - src/router is the router that handles the navigation
  - src/utils contains the files that handles Auth0, global functions and object such as UserData
- The pbfFiles folder contains all the files regarding the pbfs and the geojsons that will be shown in the map  

## Database Spatialite
The database that wasused is spatialite, even though the geometries now are handled by MapLibre and turff.js. Because of that the database could be changed with another sql database that doesn't need to be able to handle geometries. If you want to change it then you have to change some code inside the routes folder. In particular you have to change the code that makes calls to the database. That's it.
The spatialite database inside the web-app (inside the databases folder) contains all the information regardfing ways/nodes and the tables regarding powerups, medals and pins. The tables inside the db are:
- question_table:
  - TYPE: text field, contains the value WAY or NODE
  - QUESTION: text field, represents the question associated to the gemoetry
  - ID: integer field, the id identifying the way or node
  - SCORE: real field, represents the point given to the user if he answers the question
  - VALIDATING: text field, represents whether or not the question is a validation question
  - ANSWERS: text field, represents the possible answers that the user can choose from (they are separated by a ,)
  - ANSWER: text field, represents the answer given by the user
  - USERANSWERED: text field, represents the name of the user who answered the question
  - NUMBEROFVALIDATIONS: integer field, represents the number of validations that the answer has received
  - USERSWHOVALIDATED: text field, represents the list of the users who validated the answer(separated by a ,)
- completed_table:
    - id: text field, represents the id of the way which questions have been all completed
    - type: text field, represents the type of geometry, can either be node or way
    - completed: text field, it shows whether or not the questions of a certain way or node are completed
- powerUps_table:
    - POWERNAME: text field, The name of the power up 
    - PRICE: integer field, The price that the user has to pay in order to buy the power up
    - DESCRIPTION: text field, A variable which name is the same of a variable inside the translation.js file. When translated it gives the description of the power up
    - IMAGE: text field, The image associated to the power up
- pins_table:
    - IMAGE: text field, it represents the image associated to the pin
    - PRICE: integer field, it represents the price the user has to pay in order to buy the pin
- medals_table:
    - MEDALNAME: text field, the name of the medal
    - COLOR: text field, it represents the color that is used to show the medal to the user 
    - DESCRIPTION: text field, a description of the medal
- power ups tables (the name of the table is the same as the username that bought the power up):
    - POWERNAME: varchar(100) field, it represents the name of the power up bought by the user
    - TIME: varchar(100) field, represents the time in which the power up has been bought by the user
    - LIFETIME: varchar(100), represents the time that the power up lasts


## EmailJS
In the About page in order to send an email the emailjs service is used. If you want to change the mail to which the message are sent then you need to change the data of the service in the .env file.

## Pagina Medaglie
The medal are described in the database combined with the translation file. They can be found and changed in the gamification engine

## Pagina TilesVector
This is the heart of the whole application. When this page is mounted the user is checked, if the user is new then he is sent to the tutorial page. Every 5 minutes the page verifies whether or not the user has obtained enough validations on one of his answers. If yes then the app sends him a message.
The page has the MyTiles component that is the component where almost all the logic happens

### MyTiles
When the component is mounted the first thing that happens is the check of which layers needs to be created thanks to the wayLayersNames and nodeLayersNames txt files. 
After that the app verifies which are the completed nodes and ways in order to hide them. The timers are then created. The timers update the map continuously every 5 minutes. Once that's done the layers are created (the ways one, the central points one,the nodes and the clusters). The clusters are linked to the central point layer that needs to be a geojson. Ways and nodes are shown thanks to the pbf files. In order to decide which ways and nodes to show or not a maplibre function is being used. This function confronts the ids of the ways with the ids of the completed ways. 
The function handling the clicks of the user on the map are created. All the variables and functions are commentet in the code.
If you want to show the data inside acertain polygon only then you need tyo remove the comment where the central points and nodes are searched (near line 163) and you have to remove the comment from the function findIdInsidePol(). The polygon is defined inside the code(for now) but you could always create a geojson, make a rest call and get the file externally.

## Profilo e Cambio Nome
a function inside of auth0 handles the change of a user name. This function creates a field called "signUpName" inside of the user during the signup. The names shown are those inside of the nickname variable inside the gamification engine, but the variable signUpName is the same as the id of the user inside the gamification engine

## UserData
The UserData structure is initialized in the pages that require a login. The userData contains all the data of the user inside the gamification engine and it also handles all the pèowerups bought i the shop. The operations that modify the user data also modify the UserData, that way the application is responsive and there0s not a need to always call the gamification engine to get the user data. 
