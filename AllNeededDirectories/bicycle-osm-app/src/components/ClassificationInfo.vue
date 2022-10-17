<template>
  <div>
    <ol>
      <li v-for="(value,index) in this.players" v-bind:key="'P'+index">
        <PlayerField class="player_field" :item="players[index]" :index="index"/>
      </li>
    </ol>
  </div>
</template>
<script>
import PlayerField from './playersClassification/PlayerField.vue'

export default {
  name: "ClassificationInfo",
  components:{
      PlayerField,
  },
  data(){
      return{ players:[]}
  },
  mounted: async function(){
      //Call game engine for classification
      await this.getPlayerClassification().then(async items=>{
          var my_content = items.content;
          //Sort the array. From the player with the highest points to the lowest.
          my_content.sort(function(a,b){
              return parseFloat(b.state.PointConcept[1].score) - parseFloat(a.state.PointConcept[1].score);
          })
          this.players = items.content;
          //console.log(items);
          //console.log(this.players[0].playerId);
          /*for(var i=0; i<my_content.length;i++){
              console.log(my_content[i].state.PointConcept[1].score);
          }*/
      });
      
      //Add Animations
      var items = document.getElementsByClassName("player_field");
      for (let i = 0; i < items.length; ++i) {
        if(i%2==0){
            items[i].style.setProperty('--x',"100px")
        }else{
            items[i].style.setProperty('--x',"-100px")
        }
        fadeIn(items[i], i * 150)
      }
      function fadeIn (item, delay) {
        setTimeout(() => {
          item.classList.add('fadein')
        }, delay)
      }
  },

  methods:{
      async getPlayerClassification(){
        //call api and get response;
        try{
            const my_url = this.$api_url + "/posts/user/getUserClassification"
            const requestToGamification = {
                method:"get",
                headers:{ "Content-Type":"application/json"},
            };
            const fetchdata = await fetch(my_url,requestToGamification)
            .then(response => response.json())
            .then((new_response_data)=>{
                return new_response_data;
            }).catch((err)=>console.log(err)) 
            return fetchdata
        }catch(e){
            alert("Error init");
        }
      }
  },
}
</script>
<style>

ol {
    counter-reset:li; /* Initiate a counter */
    margin-left:0; /* Remove the default left margin */
    padding-left:0; /* Remove the default left padding */
}
ol > li {
    position:relative; /* Create a positioning context */
    margin:0 0 6px 2em; /* Give each list item a left margin to make room for the numbers */
    padding:4px 8px; /* Add some spacing around the content */
    list-style:none; /* Disable the normal item numbering */
}
ol > li:before {
    border-radius:20px;
    content:counter(li); /* Use the counter as content */
    counter-increment:li; /* Increment the counter by 1 */
    /* Position and style the number */
    position:absolute;
    top:10px;
    left:-1em;
    -moz-box-sizing:border-box;
    -webkit-box-sizing:border-box;
    box-sizing:border-box;
    width:2em;
    /* Some space between the number and the content in browsers that support
       generated content but not positioning it (Camino 2 is one example) */
    margin-right:8px;
    padding:4px;
    color:black;
    background:white;
    font-weight:bold;
    font-family:"Helvetica Neue", Arial, sans-serif;
    text-align:center;
}
li ol,
li ul {margin-top:6px;}
ol ol li:last-child {margin-bottom:0;}
</style>

