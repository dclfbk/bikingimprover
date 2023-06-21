<template>
  <div id="app">   
    <ion-app>
      <!--<ion-header>
        <ion-toolbar>
          <div class="titleTab" style="z-index=1">
                <SideBarNav/>
                <h3 style="margin-top: 16px;">Profile</h3>
          </div>
        </ion-toolbar>
      </ion-header> -->
      <ion-vue-router/>
    </ion-app>
  </div>
</template>

<script type="text/javascript">
  //import BottomNav from './components/BottomNav.vue'
  //import SideBarNav from "./components/sidebar/SideBarNav";
  import {getTheme} from "./utils/GlobalFunctions.js"
  import {getLanguage} from "./utils/GlobalFunctions.js"
  import Vue from 'vue'
  
  export default{
    components:{
      //SideBarNav,
        //BottomNav// register component
    },

    created(){
      SocketioService.setupSocketConnection();
      SocketioService.socket.on('validated', (data) => {
        // Handle the 'validated' event here
        const validatedValue = data.value;
        console.log(this.$auth.user.myUserIDsignUpName)
        console.log(`'validated' event with value: ${validatedValue}`);
        // Perform the desired action for the validated event on the client side
      });
    },

    mounted(){
      console.log("main component has been mounted.....");
      console.log(Vue.version);
      //this.checkAppTheme();
      getTheme();
      //getLanguage();
      Vue.config.language = getLanguage();
    },
    methods:{
    }
  }

</script>

<style lang="scss">
.ion-page{
   background-color: var(--white);
   background-image: url("./assets/images/croppedyellow-modified.png");
   background-size: 70%;
   background-position: right bottom;
   background-repeat: no-repeat;

   /*
   If you want to add animation to the ion page then you could do it like that
   transition: 1s all ease-in-out;
   opacity:0;
   animation: fadeIn 1s 1;
   --x: -400px;
   animation-fill-mode: forwards;
   */
  
}

ion-content{
    --background:none;
}

h3{
  color:var(--black);
}
</style>

