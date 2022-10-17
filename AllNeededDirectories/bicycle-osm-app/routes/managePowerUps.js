require('dotenv').config()
const { request } = require('express');
const express = require('express');
const verify = require('./verifyPasswordCall');

const router = express.Router();
const databaseToUse = "./databases/applicationValid.db"
const gamificationLink = process.env.GAMIFICATION_LINK

//To call when user is created in the app.  Or the first time the user buys a power up. Better when user created.   
//it creates the user table used to hold info regarding the pwoer ups bought. 
//it requires the user name in the body (userName)
router.post('/createUserTable',verify,(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var userName = req.body.userName;
    var query = "CREATE TABLE " + userName + " (POWERNAME VARCHAR(100), TIME VARCHAR(100), LIFETIME VARCHAR(100));"
    console.log(query);
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
        },function(err,rows){
            db.close();
            if(err){
                console.log("THERE'S AN ERROR!" + err)
                res.status(400).send(err);
            }else{
                console.log("working...")              
                res.status(200).send("success");
            }
        })
    })
})

//used to delete the user table
//it requires the user name in the body (userName)
router.post('/dropTable', verify,(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var userName = req.body.userName;
    var query = "DROP TABLE " + userName;
    console.log(query);
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
        },function(err,rows){
            db.close();
            if(err){
                console.log("THERE'S AN ERROR!" + err)
                res.status(400).send(err);
            }else{
                console.log("dropped...")              
                res.status(200).send("success");
            }
        })
    })
})

//calls the gamification engine to update the user data
//requires the player id(userName), the price of the item bought (price) 
router.post("/buyPowerEngine", verify,(req,res)=>{
    console.log("enter Buy power up engine");
    var request = require("request");
    var playerId = req.body.userName;
    var price = req.body.price;
    price = price.toString();
    console.log(price);
    console.log(playerId);
    var game_id = process.env.ID_GAME_ENGINE //
    var id_auth = process.env.ID_GAME_USER //
    var pw_auth = process.env.PW_GAME_ENGINE //
    var auth = "Basic " + Buffer.from(id_auth + ':' + pw_auth).toString('base64');
    //var my_url = "https://dev.smartcommunitylab.it/gamification-v3/gengine/execute"
    var my_url = gamificationLink + "/gamification/gengine/execute"
    var now = new Date();
    console.log("THIS IS AUTH: " + auth);
    var nowIso = now.toISOString();
    request({
        method:'POST',
        uri: my_url,
        headers:{
            "Authorization" : auth
        },
        body:{
            "actionId": "BuyPowerUp",
            "data":{
                "gameID": game_id,
                "playerID": playerId,
                "solution":{"price":price}
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

//Retrieve all the power ups inside of the database
//requires the name of the table inside the db (tableName)
router.post("/retrieveAll", verify,(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var tableName = req.body.tableName;
    var query = "SELECT * FROM " + tableName + ";"
    var my_array=[]
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element= row;
            my_array.push(element)
        },function(err,rows){
            db.close();
            if(err){
                console.log("There's an error!" + err)
                res.status(400).send([])
            }else{
                console.log("retrieved all");
                var now = new Date();
                var resultDate;
                var new_array=[];
                var diffTime;
                var diffDays;
                for(var i=0;i<my_array.length;i++){
                    resultDate = new Date(my_array[i].TIME);
                    //console.log(resultDate)
                    diffTime = Math.abs(now - resultDate);
                    diffDays = diffTime / (1000*60*60*24);
                    //console.log(diffTime)
                    //console.log(diffDays)
                    if(diffDays<1){
                        new_array.push(my_array[i])
                    }
                }
                res.status(200).send(new_array)
            }
        })
    })
})

//Add a power up to the user table. If the power up already exists then it is updated.
//requires the power up name, the time of the call and the username in the body. (powerUpName, time, userName)
router.post('/addFieldTable',verify,(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var powerUpName = req.body.powerUpName;
    var time = req.body.time;
    var userName = req.body.userName
    var checkQuery="SELECT * FROM " + userName + " WHERE POWERNAME=\""+ powerUpName + "\"";

    db.spatialite(function(err){
        db.each(checkQuery,function(err,row){
            element = row;
        },function(err,rows){
            if(err){
                console.log("error " + err)
            }else{
                console.log(rows);
                if(rows == 0){
                    //I create the power up
                    var query = "INSERT INTO " + userName + " (POWERNAME,TIME,LIFETIME) VALUES(" + "\"" + powerUpName + "\",\"" + time + "\",\"1\");"
                    console.log(query)
                    db.spatialite(function(err){
                        db.each(query, function(err,row){
                            element = row;
                        },function(err,rows){
                            db.close();
                            if(err){
                                console.log("THERE'S AN ERROR!" + err)
                                res.status(400).send(err);
                            }else{
                                //console.log(rows)
                                console.log("working...")              
                                res.status(200).send("success");
                            }
                        })
                    })
                }else{
                    //The power up has been already created, but maybe it has expired..
                    //If it has expired I recreate it... otherwise I warn the user that he/she already has the power up
                    var resultDate = new Date(element.TIME)
                    var now = new Date();
                    console.log(resultDate)
                    console.log(now)
                    var diffTime = Math.abs(now - resultDate);
                    var diffDays = diffTime / (1000*60*60*24);
                    console.log(diffTime);
                    console.log(diffDays);
                    if(diffDays<1){
                        //user cannot buy item because he already has it and has to expire first.
                        res.status(201).send("alreadyHave")
                    }else{
                        //update with current date so user can use the power up again
                        updateQuery = "UPDATE " + userName + " SET TIME =\"" + now + "\";"
                        db.spatialite(function(err){
                            db.each(updateQuery, function(err,row){
                                element = row;
                            },function(err,rows){
                                db.close();
                                if(err){
                                    console.log("THERE'S AN ERROR!" + err)
                                    res.status(400).send(err);
                                }else{
                                    console.log("working...")              
                                    res.status(200).send("bought");
                                }
                            })
                        })
                    }
                }
            }
        })
    })
    console.log(checkQuery);
})

module.exports = router;