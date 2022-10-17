<template>
  <div class= "ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>Classification</ion-title>-->
        <div  class="titleTab">
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;">Ranking</h3>
        </div>
      </ion-toolbar>
    </ion-header> 
    <br>
    <ion-content class = "ion-text-center" justify-content-center @click=clickedPage()>
        <ClassificationInfo/>
    </ion-content>
    <!--<BottomNav/>-->
  </div>
</template>

<script>
//import BottomNav from "../components/BottomNav";
import ClassificationInfo from "../components/ClassificationInfo";
import SideBarNav from "../components/sidebar/SideBarNav";

export default{
    name: "Classification",
    components: {ClassificationInfo, SideBarNav},
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
