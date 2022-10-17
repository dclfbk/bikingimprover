<template>
    <div>
        <div class = "card">
            <ion-button class="infoButton" shape="round" @click="clickedInfo()"><md-icon >info</md-icon></ion-button>
            <!--<img :src="require('@/assets/'+this.image+'')">-->
            <img :src="require('@/assets/images/placeholder.png')">
            <div style="text-align:center">
                <ion-button class="priceButton"><translate>priceMsg</translate>: {{price}}</ion-button>
            </div>
        </div> 
        <TutorialPopup ref="popup"/>
    </div>
</template>
<script>
import TutorialPopup from "./popups/TutorialPopup.vue"

export default{
    name: "ShopCard",
    components:{
        TutorialPopup,
    },
    props:['image','price','type','description'],
    data(){
        return{

        }
    },

    mounted: function(){
        //console.log("la mia immagine è " + this.image)
    },
    
    methods:{
        clickedInfo(){
            if(this.type=="pinType"){
                console.log("Serve a inserire immagine nella mappa popup");
                this.createPopup("Pin",this.$gettext("pinShopMsg"));
            }else{
                this.createPopup("Power Up", this.$gettext(this.description));
            }
        },

        createPopup(title, message){
            this.$refs.popup.title = title;
            this.$refs.popup.text = message;
            this.$refs.popup.second = true;
        }
    }

}
</script>

<style scoped>
.priceButton{
    color:var(--black);
    --background: var(--white);
    right:0;
    height:25px;
    width:90px;
}

.infoButton{
    position:absolute;
    color:var(--black);
    --background: var(--white);
    width:50px;
    right:0;
    top:0;
    --opacity:
}

h2{
    color:var(--black);
}

/*.priceButton[disabled]{
    color:var(--black);
    --ion-color-base: var(--primaryColor) !important;
    --background: var(--primaryColor);
    right:0;
    opacity:1;
}*/
</style>