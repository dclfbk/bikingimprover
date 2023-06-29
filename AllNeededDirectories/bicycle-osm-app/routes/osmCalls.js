require('dotenv').config()
const auth_config = require("../auth_config.js")
const app_url = auth_config.app_url;

const express = require('express');
const verify = require('./verifyPasswordCall');
const router = express.Router();
const databaseToUse = "./databases/applicationValid.db"
const { DOMParser } = require('xmldom');
const xmlFormatter  = require('xml-formatter');


router.get("/getOSMElement/:type&:id", (req,res)=>{
    const id = req.params.id;
    const type = req.params.type;
    const request = require("request");
    //GET OSM ELEMENT
    try{   
        var osmUrlApi = "https://openstreetmap.org/api/0.6/";
        //var osmUrlApi = "https://master.apis.dev.openstreetmap.org/api/0.6/";
        osmUrlApi = osmUrlApi + type + "/" + id;
        console.log(osmUrlApi)
        //console.log(osmUrlApi)

        const options = {
            method: 'GET',
            uri: osmUrlApi,
            headers: { "Content-Type":"application/json"},
        };
        
        request(options, function(error, response, body){
            if (error) {
                console.error('Error retrieving OSM element:', error);
                res.status(500).json("Error");
            } else if(response.statusCode!=200){
                res.status(500).send("Error");
            } else {
                //console.log("was able to retrieve OSM element")
                console.log(body);
                res.status(200).send(body)
            }
        });

    } catch (error) {
        console.error('Error getting element:', error);
        throw new Error('Failed to retrieve OSM element');
    }
})

router.post("/sendOSM", (req,res)=>{
    const data = req.body.data;
    const token = req.get("osm_token");
    const id = data[0].ID
    const type = data[0].TYPE.toLowerCase();
    console.log(data);
    const request = require("request");
    
    const fullUrl = req.protocol + '://' + req.get('host') + "/posts/";
    console.log(fullUrl);

    console.log(req.body);
    console.log(token);

    //GET OSM ELEMENT
    try{   
        //const osmUrlApi = "https://api.openstreetmap.org/api/0.6/" + type + "/" + id;
        const osmUrlApi = fullUrl + "getOSMElement" + "/" + type + "&" + id;
        console.log(osmUrlApi);

        const options = {
            method: 'GET',
            uri: osmUrlApi,
            headers: { "Content-Type":"application/json"},
            json: true
        };
        
        request(options, function(error, response, body){
            if (error) {
                console.error('Error retrieving OSM element:', error);
                res.status(500).json({ error: 'Failed to retrieve OSM element' });
            } else if(response.statusCode!=200){
                console.log("ERROR retrieving OSM ELEMENT");
                console.log(response)
                res.status(500).send("Error retrieving OSM ELEMENT");
            } else {
                console.log("was able to retrieve OSM element")
                console.log(body);
                const old_element = body;

                //CREATE CHANGESETS AND UPDATE ELEMENT IN OSM
                const importUrl = fullUrl + "importOSM";   
                console.log(importUrl);
                const my_body = {
                    "new_element": data,
                    "old_element": old_element
                }
                const importOptions = {
                    method: 'POST',
                    uri: importUrl,
                    headers: { "Content-Type":"application/json", "osm_token": token},
                    body: my_body,
                    json: true
                };

                request(importOptions, function(error,response,body){
                    if (error) {
                        console.error('Error importing OSM element:', error);
                        res.status(500).json({ error: 'Failed to retrieve OSM element' });
                    } else {

                        if(response.statusCode!=200){
                            console.log("THERE WAS INDEED AN ERROR!")
                            res.status(500).send(response)
                        }else{
                            console.log("seems everything went ok")
                            console.log(body)
                            res.status(200).send(body);
                        }
                    }
                })
                
                //res.status(200).json({ok: "ok"});
            }
        });

    } catch (error) {
        console.error('Error retrieving OSM access token:', error);
        throw new Error('Failed to retrieve OSM access token');
    }

});

