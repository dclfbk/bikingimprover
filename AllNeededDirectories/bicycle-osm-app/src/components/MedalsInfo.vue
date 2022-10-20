<template>
  <div @click="showInfo"  style="background-color:var(--white)">
      <!--<h1>Medals</h1>-->
    <div style="display:inline;">
      <md-icon v-on:click="showInfo" style="float:left; padding-left:15px; padding-top:15px" :style="'color:var(--'+this.medalColor+')'">workspace_premium</md-icon>
      <p style="float:left; margin-left:20px; ">{{medalName}}</p>
    </div>
    <hr>
    <TutorialPopup :text="this.popup_text" ref="generalPopupTutorial"/>
  </div>
</template>
<script>
import TutorialPopup from './popups/TutorialPopup.vue'

export default {
  name: "MedalsInfo",
  components:{
      TutorialPopup
  },
  props: {
    medalsList:{
      type:Array,
    },
    medalName:{
      type:String,
      required:true
    },
    medalColor:{
      type:String
    },
    medalDescription:{
      type:String
    }
  },

  data(){
    return{
      image_source: null,
      popup_text: null,
    }
  },

  mounted: async function(){
    //console.log(this.medalName);
    /*switch(this.medalName){
      case "first steps": this.image_source = require("@/assets/images/first_steps.png"); break;
      case "validator badge": this.image_source = require("@/assets/images/validator_badge.png"); break;
      case "expert badge": this.image_source = require("@/assets/images/expert_badge.png");break;
      case "professional badge": this.images_source = require("@/assets/images/professional_badge.png"); break;
      default: this.image_source = require("@/assets/images/first_steps.png"); break;
    }*/
  },

  methods:{
    showInfo(){
      console.log(this.medalColor);
      console.log(this.medalName);
      console.log(this.medalDescription);
      var pop = this.$refs.generalPopupTutorial
      /*var medal_text = this.$gettext("medalName") + "\"" + this.medalName + "\"" + this.$gettext("obtainedMsg") + " ";
      var medal_title = this.medalName;
      medal_title = medal_title.charAt(0).toUpperCase() + medal_title.slice(1);
      pop.title = medal_title;
      //console.log("ok" + this.medalName);
      switch(this.medalName){
        case("wrong answer"): pop.text= medal_text + this.$gettext("wrongAnswer");  pop.second = true; break; //Apri popup che spiega cosa rappresenta la data medaglia
        case("validator badge"): pop.text= medal_text + this.$gettext("validatorBadge");  pop.second = true;break;
        case("first steps"): pop.text= medal_text + this.$gettext("firstSteps"); pop.second=true; break;
        case("professional cyclist"): pop.text=medal_text + this.$gettext("professionalCyclist"); pop.second=true; break;
        case("cyclist"): pop.text= medal_text + this.$gettext("cyclist"); pop.second=true; break;
        case("expert validator"): pop.text= medal_text + this.$gettext("expertValidator"); pop.second=true; break;
        case("professional badge"): pop.text= medal_text + this.$gettext("professionalBadge"); pop.second=true; break;
        case("expert badge"): pop.text= medal_text + this.$gettext("expertBadge"); pop.second=true; break;
        case("beginner badge"): pop.text= medal_text + this.$gettext("beginnerBadge"); pop.second=true; break;
        case("they trust you"): pop.text= medal_text + this.$gettext("trustBadge"); pop.second=true; break;
        default: break;
      }*/
      var medal_title = this.medalName;
      medal_title = medal_title.charAt(0).toUpperCase() + medal_title.slice(1);
      pop.title = medal_title;
      pop.text = this.$gettext(this.medalName);
      pop.second=true;
    }
  },
}
</script>
<style scoped>
hr {
  border: 0;
  clear:both;
  display:block;
  width: 80%;               
  background-color:var(--black);
  height: 1px;
}
</style>