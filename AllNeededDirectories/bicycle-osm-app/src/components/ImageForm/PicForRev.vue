<template>
    <div class = "imageUpload">
        <form @submit.prevent="handleSubmit" enctype="multiplart/form-data" style="text-align: center;">
            <div class="form-group" >
                <label style="text-align:center">You can upload an image of the place to receive more points!</label>
                <input type="file" class="form-control" @change="handleUpload($event.target.files)" style="text-align-last: center"/>
            </div>
        </form>
    </div>
</template>
<script>

export default{
    name: "PicForRev",

    data(){
        return{
            model:{
                imageFile: null,
            }
        }
    },

    mounted(){

    },
    
    methods: {
        handleSubmit(){
            this.$emit('submit', this.model)
        },

        handleUpload(files){
            this.model.imageFile = files[0];
            console.log("uploading file....")
        }
    }

}
</script>

<style scoped>
.form-control{
    /*text-align:center*/
}
</style>