<template>
  <div>
      <h1><translate>noMedalUserMsg</translate></h1>
      <!--<ion-button class="back_button" @click="goToProfile()">Go Back</ion-button>-->
  </div>
</template>
<script>


export default {
  name: "NoMedalsInfo",
  data(){
      return{}
  },
  mounted: async function(){
  },

  methods:{
      goToProfile(){
            console.log("Clicked go to medal");
            this.$router.push('/profile'); 
      },
  },
}
</script>
<style scoped>

.back_button{
    --border-radius: 15px;
    --color: var(--black);
    --background: var(--white);
    width:200px;
}
</style>