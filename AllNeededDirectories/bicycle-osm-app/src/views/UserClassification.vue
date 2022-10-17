<template>
  <div class= "ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>UserProfile</ion-title>-->
        <div class="titleTab">
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;">UserProfile</h3>
        </div>
      </ion-toolbar>
    </ion-header> 
    <br>
    <ion-content class = "ion-text-center" justify-content-center @click=clickedPage()>
        <UserClassInfo/>
    </ion-content>
    <!--<BottomNav/>-->
  </div>
</template>

<script>
//import BottomNav from "../components/BottomNav";
import SideBarNav from "../components/sidebar/SideBarNav";
import UserClassInfo from "../components/UserClassInfo";

export default{
    name: "UserClassification",
    components: {SideBarNav, UserClassInfo},
    methods:{
      clickedPage(){
        console.log("you clicked the page");
        if(this.$refs.my_menu.toggleCard==true){
          this.$refs.my_menu.toggle();
        }
      }
    },
}
</script>