<template>
  <div style="max-height: 300px; overflow-y: scroll; background-color:transparent;">
    <semipolar-spinner
      v-if="loading"
      :animation-duration="2000"
      :size="65"
      color="#ff1d5e"
    />
    <h1 v-if="this.items" class="my_title" style="text-align:center">{{title}}</h1>
    <ul> <!-- <md-icon style="float:left; padding-right:15px; padding-top:15px">workspace_premium</md-icon> -->
      <!-- IF ONE DAY THE VALIDATION GIVES ERRORS THEN YOU HAVE TO TRANSLATE EVERYTHING IN A FUNCTION LIKE THE ONES IN UPDATE ANSWER OFTHE OPEN QUESTIONS -->
      <li v-for="(value,index) in this.open" v-bind:key="'Q'+index" class="myQuestList" style="list-style:none"> <!-- :class="variable" -->
        <div style="margin-left:-30px">
          <md-icon style="float:left; position:relative; padding-top:10px;">{{open[index].ICON}}</md-icon> <!-- check whether or not it has icon?....-->
        </div>
        <div>
          <QuestionForm v-if="open[index].ANSWER==''" :id="open[index].ID" :item="open[index].QUESTION" :type="open[index].TYPE" :score="open[index].SCORE" :possibilities="open[index].ANSWERS" 
          :question_to_show=$gettext(open[index].QUESTION) ref="openquests" />
          <ValidationForm v-else 
            :id="open[index].ID" :item="$gettext('checkTrueMsg') + $gettext(open[index].QUESTION) + $gettext('checkEndMsg') + $gettext(open[index].ANSWER) + '?'" 
            :type="open[index].TYPE" :score="open[index].SCORE" :userAnswered="open[index].USERANSWERED" :validationNumber="open[index].NUMBEROFVALIDATIONS"
            :userWhoValidated="open[index].U<SERSWHOVALIDATED" :realQuestion="open[index].QUESTION" ref="validateOtherQuests"
          />
        </div>
      </li>
      <li v-for="(value,index) in this.validate" v-bind:key="'V'+index" style="list-style:none">
        <div style="margin-left:-30px">
          <md-icon style="float:left; position:relative; padding-top:10px;">{{validate[index].ICON}}</md-icon>
        </div>
        <ValidationForm  :id="validate[index].ID" :item="validate[index].QUESTION" :type="validate[index].TYPE" :score="validate[index].SCORE" ref="validatequests"/>
      </li>
    </ul>
    <!--<PicForRev/>-->
    <ion-button v-on:click="onSubmit" class="my_button" :disabled="loading">Submit</ion-button>
    <LevelUp ref="level_up_alert"/>
    <NewMedal ref="new_medal_alert"/>
    <NoLocation ref="no_location_alert"/>
    <DistanceError ref="distance_alert"/>
    <TutorialPopup :text="this.popup_text" ref="generalPopupTutorial"/>
  </div>
</template>
<script>
import QuestionForm from './questions/QuestionForm.vue'
import ValidationForm from './questions/ValidationForm.vue'
import LevelUp from './popups/LevelUp.vue'
import NewMedal from './popups/NewMedal.vue'
import NoLocation from './popups/NoLocation.vue'
import DistanceError from './popups/DistanceError.vue'
import TutorialPopup from './popups/TutorialPopup.vue'
import { SemipolarSpinner  } from 'epic-spinners'
//import PicForRev from './ImageForm/PicForRev.vue'
//import Vue from 'vue'

