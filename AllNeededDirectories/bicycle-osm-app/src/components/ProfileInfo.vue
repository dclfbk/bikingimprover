<template>
  <div>
    <div>
      <img :src="$auth.user.picture" style="padding-top:10px" class="img_profile">
      <!--<h2>{{ $auth.user.nickname }}</h2>-->
      <ion-grid>
            <ion-row justify-content-center>
                <popup v-if="editing"></popup>
                <div>
                <form> 
                    <ion-item style="--background-color:transparent">
                        <!--<img style="height:40px; width:40px;" class="my_image_class" :src="this.level_icon"> -->
                        <md-icon class="icon_profile" id="icon_profile">{{this.level_icon}}</md-icon>
                        <ion-input class="text-input" text-center :value=this.nickname :readonly=this.read_only></ion-input>
                        <ion-icon class="my_icon_class" :icon="this.my_icon" v-on:click="createNamePopup"></ion-icon>
                    </ion-item>
                </form>
                </div>
            </ion-row>
      </ion-grid>

      <p class="number_anim" id="level_p"><translate>levelMsg</translate><span>:&nbsp;</span>0<!--{{this.level}}--><!--Level {{ this.level }}--></p>
      <progress id="file" value=0 max="100"> 32% </progress>



    
    </div>
    
    <div>
        <p class="number_anim" id="point_p"><translate>pointsMsg</translate><span>:&nbsp;</span>0<!--{{this.goldPoints}}--></p>
    </div>
    <br>
    <ion-grid>
        <ion-row justify-content-center>
            <ion-button class="medal_button" @click="go_to_medal"><translate>medalMsg</translate></ion-button>
        </ion-row> 
        <ion-row>
            <p></p>
        </ion-row>
        <ion-row justify-content-center>
            <ion-button class="medal_button" @click="changeTheme"><translate>themeMsg</translate></ion-button>
        </ion-row>
        <ion-row>
            <p></p>
        </ion-row>
        <ion-row justify-content-center>
            <ion-button class="medal_button" @click="logout">Logout</ion-button>
        </ion-row>
    </ion-grid>
    <br>
    <!--<ion-toggle id="ionOn" v-if="enabled==true" checked="true" color="warning" @ionChange="gpsClick()"></ion-toggle>
    <ion-toggle id="ionOff" v-else color="warning"  checked="false" @ionChange="gpsClick()"></ion-toggle>-->

    <!--<div>
      <pre>{{ JSON.stringify($auth.user, null, 2) }}</pre>
    </div>-->
  </div>
</template>

<script>
import Popup from'./Popup.vue';
import UserData from "../utils/UserData.js";
import Vue from 'vue'
import {getTheme} from '../utils/GlobalFunctions.js';
import {animateValue} from '../utils/GlobalFunctions.js';

