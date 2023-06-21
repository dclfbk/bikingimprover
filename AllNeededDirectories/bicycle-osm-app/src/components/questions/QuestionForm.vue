<template>
  <div>
    <!--<form id="answerform">
        <label for="fname">{{item}}</label><br>
        <input type="text" v-model="answer"><br>
    </form>-->
    <!-- -->
    <form>
      <label for="fname" style="color:var(--black)">{{question_to_show}}</label><br>
      <div class="select-style2" style="overflow-y:scroll"> 
        <select size="1"  autocomplete="off" id="p_answers" name="answerlist" v-model="answer" @change=select() style="color:var(--black); background-color:var(--white)">
          <option v-for="(value,index) in this.possible_answers" v-bind:key="'P'+index" style="height:8px" :value="start_answer[index]">{{possible_answers[index]}}</option>
          <!--v-bind:id="'PID'+index"-->
          <option>cancel</option>
        </select>
      </div>
      <br>
      <br>
    </form>
    <!-- -->
  </div>
</template>
<script>
import {translate} from 'vue-gettext';
export default{
    name: "QuestionForm",
    props: ['item','id','type','score','possibilities','question_to_show', 'tagAnswer'],
    data(){
        return{
            answer:"", //The answer given by the user
            possible_answers:[], //The possible answers from which the user can choose from
            start_answer:[] //The posssible answers that are written in the database.
        }
    },
    mounted(){
      console.log("mounting question form.......");
      var my_array = [];
      switch(this.possibilities){
        case "number": for(let i=0;i<101;i++){my_array.push(i)} break;
        case "open" : this.openquest = true; break;
        default: my_array = this.possibilities.split(","); break;
      }
      //my_array = this.possibilities.split(",");
      console.log(my_array);
      this.possible_answers = my_array;
      this.answer="";
    },
    methods:{
      select(){
        console.log(this.answer);
        if(this.answer=="cancel"){
          this.answer="";
        }
      },

      updateAnswers(){
        var my_array = [];
        var str = "";
        var number = false;
        const {gettext: $gettext} = translate;
        switch(this.possibilities){
          case "number": number=true; for(let i=0;i<101;i++){my_array.push(i)} break;
          case "open" : this.openquest = true; break;
          default: my_array = this.possibilities.split(","); break;
        }
        var array_to_show = my_array;
        this.start_answer = my_array;
        //console.log(str);
        //console.log(number);
        if(number==false){
          //open question, answers are not number
          array_to_show = [];
          console.log("Translating...");
          for(var i=0;i<my_array.length;i++){
            console.log(my_array[i])
            str = $gettext(my_array[i]);
            if(str==""||str==undefined||str==null){
              str=my_array[i]
            }
            array_to_show.push(str)
            console.log(str);
          }
        }

        this.possible_answers = array_to_show;
        this.answer="";
      }
    }
    /* eslint-disable */
}
</script>
<style scoped>
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