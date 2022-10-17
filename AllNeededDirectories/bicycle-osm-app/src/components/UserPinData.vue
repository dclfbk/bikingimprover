<template>
  <div style="max-height: 300px; overflow-y: scroll; background-color:transparent;">
    <!--<h1 class="my_title">{{title}}</h1>-->
    <img :src="require('@/assets/'+this.imageUrl)" style="transition: 0.5s all ease-in-out;opacity:0;animation: changeScale 0.4s 1;animation-fill-mode: forwards;display:block; margin:auto; text-align:center; height:80px; width:150">
    <p style="text-align:center">{{description}}</p>
    <p style="text-align:center">Placed By: {{userName}}</p>
  </div>
</template>
<script>

export default {
  name: 'UserPinData',
  props: ['title','description','userName','imageUrl'],
  components:{
  },
  data(){
      return{
      }
  },
  mounted: function(){

  },

  updated() {
    this.$nextTick(function () {
    // Code that will run only after the
    // entire view has been re-rendered
        console.log(this.title)
        console.log(this.imageUrl);
    })
  },

  methods:{
  }

}
</script>

<style>

</style>


