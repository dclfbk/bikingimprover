require('dotenv').config()
const { request } = require('express');
const express = require('express');

const router = express.Router();
const gamificationLink = process.env.GAMIFICATION_LINK

//call to the gamification engine that lets the user add remove or create an image. It is used to keep track of the pins of a user.
//it requires the id of the user (playerId), the name of the bought image (imageName) and the action that has to be called in the game engine (type)
router.post('/handleImage',(req,res)=>{
    var request = require("request");
    let playerId = req.body.playerId;
    let imageId = req.body.imageName;
    let type = req.body.type;
    let my_action_id = ""
    /*if(imageId==null||imageId==undefined||imageId==""){
        res.send("missing image...");
    }*/
    if(type=="add"){
        my_action_id = "AddImage"
    }else if(type=="remove"){
        my_action_id = "RemoveImage"
    }else if(type=="create"){
        my_action_id = "CreateImage"
    }
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
            "actionId": my_action_id,
            "data":{
                "gameID": game_id,
                "playerID": playerId,
                "solution":{"imageName":imageId},
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
        //console.log("THIS IS MY REQUEST YO: " + request);
        res.send(response)
    })
});

//This function calls the gamification engine to assign an image to the user
//It requires the user id (userId), the name of the bought image(imageName) and the money spent (moneySpent)
router.post('/buyImage',(req,res)=>{
    var request = require("request");
    var playerId = req.body.playerId;
    var image = req.body.imageName;
    var money = req.body.money;
    var moneySpent = money.toString();
    var my_action_id = "BuyImage"
    var now = new Date();
    var game_id = process.env.ID_GAME_ENGINE //
    var id_auth = process.env.ID_GAME_USER //
    var pw_auth = process.env.PW_GAME_ENGINE //
    var auth = "Basic " + Buffer.from(id_auth + ':' + pw_auth).toString('base64');
    var my_url = gamificationLink  + "/gamification/gengine/execute"
    var nowIso = now.toISOString();
    request({
        method:'POST',
        uri: my_url,
        headers:{
            "Authorization" : auth
        },
        body:{
            "actionId": my_action_id,
            "data":{
                "gameID": game_id,
                "playerID": playerId,
                "solution":{"imageName":image,
                            "price":moneySpent},
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
        //console.log("THIS IS MY REQUEST YO: " + request);
        res.send(response)
    })
})

//This function is used to save the pins inserted by the user in a geojson
//It requires the name of the image (image), the description used (description), the coordinates of the click(coordinates) and the user id(user)
router.post('/createGeoJson',(req,res)=>{
    var image = req.body.image;
    var user = req.body.user;
    var description = req.body.description;
    var coordinates = req.body.coordinates;
    var date = req.body.date
    var my_geojson = {
        "type": "Feature",
        "geometry":{
            "type": "Point",
            "coordinates": coordinates,
        },
        "properties": {
            "user":user,
            "description":description,
            "image":image,
            "date": date
        }
    }
    const fs = require('fs');
    fs.readFile("./pbfFiles/pinUser.geojson",'utf-8',function readFileCallback(err,data){
        if (err){
            console.log(err);
        }else{
            var json_obj = JSON.parse(data);
            console.log(json_obj)
            //Check if elements are expired, if so deletes them
            var now = new Date();
            var old = new Date();
            var seconds = 0;
            var to_remove = [];
            var length = json_obj.features.length;
            for(var i=0; i<length;i++){
                old = new Date(json_obj.features[i].properties.date);
                seconds = (now.getTime() - old.getTime())/1000;
                console.log(seconds)
                if(seconds>86400){
                    to_remove.push(i)
                }
            }
            for(var j in to_remove){
                json_obj.features = json_obj.features.splice(i,1);
            }
            //Insert the element
            json_obj.features.push(my_geojson);
            var json_str = JSON.stringify(json_obj);
            console.log(json_str);
            fs.writeFile("./pbfFiles/pinUser.geojson", json_str, 'utf-8', function(err){
                console.log("Item Inserted");
                console.log(err)
            });
        }
    });
    res.send("ok")
})

//Check if a pin inside the geojson has to be removed (if it is expired)
router.post('/controlExpireDate',(req,res)=>{
    const fs = require('fs');
    fs.readFile("./pbfFiles/pinUser.geojson",'utf-8',function readFileCallback(err,data){
        if (err){
            console.log(err);
        }else{
            var json_obj = JSON.parse(data);
            //Check if element is expired
            var now = new Date();
            var old = new Date();
            var seconds = 0;
            var to_remove = [];
            var length = json_obj.features.length;
            for(var i=0; i<length;i++){
                old = new Date(json_obj.features[i].properties.date);
                seconds = (now.getTime() - old.getTime())/1000;
                if(seconds>86400){
                    to_remove.push(i)
                }
            }
            for(var j in to_remove){
                json_obj.features = json_obj.features.splice(i,1);
            }
            var json_str = JSON.stringify(json_obj);
            fs.writeFile("./pbfFiles/pinUser.geojson", json_str, 'utf-8', function(err){
                console.log(err)
            });
        }
    });
    res.send("ok")
})

//Per ora non utilizzata
router.post('/deleteGeoJson',(req,res)=>{
    const fs = require('fs'); //necessary to create a geojson file
    fs.readFile("./pbfFiles/pinUser.geojson",'utf-8',function readFileCallback(err,data){
        if (err){
            console.log(err);
        }else{
            var json_obj = JSON.parse(data);
            var length = json_obj.features.length
            for(var i=0;i<=length;i++){
                json_obj.features.pop()
            }
            var json_str = JSON.stringify(json_obj);
            console.log(json_str);
            fs.writeFile("./pbfFiles/pinUser.geojson", json_str, 'utf-8', function(err){
                console.log("Item Inserted");
                console.log(err)
            });
        }
    });
    res.send("ok")
})

module.exports = router;