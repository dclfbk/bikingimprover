require('dotenv').config()
const auth_config = require("../auth_config.js")
const express = require('express');
const router = express.Router();
const databaseToUse = "./databases/applicationValid.db"
var request = require("request");

//UPDATE TABLE TO KNOW IF NODE/WAY HAVE ALL THEIR ANSWERS COMPLETED. IN THIS CASE I'M UPDATING A LIST OF IDS
router.post("/allAnswersCompletedList",(req,res)=>{
    const elements = req.body.elements
    //type = type.toLowerCase();
    console.log("MY ELEMENTS SARE")
    console.log(elements);
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);

    var queries = []
    for(var i=0; i<elements.length;i++){
        console.log(elements[i])
        var query = 'UPDATE completed_table SET completed = "yes" WHERE ID = "'+elements[i].ID+'" AND TYPE = "'+elements[i].TYPE.toLowerCase()+'";'; 
        queries.push(query)
    }

    console.log(queries)

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

router.get('/getCompletedFromQuestionTable',(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT ID, TYPE FROM \"question_table\" GROUP BY ID,TYPE HAVING MIN(NUMBEROFVALIDATIONS) >= 2;"
    console.log(query)
    const my_array = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
            my_array.push(element)
        },function(err,rows){
            if(err){
                res.status(500).send(err)
            }else{
                console.log(my_array);
                db.close();
                res.status(200).json(my_array);
            }
        })
    }) 
})

router.get('/getAllCompletedAnswersNotSent',(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT ID, TYPE, TAGANSWER, USERANSWERED, ANSWER, TIME, SENT FROM \"question_table\" WHERE NUMBEROFVALIDATIONS>= 2 AND VALIDATING=\"no\" AND TAGANSWER!=\"None\" AND SENT=\"no\";"
    console.log(query)
    const my_array = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
            my_array.push(element)
        },function(err,rows){
            if(err){
                res.status(500).send(err)
            }else{
                //console.log(my_array);
                db.close();
                res.status(200).json(my_array);
            }
        })
    }) 
})

//SEND THE ITEM TO OSM VIA USER ACCOUNT. IF USER ACCOUNT IS NOT ONLINE THEN EITHER SEND THEM WITH MY ACCOUNT OR WAIT
router.post("/importElements",(req,res)=>{
    const elements = req.body.elements
    const sendToOSMValidated = req.protocol + '://' + req.get('host') + "/osmCalls/validated/sendToOsm";
    console.log(sendToOSMValidated)

    var my_body = {
        "completed": elements
    };
    
    var options = { 
      method: 'POST',
      url: sendToOSMValidated,
      headers: { 'content-type': 'application/json' },
      body: my_body,
      json:true
    }

    //console.log(options);

    request(options, function(error, response, body){
        if (error) {
            console.error('Error sending element to the socket call:', error);
            res.status(500).json({ error: 'Failed to retrieve OSM element' });
        } else if(response.statusCode!=200){
            res.status(500).send("Error retrieving OSM ELEMENT");
        } else {
            console.log("It Worked")
            res.status(200).send(body)
        }
    })

})

router.post("/updateTime",(req,res)=>{
    const elements = req.body.elements
    //console.log(sendToOSMValidated)
    let cases = ""
    for(var i=0; i<elements.length;i++){
        if(i==0){
            cases = cases;
        }else{
            cases = cases + "OR "
        }
        cases = cases + "("
        cases = cases + "ID = " + elements[i].ID + " AND TYPE = \"" + elements[i].TYPE + "\" AND TAGANSWER = \"" + elements[i].TAGANSWER + "\" AND USERANSWERED = \"" + elements[i].USERANSWERED + "\")";
    }

    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    query = "UPDATE question_table SET TIME = TIME + 1 WHERE " + cases + ";"
    console.log(query);

    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
        },function(err,rows){
            if(err){
                res.status(500).send(err)
            }else{
                db.close();
                res.status(200).json("success");
            }
        })
    })
})

router.post("/updateSent",(req,res)=>{
    const elements = req.body.elements

    console.log(elements);
    //console.log(sendToOSMValidated)
    let cases = ""
    for(var i=0; i<elements.length;i++){
        if(i==0){
            cases = cases;
        }else{
            cases = cases + "OR "
        }
        cases = cases + "("
        cases = cases + "ID = " + elements[i].ID + " AND TYPE = \"" + elements[i].TYPE + "\" AND TAGANSWER = \"" + elements[i].TAGANSWER + "\" AND USERANSWERED = \"" + elements[i].USERANSWERED + "\")";
    }

    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    query = "UPDATE question_table SET SENT = \"yes\" WHERE " + cases + ";"
    console.log(query);

    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
        },function(err,rows){
            if(err){
                res.status(500).send(err)
            }else{
                db.close();
                res.status(200).json("success");
            }
        })
    })
})

router.post("/saveChangeset",(req,res)=>{
    const elements = req.body.changesetList
    /*"Added": my_import_responses[i].tagsAdded,
    "id": my_import_responses[i].id,
    "type": my_import_responses[i].type
    "changesetID": changesetID*/

    console.log(elements);
    //console.log(sendToOSMValidated)
    var query = "INSERT INTO changeset_table (CHANGESETID, NEWDATAIMPORT, ID, TYPE) VALUES "
    for(var i=0; i<elements.length;i++){
        if(i!=0){
            query = query + ", "
        }
        query = query + "("
        query = query + elements[i].changesetID.changesetID + ", \'" + elements[i].Added + "\', " + elements[i].id + ", \"" + elements[i].type + "\")"
    }
    query = query + ";"
    console.log(query);

    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);

    db.spatialite(function(err){
        db.each(query, function(err,row){
            //console.log(row)
            element = row;
        },function(err,rows){
            if(err){
                res.status(500).send(err)
            }else{
                db.close();
                res.status(200).json("success");
            }
        })
    })
})

module.exports = router;
