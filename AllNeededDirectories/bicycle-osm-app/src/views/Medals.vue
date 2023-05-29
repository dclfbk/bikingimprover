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
      <ion-button class="back_button" @click="goToProfile()">Go Back</ion-button>
    </ion-content>
    <ion-content class = "ion-text-center" justify-content-center @click=clickedPage() v-else>
        <NoMedalsInfo/>
        <ion-button class="back_button" @click="goToProfile()">Go Back</ion-button>
    </ion-content>
  </div>
</template>

<script>
import MedalsInfo from "../components/MedalsInfo";
import NoMedalsInfo from "../components/NoMedalsInfo";
import UserData from "../utils/UserData.js";
import Vue from 'vue'
import SideBarNav from "../components/sidebar/SideBarNav";

export default{
    name: "Medals",
    components: {MedalsInfo, NoMedalsInfo, SideBarNav},
    data(){
      return{ 
        my_badges:null //list of the user medals
      }
  },
  mounted: async function(){
      //Get Player Medals
      if(this.$userData==null||this.$userData==undefined){
          console.log("NOT CREATED...");
          Vue.prototype.$userData = new UserData();
          await(this.$userData.createUser(this.$auth.user.myUserIDsignUpName, this.$api_url, this.$auth.getTokenApi())).then(async items=>{
            console.log(items)
            await(this.updatePage(this.$userData)).then(items=>{
              items = this.sortByColor(items);
              this.my_badges = items;
            });
          });
          //this.updatePage(this.$userData);
      }else{
        await(this.updatePage(this.$userData)).then(items=>{
          items = this.sortByColor(items);
          this.my_badges = items;
        });
        //this.updatePage(this.$userData);
      }

      //JUST FOR ANIMATION
      var items = document.getElementsByClassName("element_list_medals");
      for (let i = 0; i < items.length; ++i) {
        if(i%2==0){
            items[i].style.setProperty('--x',"100px")
        }else{
            items[i].style.setProperty('--x',"-100px")
        }
        fadeIn(items[i], i * 300)
      }
      function fadeIn (item, delay) {
        setTimeout(() => {
          item.classList.add('fadein')
        }, delay)
      }
  },

  methods:{
      sortByColor(my_list){
        var sortOrder = {"gold":0, "silver":1, "brown":2, "black":3}
        my_list.sort(function(p1,p2){
          return sortOrder[p1.COLOR]-sortOrder[p2.COLOR];
        })
        return my_list;
      },

      async updatePage(userData){
        //if(userData.badges.length)
          //console.log(userData.badges);
          var my_body = null;
          if(userData.badges.length>0){
            this.my_badges=new Array();
            my_body = new Array();
            for(var i=0;i<userData.badges.length;i++){
              this.my_badges.push(userData.badges[i]);
              my_body.push(userData.badges[i]);
            }
          }
          //get all the badges with their description from the db.
          try{
            var my_url = this.$api_url + "/badgesTable/retrieve"
            const jwtToken = await this.$auth.getTokenApi()
            const requestSpatialite = {
            method:"post",
            headers:{"Content-Type":"application/json", 'pw_token':jwtToken},
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
          //console.log(my_url);
      },

      goToProfile(){
            console.log("Clicked go to medal");
            this.$router.push('/profile'); 
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