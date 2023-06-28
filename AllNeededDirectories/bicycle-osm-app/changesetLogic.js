
const request = require('request');

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
    for(var i=0; i<notSent[0].length; i++){
        if(notSent[0][i].TIME >= 6){
            sendWithMyAccount.push(notSent[0][i]);
        }else{
            toUpdate.push(notSent[0][i])
        }
    }
    
    const data = {
        "sendWithMyAccount": sendWithMyAccount,
        "toUpdate": toUpdate
    }

    return data;

}

async function SendWithMyAccount(route, listToSend){
    if(listToSend == null || listToSend == undefined || listToSend.length == 0){
        console.log("nothing to update");
        return;
    }
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