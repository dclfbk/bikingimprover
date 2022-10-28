# osm gamification


- [Video Setup Tutorial](https://drive.google.com/file/d/14lH2EOqcvlQlqfrdfaNT3S3AoQc3HDMO/view?usp=sharing)
- [Video Describing the project](https://drive.google.com/file/d/1y8Lin66vJZ9Ad7uO6CrAnXnDYc0SI0EZ/view?usp=sharing)
- [Presentation](https://drive.google.com/file/d/1GkWwk5YkMv0IePnH0if-U5k2y349Ykgc/view?usp=sharing)
- [Test the app on heroku](https://biking-improver.herokuapp.com)

**General Structure**: </br>
The web-app is characterized by:
- A frontend created principally with vue.js, ionic and MapLibre.
- A backend characterized by a spatialite database, a gamification engine and an Auth0 database. The spatialite database contains all the informations regarding the views and points of interest (this database can be reolaced by another sql database, but by doing so some parts of the rest calls inside the web-app have to be modified). The spatialite database contains also a table for each user containing the power ups they bought in the shop. The gamification engine is provided by FBK (Bruno Kessler Foundation) is used to keep track of the progress of the different users. The Auth0 database is used to handle logins and signups. </br>

The questions are generated thanks to the scripts inside the [create_geometry_spatialite](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite) folder. The missions are created cycling through a .yaml file. The ways and nodes with their geometries are saved in a geojson and xml format. The geojsons and xmls are then used by tippecanoe in order to create the pbf files. The pbf files are used by MapLibre to show the ways and nodes to the user. </br>
Once the questions are generated, the .pbf files are created via [tippecanoe](AllNeededDirectories/tippecanoe/tippecanoe_funzionante/NewSystem). The pbf files are read by MapLibre in order to be shown to the user. We are using .pbf files instead of .geojson files because the weigh less to the user during the loading phase (but they weigh more in the server).</br>
The [web-app](AllNeededDirectories/bicycle-osm-app) is translated only in english and italian for now. If you want to add languages you can modify the file [translation.js](AllNeededDirectories/bicycle-osm-app/src/utils).

# REQUIREMENTS</br>
The web-app was created in an Ubuntu 20.04 environment. On docker you can find the ubuntu version with all the neccessary packages installed in the repository franz99/ubuntu_image_web:ubuntu_ready_packages. You can always install them in your ubuntu environment.
The used packages are:
- git, "apt-get update \ && apt-get -y install git"
- unzip, "apt-get install unzip"
- nodejs, "apt-get install -y nodejs"
- npm, "apt-get -y install npm"
- @mapbox/geojson-merge, "npm install --save @mapbox/geojson-merge" "npm install -g @mapbox/geojson-merge"
- python2.7, "apt-get -y install python2.7"
- python3.8, "apt-get -y install python3.8"
- python3-pip, "apt-get -y install python3-pip"
- sqlite3, "apt-get install sqlite3"
- libsqlite3-mod-spatialite, "apt-get install -y libsqlite3-mod-spatialite"
- build-essential "apt-get -y install build-essential"
- make, "apt-get install make"
- libsqlite3-dev, "apt-get install libsqlite3-dev"
- zlib1g-dev, "apt-get install zlib1g-dev"
- vim, "apt-get -y install vim"
- tippecanoe, "git clone https://github.com/mapbox/tippecanoe.git" then go to the tippecanoe folder and use the commands "make -j" and "make install"

# SETUP</br>
First of all clone the repository on your computer.
Move to the [web-app](AllNeededDirectories/bicycle-osm-app) folder and create a .env file, then follow the guidelines of the next paragraphs.

***Gamification Engine***</br>
Before starting with the creation of the web app we need to check whether or not we can access to all the services needed. 
Check if you can access and login the FBK online gamification engine found at: https://gamification-test.platform.smartcommunitylab.it/gamification/consoleweb/#/home.
If you cannot access then you can try to contact the developers in order to ask fro the credentials or you can crete a local instance of the gamification engine by following the indications found at the github repository: https://github.com/smartcommunitylab/smartcampus.gamification. 
In case you created a local instance of the engine, you have to start it and then you have to create a new game (by using the button add new game in the gamification engine). Then you have to add the [rules](RulesInGamification) that can be found in this repository (src/RulesInGamification) into the game instance that you previously created under the Rules section. 
Once that's done you have to create the game actions inside the Actions section inside the gamification engine. The actions you have to create are:
- GetsValidatedFiveTimes
- GetValidatedOneTime
- GiveTrust
- RemovePoints
- TestData
- RemoveImage
- BuyPowerUp
- ChangeName
- PinAnswerCompletedTry
- BuyImage
- AddImage
- PointInserted
- ValidatePoint
- CreateImage
- PinAnswerCompleted
- ResetCustom

Create the following game concepts under the "Concepts/Points" section of the game:
- GoldCoins
- AccumulatedPoints

Create the following badges under the "Concepts/BadgeColletions" section of the game:
- beginner badge
- expert contributor
- they trust you
- wrong answer
- expert badge
- contributor
- professional badge
- trusted contributor
- validator badge
- expert validator badge
- first steps
- professional cyclist
- cyclist
- green leaves
</br>
If you're using the online instance of the gamification engine then the game that is used in the web-app is called "OpenStreetMap" and you can check all the data inside of it.
</br>
</br>

Whether you used the online instance or the local one, you have to follow this next section anyway. 
Now the gamification engine should be ready. 
Go to the [web-app](AllNeededDirectories/bicycle-osm-app) folder and into the .env file you previously created. Now add the following variables:
- ID_GAME_USER = The id used during the login into the gamification engine
- ID_GAME_ENGINE = The game id of the game created inside the gamification engine
- PW_GAME_ENGINE = The password that you use to login to the gamification engine
- GAMIFICATION_LINK = link to the gamification engine (for example.: https://gamification-test.platform.smartcommunitylab.it if you used the online instance, localhost:8010 if you used the local one)

***Auth0***</br>
The web app uses auth0 in order to handle the user authentication. In order to create the web app it is necessary to create an auth0 account or to use an existing one (https://auth0.com/). 
Login to auth0, go to your dashboard, create an application and configure it for the vue.js use following the guide in the quick start section.You just have to create an application and an api giving them names.
Inside the [web-app](AllNeededDirectories/bicycle-osm-app) folder create a file called auth_config.json and add the following data to the json:
- "domain": The domain used by the created application (can be found in the settings section of the app)
- "clientId": The client ID used by the created application (can be found in the settings section of the app)
- "audience": The api identifier found in the api section.
- "client_secret": The client_secret of the app (can be found in the api settings inside the auth0 application)
- "grant_type": "client_credentials",
- "client_id_api": The api id of the application (can be found in the api settings inside Auth0)
- "app_url": The application's url (it's the same as the domain but with the addition of "https://")

Add the next urls to the callback urls inside the application in auth0: http://localhost:8080/callback, http://localhost:8080/myTiles. Add http://localhost:8080 in the callback, logout, weborigins, allowed origins fields in the settings of the application on Auth0. Check the guidelines of Auth0 if you want to change them.

In the Dashboard of the application linked to Auth0 you'll have to add a custom action called storeFirstNickName that needs to be called during the login. This action will create a field called signUpName inside the user data so that it is associated to the user in the gamification engine. The code for the custom action in the dashboard is this:</br>

exports.onExecutePostLogin = async (event, api) => { if (event.user.user_metadata.signUpName!=null) { console.log(Skipping the expensive task because it already occurred for ${event.user.email}.); return; } // do and expensive task api.user.setUserMetadata("signUpName", event.user.nickname); };</br>

Then you have to add a second action called saveUserSignUpName with code: </br>

exports.onExecutePreUserRegistration = async (event, api) => { //console.log(event.user) api.user.setAppMetadata("signUpName",event.user.nickname) console.log(api.user); };

Then you have to add a rule that lets auth0 get the metadata signUpName every time you want to get the user info. This rule has the code:</br>

function (user, context, callback) { const namespace = 'myUserID'; user.user_metadata = user.user_metadata || {}; user.user_metadata.signUpName = user.user_metadata.signUpName || null; context.idToken[${namespace}signUpName] = user.user_metadata.signUpName; callback(null, user, context); }</br>

Inside the section Actions/flow inside auth0 you can go to login and add the rule and the action storeFirstNickName created.
Insite the section Actions/flow/PreuserRegistration add the action saveUserSignUpName.

If you'd like to activate the email verification you can just go in the authGuard.js file and remove the comment from line 9 to 28.

***EmailJS***</br>
The webApp contains a section in which it is possible to leave an email for the developers. The service used is EmailJs (https://www.emailjs.com/). If you want to use this service then you have to subscribe to EmailJs and change the following fields:
- VUE_APP_EMAIL_JS_SERVICE_ID
- VUE_APP_EMAIL_JS_TEMPLATE_ID
- VUE_APP_EMAIL_JS_PUBLIC_KEY
- VUE_APP_EMAIL_JS_USER_ID

inside the .env file with yours by following the EmailJs guidelines. 

# Creation Of The Web-App Via Docker: </br>
In order to follow this way of creating the webApp you have to have access to the online gamification engine provided by FBK. If you do not have it then you can try to contact the developer in order to ask for the credentials or you can create the application following the guide without the use of docker. 

In order to create the app automatically you have to follow the instruction written in [dockerComposeLogic](DockerLogicFolder/dockerComposeLogic).
You'll have to move the folder "AllNeededDirectories" (path: AllNeededDirectories) inside the folder "dockerComposeLogic" (path:DockerLogicFolder/dockerComposeLogic) and then you'll have to follow the instruction written in the README that can be found in the dockerComposeLogic folder. 
If you follow these instructions then it is necessary to have docker installed. 
</br>
<br />
# Creation Without Docker:</br>
If you want to use the code and create the web-app without the need of docker then you can follow these instructions:
- In the folder[AllNeededDirectories](AllNeededDirectories) there's all the material regarding the code.
- The folder [create_geometry_spatialite](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite) handles the creation of the geometries, the database and the questions used by the webApp. 
- If you want to have questions and missions regarding certain cities you'll have to insert the xml files of the cities taken in consideration into the folder [CityDirectory](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite/CityDirectory/). The xml files need to have the same structure as the files inside of OSM. You can insert any number of cities you want,but beware that the more the cities, the more the time is needed to compile.
The xml Files need to have the same name as the city taken in consideration.
If you'd like to use public administration data or different data from the one provided by OSM you can check the code inside of [TraduzioneTags](AllNeededDirectories/FerraraTranslation/TraduzioneTags).
- The missions are created thanks to the tagAndKeys_NewVersion_answer.yaml file. By changing this file it is possible to change all the questions of the web-app and it is possible to create new questions. The logic behind this file is written inside the .ipynb file "FBKIterateQuestions" inside the folder  [create_geometry_spatialite](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite)
- Once you added the xml files you can run the "FBKIterateQuestions.ipynb" script. This script will create the database containing all the informations regarding the ways, the nodes and the missions associated. The database will be created in the folder [database_prova](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite/database_prova). The database name will be "withvalidation.db". This database has to be moved to the [CreateOtherTables](AllNeededDirectories/CreateOtherTables) folder and has to be renamed "applicationValid.db"
- Once you've done the previous steps, the folders inside ["singleWaysFiles"](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite/tmp/GeojsonFiles/singleWaysFiles) have to be copied/moved to the folder  src/AllNeededDirectories/tippecanoe/tippecanoe_funzionante/NewSystem/SingleWaysFiles/.
The folders inside ["singleNodesFiles"](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite/tmp/GeojsonFiles/singleNodesFiles) have to be copied/moved to the folder src/AllNeededDirectories/tippecanoe/tippecanoe_funzionante/NewSystem/SingleNodesFiles/. 
The folders inside [GeojsonFiles/centerWayPoints](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite/tmp/GeojsonFiles/centerWayPoints) have to be moved in the folder src/AllNeededDirectories/tippecanoe/tippecanoe_funzionante/NewSystem/CenterGeojsonCittà.
- Go to the [CreateOtherTables](AllNeededDirectories/CreateOtherTables) folder and run the otherTables.ipynb script. This script will create the medal table, power_up table and pin_table inside the database. The logic of how the powerups pins and medals are created is written inside the README of the CreateOtherTables folder.
- Once the script has done running move the "applicationValid.db" database contained in the CreateOtherTables folder inside the [AllNeededDirectories/bicycle-osm-app/databases](AllNeededDirectories/bicycle-osm-app/databases) folder
- Once that's done you have to go back in the src folder. Once there go to tippecanoe, tippecanoe_funzionante and then NewSystem.
- By opening and running the script "newSystemPbfCreation.ipynb" you'll be able to create all the folders containing the pbf files needed in the web-app and used by MapLibre. 
- The files generated by this code have to be moved inside the web-app. The folderss allNodesPbf, allWaysPbf and the file allNodesGeojson.geojson have to be moved to the folder src/AllNeededDirectories/bicycle_osm_app/pbfFiles. 
The files inside CenterGeojsonCittà have to be moved in src/AllNeededDirectories/bicycle_osm_app/pbfFiles/CenterGeojson. The files wayLayers.txt and nodeLayers.txt have to be moved in src/AllNeededDirectories/bicycle_osm_app/pbfFiles/LayersNames
- The last step is to launch the app. You have to move to the src/AllNeededDirectories/bicycle_osm_app folder and use the commands "npm run build", "npm start". At this point you can see the app running at "localhost:8080"
<br />

# Web-App Creation With Public Administration Data:</br>
- If the data comes from a public administration and are different from the ones of OSM, you can use the scripts and codes inside the "FerraraTranslation/TraduzioneTags" folder.
- The "convertiTags.ipynb" file creates all the .csv tables containing all the data of the public administration, along with the translations of said data in OSM syntax. In order to use this script you'll have to change the excel files that are used to translate from a public administration language to the OSM langauge. The way the excel files works and how to modify it is written inside the file "convertiTags.ipynb".
- Once you have created all the associations between the public administration syntax and the OSM one using the "convertiTags.ipynb" script, you can create the questions regarding the public administration using the "newCreateMissions.ipynb" script
- Also in this case there's a .yaml file that can be modified in order to create new and different missions. In this case the files is easier to understand, this is because the public-administration data doesn't have to be translated for the user to be understood (for example "on sidewalk = yes" contains only a key to be verified, while in OSM translating that same tag would be more difficult and would contain more keys). In order to change the questions you can change just the key and question fields.
- If you run the code you can add the new data to an existing database or create a new one. (In order to add the data to an existing database you have to put it in the database folder).
- If you want to add the data to an existing database you have to make sure that all the ids and geometries are different.
<br />

In order to use both OSM data and the public administration data you have to run both the scripts (the one inside the create_geometry_spatialite folder and the one in FerraraTranslation folder). The first script that has to be run is the one in the create_geometry_spatialite folder. Once the scripts are finished running then you'll have to move the folders and files inside the tippecanoe folder in order to create the pbfs. The pbfs are then needed by the webApp.
<br />
If you want to do everything automatically you can follow the instruction in (DockerLogicFolder/dockerComposeLogic).
If you want to use more data from public administrations then you'll have to modify the code a little, because for now you can create as many cities as you want using the OSM data, but you can create only one using the public administration data. 
Of Curse that can be avoided if you run the public administration script more than once and modify the file names. 


# How does it work:</br>
The web app consists in:
- Frontend created mainly via vue.js and MapLibre
- Backend characterized by a spatialite database containing all the data about the ways and the nodes. It can also be changed into any other sql database, but if you do so be aware that you'll have to change some parts of the code (those about the queries) inside the routes folder in the webApp. The spatialite database also contains a table for every user. This table contains all the powerups that the user bought. The backend consists also of the FBK gamification engine and an Auth0 database used to track the logins and logouts of the user.

The questions in the app are generated through  the files inside the [create_geometry_spatialite](AllNeededDirectories/create_geometry_remake/create_geometry_spatialite) folder. The missions are generated thanks to a .yaml file. Once the missions are created, the ways and nodes with their geometries are saved as geojson and xml so that they can be used in tippecanoe to create the pbf files. The pbf files are needed by MapLibre. 
The web-app uses pbf because they weigh less on the user side (even though they weigh a little more on the server side). 
The web-app contains 2 languages, english and italian. If you want to add more languages you'll have to upodate the translation.js file inside the webApp. 