router.post("/createChangeset", async (req,res)=>{
    const token = req.get("osm_token");
    console.log(token);
    let osmPw;

    if(token == "MyOSMUser"){
        const OSMid = process.env.OSMUserID
        const OSMpw = process.env.OSMUserPW
        const credentials = `${OSMid}:${OSMpw}`;
        const encodedCredentials = btoa(credentials);
        osmPw = `Basic ${encodedCredentials}`;
    }else{
        osmPw = "Bearer " + token;
    }

    var changesetId;
                
    //const createChangesetUrl = "http://localhost:3000/api/0.6/changeset/create" //'https://api.openstreetmap.org/api/0.6/changeset/create';
    const createChangesetUrl = " https://master.apis.dev.openstreetmap.org/api/0.6/changeset/create"
    //const createChangesetBody = `<osm><changeset><tag k="source" v="BikingImprover" /><tag k="bot" v="yes" /></changeset></osm>`;
    let createChangesetBody = `<osm>
                                    <changeset>
                                    <tag k="source" v="TESTING" />
                                    <tag k="bot" v="yes" />
                                    <tag k="comment" v="Adding tags to some OSM elements. Tags are about cyclability and were validated by users using Biking-Improver." />
                                    </changeset>
                                </osm>`;
    createChangesetBody = xmlFormatter(createChangesetBody)
    /*const createChangesetResponse = await fetch(createChangesetUrl, {
        method: 'PUT',
        headers: {
        'Content-Type': 'text/xml',
        Authorization: osmPw,
        },
        body: createChangesetBody,
    });

    if (!createChangesetResponse.ok) {
        res.status(500).send("Failed to create changeset")
    }

    const changesetId = await createChangesetResponse.text();
    console.log("this is my changeset id: " + changesetId);*/

    changesetId = 1;
    res.status(200).json({changesetID: changesetId})
})

router.post("/importOSM",async (req,res) =>{
    const token = req.get("osm_token");
    const oldElement = req.body.old_element;
    const newElement = req.body.new_element;
    const changesetID = req.body.changesetID.changesetID;
    let osmPw;

    console.log(token);

    if(token == "MyOSMUser"){
        const OSMid = process.env.OSMUserID
        const OSMpw = process.env.OSMUserPW
        const credentials = `${OSMid}:${OSMpw}`;
        const encodedCredentials = Buffer.from(credentials).toString("base64");
        osmPw = `Basic ${encodedCredentials}`;
    }else{
        osmPw = "Bearer " + token;
    }

    console.log(newElement)

    if(oldElement == "Error"){
        console.log("IT'S ERROR")
        res.status(200).send("Element got deleted from OSM previously.")
    }else{
        try {

            //Get all the tags needed from the newElement.
            const id = newElement.ID;
            const type = newElement.TYPE.toLowerCase();
            var tagsKeys = [];
            var tagsAnswers = [];
            var newTagsXML = "";
    
            for(var j = 0; j < newElement.list.length; j++){
                tagsKeys.push(newElement.list[j].TAGANSWER)
                tagsAnswers.push(newElement.list[j].ANSWER)
            }
    
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(oldElement, 'application/xml');
    
            const oldTags = xmlDoc.getElementsByTagName('tag');
            const oldTagKeys = Array.from(oldTags).map((oldTags) => oldTags.getAttribute("k"));
            const oldTagElements = Array.from(oldTags).map((tag) => `<tag k="${tag.getAttribute("k")}" v="${tag.getAttribute("v")}" />`).join('');
    
            //console.log(oldTagElements)
            //console.log(tagsKeys)
            //console.log(tagsAnswers);
    
            const filteredArrayKeys = [];
            const filteredArrayAnswers = [];
    
            tagsKeys.forEach((element, index) => {
                if (!oldTagKeys.includes(element)) {
                    filteredArrayKeys.push(element);
                    filteredArrayAnswers.push(tagsAnswers[index]);
                }
            });
    
            for(var j = 0; j < filteredArrayKeys.length; j++){
                newTagsXML = newTagsXML + '<tag k="' + filteredArrayKeys[j] + '" v="' + filteredArrayAnswers[j].toLowerCase() + '" />' +'\n'
            }
            
    
            if(filteredArrayKeys.length == 0){
                res.status(500).send("There was nothing to update, no new tags.")
                //throw new Error('There was nothing to update, no new tags.');
            }
    
            const stringFilteredArrayKeys = filteredArrayKeys.join(", ");
            const stringFilteredArrayAnswers = filteredArrayAnswers.join(", ");
            
            const wayOrNodeElement = xmlDoc.getElementsByTagName(type)[0];
            const wayOrNodeVersion = wayOrNodeElement.getAttribute("version");
            let lat = ""
            let lon = ""
    
            //Get the lat and lon if it is a node
            if(type == "node"){
                lat = wayOrNodeElement.getAttribute("lat")
                lon = wayOrNodeElement.getAttribute("lon")
            }
    
            // Step 2: Update the Element
            const updateElementUrl = "https://master.apis.dev.openstreetmap.org/api/0.6/" + type + "/" + id;
            //const updateElementUrl = "https://api.openstreetmap.org/api/0.6/" + type + "/" + id;
            //const updateElementUrl = "http://localhost:3000/api/0.6/" + type + "/" + id;
            let importData = `<osm version="0.6">
                                        <changeset>
                                            <tag k="source" v="BikingImprover"/>
                                            <tag k="comment" v="Testing the update of a way, adding tags ${stringFilteredArrayKeys} with values ${stringFilteredArrayAnswers}"/>
                                        </changeset>
                                            <${type} id="${id}" changeset="${changesetID}" version="${wayOrNodeVersion}" ${type === 'node' ? ` lat="${lat}" lon="${lon}"` : ''}>
                                                ${oldTagElements}
                                                ${newTagsXML}
                                            </${type}>
                                        </osm>`;
            importData = xmlFormatter(importData)
            console.log(importData)
    
            //console.log(updateElementBody);
            //console.log(updateElementUrl);
            
            /*const updateElementResponse = await fetch(updateElementUrl, {
              method: 'PUT',
              headers: {
                'Content-Type': 'text/xml',
                Authorization: osmPw,
              },
              body: updateElementBody,
            });
        
            if (!updateElementResponse.ok) {
                console.log(updateElementResponse);
              throw new Error('Failed to update Element');
            }
            */
            res.status(200).send({message:'Success', tagsAdded: newTagsXML, id:id, type: type, sent:newElement.list});
        } catch (error) {
            console.error(error);
            res.status(500).send(error.message);
        }
    }
})

