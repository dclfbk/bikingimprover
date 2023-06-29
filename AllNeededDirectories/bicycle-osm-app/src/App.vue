<template>
  <div id="app">   
    <ion-app>
      <!--<ion-header>
        <ion-toolbar>
          <div class="titleTab" style="z-index=1">
                <SideBarNav/>
                <h3 style="margin-top: 16px;">Profile</h3>
          </div>
        </ion-toolbar>
      </ion-header> -->
      <ion-vue-router/>
    </ion-app>
  </div>
</template>

<script type="text/javascript">
  //import BottomNav from './components/BottomNav.vue'
  //import SideBarNav from "./components/sidebar/SideBarNav";
  import {getTheme} from "./utils/GlobalFunctions.js"
  import {getLanguage} from "./utils/GlobalFunctions.js"
  import Vue from 'vue'
  import SocketioService from './utils/socketio.service.js';
  
  export default{
    components:{
      //SideBarNav,
        //BottomNav// register component
    },

    created(){
      SocketioService.setupSocketConnection();

      SocketioService.socket.on('validated', async (data) => {
        //data is a list containing the tagAnswer and id of the way/node that we have to send to OSM.
        console.log("My user now is" + this.$auth.user.myUserIDsignUpName)
        console.log("Data is:");
        console.log(data);

        //Get the OSM Token
        const authToken = await this.$auth.getTokenApi();
        var token_to_use = "Bearer " + authToken.access_token;
        var user_id = this.$auth.user.sub;
        let osmToken = await this.$auth.getOSMTokenApi(user_id, token_to_use);

        if(osmToken == undefined || osmToken ==null){
          osmToken = {osmToken:"MyOSMUser"}
        }

        //Send data to osm logic using the authenticated user
        const newDataArray = this.divideElements(data.value);
        console.log(newDataArray);
        let oldElementsArray = []

        for(var i=0; i<newDataArray.length; i++){
          const id = newDataArray[i].ID;
          const type = newDataArray[i].TYPE
          const oldElement = await this.getOSMElement(id, type)
          oldElementsArray.push(oldElement);
        }
        console.log(oldElementsArray);

        const changesetID = await this.createChangeset(osmToken)

        let my_import_responses = []
        for(i=0; i<newDataArray.length; i++){
          const importElement = await this.sendDataToOSMViaUser(osmToken, newDataArray[i], oldElementsArray[i], changesetID)
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
        const flatChangeset = [...setToSentList.flat().map(item => item)];
        await this.saveChangeset(flatChangeset);
        //

        //SET DB QUESTION_TABLE TO SENT = YES
        const flatArray = [...setToSentList.flat().map(item => item)];
        await this.setToSent(flatArray);

        //CLOSE CHANGESET
        await this.closeChangeset(osmToken,changesetID)

      });

    },

    mounted(){
      console.log("main component has been mounted.....");
      console.log(Vue.version);
      //this.checkAppTheme();
      getTheme();
      //getLanguage();
      Vue.config.language = getLanguage();
    },
    methods:{
      
      divideElements(data){
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
      },

      async createChangeset(token){
        try{
          const my_url = this.$api_url + "/osmCalls/createChangeset"
          const requestSpatialite = {
            method:"POST", 
            headers:{ "Content-Type":"application/json", "token": token.osmToken},
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
      },

      async closeChangeset(token, changesetID){
        var my_body = {
          "osm_token": token,
          "changesetID": changesetID
        }
        try{
          const my_url = this.$api_url + "/osmCalls/closeChangeset"
          const requestSpatialite = {
            method:"POST", 
            headers:{ "Content-Type":"application/json", "token": token.osmToken},
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
      },

      async saveChangeset(changesetList){
        var my_body = {
          "changesetList": changesetList,
        }
        try{
          const my_url = this.$api_url + "/changeset/saveChangeset"
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
      },

      async setToSent(listToSend){
        console.log("NOW SETTING TO SENT")
        var my_body = {
          "elements": listToSend,
        }
        try{
          const my_url = this.$api_url + "/changeset/updateSent"
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
      },

      async getOSMElement(id,type){
        console.log(id);
        console.log(type.toLowerCase());
        try{
          const my_url = this.$api_url + "/osmCalls/getOSMElement/" + type.toLowerCase() + "&" + id
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
          console.log("Error sending data to OSM")
        }
      },

      async sendDataToOSMViaUser(osmToken, newElements, oldElements, changesetID){
        var my_body = {
          "new_element": newElements,
          "old_element": oldElements,
          "changesetID": changesetID
        }
        try{
          const my_url = this.$api_url + "/osmCalls/importOSM"
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
      },

      async sendDataToOSM(data){
        console.log("SENDING VIA MY ACCOUNT BECAUSE USER NOT LOGGED VIA OSM");
        //console.log(data);
        var my_body = {
          "data": data,
        }
        try{
          const my_url = this.$api_url + "/posts/sendToOSMViaMyAccount"
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
          console.log("Error sending data to OSM")
        }
      },

      async updateSentData(data){
        //console.log(data);
        var my_body = {
          "data": data,
        }
        try{
          const my_url = this.$api_url + "/changeset/updateSent"
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
          console.log("Error sending data to OSM")
        }
      },

      async updateChangeset(data){
        console.log("UPDATE CHANGESET")
        console.log(data);
        var my_body = {
          "data": data,
        }
        try{
          const my_url = this.$api_url + "/changeset/updateChangesetSentTable"
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
          console.log("Error sending data to OSM")
        }
      }

    }
  }

</script>

<style lang="scss">
.ion-page{
   background-color: var(--white);
   background-image: url("./assets/images/croppedyellow-modified.png");
   background-size: 70%;
   background-position: right bottom;
   background-repeat: no-repeat;

   /*
   If you want to add animation to the ion page then you could do it like that
   transition: 1s all ease-in-out;
   opacity:0;
   animation: fadeIn 1s 1;
   --x: -400px;
   animation-fill-mode: forwards;
   */
  
}

ion-content{
    --background:none;
}

h3{
  color:var(--black);
}
</style>

