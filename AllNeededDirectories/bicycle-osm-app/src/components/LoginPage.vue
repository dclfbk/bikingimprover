<template>
        <!---->
    <div class="home">
        <h1 style="text-align:center" v-if="!$auth.isAuthenticated" v-translate>authNeededMsg</h1>
        <h1 style="text-align:center" v-if="$auth.isAuthenticated" v-trasnlate>Login Già Effettuato, Buon Divertimento!<!--You're already logged in, have fun mapping!--></h1>
        <br>
        <!-- Check that the SDK client is not currently loading before accessing is methods -->
        <div class="divCentrale" v-if="!$auth.loading">
            <!-- show login when not authenticated -->
            <ion-button class="round_button" shape="round" v-if="!$auth.isAuthenticated" @click="login">Log in</ion-button>
        </div>
  </div>
</template>

<script>
//import alertController from '@ionic/vue';
import UserData from "../utils/UserData.js";
import Vue from 'vue'
export default{
    name: "LoginPage",

    mounted:function(){
        console.log(this.$userData);
        console.log(this.$api_url);
        console.log(this.$auth.isAuthenticated);
        if(this.$auth.isAuthenticated && (this.$userData==null||this.$userData==undefined)){
            console.log("CREO LO USER SU LOGIN PAGE");
            Vue.prototype.$userData = new UserData();
            this.$userData.createUser(this.$auth.user.myUserIDsignUpName, this.$api_url);
        }
    },

    updated(){
        if(this.$auth.isAuthenticated && (this.$userData==null||this.$userData==undefined) && this.$auth.user.nickname!=undefined){
            //console.log("UPDATING..." + this.$auth.user.nickname);
            Vue.prototype.$userData = new UserData();
            this.$userData.createUser(this.$auth.user.myUserIDsignUpName, this.$api_url);
        }
    },
    /* eslint-disable */
    methods:{
        login() {
            this.$auth.loginWithRedirect();
        },
        // Log the user out
        logout() {
            this.$auth.logout({
            returnTo: window.location.origin
            });
        }, 
    },
}
</script>
<style scoped lang="scss">
home{
    text-align:center;
    justify-content: center;
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

.divCentrale{
  text-align:center;
  bottom:10px;

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
