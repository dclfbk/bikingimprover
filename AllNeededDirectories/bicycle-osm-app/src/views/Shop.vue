<template>
  <div class= "ion-page">
    <ion-header>
      <ion-toolbar>
        <!--<ion-title>Profile</ion-title>-->
        <div class="titleTab">
              <SideBarNav ref="my_menu"/>
              <h3 style="margin-top: 16px;">Shop</h3>
              <div style=" float:right; margin-top:20px; margin-left: auto; margin-right: 25px;">
                <p style="margin:0"><translate>moneyMsg</translate>: {{my_money}}<!--Your Points: {{my_points}}--></p>
              </div>
        </div>
      </ion-toolbar>
    </ion-header> 
    <br>
    <ion-content @click=clickedPage()>
      <!--<div>
        <h2 class="my_subTitle"> Pins </h2>
        <div class = "cards" v-if="this.list_of_pins">
            <ul class = "card-list">
              <li style="padding-right:10px" v-for="(value,index) in this.list_of_pins" v-bind:key="'s'+index" @click="clickShopCard(index)" class='list-card'>
                <ShopCard :image="'images/' + list_of_pins[index].IMAGE" :price="list_of_pins[index].PRICE" :type="'pinType'" ref="shopCard"/>
              </li>
            </ul>
        </div>
      </div>
      <hr style="border-top:1px solid var(--secondaryColor)">
      <div>
        <h2 class="my_subTitle"><translate>powerUps</translate></h2>
        <div class = "cards" v-if="this.list_of_power_ups">
            <ul class = "card-list">
              <li style="padding-right:10px" v-for="(value,index) in this.list_of_power_ups" v-bind:key="'s'+index" @click="clickShopCard(index+list_of_pins.length)" class='list-card'>
                <ShopCard :image="'images/'+list_of_power_ups[index].IMAGE" :price="list_of_power_ups[index].PRICE" 
                :type="'powerType'" :description="list_of_power_ups[index].DESCRIPTION" ref="shopCard"/>
              </li>
            </ul>
        </div>
      </div>-->
      <!-- se voglio fare di tutta la pagina aggiungo style="height:100%" alle ion slides e div-->
      <div style="height:90%">
      <ion-slides ref="slides" pager="true" :options="slideOpts" style="height:100%">
        <ion-slide>
          <div style="display:inline-block; top:0; position:absolute">
              <h2 class="my_subTitle"> Pins </h2>
              <div style="display:flex"> 
                <a>
                  <md-icon style="padding-left:25px; top:0; bottom:0; position:absolute; color:#e0e0e0">chevron_left</md-icon>
                </a>
                <div class = "cards" v-if="this.list_of_pins" style="display:flex">
                  <ul class = "card-list">
                    <li style="padding-right:10px" v-for="(value,index) in this.list_of_pins" v-bind:key="'s'+index" @click="clickShopCard(index)" class='list-card'>
                      <ShopCard :image="'images/' + list_of_pins[index].IMAGE" :price="list_of_pins[index].PRICE" :type="'pinType'" ref="shopCard"/>
                    </li>
                  </ul>
                </div>
                <a href="#" @click="changeSlide(1)">
                  <md-icon style="padding-right:25px; top:0; bottom:0; right:0; position:absolute;">chevron_right</md-icon>
                </a>
              </div>
          </div>
        </ion-slide>
        <ion-slide>
          <div style="display:inline-block; top:0; position:absolute">
            <h2 class="my_subTitle"><translate>powerUps</translate></h2>
            <div style="display:flex"> 
              <a href="#" @click="changeSlide(0)">
                  <md-icon style="padding-left:25px; top:0; bottom:0; position:absolute;">chevron_left</md-icon>
              </a>
              <div class = "cards" v-if="this.list_of_power_ups">
                  <ul class = "card-list">
                    <li style="padding-right:10px" v-for="(value,index) in this.list_of_power_ups" v-bind:key="'s'+index" @click="clickShopCard(index+list_of_pins.length)" class='list-card'>
                      <ShopCard :image="'images/'+list_of_power_ups[index].IMAGE" :price="list_of_power_ups[index].PRICE" 
                      :type="'powerType'" :description="list_of_power_ups[index].DESCRIPTION" ref="shopCard"/>
                    </li>
                  </ul>
              </div>
              <a href="#">
                  <md-icon style="padding-right:25px; top:0; bottom:0; right:0; position:absolute; color:#e0e0e0">chevron_right</md-icon>
              </a>
            </div>
          </div>
        </ion-slide>
      </ion-slides>
    </div>

        <!--<h2 style="color:var(--black)"> Themes </h2>-->
        
        
        <!--<ion-button class="stackButton" @click="buySelected(selected)" shape="round"><translate>buyMsg</translate></ion-button>-->
    </ion-content>
    <ion-button class="stackButton" @click="buySelected(selected)" shape="round"><translate>buyMsg</translate></ion-button>
    
    <TutorialPopup ref="popup"/>
  </div>
</template>

