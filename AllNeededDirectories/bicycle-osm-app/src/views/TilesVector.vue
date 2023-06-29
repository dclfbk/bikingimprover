<template>
  <div class="ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>HomePage</ion-title>-->
        <div class="titleTab">         
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;">HomePage</h3>
              <div style=" float:right; margin-top:10px; margin-left: auto; margin-right: 25px;">
                <p style="margin:0"> <translate>pointsMsg</translate>: {{my_points}}<!--Your Points: {{my_points}}--></p>
                <p style="margin:0"> <translate>rankingMsg</translate>: {{my_ranking}}<!--Ranking: {{my_ranking}}--></p>
              </div>
        </div>
      </ion-toolbar>
    </ion-header> 
    <ion-content class = "ion-padding" @click=clickedPage()>
        <MyTiles v-if="finishedMounting" />
    </ion-content>
    <!--<BottomNav/>-->
    <TutorialPopup ref="popupNegative"/>
    <TutorialPopup ref="popupPositive"/>
  </div>
</template>

<script>
  // @ is an alias to /src
  import MyTiles from "../components/MyTiles";
  import TutorialPopup from "../components/popups/TutorialPopup.vue";
  import SideBarNav from "../components/sidebar/SideBarNav"
  import UserData from "../utils/UserData.js";
  import Vue from 'vue'
  //import checkUserPins from "../utils/GlobalFunctions.js"
  export default {
    name: 'TilesVector',
    components: { MyTiles, SideBarNav, TutorialPopup},
    data(){
      return{ my_points:null, my_ranking:"...", timer:null, finishedMounting:false}
    },
    async mounted(){
      //await checkUserData("prova");
      if(this.$userData==null||this.$userData==undefined){
        //console.log("NOT CREATED...");
        Vue.prototype.$userData = new UserData();
        await(this.$userData.createUser(this.$auth.user.myUserIDsignUpName, this.$api_url, await this.$auth.getTokenApi())).then(async items=>{
          this.my_points = this.$userData.points;
          this.getRanking();
          console.log(items)
          /*await(this.createDBUser(this.$auth.user.myUserIDsignUpName)).then(async items=>{
              console.log(items);            
          });*/
          if(this.$userData.isNew){
            this.$auth.getUser();
            //console.log(this.$auth.user);
            if(this.$auth.user.myUserIDsignUpName==null){
              this.$auth.user.myUserIDsignUpName = this.$auth.user.nickname 
            }
            var userToSend = this.$auth.user.myUserIDsignUpName
            await(this.createDBUser(userToSend)).then(async items=>{
              console.log(items);
              this.finishedMounting=true;
              this.$router.push("tutorial");
            });
          }else{
            this.checkIfCompletelyValidated();
            this.finishedMounting=true;
          }
        });
      }else{
        this.my_points=this.$userData.points;
        this.getRanking();
        this.checkIfCompletelyValidated();
        this.finishedMounting=true;
      }
      //await checkUserPins(this.$api_url); //anche questa magari la chiamo ogni 5 minuti
      this.timer = setInterval(()=>{
        //function called every 5 minutes (5000 * 60)
        this.checkIfCompletelyValidated()
      },300000) 
    },
    methods:{
      async checkUserClass(){
        console.log("CHECKING USER CLASSIFICATION AND THEN UPDATING::::::");
        await this.getRanking();
      },
      
      async getRanking(){
        await this.getPlayerClassification().then(async items=>{
          var my_content = items.content;
          //Ordino l'array dal player con punteggio più alto al più basso  
          my_content.sort(function(a,b){
              return parseFloat(b.state.PointConcept[1].score) - parseFloat(a.state.PointConcept[1].score);
          })
          //console.log("USERNAME:" + this.$userData.userName);
          for(var i=0; i<my_content.length;i++){
            if(my_content[i].playerId==this.$userData.userName){
              console.log(my_content[i].playerId);
              this.my_ranking=i+1;
              console.log(this.my_ranking);
            }
          }
        });
      },

      async createDBUser(userName){
        //console.log("USERRRRRRRRRRRRRRRRRRRRRRRRRR")
        console.log(userName)
        var my_body = {
          "userName": userName
        }
        try{
          const my_url = this.$api_url + "/managePowerUps/createUserTable"
          const jwtToken = await this.$auth.getTokenApi();
          //console.log(jwtToken)
          const requestSpatialite = {
            method: "post",
            headers:{"Content-Type":"application/json", 'pw_token':jwtToken.access_token},
            body: JSON.stringify(my_body)
          }
          const fetchdata = await fetch(my_url, requestSpatialite)
            .then(response => response)
            .then((new_response_data)=>{
              return new_response_data;
            }).catch((err)=>console.log(err))
            return fetchdata
          }catch(e){
            alert("Error......");
        }
      },

      async getPlayerClassification(){
        //call api and get response;
        try{
            const my_url = this.$api_url + "/posts/user/getUserClassification"
            const requestToGamification = {
                method:"get",
                headers:{ "Content-Type":"application/json"},
            };
            const fetchdata = await fetch(my_url,requestToGamification)
            .then(response => response.json())
            .then((new_response_data)=>{
                return new_response_data;
            }).catch((err)=>console.log(err)) 
            return fetchdata
        }catch(e){
            alert("Error init");
        }
      },


      async checkIfCompletelyValidated(){
        console.log("CHECK IF COMPLETELY VALIDATED....");
        //call game engine to check the custom data full_positive and full_negative. Then it resets them to 0
        if(this.$userData.full_positive!=0){
          console.log("SOME GUYS FULLY VALIDATED YOUR ANSWERS!");
          this.$refs.popupPositive.text = this.$gettext("ValStartPos") +this.$userData.full_positive + this.$gettext("ValEndPos");
          this.$refs.popupPositive.second = true;
          await this.resetCustomValidation("full_positive_validation")
          //resetValidated
        }
        if(this.$userData.full_negative!=0){
          console.log("SOME GUYS INVALIDATED YOUR ANSWER, YOU'RE LOSING POINTS");
          this.$refs.popupNegative.text = this.$gettext("ValStartNeg") +this.$userData.full_negative + this.$gettext("ValEndNeg");
          this.$refs.popupNegative.second = true;
          //resetValidated
          await this.resetCustomValidation("full_negative_validation")
        }
      },

      async resetCustomValidation(full){
        console.log("resetting....")
        var my_body = {
        "playerId" : this.$userData.userName,
        "typeMission" : "reset",
        "points" : full
        }
        console.log(my_body)
        try{
          const my_url = this.$api_url + "/missions/givePoint"
          const jwtToken = await this.$auth.getTokenApi();
          const requestSpatialite = {
            method:"post",
            headers:{"Content-Type":"application/json", 'pw_token':jwtToken.access_token},
            body: JSON.stringify(my_body),
          };
          const fetchdata = await fetch(my_url, requestSpatialite)
            .then(response => response.json())
            .then((new_response_data)=>{
              if(full == "full_positive_validation"){
                this.$userData.full_positive = 0;
              }else{
                this.$userData.full_negative = 0;
              }
              return new_response_data;
            }).catch((err)=>console.log(err))
            return fetchdata
        }catch(e){
          alert("Error......");
        }
      },

      clickedPage(){
        console.log("you clicked the page");
        if(this.$refs.my_menu.toggleCard==true){
          this.$refs.my_menu.toggle();
        }
      }
    }
  }
</script>

<style scoped>
[v-cloak]{
  display:none;
}
</style>