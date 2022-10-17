<template>
  <div>
    <!--<h1>{{item.playerId}}</h1>-->
    <ion-button v-if="my_user" :id="item.playerId" class="my_user_button" @click="goToUserInfo()">{{user_name}}</ion-button>
    <ion-button v-else :id="item.playerId" class="medal_button" @click="goToUserInfo()">{{user_name}}</ion-button>
  </div>
</template>
<script>

export default{
    name: "PlayerField",
    props: ['item','index'],
    data(){
        return{
            x:"",
            my_user:false,
            user_name:"",
        }
    },
    mounted:function(){
      var currentName = this.item.customData.newName;
      if(currentName == undefined || currentName == "undefined" || currentName == null){
        currentName = this.item.playerId;
      }
      this.user_name = currentName;
      if(this.$userData.userName == this.item.playerId){
        this.my_user = true;
      }else{
        this.my_user = false;
      }
    },
    methods:{
      goToUserInfo(){
        this.$router.push({name:"userclassification", params:{userName: this.item.playerId, current_name: this.user_name}}); 
      }
    }
    /* eslint-disable */
}
</script>

<style scoped lang="scss">

.medal_button{
    --border-radius: 15px;
    --color: var(--black);
    --background: var(--white);
    width:80%;
}

.my_user_button{
    --border-radius: 15px;
    --color: var(--white);
    --background: var(--secondaryColor);
    width:80%;
}
</style>