router.post("/closeChangeset", async (req,res)=>{
    const fetch = require("node-fetch");
    console.log("CLOSING CHANGESET");

    const token = req.get("osm_token");
    const changesetID = req.body.changesetID.changesetID
    let osmPw 

    if(token == "MyOSMUser"){
        const OSMid = process.env.OSMUserID
        const OSMpw = process.env.OSMUserPW
        const credentials = `${OSMid}:${OSMpw}`;
        const encodedCredentials = btoa(credentials);
        osmPw = `Basic ${encodedCredentials}`;
    }else{
        osmPw = "Bearer " + token;
    }

    try{
        // Step 3: Close the Changeset
        //const closeChangesetUrl = "http://localhost:3000/api/0.6/changeset/" + changesetId + "/close"//`https://api.openstreetmap.org/api/0.6/changeset/${changesetId}/close`;
        const closeChangesetUrl = `https://master.apis.dev.openstreetmap.org/api/0.6/changeset/${changesetID}/close`

        const closeChangesetResponse = await fetch(closeChangesetUrl, {
          method: 'PUT',
          headers: {
            Authorization: osmPw,
          },
        });
    
        if (!closeChangesetResponse.ok) {
          console.log(closeChangesetResponse);
          throw new Error('Failed to close changeset');
        }
    
        res.status(200).send({message:'Successfully close changeset'});
    }catch (error) {
        console.error(error);
        res.status(500).send(error.message);
    }
})

