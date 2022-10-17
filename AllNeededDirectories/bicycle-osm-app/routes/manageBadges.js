require('dotenv').config()
const { request } = require('express');
const express = require('express');
const verify = require('./verifyPasswordCall');

const router = express.Router();
const databaseToUse = "./databases/applicationValid.db"


//The body is characterized by a list of medals
router.post('/retrieve', verify,(req,res)=>{
    var badges = req.body.badges;
    //Cerco le medaglie nel database e le ritorno tutte 
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT * FROM medals_table WHERE MEDALNAME IN (\"";
    query = query + req.body[0] + "\"";
    //console.log(query);
    for(var i=1;i<req.body.length;i++){
        console.log(req.body[i]);
        query = query + ",\"" + req.body[i] + "\"";
    }
    var query = query + ");"
    console.log(query); //SELECT * FROM 'medals_table' WHERE MEDALNAME IN ("they trust you","cyclist");
    var result = [];
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
            result.push(element)
        },function(err,rows){
            db.close();
            if(err){
                console.log("THERE'S AN ERROR!" + err)
                res.status(400).send(err);
            }else{          
                console.log(result)
                res.status(200).send(result);
            }
        })
    })

})

module.exports = router;