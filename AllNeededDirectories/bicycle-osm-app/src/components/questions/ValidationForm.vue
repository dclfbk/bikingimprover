<template>
    <div>
        <label><translate  style="color:var(--black)">{{item}}</translate></label><br>
        <div class='content'>
            <div class="radiocheck">
                <input type="radio" :name="'si_no' + uniqueID" :id="'yes_answer' + uniqueID" v-model="answer" value="true">
                <label :for="'si_no' + uniqueID"><translate  style="color:var(--black)">si</translate></label>
            </div>
            <div class="radiocheck">
                <input type="radio" :name="'si_no' + uniqueID" :id="'no_answer' + uniqueID" v-model="answer" value="false">
                <label style="color:var(--black)" :for="'si_no' + uniqueID"><translate  style="color:var(--black)">no</translate></label>
            </div>
        </div>
    </div>
</template>

<script>

export default{
    name:"ValidationForm",
    props:['item','id','type','score','validationNumber','realQuestion', 'userAnswered', 'userWhoValidated', 'tagAnswer', 'openAnswer', 'uniqueID'],
    data(){
        return{
            answer:"",
        }
    },
    mounted:function(){
        console.log("QUESTI SONO GLI USER CHE HANNO VALIDATO LA RISPOSTA: " + this.userWhoValidated);
        console.log(this.tagAnswer);
    }
}
</script>

<style>
small {
    display: block;
}

.content{
    display: flex;
    justify-content: space-between;
}

.radiocheck{
    margin: auto;
}
</style>