export default {
  name: 'Test',
  props: ['items','open','validate','title','location','distanza'],
  components:{
      QuestionForm,
      ValidationForm,
      LevelUp,
      NewMedal,
      NoLocation,
      DistanceError,
      SemipolarSpinner,
      TutorialPopup,
      //PicForRev
  },
  data(){
      return{
        validate_list:[], //list of the validation missions
        open_list:[], //list of the open questions
        loading:false, //used to show the loading
        popup_text:""
      }
  },
  mounted: function(){
      console.log("mounting test....")
      const values = this.items
      console.log(this.items);
      for(var i in values){
        if(values[i].VALIDATING=="no"){
          this.open_list.push(values[i])
        }else{
          this.validate_list.push(values[i])
        }
      }
      this.$refs.openquests.forEach(i=>{
        i.updateAnswers(); //TODO TO THE VALIDATION ANSWERS update
      });
      //this.loading=true;
  },

  updated() {
    this.$nextTick(function () {
      console.log(this.items.length)
      console.log(this.open.length)
      console.log(this.validate.length)
      console.log(this.items)
      console.log(this.location);
      console.log(this.distanza);
      this.$refs.openquests.forEach(i=>{
        i.updateAnswers(); //TODO TO THE VALIDATION ANSWERS update
      });
    // Code that will run only after the
    // entire view has been re-rendered
    })
  },

  methods:{
    async onSubmit(e){
      e.preventDefault();
      var shouldAddPoint = 0; 
      //this.distanza=1; //JUST FOR TESTING
      if(this.location == false){
        console.log("SORRY YOU HAVE TO GIVE LOCATION PERMISSION TO ANSWER QUESTIONS");
        this.$refs.no_location_alert.second=true;
        return;
      }else{
        console.log(this.location);
        if(this.distanza>200){
          console.log("EEEEH TROPPO DISTANTE");
          this.$refs.distance_alert.second=true;
          return;
        }else{
      
          var powerArray = this.$userData.getPowerUps()
          if(powerArray.includes("PointBonuses")){
            console.log("include")
            shouldAddPoint=1.0;
          }

          console.log("AFTER IF");
          console.log("La tua distanza è " + this.distanza)
          var answer_to_send=""; //get the answer written by the user
          var userAnswered = ""; //get the name of the user who answered the question before
          var userWhoValidated = ""; //get the names of the users who validated the question
          var usersValidateArray = []
          var answer =""; //the answer 
          var question = ""; //the question written
          var numberOfValidations = ""; // the number of validation that the mission received
          var realQuestion = "" // the open question that became a validation question
          var id =""; // way or node id
          var type=""; // is it a way or a node?
          var score = null; //score to be given to the user if he answers
          var close_popup=false; //variable to keep track whether or not the popup should close
          var alreadyGenerated=false;
          var stillValid = true; //if it doesn't have 5 negative validation
          //var usersWhoValidated = [];
          var cancella=true; //serve per sapere se eliminare completamente la strada
          if(this.$refs.openquests!=undefined){
          this.$refs.openquests.forEach(async i=>{
            answer=i.answer;
            question=i.item;
            id=i.id;
            type=i.type
            score = i.score + shouldAddPoint;
            console.log(score);
            //check that the answer isn't empty, if it isn't then send the answer
            if(i.answer!=""){
              //send the answer
              close_popup=true
              //create the loading popup (maybe right now is too fast?)
              this.loading = true;
              console.log("SETTO CANCELLA A FALSE")
              cancella=false;
              await this.sendAnswer(answer,id,question,type).then(async items=>{
                console.log(items)
                //call the game engine to get the score
                await this.sendAnswerEngine("normal", this.$auth.user.myUserIDsignUpName, score)
                this.loading = false;
                //set cancella=false because this becomes a validation question.
                cancella=false;
              })
            }else{
              //otherwise set cancella=false in order to not delete the geometry.
              console.log("setto cancella a false perchè openquestion non ha tutte le domande con risposta...");
              cancella=false
            }
          })
          }

          //The same goes forr the validation questions
          if(this.$userData.level==null || this.$userData.level==undefined || this.$userData.level==""){
            //Popup saying that you have to answer an open question first
            this.createPopup(this.$gettext("answerOpenFirstTitleMsg"), this.$gettext("answerOpenFirstMsg"))
          }else{
            if(this.$refs.validatequests!=undefined){
              this.$refs.validatequests.forEach(async i=>{
                answer = i.answer;
                question=i.item;
                id=i.id;
                type=i.type;
                if(answer == true || answer == "true"){
                  answer_to_send = "si"
                }else{
                  answer_to_send = "no"
                }
                if(i.answer!=""){
                  close_popup=true
                  await this.sendAnswer(answer_to_send,id,question,type).then(async items=>{
                    console.log(items)
                    //call game engine in order to gain the score
                    await this.sendAnswerEngine("validation", this.$auth.user.myUserIDsignUpName, score)
                  })
                }else{
                  //set cancella=false because some validation question doesn't have an answer
                  cancella=false
                }
              })
            }
          }

          //VALIDATE OTHER USER QUEST
          if(this.$userData.level==null || this.$userData.level==undefined || this.$userData.level==""){
            //Popup saying you have to answer an open question first
            console.log("YOU CAN't ANSWER THIS! FIRST YOU HAVE TO ANSWER AT LEAST AN OPEN QUESTION")
          }else{
            if(this.$refs.validateOtherQuests!=undefined){
              this.$refs.validateOtherQuests.forEach(async i=>{
                userAnswered = i.userAnswered
                userWhoValidated = i.userWhoValidated
                usersValidateArray = this.splitTheArray(userWhoValidated)
                if(userAnswered == this.$auth.user.myUserIDsignUpName){
                  //User is validating an answer that he as given
                  this.createPopup(this.$gettext("validationErrorTitleMsg"), this.$gettext("validationErrorMsg"));
                  alreadyGenerated=true
                  cancella=false;
                }else if(usersValidateArray.includes(this.$auth.user.myUserIDsignUpName)){
                  //User has already validated this answer
                  this.createPopup(this.$gettext("alreadyValidatedTitleMsg"), this.$gettext("alreadyValidatedMsg"));
                  alreadyGenerated = true
                  cancella = false
                }
                else{
                  answer = i.answer;
                  question=i.item;
                  id=i.id;
                  type=i.type;
                  realQuestion = i.realQuestion;
                  numberOfValidations = i.validationNumber;
                  console.log("THIS IS THE NUMBER OF VALIDATION WHEN SENDIN: " + i.numberOfValidations);
                  //numberOfValidations = numberOfValidations.toString();
                  close_popup=true;
                  if(answer == true || answer == "true"){
                    //console.log("answer is true")
                    answer_to_send = "si"
                    if(numberOfValidations != "4" || numberOfValidations != 4){
                      //Set cancella=false because there are not enough validations
                      cancella=false
                    }else{
                      //console.log("Ma cancella qua poitrebbe e forse dovfrebbe essere true: " + cancella)
                      //cancella=true;
                      //close_popup = true;
                      await this.sendAnswerEngine("trust", userAnswered, score)
                    }
                  }else{
                    answer_to_send = "no"
                    if(numberOfValidations!="-4" || numberOfValidations!= -4){
                      //console.log("setto cancella a false");
                      cancella = false;
                    }else{
                      console.log("Ma cancella qua poitrebbe e forse dovfrebbe essere true: " + cancella)
                      stillValid = false
                      //Remove the points that the user received through this answer

                      cancella=false
                      close_popup = true
                      await this.deletePreviousUserAnswer(id,type,realQuestion).then(async items=>{
                        console.log(items)
                        await this.sendAnswerEngine("validation", this.$auth.user.myUserIDsignUpName,1.0)
                      })
                      await this.sendAnswerEngine("remove",userAnswered,score)//remove the points to the user that answered previously
                    }
                  }
                  //I give the points to the user that gave the validation
                  if(i.answer!="" && stillValid){
                    close_popup=true
                    await this.sendAnswerValidateOther(answer_to_send,id,question,type,numberOfValidations,realQuestion, userWhoValidated).then(async items=>{
                      console.log(items)
                      console.log("workedval?")
                      //call the game engine to get the score
                      await this.sendAnswerEngine("validation", this.$auth.user.myUserIDsignUpName, 1.0)
                    })
                  }else{
                    console.log("setto cancella a false perchè non c'è una risposta");
                    cancella=false
                  }
                }
              })   
            /*if(this.$refs.validateOtherQuests.length == 0 && this.$refs.openquests.length!=0){
              cancella=false;
            }*/
            }else{
              console.log("setto cancella a false perchè qualche non esiste la ref a validatektheruser");
              cancella=false
            }
          }
          
          //Maybe here I can make a form to get a loaded image. I get the image of the form and make a post call in order to save it in a database
          /////////
          if(cancella==true){
            //this.deleteGeometry(id,type)
            //delete the geometry of the way/node
            this.deleteGeometry(id,type).then(items=>{
              console.log("DELETED ALL" + items)
              var popup_prova = document.getElementsByClassName("maplibregl-popup");
              console.log(popup_prova)
              //console.log(popup_prova[0].style)
              //Update of the map
              this.$parent.updateAllCompleted();
            })
          }
          console.log("IL CLOSE POPUP HA COME VALORE: " + close_popup)
          if(close_popup){
            if(!alreadyGenerated){
              console.log("DOVREBBE USCIRE IL POPUP")
              this.createPopup(this.$gettext("answerSentTitleMsg"), this.$gettext("answerSentMsg"));
              console.log("USER WHO ANSWERED: " + userAnswered + "USER NICKNAME: " + this.$auth.user.nickname)
            }
            console.log("CLOSING POPUP");
            var popup_prova = document.getElementsByClassName("maplibregl-popup");
            console.log(popup_prova)
            console.log(popup_prova[0].style)
            //this.$parent.my_items=null;
            popup_prova[0].style.display="none";
            this.$parent.closePopupOfTest();
            //TODO maybe I'll add a popup saying thanks for the answer or something
          }
          console.log("MY VARIABLE CLOSE POPUP IS " + close_popup);
        }
      }
      //this.$el.parentNode.removeChild(this.$el);
    },

    //used to get the elements separated by a , and insert them in an array
    splitTheArray(string){
      var my_array = []
      my_array = string.split(",");
      console.log("This is my array after split: " + my_array);
      return my_array
    },

    //delete the way because it has all its answers completed
    async deleteGeometry(id,type){
      console.log("entered_function "+id +type)
      var my_body = {
        "id":id,
        "type":type
      }
      console.log(type)
      try{
        const my_url = this.$api_url + "/posts/allAnswerCompleted"
        const requestSpatialite = {
          method:"post", 
          headers:{ "Content-Type":"application/json"},
          body: JSON.stringify(my_body)
        };
        const fetchdata = await fetch(my_url,requestSpatialite)
          .then(response => response.json())
          .then((new_response_data)=>{
            return new_response_data;
          }).catch((err)=>console.log(err))
          return fetchdata
      }catch(e){
        alert("Errorrrr")
      }
    },

    //deletes the answer that was given to the way because it received too many negative validations
    async deletePreviousUserAnswer(id,type,question){
      console.log("DELETING PREVIOUS USER ANSWER")
      var my_body = {
        "id" : id,
        "type" : type,
        "question" : question
      }
      try{
        const my_url = this.$api_url + "/posts/deleteUserAnswer"
        const requestSpatialite = {
          method:"post",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify(my_body)
        };
        const fetchdata = await fetch(my_url,requestSpatialite)
          .then(response => response.json())
          .then((new_response_data)=>{
            return new_response_data;
          }).catch((err)=>console.log(err))
          return fetchdata
      }catch(e){
        alert("Errorrrr")
      }
    },

    createPopup(title,text){
      this.$refs.generalPopupTutorial.title = title;
      this.$refs.generalPopupTutorial.text = text;
      this.$refs.generalPopupTutorial.second = true;
    },

    //the user validated the answer of another user
    async sendAnswerValidateOther(answer,id,question,type, numberOfValidations, realQuestion, usersValidators){
      var my_body = {
        "id": id,
        "answer": answer,
        "question": question,
        "type": type,
        "userName": this.$auth.user.myUserIDsignUpName,
        "validations" : numberOfValidations,
        "realQuestion" : realQuestion,
        "validators" : usersValidators
      }
      console.log(my_body)
      try{
        const my_url = this.$api_url + "/missions/userValidatedOther"
        const requestSpatialite = {
          method: "post",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify(my_body),
        };
        const fetchdata = await fetch(my_url, requestSpatialite)
          .then(response => response.text())
          .then((new_response_data)=>{
            return new_response_data;
          }).catch((err) => console.log(err))
          return fetchdata
      }catch(e){
        alert("error init");
      }
    },

    //the user answered to a question of a way, the function modifies the database
    async sendAnswer(answer,id,question,type){
      var my_body = {
        "id": id,
        "answer": answer,
        "question": question,
        "type": type,
        "userName": this.$auth.user.myUserIDsignUpName,//Needed layer for another validation system
      }
      console.log(my_body)
      try{
        const my_url = this.$api_url + "/missions/addAnswer"
        const requestSpatialite = {
          method:"post",
          headers:{ "Content-Type":"application/json"},
          body: JSON.stringify(my_body),
        };
        const fetchdata = await fetch(my_url,requestSpatialite)
          .then(response => response.text())
          .then((new_response_data)=>{
            //console.log("this is response" + new_response_data)
            //console.log(new_response_data)
            return new_response_data;
          }).catch((err)=>console.log(err)) 
          return fetchdata
      }catch(e){
        alert("Error init");
      }
    },

    //sends the answer to the gamification engine in order to update the user data
    async sendAnswerEngine(type,nickname,score){
      //console.log("WHY IS IT NOT WORKING?")
      console.log("TYPE SENT"+type)
      console.log(nickname)
      console.log(score)
      var my_score = score.toString();
      //Only 1 point for the validation answers
      if(type=="validation"){
        my_score="1";
        console.log("THIS IS MY NEW SCORE: " + my_score);
        score=1;
      }
      my_score = my_score + ".0";
      //console.log(my_score)
      var my_body = {
        "playerId" : nickname,
        "typeMission" : type,
        "points" : my_score
      }
      console.log(my_body)
      try{
        const my_url = this.$api_url + "/missions/givePoint"
        const requestSpatialite = {
          method:"post",
          headers:{"Content-Type":"application/json", 'pw_token':process.env.VUE_APP_REST_PASSWORD},
          body: JSON.stringify(my_body),
        };
        //console.log(requestSpatialite);
        const fetchdata = await fetch(my_url, requestSpatialite)
          .then(response => response.json())
          .then((new_response_data)=>{
            this.updateUserInfo(type,score);
            return new_response_data;
          }).catch((err)=>console.log(err))
          return fetchdata
      }catch(e){
        alert("Error......");
      }
    },

    //update the user state
    updateUserInfo(type,score){
      var medalArray = [];
      console.log("ENTERED UPDATE");
      console.log(this.$userData)
      medalArray = this.$userData.missionComplete(type,score);
      if(this.$userData.just_leveled_up == true){
        console.log("LEVELUP");
        console.log(this.$refs)
        //popup saying you leveld up
        this.$refs.level_up_alert.second=true;
        this.$userData.just_leveled_up = false;
      }
      if(medalArray.length!=0){
        for(let i=0;i<medalArray.length;i++){
          console.log("THIS IS A MEDAL: " + medalArray[i]);
          this.$refs.new_medal_alert.medalName = "Congratulations, You unlocked the " + medalArray[i] + " medal!";
          this.$refs.new_medal_alert.second=true;
        }
      }
      this.$parent.$parent.my_points=this.$userData.points;
      this.$parent.$parent.checkUserClass();
      //TODO send a popup saying thanks for the answer
    },

    //not used for now
    async verifyPowerUps(userName){
      console.log("USER SENT"+userName)
      var my_body = {
        "tableName" : userName,
      }
      try{
        const my_url = this.$api_url + "/managePowerUps/retrieveAll"
        const requestSpatialite = {
          method:"post",
          headers:{"Content-Type":"application/json", 'pw_token':process.env.VUE_APP_REST_PASSWORD},
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
    },
  },

}
</script>

<style scoped>
  .my_button{
    margin-left: auto;
    margin-right: 20px;
    float:right;
    --border-radius: 15px;
    --background: white;
    --color: $color1;
  }

  .my_title{
    display:flex;
    justify-content:center;
  }

  .maplibregl-popup-content {
  background-color:transparent;
  }

  .mapboxgl-popup-content{
    background-color:transparent;
  }
  .maplibregl-popup{background-color:transparent;}
  .mapboxgl-popup{background-color:transparent;} 
  .maplibregl-popup-anchor-bottom{background-color:transparent;}
  .mapboxgl-popup-anchor-bottom{background-color:transparent;}

  .maplibregl-popup-anchor-top {background-color:transparent;}
  .mapboxgl-popup-anchor-top{background-color:transparent;}

  .md-icon{
    font-size: 18px! important;
  }
</style>


