require('dotenv').config()
const auth_config = require("../auth_config.js")
const clientId = auth_config.client_id_api
const client_secret = auth_config.client_secret
const domain = auth_config.domain
const audience = auth_config.audience
const grant_type = auth_config.grant_type
const app_url = auth_config.app_url;

const express = require('express');
const verify = require('./verifyPasswordCall');
const { Console } = require('console')

const router = express.Router();
const databaseToUse = "./databases/applicationValid.db"
const gamificationLink = process.env.GAMIFICATION_LINK

//EXAMPLE REST API
router.get('/', (req,res)=>{
    //res.send("we are on psots");
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT id,type from merged where ST_Distance(GeomFromText('POINT(11.194239 46.052415)',4326),geom,0)< 700.120 UNION ALL SELECT id,type FROM node_merged where ST_Distance(GeomFromText('POINT(11.194239 46.052415)',4326),geom,0)< 2500.120"
    db.spatialite(function(err) {
        db.each(query, function(err, row) {
        console.log(row);
        });
    });
    
    res.send("We're on post")
});

//GET ID AND TYPE OF ALL NODES AND WAYS INSIDE A CERTAIN AREA
router.post('/',(req,res)=>{
    const lat = req.body.latitude;
    const long = req.body.longitude;
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT id,type from merged where ST_Distance(GeomFromText('POINT(" + long + " " + lat + ")',4326),geom,0)< 700.120"+
                " UNION ALL SELECT id,type FROM node_merged where ST_Distance(GeomFromText('POINT(" + long + " " + lat + ")',4326),geom,0)< 2500.120"
    console.log(query)
    const my_array = []
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
            my_array.push(element);
        },function(err,rows){
            //console.log(element)
            console.log(my_array);
            db.close();
            //my_json = JSON.stringify(my_array)
            //HERE I SHOULD LOOK WHEThER OR NOT MY NODES AND WAYS HAVE ALREADY AN ANSWER OR NOT
            res.status(200).send(my_array);
        })
    })
})

//GET MISSION FOR THE SINGLE NODE/WAY WITH A CERTAIN ID
//it requires the type of the object (type) and the id of the geometry (geomid)
router.get('/:geomid&:type',(req,res)=>{
    const type = req.params.type;
    const my_id = req.params.geomid;
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT * FROM 'question_table' WHERE ID IS '" + my_id +"' AND TYPE IS '" + type + "' AND NUMBEROFVALIDATIONS < " + '"2"'+";";
    console.log(query)
    const my_array = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
            my_array.push(element)
        },function(err,rows){
            console.log(my_array);
            db.close();
            res.status(200).send(my_array);
        })
    }) 
})

//GET ALL INFO ABOUT WAY AND NODE WITH A CERTAIN ID AND TYPE, REQUIRES DATA WITH ID AND TYPE OF THE OBJECT (ex: "data":[{"id": 23762376, "type":"way"},{"id": 292315332, "type":"way"},{"id": 303166646,  "type":"way"}],)
router.post('/getAllWithIds', (req,res)=>{
    const data = req.body.data
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    if(data == null){
        res.status(400).send("no ids found")
    }
    my_array = []
    for(var i in data){
        my_array.push(data[i]);
    }
    var query = "SELECT * FROM 'question_table' WHERE ID IS "
    for (var i in my_array){
        query = query + my_array[i].id +" AND TYPE IS '" +my_array[i].type.toUpperCase() + "' OR ID IS "
    }
    query = query.substring(0, query.length-10);
    //console.log(query);
    my_result = []
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
            my_result.push(element)
        },function(err,rows){
            console.log(my_result);
            db.close();
            res.status(200).send(my_result);
        })
    }) 
})

//GET ALL GEOJSON FILES SPECIFIED IN THE BODY
router.post('/getgeojson',(req,res)=>{
    const fs = require('fs');
    const data = req.body.data
    if(data == null){
        res.status(400).send("no ids found")
    }
    var files = []//{"myjsons":[]};//[];
    for(var i in data){
        if(data[i].type == "node"){
            try{
                file = "./my_files/singleNodesFiles/node" + data[i].id + ".geojson";
                var file_to_add = fs.readFileSync(file,'utf-8')
                JSON.parse(file_to_add)
            }catch(err){
                console.error(err)
                res.status(400).json({message:err});
            }
        }else{
            try{
                file = "./my_files/singleWaysFiles/way" + data[i].id + ".geojson";
                var file_to_add = fs.readFileSync(file,'utf-8')
                JSON.parse(file_to_add)
            }catch(err){
                console.error(err)
                res.status(400).json({message:err});
            } 
        }
        files.push(file_to_add)
        JSON.stringify(files)
    }
    res.json(files)
})

