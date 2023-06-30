
const request = require('request');
const fetch = require('node-fetch');

async function CheckCompleted(route){
    return new Promise((resolve, reject) => {
        console.log(route);
        //PER PRENDERE ELMENTI CHE HANNO PIU DI 1 IN VALIDATIONS E LO HANNO IN OGNI ENTRY
        const options = {
            method : 'GET',
            url : route + "/changeset/getCompletedFromQuestionTable",
            headers:{ "Content-Type":"application/json"},
            json:true
        }

        request(options, async function(error, response, body){
            if(error){
                //error
                console.log(error)
                reject(error);
            }else{
                const ids = body
                resolve(ids);
            }
        })
    })

}

async function UpdateCompleted(route, ids){
    return new Promise((resolve, reject) => {
        const elements = {
            "elements" : ids
        }
        const options = {
            method : 'POST',
            url : route + "/changeset/allAnswersCompletedList",
            body: elements,
            headers:{"Content-Type":"application/json"},
            json: true,
        }

        request(options, async function(error, response, body){
            if(error){
                //error
                console.log(error)
                reject(error);
            }else{
                const ids = body
                resolve(ids);
            }
        })
    })

}

async function GetCompletedQuestions(route){
    return new Promise((resolve, reject) => {
        console.log(route);
        const options = {
            method : 'GET',
            url : route + "/changeset/getAllCompletedAnswersNotSent",
            headers:{ "Content-Type":"application/json"},
            json:true
        }

        request(options, async function(error, response, body){
            if(error){
                //error
                console.log(error)
                reject(error);
            }else{
                const completedAnswers = body
                resolve(completedAnswers);
            }
        })
    })

}

async function UpdateOrImport(route, answers){
    return new Promise((resolve, reject) => {
        const elements = {
            "elements" : answers
        }
        const options = {
            method : 'POST',
            url : route + "/changeset/importElements",
            body: elements,
            headers:{"Content-Type":"application/json"},
            json: true,
        }

        request(options, async function(error, response, body){
            if(error){
                //error
                console.log(error)
                reject(error);
            }else{
                const result = body
                resolve(result.sendToOsmList);
            }
        })
    })

}

function HandleNotSentData(notSent){
    if(notSent == undefined || notSent.length == 0){
        return {};
    }

    let sendWithMyAccount = []
    let toUpdate = []

    //if the answer wasn't sent in 6 hours then I send it with osm, otherwise update the hour field
    for(var i=0; i<notSent.length; i++){
      for(var j=0; j<notSent[i].length; j++)
        if(notSent[i][j].TIME >= 6){
            sendWithMyAccount.push(notSent[i][j]);
        }else{
            toUpdate.push(notSent[i][j])
        }
    }
    
    const data = {
        "sendWithMyAccount": sendWithMyAccount,
        "toUpdate": toUpdate
    }

    return data;

}

async function SendWithMyAccount(route, listToSend){
    const osmToken = {osmToken:"MyOSMUser"}
    console.log("SEND WITH MY ACCOUNT FUNCTION");

    if(listToSend == null || listToSend == undefined || listToSend.length == 0){
        console.log("nothing to update");
        return;
    }

    //Send data to osm logic using the authenticated user
    const newDataArray = divideElements(listToSend);

    //console.log(newDataArray);

    let oldElementsArray = []

    for(var i=0; i<newDataArray.length; i++){
      const id = newDataArray[i].ID;
      const type = newDataArray[i].TYPE
      const oldElement = await getOSMElement(route, id, type)
      oldElementsArray.push(oldElement);
    }
    console.log(oldElementsArray);

    var errors = 0;
    for(i=0; i<oldElementsArray.length; i++){
      if(oldElementsArray[i] == "Error"){
        errors ++;
      }
    }
    
    if(errors == oldElementsArray.length){
      console.log("All elements were deleted...")
      return;
    }

    const changesetID = await createChangeset(route, osmToken)

    if(changesetID == undefined || changesetID == null){
      return;
    }

    let my_import_responses = []
    for(i=0; i<newDataArray.length; i++){
      const importElement = await sendDataToOSM(route, osmToken, newDataArray[i], oldElementsArray[i], changesetID)
      my_import_responses.push(importElement);
    }

    let setToSentList = []
    let changesetList = []
    for(i=0; i<my_import_responses.length; i++){
      if(my_import_responses[i]!=undefined && my_import_responses[i].sent!=undefined){
        console.log(my_import_responses[i].sent);
        setToSentList.push(my_import_responses[i].sent)
        const valueToAdd = {
          "Added": my_import_responses[i].tagsAdded,
          "id": my_import_responses[i].id,
          "type": my_import_responses[i].type,
          "changesetID": changesetID
        }
        changesetList.push(valueToAdd)
      }
    }

    //INSERT DATA INTO CHANGESETSENT TABLE SO I KNOW THAT I SENT IT AND I KEEP TRACK OF MY IMPORTS
    const flatChangeset = [...changesetList.flat().map(item => item)];
    await saveChangeset(route, flatChangeset);
    //

    //SET DB QUESTION_TABLE TO SENT = YES
    const flatArray = [...setToSentList.flat().map(item => item)];
    await setToSent(route, flatArray);

    //CLOSE CHANGESET
    await closeChangeset(route, osmToken,changesetID)

    /*return new Promise((resolve, reject) => {
        const elements = {
            "elements" : answers
        }
        const options = {
            method : 'POST',
            url : route + "/changeset/importElements",
            body: elements,
            headers:{"Content-Type":"application/json"},
            json: true,
        }

        request(options, async function(error, response, body){
            if(error){
                //error
                console.log(error)
                reject(error);
            }else{
                const result = body
                resolve(result.sendToOsmList);
            }
        })
    })*/
    return;
}