/*router.post("/importOSM",async (req,res) =>{
    const fetch = require("node-fetch");
    const token = req.get("osm_token");
    const oldElement = req.body.old_element;
    const newElement = req.body.new_element;
    const osmPw = "Bearer " + token;

    var changesetId;

    //console.log(req.body)

    for(var i=oldElement.length - 1; i>= 0; i--){
        if(oldElement[i] == "Error"){
            oldElement.splice(i,1);
            newElement.splice(i,1);
        }
    }

    //STEP 1: Create a Changeset
    if(newElement.length!=0 && newElement != undefined){
                
        //const createChangesetUrl = "http://localhost:3000/api/0.6/changeset/create" //'https://api.openstreetmap.org/api/0.6/changeset/create';
        const createChangesetUrl = " https://master.apis.dev.openstreetmap.org/api/0.6/changeset/create"
        //const createChangesetBody = `<osm><changeset><tag k="source" v="BikingImprover" /><tag k="bot" v="yes" /></changeset></osm>`;
        let createChangesetBody = `<osm>
                                        <changeset>
                                        <tag k="source" v="TESTING" />
                                        <tag k="bot" v="yes" />
                                        <tag k="comment" v="Adding tags to some OSM elements. Tags are about cyclability and were validated by users using Biking-Improver." />
                                        </changeset>
                                    </osm>`;
        createChangesetBody = xmlFormatter(createChangesetBody)
        const createChangesetResponse = await fetch(createChangesetUrl, {
            method: 'PUT',
            headers: {
            'Content-Type': 'text/xml',
            Authorization: osmPw,
            },
            body: createChangesetBody,
        });

        if (!createChangesetResponse.ok) {
            throw new Error("Failed to create changeset");
        }

        const changesetId = await createChangesetResponse.text();
        console.log("this is my changeset id: " + changesetId);
        changesetId = 1;
    }else{
        throw new Error("Element is undefined");
    }

    //Now Prepare the import
    let importData = `<osm version="0.6">
    <changeset>
        <tag k="source" v="BikingImprover"/>
        <tag k="comment" v="Testing the update of a way, adding different tags regarding cyclability"/>
    </changeset>`

    let newTagsImport = []
    let idsImportList = []
    let typeImportList = []

    try {
        console.log("DAJEEEEEEEEEEEEEEEEE")
        console.log(oldElement);

        for(var i=0; i<newElement.length; i++){
            if(oldElement[i] =='Error'){
                console.log("THERE WAS ERROR")
            }else{
                //console.log(oldElement[i]);
                const id = newElement[i].ID;
                const type = newElement[i].TYPE.toLowerCase();
                var tagsKeys = [];
                var tagsAnswers = [];
                var newTagsXML = "";

                for(var j = 0; j < newElement[i].list.length; j++){
                    tagsKeys.push(newElement[i].list[j].TAGANSWER)
                    tagsAnswers.push(newElement[i].list[j].ANSWER)
                }

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(oldElement[i], 'application/xml');
        
                const oldTags = xmlDoc.getElementsByTagName('tag');
                const oldTagKeys = Array.from(oldTags).map((oldTags) => oldTags.getAttribute("k"));
                const oldTagElements = Array.from(oldTags).map((tag) => `<tag k="${tag.getAttribute("k")}" v="${tag.getAttribute("v")}" />`).join('');

                console.log(oldTagElements)
                console.log(tagsKeys)
                console.log(tagsAnswers);

                const filteredArrayKeys = [];
                const filteredArrayAnswers = [];

                tagsKeys.forEach((element, index) => {
                    if (!oldTagKeys.includes(element)) {
                        filteredArrayKeys.push(element);
                        filteredArrayAnswers.push(tagsAnswers[index]);
                    }
                });

                for(var j = 0; j < filteredArrayKeys.length; j++){
                    newTagsXML = newTagsXML + '<tag k="' + filteredArrayKeys[j] + '" v="' + filteredArrayAnswers[j].toLowerCase() + '" />' +'\n'
                }

                newTagsImport.push(newTagsXML)
                idsImportList.push(id)
                typeImportList.push(type)
        
                if(filteredArrayKeys.length == 0){
                    //res.status(500).send("There was nothing to update, no new tags.")
                    throw new Error('There was nothing to update, no new tags.');
                }
        
                //const stringFilteredArrayKeys = filteredArrayKeys.join(", ");
                //const stringFilteredArrayAnswers = filteredArrayAnswers.join(", ");

                const wayOrNodeElement = xmlDoc.getElementsByTagName(type)[0];
                const wayOrNodeVersion = wayOrNodeElement.getAttribute("version");
                let lat = ""
                let lon = ""

                //Get the lat and lon if it is a node
                if(type == "node"){
                    lat = wayOrNodeElement.getAttribute("lat")
                    lon = wayOrNodeElement.getAttribute("lon")
                }

                const updateElementBody = `
                                        <${type} id="${id}" changeset="${changesetId}" version="${wayOrNodeVersion}" ${type === 'node' ? ` lat="${lat}" lon="${lon}"` : ''}>
                                            ${oldTagElements}
                                            ${newTagsXML}
                                        </${type}>`;

                //const prettifiedXml = format(updateElementBody, { indentation: '  ' });
                
                prettifiedXML = xmlFormatter(updateElementBody)
                importData = importData + prettifiedXML;
            }
        }
        importData = importData + "</osm>"
        importData = xmlFormatter(importData)
        console.log(importData);
        
        /*
        // Step 2: Update the Element
        const updateElementUrl = "https://master.apis.dev.openstreetmap.org/api/0.6/" + type + "/" + id;
        //const updateElementUrl = "https://api.openstreetmap.org/api/0.6/" + type + "/" + id;
        //const updateElementUrl = "http://localhost:3000/api/0.6/" + type + "/" + id;
        //console.log(updateElementUrl);
        
        const updateElementResponse = await fetch(updateElementUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'text/xml',
            Authorization: osmPw,
          },
          body: importData,
        });
    
        if (!updateElementResponse.ok) {
            console.log(updateElementResponse);
          throw new Error('Failed to update Element');
        }*/
        
        /*
        // Step 3: Close the Changeset
        //const closeChangesetUrl = "http://localhost:3000/api/0.6/changeset/" + changesetId + "/close"//`https://api.openstreetmap.org/api/0.6/changeset/${changesetId}/close`;
        const closeChangesetUrl = `https://master.apis.dev.openstreetmap.org/api/0.6/changeset/${changesetId}/close`

        const closeChangesetResponse = await fetch(closeChangesetUrl, {
          method: 'PUT',
          headers: {
            Authorization: osmPw,
          },
        });
    
        if (!closeChangesetResponse.ok) {
          console.log(closeChangesetResponse);
          throw new Error('Failed to close Changeset');
        }
    
        res.status(200).send({message:'Success', tagsAdded: newTagsImport, id:idsImportList, type: typeImportList});
      } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
      }
});*/

