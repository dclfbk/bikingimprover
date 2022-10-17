<template>
  <div class = "popup" id="popup" text-align="center" justify-content="center" display="flex">
        <ion-grid>
            <ion-row class="ion-align-items-center">
            <ion-col>
                <ion-item class="my_input_container">
                    <ion-input id="my_input" class="my_input" :value="answer" @input="answer = $event.target.value" placeholder="Enter New Nickname" name="email_login"></ion-input>
                </ion-item>
            </ion-col>
            </ion-row>

            <ion-row class="ion-align-items-center">
            <ion-col class="ion-text-center">
                <ion-button class="my_button" v-on:click="onCancel" >Cancel</ion-button>
                <ion-button class="my_button" v-on:click="onSubmit" >Submit</ion-button>
            </ion-col>
            </ion-row>
        </ion-grid>
  </div>
</template>
<script>
export default {
    name: "Popup",
    data(){
        return{
            answer:"",
        }
    },
    methods : {
        onCancel(){
            this.$parent.editing=false;
        },

        async onSubmit(){
            if(this.answer.length<5){
                console.log(this.answer)
                alert("Nickname must be at least 5 character long")
            }else{
                alert("Changing Nickname please wait...")
                var new_name = this.answer;
                var my_received_answer= await this.$parent.updateName(async function(){
                    console.log("finished")
                    console.log(my_received_answer)
                    //change userName inside the game engine
                },this.answer)
                console.log("The answer to send to the function is " + new_name);
                await this.changeUserNameEngine(new_name);
                this.$parent.editing=false;
            }
        },

        async changeUserNameEngine(newName){
            var oldName = this.$auth.user.myUserIDsignUpName;
            //console.log(newName)
            //console.log(oldName)
            var my_body = {
                "newName" : newName, //will be the customData
                "oldName" : oldName,
            }
            try{
                const my_url = this.$api_url + "/posts/user/changeUserNameEngine"
                const requestSpatialite = {
                method: "post",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(my_body),
                };
                const fetchdata = await fetch(my_url, requestSpatialite)
                .then(response => response.text())
                .then((new_response_data)=>{
                    return new_response_data;
                }).catch((err) => console.log(err))
                return fetchdata
            }catch(e){
                alert("error init");
            }
        },
    }
}
</script>

<style scoped>
.popup{
    display:flex;
    align-items: center;
    text-align:center;
    background-color:var(--white);
    justify-content: center;
    z-index:100;
    position: absolute;
    width:400px;
    /*height: 20%;*/
    /*border-style:solid;
    border-color:var(--secondaryColor);*/
}

.my_input_container{
    --background: var(--white);
    --background-color: var(--white);
    --highlight-color-focused: var(--secondaryColor);
}

.my_input{
    --background: var(--white);
    --background-color: var(--white);
    --color: var(--black);
    border:none;
    text-align:center;
}

ul{
    list-style:none;
    padding:0;
}

.text-input{
    text-align:center;
}

.my_button{
    --border-radius: 15px;
    --color: var(--black);
    --background: var(--white);
    margin-right: 80px;
    margin-left: -45px
    /*width:200px;*/
}
</style>