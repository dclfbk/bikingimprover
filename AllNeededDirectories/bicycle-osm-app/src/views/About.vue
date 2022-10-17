<template>
  <div class= "ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>Profile</ion-title>-->
        <div class="titleTab">
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;">About</h3>
        </div>
      </ion-toolbar>
    </ion-header> 
    <br>
    <ion-content class = "ion-text-center" justify-content-center @click=clickedPage()>
        <div style="width:80%; justify-content: center; display:inline-flex">
        <p>
          <translate>
            aboutMsg 
          </translate>
        </p>
        </div>
        <br>
        <br>
        <h1><translate>contact</translate></h1>
        <br>
        <form id="contact_form">
          <label for="name" class="labelForm">Full Name:</label><br> <!-- v-model="fname"-->
          <input type="text" id="name" name="name" class="inputFormText" v-model="name"><br><br>
          <label for="email" class="labelForm">Your Email Address:</label><br>
          <input type="text" id="email" name="email" class="inputFormText"  v-model="email"><br><br>
          <label for="subject" class="labelForm">Subject:</label><br>
          <input type="text" id="subject" name="subject" class="inputFormText" v-model="subject"><br><br>
          <!--<label for="message" class="labelForm">Message:</label><br>
          <input type="text" id="message" name="message" class="inputFormText" v-model="message"><br><br>-->
          <label for="message" class="labelForm">Message:</label><br>
          <textarea id="message" class = "messageArea" name="message" cols="20" rows="1"></textarea>
        </form>
        <br>
        <ion-grid>
          <ion-row justify-content-center>
            <ion-button v-on:click="onSubmit" class="submitButton">Submit</ion-button>
          </ion-row> 
        </ion-grid>
        <TutorialPopup ref="popup"/>
    </ion-content>
    <!--<BottomNav/>-->
  </div>
</template>

<script>
//import BottomNav from "../components/BottomNav";
import SideBarNav from "../components/sidebar/SideBarNav";
import TutorialPopup from "../components/popups/TutorialPopup";
import emailjs from 'emailjs-com';

export default{
    name: "About",
    components: {SideBarNav, TutorialPopup},
    data(){
      return{
        name:"",
        email:"",
        subject:"",
        message:"",
      }
    },
    mounted(){
      var items = document.getElementsByClassName("labelForm");
      for (let i = 0; i < items.length; ++i) {
        console.log(i);
        if(i%2==0){
            items[i].style.setProperty('--x',"100px")
        }else{
            items[i].style.setProperty('--x',"-100px")
        }
        fadeIn(items[i], i * 300)
      }
      function fadeIn (item, delay) {
        setTimeout(() => {
          item.classList.add('fadein')
        }, delay)
      }    
    },

    methods:{
      onSubmit(){
        console.log("clicked submit");
        var name;
        var email;
        var subject;
        var message;
        name = document.getElementById("name");
        email = document.getElementById("email");
        message = document.getElementById("message");
        subject  = document.getElementById("subject");
        //console.log("name: " + name.value + " email: " + email.value + " subject: " + subject.value + " message " + message.value);
        if(name.value == "" || name.value==null || name.value==undefined ||
          email.value == "" || email.value==null || email.value==undefined ||
          message.value == "" || message.value==null || message.value==undefined ||
          subject.value == "" || subject.value==null || subject.value==undefined){
              this.createPopup(this.$gettext("messageTitleErrorMsg"), this.$gettext("completeFieldMsg"));
              console.log("all fields must be completed");
        }else{
          emailjs.init(process.env.VUE_APP_EMAIL_JS_USER_ID);
          // SEND MESSAGE TO EMAIL
          try{
            emailjs.sendForm(process.env.VUE_APP_EMAIL_JS_SERVICE_ID,process.env.VUE_APP_EMAIL_JS_TEMPLATE_ID, document.getElementById("contact_form"),process.env.VUE_APP_EMAIL_JS_USER_ID,{
              subject: subject.value,
              message: message.value,
              name: name.value,
              email: email.value,
            })
            this.createPopup(this.$gettext("messageSentTitleMsg"),this.$gettext("messageSentMsg"));
          }catch(error){
            console.log(error)
            this.createPopup(this.$gettext("messageTitleErrorMsg"),this.$gettext("messageErrorMsg"));
          }
          document.getElementById("contact_form").reset();
        }
      },

      createPopup(title,text){
        this.$refs.popup.title = title;
        this.$refs.popup.text = text;
        this.$refs.popup.second=true;
      },

      clickedPage(){
        console.log("you clicked the page");
        if(this.$refs.my_menu.toggleCard==true){
          this.$refs.my_menu.toggle();
        }
      }
    },
}
</script>

<style>
.messageArea{
    height:50px;
    background-color: transparent;/*white;*/
    border: 0px solid;
    border-bottom: 3px solid var(--primaryColor);
    color: var(--black)
  }

.messageArea:focus{
    border: 4px solid var(--secondaryColor);
    background-color: white;
    color: black;
}

.inputFormText{
    background-color: transparent;
    border: 0px solid;
    border-bottom: 3px solid var(--primaryColor);
    color: var(--black)
}
  
.inputFormText:active{
    border: none;
    outline:none;
    border-bottom: 3px solid var(--secondaryColor);
}
  
.inputFormText:focus{
    border:none;
    outline:none;
    border-bottom: 3px solid var(--secondaryColor);
}
  
.labelForm{
    color: var(--secondaryColor);
    font-weight: bold;
    /*-webkit-text-stroke: 1px white;*/
    background-color: var(--white);
    transition: 0.6s all ease-in-out;
    opacity:0;
}
  
.submitButton{
    --border-radius: 15px;
    --color: var(--black);
    --background: var(--white);
    /*outline: 1px solid black;*/
    border:2px solid var(--secondaryColor);
    border-radius: 15px;
    width:150px;
    font-weight: bold;
}
</style>