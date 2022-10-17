<template>
  <div>
    <div class="map-container" ref="myTutorialMapp" id="map-container"></div>
    <div class = "map-overlay-down">
      <div class = "map-overlay-inner">
        <ion-button class="addIconButton" shape="round"><md-icon >add</md-icon></ion-button>
      </div>
    </div>
    <TutorialPopup :text="this.popup_text" ref="tutorial_popup"></TutorialPopup>
    <QuestTutorialPopup ref="questPopup" v-if="showQuests"/>
    <GeneralPopupTutorial ref="generalPopupTutorial" v-if="showGeneral"></GeneralPopupTutorial>
  </div>
</template>

<script>
import maplibre from 'maplibre-gl';
import TutorialPopup from '../popups/TutorialPopup'
import QuestTutorialPopup from '../popups/QuestTutorialPopup'
import GeneralPopupTutorial from '../popups/GeneralPopupTutorial.vue'

export default {
  name: "MapTutorial",
  components:{
      TutorialPopup,
      QuestTutorialPopup,
      GeneralPopupTutorial
  },
  data(){
    return{showQuests:null, map:null, my_title:"", popup_text:"", showGeneral:null, ltlngObject:null}
  },
  mounted: async function(){
    const ref=this
    const mapStyle = "https://api.maptiler.com/maps/topo/style.json?key=S1aB9ElJLePXra57G3cm"
    console.log(mapStyle)
    const initialState = {
      //lng: 11.13695030023975,
      //lat: 46.069092939704404,
      lng: 11.11695030023975,
      lat: 46.069092939704404,
      zoom: 14
    };
    const startPoint = {
      lng: 11.11695030023975,
      lat: 46.069092939704404,
    }
    this.popup_text = "Cliccando una via colorata o un cerchio all'interno di essa potrai vederne le domande associate. Prova a cliccare la via o il cerchio associato."

    this.map = new maplibre.Map({
      container: this.$refs.myTutorialMapp,
      style: `${mapStyle}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      maxZoom: 17,
      interactive: false
    });
    this.map.setMaxZoom(20);
    this.map.on('load',function(){
        ref.map.resize();
        ref.map.flyTo({
            center: startPoint,
            zoom:18
        })
        //CALL FIRST POPUP
        ref.$refs.tutorial_popup.text=ref.popup_text;
        ref.$refs.tutorial_popup.second=true;
        ref.map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                        [11.117128729820251, 46.06812076552367],
                        [11.117101907730103, 46.068161705829425],
                        [11.116903424263, 46.0686008817448],
                        [11.116817593574524, 46.0688130247913],
                        [11.116822957992554, 46.06886140817895],
                        [11.116865873336792, 46.068943287661426],
                        [11.116951704025269, 46.069088437354566],
                        [11.117193102836609, 46.069445727280794],
                        [11.117445230484009, 46.069609484390725],
                        [11.11766517162323, 46.06979184969137],
                    ]
                }
            }
        });
        ref.map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout':{
                'line-join': 'round',
                'line-cap': 'round',
            },
            'paint': {
                'line-color': "#6667AB",
                'line-width': 9,
            },
        });
        ref.map.on('click', 'route',function(e){
            ref.showQuests=true;
            ref.showQuestion(ref,e,"Strada");      
        });
        //Add the center point
        ref.map.addSource('my_centered',{
            'type':'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'Point',
                    'coordinates': [
                        11.11695030023975, 46.069092939704404,
                    ]
                }
            }
        });
        ref.map.addLayer({
            'id': 'my_centered',
            'type': 'circle',
            'source': 'my_centered',
            'paint':{
                'circle-radius': 10,
                'circle-stroke-width': 3,
                'circle-color' : "#ECC478",
                "circle-stroke-color" : "#6667AB"
            }
        });
        ref.map.on('click', 'my_centered',function(e){
            console.log("click " + e);
            ref.showQuests=true;
            ref.showQuestion(ref,e,"Strada");
        });
    });
    
  },
  methods:{
    showQuestion(ref,e,title){
        ref.popup_text="Ora puoi selezionare una risposta (in questo caso già selezionata). Prova ora a premere submit e inviare la risposta."
        ref.$refs.tutorial_popup.text=ref.popup_text;
        ref.$refs.tutorial_popup.second=true;
        console.log(title);
        ref.ltlngObject = e.lngLat;
        ref.$nextTick(()=>{
            var my_popup = new maplibre.Popup({closeOnClick:false, closeButton:false}).
            setLngLat(e.lngLat).
            setDOMContent(ref.$refs.questPopup.$el).
            //setHTML(ref.$refs.htmlPopup.$el.outerHTML).
            addTo(ref.map);
            //console.log(my_popup);
            //console.log(my_popup._container.style)
            my_popup._container.style.backgroundColor = "rgba(255,255,255,0.8)";
            my_popup._content.style.backgroundColor= "rgba(255,255,255,0.7)";
        })     
    },

    userAnswered(){
      var popup = document.getElementsByClassName("mapboxgl-popup");
      if(popup){
        popup[0].remove();
      }
      console.log(this.$refs);
      this.showGeneral = true;
      //this.$refs.generalPopupTutorial.text = "Congratulazioni! Hai risposto alla tua prima domanda! Continua così e scalerari la classifica!"
      //this.$refs.generalPopupTutorial.title = "Congratulazioni";
      this.$nextTick(()=>{
        var my_popup = new maplibre.Popup({closeOnClick:false, closeButton:false}).
        setLngLat(this.ltlngObject).
        setDOMContent(this.$refs.generalPopupTutorial.$el).
        addTo(this.map);
        my_popup._container.style.backgroundColor = "rgba(255,255,255,0.8)";
        my_popup._content.style.backgroundColor= "rgba(255,255,255,0.7)";
      })
      this.removeWay();
    },

    removeWay(){
      this.map.removeLayer("route");
      this.map.removeSource("route");
      this.map.removeLayer("my_centered");
      this.map.removeSource("my_centered");
    },

    changePage(){
        //this.$router.push('/imagesTutorial'); 
        this.$router.push('/mytiles')
    },

    newInfo(title,text,number){
      console.log("Clicked Cool button");
      //Create image and show the buttons to zoom, show position etc...
      var geolocate = new maplibre.GeolocateControl({
        fitBoundsOptions: {
            zoom: 16,
        },
        positionOptions: {
          enableHighAccuracy: true
        },
        showUserHeading: true,
        trackUserLocation: true,
        showAccuracyCircle: false,
      })
      if(this.map._controls.length < 3){
        this.map.addControl(new maplibre.NavigationControl());
        this.map.addControl(
          geolocate
        );
      }
      switch(number){
        case 0: this.createAndAddArrow("0px", "no", "no", "45px","100px", 0, 0); break;
        case 1: this.removeArrow("img0"); this.createAndAddArrow("5px","no", "no","no", "100px", -110, 1); break;
        case 2: this.removeArrow("img1"); this.createAndAddArrow("5px","no", "no", "45px", "100px", -45, 2); break;
        case 3: this.removeArrow("img2"); this.createAndAddArrow("no", "60px", "45px", "no", "100px",135,2); break;
        case 4: this.removeArrow("img2"); this.$refs.generalPopupTutorial.finished = true; break;
      }
      number = number + 1;
      this.$refs.generalPopupTutorial.title= title
      this.$refs.generalPopupTutorial.text = text
      this.$refs.generalPopupTutorial.number = number;

      this.$nextTick(()=>{
        var my_popup = new maplibre.Popup({closeOnClick:false, closeButton:false}).
        setLngLat(this.ltlngObject).
        setDOMContent(this.$refs.generalPopupTutorial.$el).
        addTo(this.map);
        my_popup._container.style.backgroundColor = "rgba(255,255,255,0.8)";
        my_popup._content.style.backgroundColor= "rgba(255,255,255,0.7)";
      })
    },

    removeArrow(id){
      var element = document.getElementById(id);
      element.remove();
    },

    createAndAddArrow(top,bottom,left,right,width, rotate, number){
      var container = document.getElementById("map-container");
      var img = document.createElement('img')
      img.id = "img" + number;
      img.src = require("@/assets/images/right-arrow-corn.png")
      img.style["position"]="absolute"
      img.style.top = top
      img.style.bottom = bottom;
      img.style.left = left;
      img.style.right = right
      img.style.width = width
      var rotation = "rotate(" + rotate + "deg)"
      console.log(rotation)
      img.style.transform = rotation
      container.appendChild(img)
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import '~maplibre-gl/dist/maplibre-gl.css';

.map-container {
  position: absolute; top: 0; bottom: 0;  left: 0; right:0;
  height: 100%;
  width: 100%;
  margin: 0; padding: 0;
}

.maplibregl-popup-content {
  background-color:transparent;
}

.mapboxgl-popup-content{
  background-color:transparent;
}
.maplibregl-popup{background-color:transparent;}
.mapboxgl-popup{background-color:transparent;} 
.maplibregl-popup-anchor-bottom{background-color:transparent;}
.mapboxgl-popup-anchor-bottom{background-color:transparent;}

.maplibregl-canvas-container{
    width:100%;
    height:100%;
    height: 100vh;
}
.mapboxgl-canvas-container{
    width:100%;
    height:100%;
    height: 100vh;
}
</style>
