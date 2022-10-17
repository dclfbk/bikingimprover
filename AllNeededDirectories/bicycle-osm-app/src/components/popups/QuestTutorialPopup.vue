<template>
  <div style="max-height: 300px; overflow-y: scroll; background-color:transparent;">
    <h1 class="my_title">{{title}}</h1>
    <ul>
      <li>
            <div>
                <form>
                    <label for="fname">è una strada percorribile in bicicletta?</label><br>
                    <div class="select-style2" style="overflow-y:scroll"> 
                        <select size="1"  autocomplete="off" id="p_answers" name="answerlist" @change=select()>
                        <option style="height:8px">si</option>
                        </select>
                        </div>
                    <br>
                    <br>
                </form>
            </div>
          </li>
    </ul>
    <ion-button v-on:click="onSubmit" class="my_button">Submit</ion-button>
  </div>
</template>
<script>
//import Vue from 'vue'

export default {
  name: 'QuestTutorialPopup',
  components:{
  },
  data(){
      return{
          title: "Strada"
      }
  },
  mounted: function(){
  },
  updated() {
    this.$nextTick(function () {
       /* 
      this.$refs.openquests.forEach(i=>{
        i.updateAnswers();
      });*/
    // Code that will run only after the
    // entire view has been re-rendered
    })
  },
  methods:{
    async onSubmit(e){
        console.log("CLICKING SUBMIT");
        console.log(e);
        
        this.$parent.userAnswered();
        var popup_prova = document.getElementsByClassName("maplibregl-popup");
        console.log(popup_prova)
        console.log(popup_prova[0].style)
        //this.$parent.my_items=null;
        popup_prova[0].style.display="none";
        this.$parent.showGeneral = true;
    },

  },

}
</script>

<style>
  .my_button{
    margin-left: auto;
    margin-right: 20px;
    float:right;
    --border-radius: 15px;
    --background: white;
    --color: $color1;
  }

  .my_title{
    display:flex;
    justify-content:center;
  }
  
  .select-style2 {
    border:1px solid #777;
    width: 160px;
    border-radius: 3px;
    overflow: hidden;
    /*overflow-y:scroll;*/
    float:left;
  }

  .select-style2 select {  
    font-size:15px;
    color:black;
    padding: 5px 8px 0px 5px;
    width: 130%;
    border: none;
    box-shadow: none;
    background: transparent;
    background-image: none;	  
  }

  .select-style2 select:focus {
    outline: none;  
  }
  .select-style2 select option {
    padding:3px;
  }
</style>

