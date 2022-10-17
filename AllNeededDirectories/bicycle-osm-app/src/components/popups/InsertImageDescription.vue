<template>
  <div>
    <md-dialog-prompt
      :md-active.sync="second"
      v-model="value"
      :md-title="textTitle"
      md-input-maxlength="30"
      :md-input-placeholder="textPlaceHolder"
      md-confirm-text="Done"
      @md-confirm="onConfirm" />
  </div>
</template>

<script>
  export default {
    name: 'InsertImageDescription',
    data: () => ({
      second: false,
      imageUrl: null,
      value: null,
      textPlaceholder: "",
      textTitle: "",
    }),

    mounted(){
        this.textPlaceholder = this.$gettext("writeMsg");
        this.textTitle = this.$gettext("insertImageMsg");
    },

    methods:{
        async onConfirm(){
            if(this.value==undefined||this.value==""){
              console.log("please Insert something");
              this.$parent.lackDescription()
            }else{
              await this.$parent.insertImage(this.imageUrl,this.value)
            }
        }
    }
  }
</script>