export default{
    name: "ProfileInfo",
    components:{
      "popup" : Popup,
    },
    data(){
        return{
            editing:null,
            read_only: null,
            nickname: null,
            my_icon:null,
            level:null,
            value:null,
            goldPoints:null,
            level_icon: null,
            enabled:false
        }
    },
    methods:{
        async updateName(_callback,newName){ //maube use auth.usewr.myuserfirstsignupname
            var acc_token = await this.$auth.getTokenApi();
            var user_id = this.$auth.user.sub;
            var token_to_use = "Bearer " + acc_token.access_token;
            var my_body = {
                "new_name": newName,
                "user_id": user_id
            }
            var my_url = this.$api_url + "/posts/user/changeUsername"
            try{
                var my_request = {
                    method: "post",
                    headers:{ "Content-Type":"application/json", "Authorization": token_to_use},
                    body:JSON.stringify(my_body)
                }
                const fetchdata = await fetch(my_url,my_request)
                .then(response => response.json())
                .then((new_response_data)=>{
                    console.log("AOOOO"+new_response_data);
                    this.nickname = newName 
                    this.$auth.user.nickname = newName
                    return new_response_data;
                }).catch((err)=>console.log(err))
                    _callback();
                    return fetchdata
            }catch(e){
                console.log(e)
            }
        },

        async createNamePopup(){
            console.log("clicked")
            this.editing=true;
        },

        go_to_medal(){
            console.log("Clicked go to medal");
            this.$router.push('/medals'); 
        },

        logout(){
            this.$auth.logout({
                returnTo: window.location.origin
            });
        },

        updatePage(userData){
            console.log(userData);
            //update the profile
            this.level = userData.level;
            this.goldPoints = userData.points;
            var custom_levelUp = userData.level_up_points;
            var max_points = this.level*10;
            var my_value = custom_levelUp*100/max_points
            this.value = my_value;
            if(userData.level==undefined){
                this.level=0;
            }
            if(userData.points == undefined){
                this.goldPoints=0;
            }
            var level_int = parseInt(userData.level);
            if(level_int<5){
                //this.level_icon = require("@/assets/images/passeggino.png");
                this.level_icon = "child_friendly"
            }else if(level_int>=5 && level_int<10){
                //this.level_icon = require("@/assets/images/tricycle.png");
                this.level_icon = "pedal_bike"
                console.log("tra 5 e 10")
            }else{
                //this.level_icon = require("@/assets/images/bicycle.png");
                this.level_icon = "two_wheeler"
                console.log("sopra 10, " + level_int)
            }
        },

        changeTheme(){
            if(localStorage.getItem("theme")=="blackish"||localStorage.getItem("theme")==undefined|| localStorage.getItem("theme")==null){
                localStorage.setItem("theme", "default");
                getTheme();
            }else{
                localStorage.setItem("theme", "blackish");
                getTheme();
            }
        },
    },

    mounted:async function(){
        //Page logic
        this.editing=false;
        this.nickname = this.$auth.user.nickname;
        this.read_only = true;
        this.my_icon=require("@/assets/images/pencil-sharp.svg");
        this.level_icon = require("@/assets/images/passeggino.png");
        if(this.$userData==null||this.$userData==undefined){
            console.log("NOT CREATED...");
            Vue.prototype.$userData = new UserData();
            await(this.$userData.createUser(this.$auth.user.myUserIDsignUpName, this.$api_url));
            this.updatePage(this.$userData);
        }else{
            this.updatePage(this.$userData);
        }
        //FOR ANIMATION
        var icon_profile = document.getElementById("icon_profile");
        var level_p = document.getElementById("level_p");
        var point_p = document.getElementById("point_p");
        var progress_b = document.getElementById("file");
        animateValue(level_p, 0, this.level, 800,false);
        animateValue(point_p, 0, this.goldPoints, 1000,false);
        animateValue(progress_b, 0, this.value, 700, true);
        icon_profile.style.setProperty('--x',"-100px")
    },
}
</script>

<style scoped lang="scss">

ion-item{
  text-align : center;
  align-items:center;
  --ion-background-color: transparent !important
}

.text-input{
    color:var(--black);
    opacity:1;
    --background:none;
}

ion-input{
--background: none;
}

ion-icon{
    cursor:pointer
}

.medal_button{
    --border-radius: 15px;
    --color: var(--black);
    --background: var(--white);
    width:200px;
}

.my_image_class{
    color: var(--black);
    -webkit-filter: var(--inv);
    filter: var(--inv);
}

.my_icon_class{
    --color: var(--black);
    color: var(--black);
}

.md-icon{
    min-width:36px; 
    font-size:36px! important;
}

/*progress::-moz-progress-bar { background: var(--secondaryColor); }
progress::-webkit-progress-value { background: var(--secondaryColor); }
progress { color: var(--secondaryColor); }*/
progress{
    accent-color: var(--secondaryColor);
    /*background-color: var(--secondaryColor);*/
    color: var(--secondaryColor)
}
</style>