function divideElements(data){
    const dividedData = data.reduce((result, element) => {
      const existingElement = result.find(item => item.ID === element.ID);

      if (existingElement) {
        existingElement.list.push(element);
      } else {
        result.push({
          TYPE: element.TYPE,
          ID: element.ID,
          list: [element]
        });
      }

      return result;
    }, []);
    return dividedData;
}

async function saveChangeset(route, changesetList){
    var my_body = {
      "changesetList": changesetList,
    }
    try{
      const my_url = route + "/changeset/saveChangeset"
      const requestSpatialite = {
        method:"POST", 
        headers:{ "Content-Type":"application/json"},
        body: JSON.stringify(my_body),
        json:true
      };
      const fetchdata = await fetch(my_url,requestSpatialite)
        .then(response => response.json())
        .then((new_response_data)=>{
          return new_response_data;
        }).catch((err)=>console.log(err))
        return fetchdata
    }catch(e){
      console.log("Error saving changeset")
    }
}

async function setToSent(route, listToSend){
    console.log("NOW SETTING TO SENT")
    var my_body = {
      "elements": listToSend,
    }
    try{
      const my_url = route + "/changeset/updateSent"
      const requestSpatialite = {
        method:"POST", 
        headers:{ "Content-Type":"application/json",},
        body: JSON.stringify(my_body),
        json:true
      };
      const fetchdata = await fetch(my_url,requestSpatialite)
        .then(response => response.json())
        .then((new_response_data)=>{
          return new_response_data;
        }).catch((err)=>console.log(err))
        return fetchdata
    }catch(e){
      console.log("Error setting to sent")
    }
}

async function closeChangeset(route, token, changesetID){
    var my_body = {
      "osm_token": token,
      "changesetID": changesetID
    }
    try{
      const my_url = route + "/osmCalls/closeChangeset"
      const requestSpatialite = {
        method:"POST", 
        headers:{ "Content-Type":"application/json", "osm_token": token.osmToken},
        body: JSON.stringify(my_body),
        json:true
      };
      const fetchdata = await fetch(my_url,requestSpatialite)
        .then(response => response.json())
        .then((new_response_data)=>{
          return new_response_data;
        }).catch((err)=>console.log(err))
        return fetchdata
    }catch(e){
      console.log("Error creating changeset")
    }
}

async function sendDataToOSM(route, osmToken, newElements, oldElements, changesetID){
    var my_body = {
      "new_element": newElements,
      "old_element": oldElements,
      "changesetID": changesetID
    }
    try{
      const my_url = route + "/osmCalls/importOSM"
      const requestSpatialite = {
        method:"post", 
        headers:{ "Content-Type":"application/json", "osm_token": osmToken.osmToken},
        body: JSON.stringify(my_body)
      };
      const fetchdata = await fetch(my_url,requestSpatialite)
        .then(response => response.json())
        .then((new_response_data)=>{
          return new_response_data;
        }).catch((err)=>console.log(err))
        return fetchdata
    }catch(e){
      console.log("Error sending data to OSM")
    }
}

async function getOSMElement(route,id,type){
    console.log(id);
    console.log(type.toLowerCase());
    try{
      const my_url = route + "/osmCalls/getOSMElement/" + type.toLowerCase() + "&" + id
      console.log(my_url)
      const requestSpatialite = {
        method:"GET", 
        headers:{ "Content-Type":"application/json"},
        json:true
      };
      const fetchdata = await fetch(my_url,requestSpatialite)
        .then(response => response.text())
        .then((new_response_data)=>{
          return new_response_data;
        }).catch((err)=>console.log(err))
        return fetchdata
    }catch(e){
      console.log("Error getting data from OSM" + e)
    }
}

async function createChangeset(route, token){
    try{
      const my_url = route + "/osmCalls/createChangeset"
      const requestSpatialite = {
        method:"POST", 
        headers:{ "Content-Type":"application/json", "osm_token": token.osmToken},
        json:true
      };
      const fetchdata = await fetch(my_url,requestSpatialite)
        .then(response => response.json())
        .then((new_response_data)=>{
          return new_response_data;
        }).catch((err)=>console.log(err))
        return fetchdata
    }catch(e){
      console.log("Error creating changeset")
    }
}

async function UpdateTime(route, listToUpdate){
    if(listToUpdate == null || listToUpdate == undefined || listToUpdate.length == 0){
        console.log("nothing to update");
        return;
    }
    return new Promise((resolve, reject) => {
        const elements = {
            "elements" : listToUpdate
        }

        const options = {
            method : 'POST',
            url : route + "/changeset/updateTime",
            body: elements,
            headers:{"Content-Type":"application/json"},
            json: true,
        }

        request(options, async function(error, response, body){
            if(error){
                //error
                console.log(error)
                reject(error);
            }else{
                const result = body
                resolve(result);
            }
        })
    })
}

module.exports = {
    CheckCompleted,
    UpdateCompleted,
    GetCompletedQuestions,
    UpdateOrImport,
    HandleNotSentData,
    SendWithMyAccount,
    UpdateTime
}