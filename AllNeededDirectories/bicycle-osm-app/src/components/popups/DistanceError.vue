<template>
  <div>
    <md-dialog-alert
      :md-active.sync="second"
      :md-close-on-esc="false"
      :md-click-outside-to-close="false"
      md-title="Distance"
      md-confirm-text="Close"
      @md-confirm="onConfirm"
      :md-content="popText" />
  </div>
</template>

<script>
  export default {
    name: 'DistanceError',
    data: () => ({
      second: false,
      popText: ""
    }),
    mounted(){
      this.popText = this.$gettext("distanceMsg");
      console.log(this.popText)
    },
    methods:{
        onConfirm(){
            console.log("Clicked on agree")
            console.log(this.popText)
        }
    },
    computed:{
      mdContent:{
        get: function(){
          return this.popText;
        }
      }
    }
  }
</script>
<style>
.md-dialog-container{
    background-color:var(--white);
}
</style>