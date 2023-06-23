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
        const osmToken = await this.$auth.getOSMTokenApi(user_id, token_to_use);
        
        if(osmToken!=undefined){
          //Send data to osm logic using the authenticated user
          console.log(osmToken.osmToken);
          this.sendDataToOSMViaUser(osmToken, data.value);
        }else{
          //Send data to OSM using our OSM account
          this.sendDataToOSM(data.value);
        }

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

      async sendDataToOSMViaUser(osmToken, data){
        var my_body = {
          "data": data,
        }
        try{
          const my_url = this.$api_url + "/posts/sendOSM"
          const requestSpatialite = {
            method:"post", 
            headers:{ "Content-Type":"application/json", "osm_token": osmToken},
            body: JSON.stringify(my_body)
          };
          const fetchdata = await fetch(my_url,requestSpatialite)
            .then(response => response.json())
            .then((new_response_data)=>{
              return new_response_data;
            }).catch((err)=>console.log(err))
            return fetchdata
        }catch(e){
          alert("Error sending data to OSM")
        }
      },

      async sendDataToOSM(data){
        console.log("sending via my account");
        console.log(data);
        return;
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

