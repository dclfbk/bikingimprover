export default class UserData{
    userName;
    points;
    gold;
    level_up_points;
    badges = [];
    level;
    just_leveled_up=false;
    validation_completed;
    answer_completed;
    isNew;
    full_positive;
    full_negative;
    my_images;
    geolocationPermission = false;
    powerUps=[];
    constructor(userName,points,level_up_points,badges,level){
        this.userName = userName;
        this.points = points;
        this.gold = 0;
        this.level_up_points = level_up_points;
        this.badges = badges;
        this.level = level;
        this.just_leveled_up = false;
        this.validation_completed=0;
        this.answer_completed=0;
        this.full_positive=0;
        this.full_negative=0;
        this.my_images = [];
        this.powerUps=[];
    }

    //create the userData and update it with the data of the gamification engine
    //add the power up in the database
    async createUser(userName,api_url, token){
        this.userName = userName;
        var my_user = userName;
        //var my_user = "anothertrycomeone";
        var my_url = api_url + "/posts/user/getUser/"+my_user;
        try{
            var my_request = {
                method: "GET",
                headers:{ "Content-Type":"application/json"},
            }
            const fetchdata = await fetch(my_url,my_request)
            .then(response=>response.json())
            .then(async (new_response_data)=>{
                //if it doesn't exist then create it
                if(JSON.stringify(new_response_data.customData)==='{}'){
                    console.log("NUOVO GIOCATORE")
                    this.updateUserInfo(new_response_data)
                    //TODO UPDATE USER POWERUPS!!!!!!
                    //this.createNewUser(my_user,api_url) 
                    console.log(new_response_data)
                    this.isNew = true;
                    await (this.checkPowerUps(userName,api_url, token)).then(items=>{
                        console.log(items);
                        this.powerUps = items;
                    })
                }else{
                    //if it does exist then update its data
                    console.log("GIOCATORE ESISTE Già")
                    this.updateUserInfo(new_response_data)
                    console.log(new_response_data)
                    this.isNew = false;
                    await (this.checkPowerUps(userName,api_url, token)).then(items=>{
                        console.log(items);
                        this.powerUps = items;
                    })
                }
            }).catch((err)=>console.log(err))
            return fetchdata
        }catch(e){
            console.log(e)
        }
    }

    //update the userData with the data received from the gamification engine
    updateUserInfo(userdata){
        console.log(userdata);
        var validations = userdata.customData.validation_completed;
        var answers = userdata.customData.answer_completed
        var fullPositive = userdata.customData.full_positive_validation;
        var fullNegative = userdata.customData.full_negative_validation;
        var my_images = userdata.customData.myImages;
        this.badges=new Array();
        this.level = userdata.customData.level;
        if(userdata.state.PointConcept != undefined ){
            this.points = userdata.state.PointConcept[1].score;
            this.gold = userdata.state.PointConcept[0].score;
            console.log(userdata.state.PointConcept);
        }else{
            this.points = 0;
            this.gold = 0;
        }
        //this.points = userdata.state.PointConcept[1].score;
        this.level_up_points = userdata.customData.level_up_points;
        this.validation_completed = validations;
        this.answer_completed = answers;
        this.full_positive = fullPositive;
        this.full_negative = fullNegative;
        this.my_images = my_images;

        var badgeCollection = userdata.state.BadgeCollectionConcept;
        if(badgeCollection == undefined){
            console.log("Empty");
        }else{
            for(var i=0;i<badgeCollection.length;i++){
                if(badgeCollection[i].badgeEarned.length==0){
                    //console.log("no badge...");
                }else{
                    this.badges.push(badgeCollection[i].name); 
                }
            }
        }
        console.log("QUESTA è la userData con custom data level up points: " + userdata.customData.level_up_points);
        //console.log("checking level_up undefined....");
        if(userdata.customData.level_up_points==undefined || isNaN(userdata.customData.level_up_points)){
            this.level_up_points=0;
            console.log("LEVEL UP POINTS WELL IT WAS UNDEFINED OR NAN, NOW 0!!!");
        }
        if(userdata.customData.level==undefined || isNaN(userdata.customData.level)){
            //console.log("LEVEL WAS UNDEFINED OR NAN, NOW 0!!!");
            this.level=0;
            this.level_up_points=0;
        }
        if(userdata.state.PointConcept != undefined ){
            if(userdata.state.PointConcept[1].score==undefined || isNaN(userdata.state.PointConcept[1].score)){
                //console.log("SCORE WAS UNDEFINED OR NAN, NOW 0!!!");
                this.points=0;
            }
        }
        if(answers == undefined || isNaN(answers)){
            //console.log("ANSWERS WAS UNDEFINED OR NAN, NOW 0!!!");
            this.answer_completed = 0;
        }
        if(validations == undefined || isNaN(validations)){
            //console.log("VALIDATIONS WAS UNDEFINED OR NAN, NOW 0!!!");
            this.validation_completed = 0;
        }
        if(fullPositive == undefined || isNaN(fullPositive)){
            //console.log("FULLPOSITIVE WAS UNDEFINED OR NAN, NOW 0!!!");
            this.full_positive= 0;
        }
        if(fullNegative == undefined || isNaN(fullNegative)){
            //console.log("FULLNegative WAS UNDEFINED OR NAN, NOW 0!!!");
            this.full_negative = 0;
        }
        if(my_images == undefined){
            this.my_images = [];
        }
    }

    //get the power up of the userData with a call to the database
    async checkPowerUps(userName,api_url, token){
        console.log("USER SENT"+userName)
        var my_body = {
            "tableName" : userName,
        }
        try{
            const my_url = api_url + "/managePowerUps/retrieveAll"
            const requestSpatialite = {
            method:"post",
            headers:{"Content-Type":"application/json", "pw_token": token.access_token},
            body: JSON.stringify(my_body),
            };
            //console.log(requestSpatialite);
            const fetchdata = await fetch(my_url, requestSpatialite)
            .then(response => response.json())
            .then((new_response_data)=>{
                return new_response_data;
            }).catch((err)=>console.log(err))
            return fetchdata
        }catch(e){
            alert("Error......");
        }
    }

    //if a day has passed then deletes the power up
    checkPowerUpsTime(){
        var diffTime;
        var diffDays;
        var now = new Date();
        var new_array = [];
        var resultDate;
        for(var i=0;i<this.powerUps.length;i++){
            resultDate = new Date(this.powerUps[i].TIME);
            diffTime = Math.abs(now - resultDate);
            diffDays = diffTime / (1000*60*60*24);
            if(diffDays<this.powerUps[i].LIFETIME){
                new_array.push(this.powerUps[i])
            }
        }
        this.powerUps = new_array;
    }

    //get the power up that are not expired
    getPowerUps(){
        this.checkPowerUpsTime();
        var array_with_names = [];
        console.log("getting powers...");
        console.log(this.powerUps);
        for(var i=0;i<this.powerUps.length;i++){
            console.log(this.powerUps);
            array_with_names.push(this.powerUps[i].POWERNAME);
        }
        return array_with_names;
    }

    async createNewUser(username,api_url){
        console.log(username)
            //call the game engine to create the user
            var my_url = api_url + "/posts/user/createNewUser"
            var my_body = {
                "userid":username
            }
            try{
                const my_request = {
                    method:"POST",
                    headers:{ "Content-Type":"application/json"},
                    body: JSON.stringify(my_body)
                };
                const fetchdata = await fetch(my_url,my_request)
                .then(response => response.json())
                .then((new_response_data)=>{
                    //update the data to show the profile
                    this.updateUserInfo(new_response_data)
                    console.log(new_response_data)
                    return new_response_data;
                }).catch((err)=>{
                    console.log(err);
                    console.log(err.status)                   
                    })
                return fetchdata
            }catch(e){
                alert("Errorrrr")
            }
    }

    //Method used to update the user score inside the userData when a mission gets completed
    missionComplete(type,score){
        var medalArray = [];
        console.log("this is missionComplete:" + type + score);
        this.points = this.points + score;
        this.gold = this.gold + score;
        var my_level_up = parseInt(this.level_up_points);
        my_level_up=my_level_up+score;
        this.level_up_points = my_level_up;
        console.log("sta funzionando"+this.level_up_points);
        var currentLevel = parseInt(this.level);
        var level_thresh = currentLevel * 10;
        console.log("this is level_thresh: "+level_thresh)
        console.log("this is level up:" + my_level_up);
        if(my_level_up > level_thresh||my_level_up==level_thresh){
            //Level Up
            var new_level_up_points = my_level_up - level_thresh; 
            this.level = currentLevel + 1;
            this.level_up_points = new_level_up_points;
            this.just_leveled_up = true;
            //notice the user
            console.log("YOU LEVELED UP!")
            medalArray = this.checkLevelMedals(medalArray);
            //alert("YOU LEVELED UP!");
        }
        if(type=="validation"){
            medalArray = this.checkValidationMedals(medalArray);
        }else{
            medalArray = this.checkOpenMedals(medalArray);
        }
        return medalArray;
    }

    //Method used to assign the medal to the userData when he levels up
    checkLevelMedals(my_array){
        console.log("EnteredCheckLevelMedals")
        if(this.level==5 || this.level=="5"){
            //get the beginner medal
            my_array.push("beginner badge")
            console.log("Congratulations level 5")
            this.badges.push("beginner badge");
        }
        if(this.level==10 || this.level=="10"){
            //get the expert medal
            my_array.push("expert badge")
            console.log("Congratulations level 10")
            this.badges.push("expert badge");
        }
        if(this.level==20 || this.level=="20"){
            //get the professional medal
            my_array.push("professional badge");
            console.log("Congratulations level 20")
            this.badges.push("professional badge");
        }
        return my_array;
    }

    //Method used to assign the validation medals
    checkValidationMedals(my_array){
        console.log("EnteredCheckValidationMedals")
        //increment by one
        var my_validations = parseInt(this.validation_completed);
        my_validations = my_validations + 1;
        if(my_validations == 1){
            //get the validator badge
            my_array.push("validator badge");
            console.log("Congratulation First Validation")
            this.badges.push("validator badge");
        }
        if(my_validations == 20){
            //get the expert validator badge
            my_array.push("expert validator badge");
            console.log("Congratulation 20 Validation")
            this.badges.push("expert validator badge");
        }
        this.validation_completed = my_validations;
        return my_array;
    }

    //method used to assign the questions badges
    checkOpenMedals(my_array){
        console.log("EnteredCheckOpenMedals")
        //increment by 1
        var my_answers = parseInt(this.answer_completed);
        my_answers = my_answers + 1;
        if(my_answers == 1){
            my_array.push("first steps");
            console.log("Congratulations on your first answer! FIRST STEPS MEDAL");
            this.badges.push("first steps");
        }
        if(my_answers == 20){
            //get the validator badge
            my_array.push("cyclist");
            console.log("Congratulation 20 Answers")
            this.badges.push("cyclist");
        }
        if(my_answers == 50){
            //get the expert validator badge
            my_array.push("professional cyclist");
            console.log("Congratulation 50 Answers")
            this.badges.push("professional cyclist");
        }
        this.answer_completed = my_answers;
        return my_array;
    }
}
  