<template>
    <div>
        <label><translate  style="color:var(--black)">{{item}}</translate></label><br>
        <div class='content'>
            <div class="radiocheck">
                <input type="radio" name="si_no" id="yes_answer" v-model="answer" value="true">
                <label for="si_no"><translate  style="color:var(--black)">si</translate></label>
            </div>
            <div class="radiocheck">
                <input type="radio" name="si_no" id="no_answer" v-model="answer" value="false">
                <label style="color:var(--black)" for="si_no"><translate  style="color:var(--black)">no</translate></label>
            </div>
        </div>
    </div>
</template>

<script>

export default{
    name:"ValidationForm",
    props:['item','id','type','score','validationNumber','realQuestion', 'userAnswered', 'userWhoValidated', 'tagAnswer'],
    data(){
        return{
            answer:"",
        }
    },
    mounted:function(){
        console.log("QUESTI SONO GLI USER CHE HANNO VALIDATO LA RISPOSTA: " + this.userWhoValidated);
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
