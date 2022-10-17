<template>
  <div class= "ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>Profile</ion-title>-->
        <div class="titleTab">
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;">Options</h3>
        </div>
      </ion-toolbar>
    </ion-header> 
    <br>
    <ion-content class = "ion-text-center" justify-content-center @click=clickedPage()>
        <ion-grid>
            <ion-row>
                <ion-col width-50>
                    <ion-item class = "select-input">
                        <ion-label>
                            <translate style="color:var(--black)">languageMsg</translate>: <translate style="color:var(--black)">languageType</translate>
                        </ion-label>
                    </ion-item>
                </ion-col>
                <ion-col width-50>
                    <ion-item class = "select-input">
                        <ion-select :placeholder="current" @ionChange="languagePick($event)">
                            <ion-select-option v-for="(my_language,key) in $language.available" :value="key" v-bind:key="my_language">{{my_language}}</ion-select-option>
                            <!--<ion-select-option value="English">English</ion-select-option>
                            <ion-select-option value="Italian">Italian</ion-select-option>-->
                        </ion-select>
                    </ion-item>
                </ion-col>
            </ion-row>
            <br>
            <br>
            <br>
            <ion-row justify-content-center>
                <ion-button class="change_button" @click="changeTheme"><translate>themeMsg</translate></ion-button>
            </ion-row>
            <br>
            <ion-row justify-content-center> 
                <ion-button class="change_button" @click="logout">Logout</ion-button>
            </ion-row>
        </ion-grid>
    </ion-content>
    
    <!--<BottomNav/>-->
  </div>
</template>

<script>
//import BottomNav from "../components/BottomNav";
import SideBarNav from "../components/sidebar/SideBarNav";
import Vue from 'vue'
import {getTheme} from '../utils/GlobalFunctions.js';
import {getLanguage} from '../utils/GlobalFunctions.js';
import {setLanguage} from '../utils/GlobalFunctions.js';

export default{
    name: "Options",
    components: {SideBarNav},
    data(){
      return{
          languagePicked:"",
          current: null,
      }
    },
    beforeMount:function(){
        //this.current = Vue.prototype.currentLanguage;
        //getLanguage();
        this.current=getLanguage()
    },
    methods:{
        clickedPage(){
            console.log("you clicked the page");
            if(this.$refs.my_menu.toggleCard==true){
                this.$refs.my_menu.toggle();
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
        languagePick(event){
            console.log("Previous Language was: " + Vue.config.language)
            //console.log(Vue.config.language.available)
            console.log("picked language is " + event.detail.value);
            this.languagePicked = (event.detail.value)
            Vue.config.language = this.languagePicked
            setLanguage(this.languagePicked);
        }
    },
}
</script>

<style>
.change_button{
    --border-radius: 15px;
    --color: var(--black);
    --background: var(--white);
    width:200px;
}

.change_button > span{
    --color: var(--black);
    color: var(--black);
}

.select-input{
    color:var(--black);
    opacity:1;
    --background:none;
}

button > span{
    color:black;
    
}
</style>