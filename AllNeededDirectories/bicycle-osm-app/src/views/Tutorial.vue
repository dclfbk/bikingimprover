<template>
  <div class="ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>HomePage</ion-title>-->
        <div style="display:inline-flex; overflow:auto; width:100%; background-color:#ECC478; pointer-events:none;">         
              <SideBarNav/>
              <h3 style="margin-top: 16px;">Tutorial</h3>
              <div style=" float:right; margin-top:10px; margin-left: auto; margin-right: 25px;">
                <p style="margin:0"> Punteggio: {{my_points}}<!--Your Points: {{my_points}}--></p>
                <p style="margin:0">Classifica: {{my_ranking}}<!--Ranking: {{my_ranking}}--></p>
              </div>
        </div>
      </ion-toolbar>
    </ion-header> 
    <ion-content class = "ion-padding">
        <ion-button class="stackButton" shape="round">SKIP TUTORIAL</ion-button>
        <MapTutorial/>
        <ion-button class="stackButton" @click="skipTutorial" shape="round">SKIP TUTORIAL</ion-button>
    </ion-content>
  </div>
</template>

<script>
  import SideBarNav from "../components/sidebar/SideBarNav"
  import MapTutorial from "../components/tutorial/MapTutorial"
  export default {
    name: 'Tutorial',
    components: {SideBarNav, MapTutorial},
    data(){
      return{ my_points:0, my_ranking:0}
    },
    methods:{
        skipTutorial(){
          console.log("Clicked skip tutorial");
          this.$userData.isNew = false;
          this.$router.push('/mytiles'); 
        }
    }
  }
</script>

<style scoped>

</style>