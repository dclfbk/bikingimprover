<template>
  <div>
    <md-dialog-alert
      :md-active.sync="second"
      :md-close-on-esc="false"
      :md-click-outside-to-close="false"
      :md-title="this.title"
      md-confirm-text="Close"
      @md-confirm="onConfirm"
      @close="onConfirm"
      type=button
      :md-content="this.text"
      />
      <!--<span>Testo: {{this.text}}</span>-->

    <!--<md-button class="md-primary md-raised" @click="second = true">Alert</md-button>-->
     <!--md-dialog-comfirm-->
  </div>
</template>

<script>
  export default {
    name: 'TutorialPopup',
    data: () => ({
      second: false,
      text:"",
      title: "TutorialPopup",
    }),
    mounted(){
        //console.log("THIS IS MY TEXT:" + this.text);
    },
    methods:{
        onConfirm(){
            console.log("Clicked on agree")
        },
        onSubmit(){
          console.log("WORKING?");
        }
    }
  }
</script>
<style scoped>
.md-dialog-container{
    background-color:white;
    color:black;
}
</style>