//GET ALL WAYS THAT HAVE ALL ANSWERS COMPLETED
router.get('/way/checkcompleted',(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT ID FROM 'completed_table' WHERE completed IS " + '"yes" AND type IS "way"';
    console.log(query)
    const my_array = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
            my_array.push(element)
        },function(err,rows){
            console.log(my_array);
            db.close();
            res.status(200).send(my_array);
        })
    }) 
})

//GET ALL NODES THAT HAVE ALL ANSWERS COMPLETED
router.get('/node/checkcompleted',(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT ID FROM 'completed_table' WHERE completed IS " + '"yes" AND type IS "node"';
    console.log(query)
    const my_array = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
            my_array.push(element)
        },function(err,rows){
            console.log(my_array);
            db.close();
            res.status(200).send(my_array);
        })
    }) 
})

//get all the ways that have the score less than the one specified
//it requires a score in the body (score)
router.get('/higherScore/:score',(req,res)=>{
    var score  = req.params.score;
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    //var query = 'SELECT id FROM "completed_table" WHERE CAST(SCORE as double) < CAST(\'' + score + '\' as double) OR completed IS "yes"'
    var query = 'SELECT id,type FROM "completed_table" WHERE CAST(SCORE as double) < CAST(\'' + score + '\' as double) OR completed IS "yes"'
    var way_array = [];
    var node_array = [];
    var array_to_return = [];
    console.log(query);
    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
            if(element.type=='node'){
                node_array.push(element.id)
            }else{
                way_array.push(element.id)
            }
        },function(err,rows){
            array_to_return.push(way_array);
            array_to_return.push(node_array)
            db.close();
            if(err){
                res.status(400).send(err);
            }else{
                res.status(200).send(array_to_return);
            }
        })
    }) 
})

//GET ALL THE LAYER NAMES OF WAYS
router.get('/way/getAllLayerNames',(req,res)=>{
    const fs = require('fs');
    const contents = fs.readFileSync("./pbfFiles/LayersNames/wayLayers.txt",'utf-8');
    var arr = contents.split(/\r?\n/);
    console.log(arr)
    arr.pop();
    arr = JSON.stringify(arr);
    res.status(200).send(arr);
})

//GET ALL THE LAYER NAMES OF NODES
router.get('/node/getAllLayerNames',(req,res)=>{
    const fs = require('fs');
    const contents = fs.readFileSync("./pbfFiles/LayersNames/nodeLayers.txt",'utf-8');
    var arr = contents.split(/\r?\n/);
    console.log(arr)
    arr.pop()
    arr = JSON.stringify(arr);
    res.status(200).send(arr);
})

//UPDATE TABLE TO KNOW IF NODE/WAY HAVE ALL THEIR ANSWERS COMPLETED
router.post("/allAnswerCompleted",(req,res)=>{
    const id = req.body.id
    var type = req.body.type
    type = type.toLowerCase();
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = 'UPDATE completed_table SET completed = "yes" WHERE ID = "'+id+'" AND TYPE = "'+type+'";'; 
    console.log(query)
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
        },function(err,rows){
            db.close();
            if(err){
                res.status(400).send(err);
            }else{
                console.log("working...")
                res.status(200).send();
            }
        })
    })
})


//serve solo per resettare tutto durante le prove
router.get("/resetAllCompleted",(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = 'UPDATE completed_table SET completed = "no" WHERE ID = "201175000" AND TYPE = "way";'; 
    console.log(query)
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
        },function(err,rows){
            db.close();
            if(err){
                res.status(400).send(err);
            }else{
                console.log("working...")
                res.status(200).send();
            }
        })
    })
})

router.get('/node/checkIfWorking',(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    //var query = "SELECT * FROM 'question_table' WHERE ID IS '" + my_id +"' AND TYPE IS '" + type + "';";
    var query = "SELECT * FROM 'completed_table' WHERE completed IS " + '"no" AND type IS "node"';
    console.log(query)
    const my_array = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
            my_array.push(element)
        },function(err,rows){
            console.log(my_array);
            db.close();
            res.status(200).send(my_array);
        })
    }) 
})

/*This function is used to gain the token used to access to the auth0 api*/
router.get('/user/getTokenApi',(req,res)=>{
    var request = require("request");
    var body = '{"client_id":"' + clientId + '","client_secret":"' + client_secret + '", "audience":"' + audience + '","grant_type":"'+ grant_type + '"}';
    
    var options = { method: 'POST',
      url: app_url + 'oauth/token',
      headers: { 'content-type': 'application/json' },
      body: body}
      request(options, function (error, response, body) {
      if (error) throw new Error(error);
      res.send(body)
    });
})