<script>
import SideBarNav from '../components/sidebar/SideBarNav.vue'
import ShopCard from '../components/ShopCard.vue'
import TutorialPopup from '../components/popups/TutorialPopup.vue'
import UserData from "../utils/UserData.js";
import { IonSlides, IonSlide } from '@ionic/vue';
import Vue from 'vue'

export default{
    name: "Shop",
    components: {SideBarNav, ShopCard, TutorialPopup,IonSlides, IonSlide},
    data(){
      return{
        list_of_power_ups: null, //lista dei nomi dei power up
        list_of_pins: null,
        price:null,
        my_money:0, //soldi posseduti dallo user
        selected:null //elemento selezionato nello shop
      }
    },

    async beforeMount(){
      var pins = await this.getAllPins(function(){
      })
      var powerUps = await this.getAllPowerUps(function(){
      })
      console.log(pins);
      console.log(powerUps);
      this.list_of_pins = pins;
      this.list_of_power_ups = powerUps;
      this.list_of_power_ups.sort(function(a,b){
        return parseFloat(a.PRICE) - parseFloat(b.PRICE);
      })
      this.list_of_pins.sort(function(a,b){
        return parseFloat(a.PRICE) - parseFloat(b.PRICE);
      })
    },

    async mounted(){
       if(this.$userData==null||this.$userData==undefined){
          Vue.prototype.$userData = new UserData();
          await(this.$userData.createUser(this.$auth.user.myUserIDsignUpName, this.$api_url,await this.$auth.getTokenApi())).then(items=>{
            this.my_money = this.$userData.gold;
            console.log(items)
          });
      }else{
        this.my_money = this.$userData.gold;
      }
      if(this.list_of_pins==null){
        //soluzione provvisoria....
        var pins = await this.getAllPins(function(){
        })
        var powerUps = await this.getAllPowerUps(function(){
        })
        console.log(pins);
        console.log(powerUps);
        this.list_of_pins = pins;
        this.list_of_power_ups = powerUps;
        this.list_of_power_ups.sort(function(a,b){
          return parseFloat(a.PRICE) - parseFloat(b.PRICE);
        })
        this.list_of_pins.sort(function(a,b){
          return parseFloat(a.PRICE) - parseFloat(b.PRICE);
        })
      }
      //animation Cards...
        console.log("STARTING ANIMATION PART");
        var card_items = document.getElementsByClassName("list-card");
        for (let i = 0; i < card_items.length; ++i) {
          fadeIn(card_items[i], i * 300)
        }
        function fadeIn (item, delay) {
          setTimeout(() => {
            item.classList.add('fadein')
          }, delay)
      }


    },
    methods:{
      changeSlide(index){
        console.log(index);
        this.$refs.slides.slideTo(index,1000);
      },

      clickShopCard(index){
        var allCards = document.getElementsByClassName("card");
        for(var i=0; i<allCards.length; i++){
            allCards[i].style.boxShadow = "0px 0px 0px 0px rgba(0,0,0,0)"
            allCards[i].style.border= "none";
        }
        allCards[index].style.boxShadow = "0px 0px 30px var(--primaryColor)";
        allCards[index].style.border= "1px solid var(--primaryColor)";
        this.selected = index
      },

      resetShopCards(){
        var allCards = document.getElementsByClassName("card");
        for(var i=0; i<allCards.length; i++){
            allCards[i].style.boxShadow = "0px 0px 0px 0px rgba(0,0,0,0)"
            allCards[i].style.border= "none";
        }
      },

      async buySelected(sel){
        console.log(sel);
        var price;
        var user = this.$auth.user.myUserIDsignUpName
        if(sel<this.list_of_pins.length){
          //the user is buying a pin
          //var imageName = 'images/' + this.list_of_pins[sel].IMAGE To remove the comment once you'll have good images
          var imageName = "images/placeholder.png"
          price = this.$refs.shopCard[sel].price
          var intPrice = parseInt(price);
          //call the game engine and insert the image into the userData. Remove as much gold as the price of the element
          if(price<=this.$userData.gold){
            this.$refs.popup.title = this.$gettext("thanksMsg")
            this.$refs.popup.text = this.$gettext("boughtMsg")
            this.second=true
            this.$refs.popup.second=true
            await this.buyItemEngine(this.$auth.user.myUserIDsignUpName,price,imageName).then(async items=>{
              //update user
              console.log(items)
              this.$userData.my_images.push(imageName)
              this.$userData.gold = this.$userData.gold - price;
              //showPopup saying ok you bought element,
              this.my_money = parseInt(this.my_money)-intPrice;
              this.resetShopCards()
            });
          }else{
            //showPopup saying you don't have money
            this.createPopup(this.$gettext("lackMoneyTitleMsg"), this.$gettext("lackMoneyMsg"));
          }
        }else{
          console.log("you're buying power ups...")
          var powerIndex = sel-this.list_of_pins.length;
          var element = this.list_of_power_ups[powerIndex];
          price = element.PRICE;
          var now = new Date();
          var powerUpBought = {"POWERNAME": element.POWERNAME, "TIME":now, "LIFETIME":"1"}
          if(price<=this.$userData.gold){
            await this.buyPowerUp(user,price,element.POWERNAME).then(async items=>{
              console.log("ok");
              console.log(items);
              if(items.status==200){
                //comprato
                await this.buyPowerUpEngine(user,price).then(items=>{
                  console.log(items);
                  console.log(this.$userData);
                  this.$userData.gold = this.$userData.gold - price;
                  this.my_money = parseInt(this.my_money)- parseInt(price);
                  this.createPopup("Thanks","You bought the power up");
                  this.$userData.powerUps.push(powerUpBought);
                  this.resetShopCards()
                })
                console.log("BOUGHT")
              }else if(items.status==201){
                //can't buy you already have it....
                console.log("alreadyHave")
                this.createPopup(this.$gettext("alreadyHaveTitleMsg"), this.$gettext("alreadyHaveMsg"));
              }else{
                console.log("error")
              }
            })
          }else{
            this.createPopup(this.$gettext("lackMoneyTitleMsg"), this.$gettext("lackMoneyMsg"));
          }
        }
      },

      createPopup(title,text){
        this.$refs.popup.title = title;
        this.$refs.popup.text = text;
        this.$refs.popup.second=true;
      },

      async getAllPins(_callback){
        try{
          var my_url = this.$api_url + "/manageShop/getPins"
          const requestSpatialite = {
            method:"get",
            headers:{ "Content-Type":"application/json"},
          };
          const fetchdata = await fetch(my_url,requestSpatialite)
            .then(response => response.json())
            .then((new_response_data)=>{
              return new_response_data;
            }).catch((err)=>console.log(err)) 
            _callback();
            return fetchdata
        }catch(e){
          alert("Error init");
        }
      },

      async getAllPowerUps(_callback){
        try{
          var my_url = this.$api_url + "/manageShop/getPowerUps"
          console.log(my_url)
          const requestSpatialite = {
            method:"get",
            headers:{ "Content-Type":"application/json"},
          };
          const fetchdata = await fetch(my_url,requestSpatialite)
            .then(response => response.json())
            .then((new_response_data)=>{
              return new_response_data;
            }).catch((err)=>console.log(err)) 
            _callback();
            return fetchdata
        }catch(e){
          alert("Error init");
        }
      },

      async buyPowerUpEngine(userName, price){
        console.log("POWER UP FUNCTION FOR BUYING...");
        console.log(userName);
        //console.log(price);
        var my_body = {
          "userName": userName,
          "price": price
        }
        try{
          const my_url = this.$api_url + "/managePowerUps/buyPowerEngine"
          const jwtToken = await this.$auth.getTokenApi();
          const requestSpatialite = {
            method: "post",
            headers:{"Content-Type":"application/json", 'pw_token':jwtToken.access_token},
            body:JSON.stringify(my_body),
          }
          const fetchdata = await fetch(my_url, requestSpatialite)
            .then(response => response)
            .then((new_response_data)=>{
              return new_response_data;
            }).catch((err)=>console.log(err))
            return fetchdata
        }catch(e){
          alert("Error......");
        }
      },

      async buyPowerUp(userName,price,elementName){
        console.log(userName);
        console.log(price);
        console.log(elementName);
        var my_body = {
          "userName": userName,
          "time": new Date(),
          "powerUpName":elementName
        }
        try{
          const my_url = this.$api_url + "/managePowerUps/addFieldTable"
          const jwtToken = await this.$auth.getTokenApi();
          const requestSpatialite = {
            method: "post",
            headers:{"Content-Type":"application/json", 'pw_token':jwtToken.access_token},
            body:JSON.stringify(my_body),
          }
          const fetchdata = await fetch(my_url, requestSpatialite)
            .then(response => response)
            .then((new_response_data)=>{
              return new_response_data;
            }).catch((err)=>console.log(err))
            return fetchdata
        }catch(e){
          alert("Error......");
        }
      },

      async buyItemEngine(nickname,price,image){
      var my_price = price.toString();
      var my_body = {
        "playerId" : nickname,
        "money" : my_price,
        "imageName" : image
      }
      try{
        const my_url = this.$api_url + "/manageImages/buyImage"
        const requestSpatialite = {
          method:"post",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify(my_body),
        };
        const fetchdata = await fetch(my_url, requestSpatialite)
          .then(response => response.json())
          .then((new_response_data)=>{
            return new_response_data;
          }).catch((err)=>console.log(err))
          return fetchdata
      }catch(e){
        alert("Error......");
      }
    },

    clickedPage(){
      if(this.$refs.my_menu.toggleCard==true){
        this.$refs.my_menu.toggle();
      }
    }

  },
}
</script>

<style scoped>
h2{
  justify-content:center;
  text-align:center;
}

.my_subTitle{
  color:var(--black);
  transition: 0.5s all ease-in-out;
  opacity:0;
  animation: changeScale 0.4s 1;
  animation-fill-mode: forwards;
}

ion-slides{
  --bullet-background: black;
  --bullet-background-active: var(--secondaryColor);
}
</style>