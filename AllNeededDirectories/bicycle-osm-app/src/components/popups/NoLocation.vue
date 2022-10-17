<template>
  <div>
    <md-dialog-alert
      :md-active.sync="second"
      :md-close-on-esc="false"
      :md-click-outside-to-close="false"
      md-title="Geolocation"
      md-confirm-text="Close"
      @md-confirm="onConfirm"
      :md-content="popText" />

    <!--<md-button class="md-primary md-raised" @click="second = true">Alert</md-button>-->
  </div>
</template>

<script>
  export default {
    name: 'NoLocation',
    data: () => ({
      second: false,
      popText: ""
    }),
    mounted(){
      this.popText = this.$gettext("geoPermissionMsg");
    },
    methods:{
        onConfirm(){
            console.log("Clicked on agree")
        }
    }
  }
</script>
<style>
.md-dialog-container{
    background-color:white;
}
</style>