/*This function lets the user change username.
it requires the user id (user_id) and the new name (new_name) in the body.*/
router.post('/user/changeUsername',(req,res)=>{
    var request = require("request");
    var user_id = req.body.user_id;
    var new_name = req.body.new_name;
    var user_acc_token = req.headers.authorization;
    console.log("Am I WORKING?")
    var my_url = app_url + 'api/v2/users/' + user_id;
    var my_body = {
        "nickname" : new_name
    }
    var options ={ method:'PATCH',
        url: my_url,
        headers: {'Content-Type': 'application/json',"Authorization": user_acc_token},
        body: JSON.stringify(my_body)
    };
    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body)
        res.send(response)
    });

})

router.post('/user/changeUserNameEngine', (req,res)=>{
    var request = require('request');
    var playerId = req.body.oldName;
    var new_name = req.body.newName;

    var game_id = process.env.ID_GAME_ENGINE //
    var id_auth = process.env.ID_GAME_USER //
    var pw_auth = process.env.PW_GAME_ENGINE //
    var auth = "Basic " + Buffer.from(id_auth + ':' + pw_auth).toString('base64');
    var my_url = gamificationLink + "/gamification/gengine/execute"
    var now = new Date();
    var nowIso = now.toISOString();
    request({
        method:'POST',
        uri: my_url,
        headers:{
            "Authorization" : auth
        },
        body:{
            "actionId": "ChangeName",
            "data":{
                "gameID": game_id,
                "playerID": playerId,
                "solution":{"newName":new_name}
            },
            "executionMoment": nowIso,
            "gameId": game_id,
            "playerId": playerId
        },
        json:true

    },function(error,response,body){
        if(error){
            console.log("this is my error: " + error);
            console.log("this is my response: " + response);
        }
        const myJson = JSON.stringify(response);
        console.log("this is json: " +myJson);
        console.log("this is response: " +response);
        res.send(response)
    })
})

/*Get the data about a certain user,
it requires the user id in the body (userid)*/
router.get('/user/getUser/:userid',(req,res)=>{
    var request = require("request");
    var user_id = req.params.userid;
    var game_id = process.env.ID_GAME_ENGINE //
    var id_auth = process.env.ID_GAME_USER //
    var pw_auth = process.env.PW_GAME_ENGINE //
    var auth = "Basic " + Buffer.from(id_auth + ':' + pw_auth).toString('base64');
    //var my_url = "https://dev.smartcommunitylab.it/gamification-v3/data/game/" + game_id + "/player/"+ user_id;
    var my_url = gamificationLink + "/gamification/data/game/" + game_id + "/player/"+ user_id;
    request({
        method: 'GET',
        uri: my_url,
        headers: {
            "Authorization" : auth
        },
        json: true
    },function(error,response,body){
        if(error){
            console.log("this is my error: " + error);
            console.log("This is my response: " + response);
            res.status(404).send()
        }
        stringified_body = JSON.stringify(body);
        console.log("this is body: " +JSON.stringify(body));
        res.status(200).send(stringified_body)
    })
});

/* create a new user inside the gamification engine, if it already exists then it returns the user itself*/
//requires the username (userid) in the body 
router.post("/user/createNewUser",(req,res)=>{
    var request = require("request");
    var user_id = req.body.userid;
    var game_id = process.env.ID_GAME_ENGINE //
    var id_auth = process.env.ID_GAME_USER //
    var pw_auth = process.env.PW_GAME_ENGINE //
    var auth = "Basic " + Buffer.from(id_auth + ':' + pw_auth).toString('base64');
    //var my_url = "https://dev.smartcommunitylab.it/gamification-v3/data/game/" + game_id + "/player/"+ user_id;
    var my_url = gamificationLink + "/gamification/data/game/" + game_id + "/player/"+ user_id;
    //console.log(auth)
    console.log("CREATING NEW USER....")
    console.log(my_url);
    request({
        method: 'post',
        uri: my_url,
        headers: {
            "Authorization" : auth,
        },
        body:{
            "playerId": user_id,
            /*"customData":{
                "level_up_points": 0,
                "level": 0,
            }*/
        },
        json: true
    },function(error,response,body){
        if(error){
            console.log("this is my error: " + error);
            console.log("This is my response: " + response);
            res.status(404).send()
        }
        stringified_body = JSON.stringify(body);
        console.log("this is body: " +JSON.stringify(body));
        console.log("NOT STRINGIFIED BODY: "+body)
        res.status(200).send(body)
    })
});

