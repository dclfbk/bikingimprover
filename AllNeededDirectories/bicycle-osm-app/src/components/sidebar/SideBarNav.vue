<template>
    <div>
    <md-menu :mdCloseOnClick="true" :md-active.sync="toggleCard">
      <md-button class="md-icon-button" md-menu-trigger>
        <md-icon>menu</md-icon>
      </md-button>

      <md-menu-content @mouseleave="$mdMenu.close()">
        <md-menu-item to="/mytiles">
          <div style="float:left">
            <md-icon>home</md-icon>
            <span style="padding-left:10px">Home</span>
          </div>
        </md-menu-item>

        <md-menu-item to="/profile">
          <div style="float:left">
            <md-icon>manage_accounts</md-icon>
            <span style="padding-left:10px">Profile</span>
          </div>
        </md-menu-item>

        <md-menu-item to="/classification">
          <div style="float:left">
            <md-icon>tour</md-icon>
            <span style="padding-left:10px">Ranking</span>
          </div>
        </md-menu-item>

        <md-menu-item to="/shop">
          <div style="float:left">
            <md-icon>local_atm<!--paid--></md-icon>
            <span style="padding-left:10px">Shop</span>
          </div>
        </md-menu-item>

        <md-menu-item to="/options">
          <div style="float:left">
            <md-icon>settings<!--paid--></md-icon>
            <span style="padding-left:10px">Settings</span>
          </div>
        </md-menu-item>

        <md-menu-item to="/about">
          <div style="float:left">
            <md-icon>help</md-icon>
            <span style="padding-left:10px">About</span>
          </div>
        </md-menu-item>

      </md-menu-content>
    </md-menu>
    </div>
</template>
<script>

export default {
    name: 'SideBarNav',
    components:{},
    data: () => ({
      toggleCard: false
    }),
    methods: {
      toggle () {
        this.toggleCard = !this.toggleCard
      },
    },
    /*created(){
      var currentUrl = window.location.pathname;
      currentUrl=this.$route.name;
      console.log("yo"+currentUrl)
      switch(currentUrl){
        //case "/": this.filterHome="filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);"; break;
        case "TilesVector": this.filterHome="filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);"; break;
        case "Profile": this.filterProfile="filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);"; break;
        case "Medals": this.filterProfile="filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);"; break;
        case "Classification": this.filterClass="filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);"; break;
        case "MedalUser": this.filterClass="filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);"; break;
        case "userclassification": this.filterClass="filter: invert(0%) sepia(95%) saturate(20%) hue-rotate(39deg) brightness(93%) contrast(107%);"; break;
        default: this.filterHome="filter: invert(97%) sepia(3%) saturate(11%) hue-rotate(107deg) brightness(104%) contrast(104%);";
                this.filterProfile="filter: invert(97%) sepia(3%) saturate(11%) hue-rotate(107deg) brightness(104%) contrast(104%);";
                this.filterClass="filter: invert(97%) sepia(3%) saturate(11%) hue-rotate(107deg) brightness(104%) contrast(104%);";
                
      }
    }*/
  }
</script>
<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Material+Icons");
  .md-menu,
  .toggle {
    margin: 8px;
  }

  .md-menu-content-container{
    background-color:var(--white);
    color:var(--white);
    height:290px;
  }

  .author-card {
    padding: 8px 16px;
    display: flex;
    align-items: center;

    .md-avatar {
      margin-right: 16px;
    }

    .author-card-info {
      display: flex;
      flex-flow: column;
      flex: 1;
    }

    span {
      font-size: 16px;
    }

    .author-card-links {
      display: flex;

      a + a {
        margin-left: 8px;
      }
    }
  }
</style>