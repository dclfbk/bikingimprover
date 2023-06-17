require('dotenv').config()
const { request } = require('express');
const express = require('express');
const verify = require('./verifyPasswordCall');

const router = express.Router();
const databaseToUse = "./databases/applicationValid.db"
const gamificationLink = process.env.GAMIFICATION_LINK

//EXAMPLE REST API
router.get('/', verify, (req,res)=>{
    res.send("ah")
});

//ADD THE ANSWER To AN OPEN QUESTION TO THE ELEMENT WITH A CERTAIN ID AND QUESTION, ID ANSWER TYPE AND QUESTION ARE REQUESTED IN THE BODY
router.post('/addOpenAnswer',(req,res)=>{
    const allAnswers = req.body.answers;
    const userName = req.body.userName;

    console.log("ASJDIPIOSDJSPAD");
    console.log(allAnswers);
    //res.status(200).send("success");

    const queries = []
    for(var i=0; i < allAnswers.length; i++){
        var query = "UPDATE question_table SET ANSWER = \"" + allAnswers[i].answer +"\", USERANSWERED = \"" + userName + "\" WHERE ID = " +allAnswers[i].id+" AND QUESTION = \"" + allAnswers[i].question + "\"" + "AND TYPE = '" + allAnswers[i].type +"' AND ANSWER = \"\"" + ";" 
        queries.push(query);
    }
    console.log(queries);

    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    db.spatialite(function(err) {
        if (err) {
          console.log("THERE'S AN ERROR!" + err);
          res.status(400).send(err);
          return;
        }
      
        db.serialize(function() {
            db.run('BEGIN TRANSACTION;');
            var completedQueries = 0;
        
            queries.forEach(function(query) {
                db.run(query, function(err) {
                    if (err) {
                        console.log("THERE'S AN ERROR!" + err);
                        res.status(400).send(err);
                        return;
                    }
            
                    completedQueries++;
                    if (completedQueries === queries.length) {
                        db.run('COMMIT;', function(err) {
                            db.close();
                            if (err) {
                                console.log("THERE'S AN ERROR!" + err);
                                res.status(400).send(err);
                            } else {
                                console.log("Working...");
                                res.status(200).send("Success");
                            }
                        });
                    }
                });
            });
        });
    });
})

//ADD THE ANSWER TO THE ELEMENT WITH A CERTAIN ID AND QUESTION, ID ANSWER TYPE AND QUESTION ARE REQUESTED IN THE BODY
router.post('/addAnswer',(req,res)=>{
    const answer= req.body.answer;
    const id = req.body.id;
    const question = req.body.question;
    const type = req.body.type;
    const userName = req.body.userName;
    //const userName = "provaseFunziona";

    console.log(answer)
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    //var query = "UPDATE question_table SET ANSWER = \"" + answer + "\" WHERE ID = " +id+" AND QUESTION = \"" + question + "\"" + "AND TYPE = '" + type +"';" 
    var query = "UPDATE question_table SET ANSWER = \"" + answer +"\", USERANSWERED = \"" + userName + "\" WHERE ID = " +id+" AND QUESTION = \"" + question + "\"" + "AND TYPE = '" + type +"' AND ANSWER = \"\"" + ";" 
    //var query = "SELECT * FROM question_table WHERE ID = 39170833 AND QUESTION = 'Posso andare in bicicletta per questa strada?';" 
    //UPDATE question_table SET ANSWER = "SI",USERANSWERED = "PROVA",NUMBEROFVALIDATIONS = "0" WHERE ID = "13858908" AND QUESTION = "Posso andare in bicicletta per questa strada?"
    console.log(query)
    //const my_array = []
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
        },function(err,rows){
            db.close();
            if(err){
                console.log("THJERE?S AN ERROR!" + err)
                res.status(400).send(err);
            }else{
                //console.log(rows)
                console.log("working...")              
                res.status(200).send("success");
            }
        })
    })
    //console.log("queried");
})

//this function is used for the validations of the answers of other users
//it requires the chosen answer(answer), the id of the way/node(id), the type of the way or node(type), the user that has answered(userName),
//the list of validators(validators), the number of validations received(validations) and the question of the way/node(realQuestion)
router.post('/userValidatedOther',(req,res)=>{
    const answer= req.body.answer;
    const id = req.body.id;
    const question = req.body.question;
    const type = req.body.type;
    const userName = req.body.userName;
    var validators = req.body.validators;
    var validations = req.body.validations;
    const realQuestion = req.body.realQuestion;

    console.log(answer)
    console.log("THIS IS THE VALIDATIONS I RECEIVED" + validations);
    if(answer == "si"){
        if(validations == "" || validations == null || validations == undefined){
            console.log("undefined or nothing")
            validations = "1";
        }else{
            console.log("Have to increment the number")
            validations = parseInt(validations) + 1;
        }
    }else{
        if(validations == "" || validations == null || validations == undefined){
            console.log("undefined or nothing")
            validations = "-1";
        }else{
            console.log("Have to decrease the numebr")
            validations = parseInt(validations) - 1;
        }
    }
    validations = validations.toString();
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    console.log("this is the answer given to the validated other:" + answer)
    console.log("This is the number of validations " + validations);
    validators = validators + "," + userName
    var query = "UPDATE question_table SET NUMBEROFVALIDATIONS = \"" + validations +"\", USERSWHOVALIDATED = \"" + validators + "\" WHERE ID = " +id+" AND QUESTION = \"" + realQuestion + "\" " + "AND TYPE = '" + type +"';" 
    console.log(query);
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
            //my_array.push(element);
        },function(err,rows){
            //console.log(my_array);
            db.close();
            //my_json = JSON.stringify(my_array)
            if(err){
                console.log("THJERE?S AN ERROR!" + err)
                res.status(400).send(err);
            }else{
                console.log("working...")              
                res.status(200).send("success");
            }
        })
    })
})

//GIVE THE PLAYER THE REQUIRED POINTS FROM COMPLETING A MISSION
//REQUIRES THE PLAYER NAME IN THE BODY, THE TYPE OF MISSION (VALIDATION OR NORMAL) AND THE POINTS ASSOCIATED
router.post('/givePoint',verify,(req,res)=>{
    var request = require("request");
    let playerId = req.body.playerId;
    let typeMission = req.body.typeMission;
    let points = req.body.points;
    let numberAnswers = req.body.listLength;
    let my_action_id = ""
    console.log(playerId);
    console.log(typeMission);
    console.log(points)
    if(typeMission=="validation"){
        my_action_id = "ValidatePoint"
    }else if(typeMission == "normal"){
        my_action_id = "PinAnswerCompleted"
    }else if(typeMission == "remove"){
        my_action_id = "RemovePoints"
    }else if(typeMission == "trust"){
        my_action_id = "GiveTrust"
    }else if(typeMission == "testing"){
        my_action_id = "TestData"
    }else if(typeMission == "reset"){
        my_action_id = "ResetCustom"
    }
    console.log(my_action_id)
    var game_id = process.env.ID_GAME_ENGINE //
    var id_auth = process.env.ID_GAME_USER //
    var pw_auth = process.env.PW_GAME_ENGINE //
    var auth = "Basic " + Buffer.from(id_auth + ':' + pw_auth).toString('base64');
    //var my_url = "https://dev.smartcommunitylab.it/gamification-v3/gengine/execute"
    var my_url = gamificationLink + "/gamification/gengine/execute"
    var now = new Date();
    //console.log("THIS IS AUTH: " + auth);
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
                "solution":{"points":points, "numberAnswers": numberAnswers}
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

module.exports = router;