//This API is used to get the classification of the users inside the game
router.get('/user/getUserClassification',(req,res)=>{
    var request = require("request");
    var game_id = process.env.ID_GAME_ENGINE //
    var id_auth = process.env.ID_GAME_USER //
    var pw_auth = process.env.PW_GAME_ENGINE //
    var auth = "Basic " + Buffer.from(id_auth + ':' + pw_auth).toString('base64');
    //var my_url = "https://dev.smartcommunitylab.it/gamification-v3/gengine/state/" + game_id + "?page=1&size=1000";
    var my_url = gamificationLink + "/gamification/gengine/state/" + game_id + "?page=1&size=1000";
    //console.log(my_url);
    request({
        method: 'GET',
        uri: my_url,
        headers: {
            "Authorization" : auth
        },
        json: true
    },function(error,response,body){
        if(error){
            console.log("this is my error: " + error);
            console.log("This is my response: " + response);
            res.status(404).send()
        }
        stringified_body = JSON.stringify(body);
        console.log("this is body: " +JSON.stringify(body));
        res.status(200).send(stringified_body)
    })
});

//deletes the answer previously given by a certain user and resets the number of validations.
//it requires the id of the way/nde (id), the type of the geometry (type) and the question that needs to be reset (question)in the body
router.post("/deleteUserAnswer", (req,res)=>{
    var id = req.body.id
    var question = req.body.question
    var type = req.body.type
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "UPDATE question_table SET ANSWER = " + "\"\"" + ", USERANSWERED = "+ "\"\"" + ", NUMBEROFVALIDATIONS = 0" + ", USERSWHOVALIDATED = \"\""
               + " WHERE ID IS '" + id +"' AND TYPE IS '" + type + "'AND QUESTION IS '" + question + "'"  ;
    
    //UPDATE question_table SET ANSWER = "", USERANSWERED = "", NUMBEROFVALIDATIONS = 0, USERSWHOVALIDATED = "" WHERE ID IS 13858908 AND TYPE IS 'WAY' AND QUESTION IS 'Posso andare in bicicletta per questa strada?'
    console.log(query)
    const my_array = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
            my_array.push(element)
        },function(err,rows){
            console.log(my_array);
            db.close();
            res.status(200).send(my_array);
        })
    }) 
})

//returns an array with all the points that are inside a certain geojson.
//it requires the geojson in the body.
router.post("/getAllPoints",(req,res) =>{
    var geojsonName = req.body.geojsonName;
    var idCoordinate;
    var allPoints = [];
    const fs = require('fs');
    fs.readFile("./pbfFiles/" + geojsonName,'utf-8',function readFileCallback(err,data){
        if (err){
            console.log(err);
        }else{
            var json_obj = JSON.parse(data);
            //Verifico se ci sono elementi da eliminare perchè sono presenti da troppo tempo
            var length = json_obj.features.length;
            for(var i=0; i<length;i++){
                //console.log(json_obj[i])
                //console.log(json_obj.features[i].geometry.coordinates);
                idCoordinate = {
                    "id" : json_obj.features[i].properties.id,
                    "coordinates": json_obj.features[i].geometry.coordinates
                }
                allPoints.push(idCoordinate);
            }
        }
        console.log(allPoints);
        res.status(200).send(allPoints);
    });
    
})

router.post("/get-osm-token",(req,res) => {
    var request = require("request");
    const token = req.get("token");
    var user_id = req.body.user_id;

    //console.log(token)
    try {
        // Make a request to the OSM API to obtain the access token
        const osmAuthTokenUrl = "https://" + domain + "/api/v2/users/" + user_id;
        //console.log(osmAuthTokenUrl)

        const options = {
            method: 'GET',
            uri: osmAuthTokenUrl,
            headers: { "Authorization" : token},
            json: true
        };
        
        request(options, (error, response, body) => {
            if (error) {
              console.error('Error retrieving OSM access token:', error);
              res.status(500).json({ error: 'Failed to retrieve OSM access token' });
            } else {
              // Extract the OSM access token from the response
              console.log("this is body: ")
              console.log(body);
              var osmToken = ""
              for(var i=0; i<body.identities.length; i++){
                  if(body.identities[i].connection == "OpenStreetMap"){
                      console.log("connected via OSM")
                      osmToken = body.identities[i].access_token;
                  }
              }
              if(osmToken == ""){
                  console.log("OSM Token not found");
                  res.status(404).json({error: "OSM token not found in this user"})
              }else{
                res.status(200).json({ osmToken });
              }
              //const osmToken = body.identities[0].access_token;
              //res.status(200).json({ osmToken });
            }
        });
    } catch (error) {
        console.error('Error retrieving OSM access token:', error);
        throw new Error('Failed to retrieve OSM access token');
    }
})

router.get('/checkTokenValidity', (req, res) => {
    try {
      // Invoke the middleware
      verify(req, res, (err) => {
        if (err) {
          // Middleware returned an error
          res.status(403).send({ error: 'Invalid token' });
        } else {
          // Middleware succeeded
          res.status(200).send({ valid: true });
        }
      });
    } catch (error) {
      // Error occurred while invoking the middleware
      res.status(500).send({ error: 'Internal server error' });
    }
});

module.exports = router;