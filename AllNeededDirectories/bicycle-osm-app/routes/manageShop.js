require('dotenv').config()
const { request } = require('express');
const express = require('express');

const router = express.Router();
const databaseToUse = "./databases/applicationValid.db"


//Get all the pins that the user can buy in the shop
router.get('/getPins',(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT * FROM 'pins_table'"
    var array = [];
    console.log(query);
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
            array.push(element);
        },function(err,rows){
            db.close();
            if(err){
                console.log("THERE'S AN ERROR!" + err)
                res.status(400).send(err);
            }else{
                console.log("working...")              
                res.status(200).send(array);
            }
        })
    })
})

//Get allt he power ups that the user can buy in the shop
router.get('/getPowerUps',(req,res)=>{
    var sqlite = require('spatialite');
    var db = new sqlite.Database(databaseToUse);
    var query = "SELECT * FROM 'powerUps_table'"
    var array = [];
    console.log(query);
    db.spatialite(function(err){
        db.each(query, function(err,row){
            element = row;
            array.push(element);
        },function(err,rows){
            db.close();
            if(err){
                console.log("THERE'S AN ERROR!" + err)
                res.status(400).send(err);
            }else{
                console.log("working...")              
                res.status(200).send(array);
            }
        })
    })
})

module.exports = router;