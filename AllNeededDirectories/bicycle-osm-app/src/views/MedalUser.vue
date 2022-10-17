<template>
  <div class= "ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>Medals</ion-title>-->
        <div class="titleTab">
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;">Medals</h3>
        </div>
      </ion-toolbar>
    </ion-header> 
    <br>
    <ion-content class = "ion-text-center" justify-content-center @click=clickedPage() v-if="this.my_badges">
      <li class="medal_list" v-for="(value,index) in this.my_badges" v-bind:key="'M'+index">
        <MedalsInfo class="element_list_medals" :medalName="my_badges[index].MEDALNAME" :medalColor="my_badges[index].COLOR" :medalDescription="my_badges[index].DESCRIPTION"/>
      </li>
      <ion-button class="back_button" @click="goToClassification()">Go Back</ion-button>
        <!--<MedalsInfo :medalsList="my_badges"/>-->
    </ion-content>
    <ion-content class = "ion-text-center" justify-content-center @click=clickedPage() v-else>
        <NoMedalsClassInfo/>
        <ion-button class="back_button" @click="goToClassification()">Go Back</ion-button>
    </ion-content>
    
    <!--<BottomNav/>-->
  </div>
</template>

<script>
//import BottomNav from "../components/BottomNav";
import MedalsInfo from "../components/MedalsInfo";
import NoMedalsClassInfo from "../components/NoMedalsClassInfo";
import UserData from "../utils/UserData.js";
import Vue from 'vue'
import SideBarNav from "../components/sidebar/SideBarNav";

export default{
    name: "MedalUser",
    components: {MedalsInfo, NoMedalsClassInfo, SideBarNav},
    data(){
      return{ my_badges:null, nickname:null}
    },
    props: ['userName', 'showName'],
    mounted: async function(){
        //Get Player Medals
        var nickname = this.$route.params.userName
        var userStats = new UserData();
        this.nickname=nickname;
        this.showName = this.$route.params.showName
        if(this.$userInfo==null||this.$userInfo==undefined){
            //console.log("NOT CREATED...");
            await(userStats.createUser(nickname,this.$api_url));
            await this.updatePage(userStats).then(items=>{
              console.log(items);
              this.my_badges = items
            });
            Vue.prototype.$userInfo = userStats;
        }else{
            if(this.$userInfo.userName==nickname){
                //console.log("Perfect");
                await this.updatePage(this.$userInfo).then(items=>{
                  console.log(items);
                  this.my_badges = items
                });
            }else{
                //console.log("Not the same");
                //console.log("nickname: " + nickname + "name: " + this.$userInfo.userName)
                await(userStats.createUser(nickname,this.$api_url));
                await this.updatePage(userStats).then(items=>{
                  console.log(items);
                  this.my_badges = items
                });
                Vue.prototype.$userInfo = userStats;
            }
        }
        //console.log(this.nickname);
        //JUST FOR ANIMATION
        var items = document.getElementsByClassName("element_list_medals");
        for (let i = 0; i < items.length; ++i) {
          fadeIn(items[i], i * 300)
        }
        function fadeIn (item, delay) {
          setTimeout(() => {
            item.classList.add('fadein')
          }, delay)
        }
  },

  methods:{
      async updatePage(userData){
          /*if(userData.badges.length>0){
            this.my_badges=new Array();
            for(var i=0;i<userData.badges.length;i++){
              this.my_badges.push(userData.badges[i]);
            }
          }*/
          var my_body = null;
          if(userData.badges.length>0){
            this.my_badges=new Array();
            my_body = new Array();
            for(var i=0;i<userData.badges.length;i++){
              this.my_badges.push(userData.badges[i]);
              my_body.push(userData.badges[i]);
            }
          }
          //get all the badges with their description from the db
          try{
            var my_url = this.$api_url + "/badgesTable/retrieve"
            const requestSpatialite = {
            method:"post",
            headers:{"Content-Type":"application/json", 'pw_token':process.env.VUE_APP_REST_PASSWORD},
            body: JSON.stringify(my_body)
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

      goToClassification(){
            console.log("Clicked go to medal");
            //this.$router.push('/classification'); 
            this.$router.push({name:"userclassification", params:{userName: this.nickname, current_name:this.showName}});
      },

      clickedPage(){
        console.log("you clicked the page");
        if(this.$refs.my_menu.toggleCard==true){
          this.$refs.my_menu.toggle();
        }
      }
  },
}
</script>
<style scope>
  .medal_list{
    list-style-type:none;
  }

  .back_button{
    --border-radius: 15px;
    --color: var(--black);
    --background: var(--white);
    width:200px;
    margin:0 auto;
    margin-bottom: 50px;
    margin-top:20px;
  }
</style>