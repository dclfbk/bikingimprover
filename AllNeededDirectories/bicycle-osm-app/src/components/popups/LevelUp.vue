<template>
  <div>
    <md-dialog-alert
      :md-active.sync="second"
      md-title="Level Up!"
      :md-content="popText" />

    <!--<md-button class="md-primary md-raised" @click="second = true">Alert</md-button>-->
  </div>
</template>

<script>
  export default {
    name: 'LevelUp',
    data: () => ({
      second: false,
      popupText: ""
    }),
    mounted(){
      this.popText = this.$gettext("levelUpMsg");
      console.log(this.popText)
    }
  }
</script>
<style>
.md-dialog-container{
    background-color:white;
}
</style>