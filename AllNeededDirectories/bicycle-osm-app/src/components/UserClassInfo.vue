<template>
  <div>
    <div>
      <!--<img src="../assets/images/3289576_user_icon.png" style="width:100px; height:100px;">-->
      <md-icon class="icon_profile" id="icon_profile">{{this.level_icon}}</md-icon>
      <br>
      <ion-item>
            <ion-input class="text-input" text-center :value=this.current_name :readonly=this.read_only></ion-input>
      </ion-item>

      <p class="number_anim" id="level_p"><translate>levelMsg</translate><span>:&nbsp;</span> 0</p>
      <progress id="file" :value=value max="100"> 32% </progress>
    </div>
    
    <div>
        <p class="number_anim" id="point_p"><translate>pointsMsg</translate><span>:&nbsp;</span> 0</p>
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
            <ion-button class="medal_button" @click="go_back">Go Back</ion-button>
        </ion-row>
    </ion-grid>
  </div>
</template>

<script>
import UserData from "../utils/UserData.js";
import Vue from 'vue'
import {animateValue} from '../utils/GlobalFunctions.js';

export default{
    name: "UserClassInfo",
    data(){
        return{
            editing:null,
            read_only: null,
            nickname: null, //used to know of which user the medal belong o
            my_icon:null,  
            level:null, //user level
            value:null, //how much do you still need to levle up
            goldPoints:null, //goldPoints of the user in the game engine
            level_icon:null
        }
    },
    props: ['userName','current_name'],
    methods:{
        go_to_medal(){
            //this.$router.push('/medalclassification'); 
            this.$router.push({name:"MedalUser", params:{userName: this.nickname, showName:this.current_name}});
        },

        go_back(){
            this.$router.push('/classification');
        },

        updatePage(userData){
            //update the profile
            this.level = userData.level;
            this.goldPoints = userData.points;
            var custom_levelUp = userData.level_up_points;
            var max_points = this.level*10;
            var my_value = custom_levelUp*100/max_points
            this.value = my_value;
            var level_int = parseInt(userData.level);
            if(level_int<5){
                this.level_icon = "child_friendly"
            }else if(level_int>=5 && level_int<10){
                this.level_icon = "pedal_bike"
            }else{
                this.level_icon = "two_wheeler"
            }
        }
    },

    mounted:async function(){
        this.editing=false;
        this.read_only = true;
        var nickname = this.$route.params.userName
        this.current_name = this.$route.params.current_name
        this.nickname = nickname;
        var userStats = new UserData();
        if(this.$userInfo==null||this.$userInfo==undefined){
            //console.log("NOT CREATED...");
            await(userStats.createUser(nickname,this.$api_url, this.$auth.getTokenApi()));
            this.updatePage(userStats);
            Vue.prototype.$userInfo = userStats;
        }else{
            if(this.$userInfo.userName==nickname){
                //console.log("Perfect");
                this.updatePage(this.$userInfo);
            }else{
                //console.log("Not the same");
                //console.log("nickname: " + nickname + "name: " + this.$userInfo.userName)
                await(userStats.createUser(nickname,this.$api_url, this.$auth.getTokenApi()));
                this.updatePage(userStats);
                Vue.prototype.$userInfo = userStats;
            }
        }

        //FOR ANIMATION
        var icon_profile = document.getElementById("icon_profile");
        var level_p = document.getElementById("level_p");
        var point_p = document.getElementById("point_p");
        var progress_b = document.getElementById("file");
        animateValue(level_p, 0, this.level, 800,false);
        animateValue(point_p, 0, this.goldPoints, 1000,false);
        animateValue(progress_b, 0, this.value, 700, true);
        icon_profile.style.setProperty('--x',"-200px")
    },
}
</script>

<style scoped lang="scss">

ion-item{
  text-align : center;
  align-items:center;
  --ion-background-color: transparent !important
}

ion-input{
--background: none;
}

.text-input{
    color:var(--black);
    opacity:1
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

.md-icon{
    font-size: 108px! important;
    padding-top:72px;
    padding-bottom:60px;
}

.icon_profile{
    color:#8C8C8C
}

progress{
    accent-color: var(--secondaryColor);
    /*background-color: var(--secondaryColor);*/
    color: var(--secondaryColor)
}

</style>
