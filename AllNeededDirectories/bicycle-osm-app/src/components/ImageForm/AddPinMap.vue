<template>
    <div>
        <div class = "cards">
            <ul class = "card-list">
                <li v-for="(value,index) in this.user_pins" v-bind:key="'u'+index" @click="clickCard(index)" class='list-card' style="opacity:1">
                    <div class = "card">
                        <img :src="require('@/assets/'+user_pins[index]+'')" style = "width:100%; opacity:1">
                    </div>
                </li>
            </ul>
        </div>
        <br>
        <ion-button class="my_button" @click="insertDescription(selected)"><translate>inserisci</translate></ion-button>
        <InsertImageDescription ref="insertPopup"/>
        <TutorialPopup ref="lack"/>
    </div>
</template>
<script>
import InsertImageDescription from "../popups/InsertImageDescription.vue"
import TutorialPopup from "../popups/TutorialPopup.vue"

export default{
    name: "AddPinMap",
    components:{
        InsertImageDescription,
        TutorialPopup
    },
    data(){
        return{
            model:{
                imageFile: null,
                selected: null,
            }
        }
    },

    props:['user_pins','coordinates'],

    mounted: function(){
      /*console.log("mounted...")
      console.log(this.prova);
      console.log(this.user_pins)
      console.log(this.coordinates);*/
    },

    updated() {
        this.$nextTick(function () {
            console.log("updated...")
            console.log(this.user_pins);
        // Code that will run only after the
        // entire view has been re-rendered
        })
    },
    
    methods:{
        clickCard(position){
            var allCards = document.getElementsByClassName("card");
            for(var i=0; i<allCards.length; i++){
                allCards[i].style.boxShadow = "0px 4px 8px 0px rgba(0,0,0,0.2)"
                allCards[i].style.border= "none";
            }
            allCards[position].style.boxShadow = "0px 0px 30px #6667AB";
            allCards[position].style.border= "1px solid #6667AB";
            this.selected = position
        },

        insertDescription(sel){
            //pass the url image as prop to the new vue object and create the Image with url and description to send 
            if(sel!=null){
                this.$refs.insertPopup.imageUrl=this.user_pins[sel];
                this.$refs.insertPopup.second=true;
            }

        },

        lackDescription(){
            this.$refs.lack.text = this.$gettext("insertDescriptionMsg");
            this.$refs.lack.second = true;
        },

        async insertImage(imageUrl, description){
            console.log("immagine inserita: " + imageUrl);
            console.log("descrizione inserita: "+ description);
            console.log("Utente che ha inserito immagine: " +this.$auth.user.myUserIDsignUpName)
            console.log("coordinate, lng: "+ this.coordinates.lng + " lat: " + this.coordinates.lat)
            console.log(this.$auth.user.nickname)
            var array = this.$userData.my_images;

            var index = array.indexOf(imageUrl);
            if (index !== -1) {
                array.splice(index, 1);
            }
            console.log(this.$auth.user)
            var my_body = {
              "playerId" : this.$auth.user.myUserIDsignUpName,
              "type" : "remove",
              "imageName" : imageUrl,
            }
            console.log(my_body)
            try{
              const my_url = this.$api_url + "/manageImages/handleImage"
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
                this.hidePopup();
                //add image as geojson inside the server so that other user can see it too
                await this.addImageAsGeojson(imageUrl,description,this.$userData.userName, this.coordinates);
                this.$parent.reloadUserPins();
                return fetchdata
            }catch(e){
                alert("Error......");
                console.log(e)
                this.hidePopup();
            }
        },

        hidePopup(){
            var popup_prova = document.getElementsByClassName("maplibregl-popup");
            popup_prova = document.getElementsByClassName("maplibregl-popup");
            console.log(popup_prova)
            console.log(popup_prova[0].style)
            popup_prova[0].style.display="none";
        },

        async addImageAsGeojson(image,description,userName, coordinates){
            var today = new Date();
            console.log(image)
            console.log(description)
            console.log(userName)
            console.log(coordinates)
            console.log(today)
            var coordinate_array = []
            coordinate_array.push(coordinates.lng);
            coordinate_array.push(coordinates.lat);
            var my_body = {
                "image": image,
                "description": description,
                "user": userName,
                "coordinates": coordinate_array,
                "date": today
            }
            try{
              const my_url = this.$api_url + "/manageImages/createGeoJson"
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
                //add image as geojson inside the server so that other user can see it too
                return fetchdata
            }catch(e){
                alert("Error......");
            }
            
        }
    }

}
</script>

<style scoped>

</style>