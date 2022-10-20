<template>
  <div class="ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title class="ion-text-center">Welcome</ion-title>-->
            <!--<BottomNav/>-->
            <div class="titleTab">
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;" v-translate>welcomeMsg</h3>
            </div>
      </ion-toolbar>
    </ion-header>
    <ion-content class = "ion-padding">
      <LoginPage/>
    </ion-content>
    <ion-content style="bottom:50px" class = "ion-padding" v-if="$auth.isAuthenticated" @click=clickedPage()>
      <div class="divCentrale">
        <ion-button class="round_button" shape="round" @click="startMapping">Start</ion-button>
    </div>
    </ion-content>
    <!--<BottomNav/>-->
  </div>
</template>

<script>
  // @ is an alias to /src
  import LoginPage from "../components/LoginPage";
  //import BottomNav from "../components/BottomNav";
  import SideBarNav from "../components/sidebar/SideBarNav";

  export default {
    name: 'Home',
    components: { LoginPage,SideBarNav},
    beforeDestroy () {
      document.querySelector('body').setAttribute('style', '')
    },
    methods:{
      startMapping(){
        this.$router.push('/mytiles');
      },

      clickedPage(){
        console.log("you clicked the page");
        if(this.$refs.my_menu.toggleCard==true){
          this.$refs.my_menu.toggle();
        }
      }
    }
  }

</script>
<style scoped>
/*ion-content{
  bottom:50px;
}*/
h3{
  color:var(--black)
}
body{
  background:var(--white);
}

.divCentrale{
  text-align:center;
  bottom:10px;

}

.round_button{
  border-radius:50%;
  height:100px;
  width:100px;
  /*background-color: rgb(27, 218, 186);*/
  color:var(--white);
  --background: var(--secondaryColor);
  font-weight:bold;
  font-size:20px;
  /*border:solid rgb(27, 218, 186) 10px;*/
  animation: changesize 2s ease-in infinite;
}

@-webkit-keyframes changesize{
    0%{
        -webkit-transform: scale(1);
        -moz-transform: scale(1);
        -o-transform: scale(1);
        transform: scale(1);
    }
    50%{
        -webkit-transform: scale(1.2);
        -moz-transform: scale(1.2);
        -o-transform: scale(1.2);
        transform: scale(1.2);
    }
    100%{
        -webkit-transform: scale(1);
        -moz-transform: scale(1);
        -o-transform: scale(1);
        transform: scale(1);
    }
}
</style>