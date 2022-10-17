<template>
  <div>
    <md-dialog-alert
      :md-active.sync="second"
      md-title="Nuova Medaglia!"
      :md-content="medalName" />

    <!--<md-button class="md-primary md-raised" @click="second = true">Alert</md-button>-->
  </div>
</template>

<script>
  export default {
    name: 'NewMedal',
    /*data: () => ({
      second: false,
      medalName: "null",
    }),*/
    data(){
        return{
            second:false,
            medalName:"null",
        }
    },
  }
</script>
<style>
.md-dialog-container{
    background-color:white;
}
</style>