router.post("/validated/sendToOsm"/*,verify*/, (req,res) =>{
    const io = req.app.get('io');
    const elements = req.body.completed;

    console.log("VALIDATED WORKING NOW SENDING THE ITEM TO OSM. THE ITEM IS:")
    console.log(elements);

    //Separate the answers based on the userAnswered variable.
    const lists = [];

    elements.forEach(item =>{
        const userAnswered = item.USERANSWERED;
        console.log(userAnswered)

        //Check if the list for that user already exists, if it does not then create it
        if(!lists[userAnswered]){
            lists[userAnswered] = [];
        }
        
        //push the item in the user list
        lists[userAnswered].push(item);
    })
    
    //const validated = 2; // Replace with your logic
    //console.log(lists);
  
    let userFound = false;
    let userListFound = [];
    //let userListNotFound = [];
            
    //Get the lists elements.
    const listArray = Object.values(lists);
    //console.log(listArray.length)
  
    console.log(io.sockets.sockets);
    // Iterate through all connected sockets
    io.sockets.sockets.forEach((socket, socketId) => {
      // Get the authenticated user name from the socket request
      console.log("FORLOOP");
      const authenticatedUserName = socket.userSignedUpName;
      console.log(authenticatedUserName);

      //cycle through my elements based on the users, and then emit to the socket of the user the action. The value to pass is listArray[i].The user is listArray[i][0].userAnswered
      for(var i=0; i<listArray.length;i++){
          console.log("cycling user lists of elements")
          console.log(listArray[i][0].USERANSWERED);
          if(authenticatedUserName == listArray[i][0].USERANSWERED){
            socket.emit('validated', { value: listArray[i] }); //Send the data to the user so that he can send it via OSM Token
            userFound = true;
            userListFound.push(i); //so that I know which elements have the user online. So this elements will be sent by that user
          }else{
            //userListNotFound.push(i)
            console.log("Different user");
          }
      }
    });

    let sendToOSMList = [];

    if(userListFound.length !=0){
        for(var i=0; i<listArray.length; i++){
            for(var j=0; j<userListFound.length; j++){
                if(i == userListFound[j]){
                    //DO NOTHING
                }else{
                    //SEND DATA VIA MY OWN ACCOUNT SINCE THE USER IS NOT ONLINE AND I CANNOT SEND THE DATA WITH THEIR ACCOUNT
                    sendToOSMList.push(listArray[i]);
                }
            }
        }
    }else{
        sendToOSMList = listArray;
    }


    console.log("SHOULD SEND THIS WITH MY OSM ACCOUNT");
    console.log(sendToOSMList);

    //CALL FUNCTION TO SEND THESE DATA WITH MY ACCOUNT

    //if some users weren't found then send the data via our account, //Combine all missing user osm answers to a single one to send with our account
    /*if(userListNotFound.length != 0){

        console.log("Missing user");
        const sendToOSMList = [];
        for(var i=0; i<userListNotFound.length; i++){
            sendToOSMList.push(listArray[i]);
        }
        console.log("SHOULD SEND THIS WITH MY OSM ACCOUNT");
        console.log(sendToOSMList);
    }*/
  
    /*if (!userFound) {
      // Perform the desired action when no user with a matching name is found
      // Replace the following code with your actual implementation
      console.log('No connected user with the matching name found. Perform the desired action.');
    }*/
    
    res.status(200).json({ message: 'Value updated successfully', sendToOsmList: sendToOSMList });
  
});

router.post("/sendToOSMViaMyAccount"/*,verify*/, (req,res) =>{
    console.log("POST CALL TO SEND TO OSM VIA MY ACCOUNT SEEMS IT?S WORKING?")
    const data = req.body.data;
    console.log(data);
    res.status(200).send("ok");
});

module.exports = router;