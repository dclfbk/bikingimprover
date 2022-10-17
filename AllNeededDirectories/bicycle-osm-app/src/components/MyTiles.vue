<template>
  <div>
    <AddPinMap v-if="addPin" ref="pinMode" :user_pins="imagesList" :coordinates="clickCoordinates"/>
    <UserPinData v-if="showPin" ref="userPin" :title="my_title" :imageUrl="image" :userName="userPinName" :description="description" />
    <TutorialPopup ref="tutPop"/>
    <div class="addingPinDiv" v-if="addingPinMode"></div>
    <Test v-if="my_items" id="popup" :distanza="my_distance" :title="my_title" :items="my_items" ref="htmlPopup" :open="my_open_quest" :validate="my_validate_quest" :location="location_permission"/>
    <div class="map-container" ref="myMapp"></div>   

    <div v-if="showSelect" class="map-overlay top">
      <div class="map-overlay-inner">
        <fieldset>
          <label>Select layer</label>
          <select id="my_layer" name="my_layer">
            <option value="show_all"><translate>showAllMsg</translate></option>
            <option value="nothing"><translate>showNothingMsg</translate></option>
            <!--<option value="trento_choice">Trento</option>
            <option value="ferrara_choice">Ferrara</option>-->
            <option value="way_choice"><translate>onlyWayMsg</translate></option>
            <option value="node_choice"><translate>onlyPointsMsg</translate></option>
            <option v-for="(value,index) in way_layer_names" v-bind:key="'city'+index" class="cityOption" :value="way_layer_names[index]">{{way_layer_names[index]}}</option>
          </select>
        </fieldset>
        <fieldset>
          <button style="width:100px" @click="changeWayLayer(page,completed_w)">Select</button>
          <div id="swatches"></div>
        </fieldset>
      </div>
    </div>
    <div class = "map-overlay-down">
      <div class = "map-overlay-inner">
        <ion-button class="addIconButton" @click="showInsertPopup" shape="round"><md-icon >add</md-icon></ion-button>
        <!--<button> Add </button>-->
      </div>
    </div>
    <NoLocation ref="no_location_alert"/>
  </div>
</template>

<script>
import maplibre from 'maplibre-gl';
import Test from './Test.vue';
import AddPinMap from './ImageForm/AddPinMap.vue';
import UserPinData from './UserPinData.vue';
import NoLocation from './popups/NoLocation.vue';
import booleanPointInPol from '@turf/boolean-point-in-polygon';
import TutorialPopup from './popups/TutorialPopup.vue';
import checkUserPins from "../utils/GlobalFunctions.js"


export default {
  name: "MyTiles",
  components:{
    Test,
    AddPinMap,
    NoLocation,
    UserPinData,
    TutorialPopup
  },
  data(){
    return{
      public_path: process.env.BASE_URL, 
      my_distance:null, //needed to know whether or not the user can answer a question (if too distant he can't)
      location_permission:null,  //gps permission
      map:null, //the map of maplibre holding all the layers...
      completed_w:null, //all the ways that will not be shown
      completed_n:null, //all the nodes that will not be shown
      my_items:null, 
      my_title:"", //title used for the popup question
      page:this, //used to change layer shown
      my_open_quest:null, //the open questions associated to a way or node
      my_validate_quest:null, //the validation questions associated to a way or node
      way_layer_names: null, //name of the way layers shown on the map
      node_layer_names: null, //name of the layers of the nodes shown on the map
      way_layer_list:null, //a list of all the way layers
      node_layer_list:null, //a list of all the node layers
      center_points_layer_list:[], //a list of all the center layers
      cluster_layer_list: [], //a list of all the cluster layers
      active_way_layer:[], //a list of all the active way layers
      active_node_layer:[], //list of all the active node layers
      active_center_layer:[], //list of all the active center layers
      cluster_active_list:[], //list of all the active cluster layers
      addPin:null, //variable needed to know whether or not to show the popup to add pins in the map
      imagesList: [], //list of the user pins
      clickCoordinates: null, //where to spawn the popup when the user is in pinMode
      addingPinMode: false, //whether or not the user is in pinMode
      showPin: false, //show the pin clicked by the user if true
      image: null, //image associated to the pin clicked by the user 
      description: null, //description of the pin
      userPinName:null, //name of the user who put the pin
      showSelect:false, //if true show the form where the user can choose the layers
      higherScoreWayList: [], //list of the ways that have a score less than x value
      higherScoreNodeList: [], //list of the nodes that have a score less than x value
      showHigher: false, //check if user wants to see higher scores only
      way_url: "", 
      node_url:"",
      center_json_url:"",
      pin_user_url:"",
      allNodesPoints:[],
      allCenteredPoints:[],
      timer:[]
      }
      //SELECT * FROM "completed_table" WHERE CAST(SCORE as double) > CAST('5.0' as double)
  },
  beforeMount: async function(){
    
  },

  mounted: async function(){
    const ref=this 
    //the data url used to create the sources and layers
    var way_url = this.public_path + "pbfFiles/allWaysPbf/{z}/{x}/{y}.pbf"
    var node_url = this.public_path + "pbfFiles/allNodesPbf/{z}/{x}/{y}.pbf"
    //var center_json_url = this.public_path + "pbfFiles/allCenterPoints.geojson"
    var center_json_url = [];
    const pin_user_url = this.public_path+"pbfFiles/pinUser.geojson"
    //functions needed to make the pbfs links work
    way_url = this.polishURLS(way_url);
    node_url = this.polishURLS(node_url);

    this.way_url = way_url;
    this.node_url = node_url;
    this.pin_user_url = pin_user_url
    
    //Get all completed ways, get all layer names...
    var nodeLayerNames = await this.getAllLayerNames(function(){
      console.log("finished getting all node layer names...")
    },"node")
    var wayLayerNames = await this.getAllLayerNames(function(){
      console.log("finished getting all way layerss names...")
    },"way")

    console.log(nodeLayerNames);
    console.log(wayLayerNames);
    this.way_layer_names = wayLayerNames;
    this.node_layer_names = nodeLayerNames;
    this.showSelect=true;
    
    //The central points url of the ways
    var url_center
    for(var i=0; i<wayLayerNames.length; i++){
      url_center = this.public_path + "pbfFiles/CenterGeojson/" + wayLayerNames[i] + "Center.geojson"
      center_json_url.push(url_center);
    }
    this.center_json_url = center_json_url
    //rest call needed to know which ways and nodes to show.It checks this in the database
    var my_completed_ways_dt = await this.getAllCompletedWaysAndNodes(function(){
      console.log("finished getting all ways....")
    },"way")
    var my_completed_nodes_dt = await this.getAllCompletedWaysAndNodes(function(){
      console.log("finished getting all nodes....")
    },"node")
    this.initializeCompleted(my_completed_ways_dt,"way");
    this.initializeCompleted(my_completed_nodes_dt,"node");

    var powerArray = this.$userData.getPowerUps()
    if(powerArray.includes("seeEverything")){
      var higherScores = await this.getHigherScore(function(){
        ref.addHighField();
      },"5.0")
      var set = new Set(higherScores[0]);
      this.higherScoreWayList = Array.from(set);
      set = new Set(higherScores[1]);
      this.higherScoreNodeList = Array.from(set);
    }

    //update completed and page every time after 5 mins.
    var timer = setInterval(() =>{
      this.updatePage()
    },300000) //Ogni 5 minuti 300000
    this.timer.push(timer);
    timer = setInterval(()=>{ 
      checkUserPins(this.$api_url)
    },3600000) //Ogni ora
    this.timer.push(timer);

    //Function used forthe boundaries (turf.js)
    //IF YOU WANT TO HAVE THIS FEATURE THEN YOU HAVE TO REMOVE THE COMMENT FROM HERE ON AND REMOVETHE COMMENT ON THE FIRST INSTANCE OF THE FUNCTION "findIdInsidePol()"
    //Variable needed if you want to visualize points only inside a certain area. Function findIdInside also needed! Remove comment later.
    /*var allCenteredPoints = await this.getAllCenteredPoints(function(){
      console.log("finished getting all points with id...");
    },"CenterGeojson/allCenterPoints.geojson")
    //Stessa cosa va fatta per il geojson dei nodi
    var allNodesPoints = await this.getAllCenteredPoints(function(){
      console.log("finished getting all nodes.......");
    },"allNodesGeojson.geojson")
    this.allCenteredPoints = allCenteredPoints;
    this.allNodesPoints = allNodesPoints;*/

    this.askGeoLocation();
    //const mapStyle = "https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=S1aB9ElJLePXra57G3cm" LOTR NON FUNZIONA
    const mapStyle = "https://api.maptiler.com/maps/topo/style.json?key=S1aB9ElJLePXra57G3cm"
    //const mapStyle = "https://api.maptiler.com/maps/basic-v2-dark/style.json?key=S1aB9ElJLePXra57G3cm"
    const initialState = {
      lng: 11.116667,
      lat: 46.066666,
      zoom: 15,
    };

    this.map = new maplibre.Map({
      container: this.$refs.myMapp,
      style: `${mapStyle}`,
      center: [initialState.lng, initialState.lat],
      zoom: initialState.zoom,
      maxZoom: 19,
    });
    this.map.setMaxZoom(19);
    this.map.dragRotate.enable();

    ref.map.resize();

    //geolocation and various controls
    this.map.addControl(new maplibre.NavigationControl());
    var geolocate = new maplibre.GeolocateControl({
        fitBoundsOptions: {
            zoom: 17,
        },
        positionOptions: {
          enableHighAccuracy: true
        },
        showUserHeading: true,
        trackUserLocation: true,
        showAccuracyCircle: false,
    })

    this.map.addControl(
      geolocate
    );
    this.map.maxZoom=17;

    //ALL LOGIC OF THE MAP ON LOAD
    ref.map.on('load',function(){
      //ref.findIdInsidePol(ref,ref.allCenteredPoints,ref.allNodesPoints)
      ref.map.resize();
      geolocate.trigger();
      geolocate._accuracyCircleMarker._color= "#DC143C";
      ref.map.resize();

      //SOURCES AND LAYERS CREATION
      //WAY LAYER
      ref.createSource(ref,"my_ways", ref.way_url,17)
      ref.createAllWayLayers(ref,ref.way_layer_names,ref.completed_w)
      //NODE LAYER
      ref.createSource(ref,"my_nodes",ref.node_url,16)
      ref.createAllNodeLayers(ref,ref.node_layer_names, ref.completed_n)
      //CENTRAL POINTS LAYER AND CLUSTERS LAYER. THEY USE GEOJSONS.
      //One source for each centerLayer, one for each file. wayLayerNames[i] is associated to the link of center_json_url[i]
      for(i=0;i<ref.way_layer_names.length;i++){
        ref.createGeojsonSource(ref,ref.completed_w, ref.way_layer_names[i]+"-centered",ref.center_json_url[i]);
      }
      //Cluster layer creation, one for each layer. Otherwise it gives problems when hiding elements.
      ref.createAllClusterLayers(ref,ref.way_layer_names);
      //Center points layer creation
      ref.createAllCenterLayers(ref,ref.way_layer_names, ref.completed_w);
      console.log(ref.map.getStyle().layers)
      //PINS INSERTED BY THE USER
      ref.createGeojsonSourceNoCluster(ref,"pins", ref.pin_user_url)
      ref.createUserPinsLayer(ref,"pins","pins_data")

      //HANDLE WAYS MAP CLICKS
      for(var i=0;i<ref.way_layer_list.length;i++){
        ref.map.on("click", ref.way_layer_list[i],function(e){
          ref.clickOnWayLayer(ref,ref.active_center_layer,geolocate,e)
        })
      }
      //HANDLE NODES MAP CLICKS
      for(i=0;i<ref.node_layer_list.length;i++){
        ref.map.on("click",ref.node_layer_list[i],function(e){
          ref.clickOnNodeLayer(ref,geolocate,e)
        })
      }
      //HANDLE CENTER POINTS MAP CLICKS
      for(i=0;i<ref.way_layer_list.length;i++){
        ref.map.on("click", ref.way_layer_list[i] + "Center",function(e){
          ref.clickOnCenterLayer(ref,ref.active_way_layer,geolocate,e)
        })
      }
      //HANDLE USER PINS MAP CLICKS
      ref.map.on("click","pins_data",function(e){
        ref.clickOnUserPinsLayer(ref, e)
      })
      //HANDLE CLUSTER CLICKS
      for(i=0;i<ref.cluster_layer_list.length;i++){
        ref.map.on("click", ref.cluster_layer_list[i],function(e){
          ref.clickOnCluster(ref,e);
        })
      }
    }) 

    //RESET EVERYTHING WHEN CLICK OUTSIDE THE WAYS AND NODES
    ref.map.on('click', function(e) {
      var popup_prova = document.getElementsByClassName("maplibregl-popup");
      if(popup_prova[0]==undefined || popup_prova[0]=="undefined"){
        ref.showEverything(ref, ref.map, ref.completed_w, ref.completed_n);//my_completed_nodes);
      }else{
        if(popup_prova[0].style.display=="none"){
          console.log('A click event has occurred at ' + e.lngLat);
        }
        ref.showEverything(ref, ref.map, ref.completed_w, ref.completed_n);//my_completed_nodes);
      }
      //ref.findIdInsidePol(ref, allCenteredPoints)
    });
  },

  methods:{
    showInsertPopup(){
      this.addingPinMode = true;
      this.map.on('click',this.startInsertIcon)
    },

    startInsertIcon(e){
      this.imagesList = [];
      this.addPin = true;
      var user_images = this.$userData.my_images;
      if(user_images.length>0){
        this.imagesList = user_images;
        this.clickCoordinates = e.lngLat
        console.log(user_images)
        this.$nextTick(()=>{
          var my_popup = new maplibre.Popup().
          setLngLat(e.lngLat).
          setDOMContent(this.$refs.pinMode.$el).
          addTo(this.map);
          my_popup._container.style.backgroundColor = "#6667AB";
          my_popup._content.style.backgroundColor= "rgba(255,255,255,1)";
        })
      }else{
        this.$refs.tutPop.title = this.$gettext("lackPinMsg");
        this.$refs.tutPop.text = this.$gettext("buyPinMsg");
        this.$refs.tutPop.second=true
      }
      this.addingPinMode = false;
      this.map.off('click', this.startInsertIcon);
    },
    
    //to update to receive also a polygon to check. 
    //returns an array with all the information of nodes and ways that are inside a certain polygon
    findIdInsidePol(ref, allCenterWayPoints,allNodePoints){
      var helper = require('@turf/helpers')
      var searchWithin = helper.polygon([[
                          [11.1349010, 46.0532202],
                          [11.1398792, 46.0715634],
                          [11.1209106, 46.0734688],
                          [11.1174774, 46.0539350],
                          [11.1349010, 46.0532202],
                        ]], {name: 'polygon'})
      //var wayFeature = ref.map.querySourceFeatures("my_ways",{sourceLayer: "combined"})
      //var nodeFeature = ref.map.querySourceFeatures("my_nodes",{sourceLayer: "combinedNodes"})
      //var centerFeature = ref.map.querySourceFeatures("my_centered", {sourceLayer: "my_center_data"})
      var arrayToCheck = []
      var inside = false;
      var i;
      for(i in allNodePoints){
        inside = booleanPointInPol(allNodePoints[i].coordinates,searchWithin)
        if(inside){
          arrayToCheck.push(allNodePoints[i].id)
        }else{
          if(!ref.completed_n.includes(allNodePoints[i].id)){
            ref.completed_n.push(allNodePoints[i].id);
          }
        }
      }
      
      arrayToCheck = [];
      for(i in allCenterWayPoints){
        if(allCenterWayPoints[i].id != undefined){
          inside = booleanPointInPol(allCenterWayPoints[i].coordinates, searchWithin)
          if(inside){
            arrayToCheck.push(allCenterWayPoints[i].id)
          }else{
            if(!ref.completed_w.includes(allCenterWayPoints[i].id)){
              ref.completed_w.push(allCenterWayPoints[i].id);
            }
          }
        }
      }

      /*arrayToCheck = []
      //To make it work remove the comment on the else
      for(i in wayFeature){
        if(this.checkWayInPol(wayFeature[i],searchWithin)){
          arrayToCheck.push(wayFeature[i])
        }else{
          if(!this.completed_w.includes(wayFeature[i].properties.id)){
            this.completed_w.push(wayFeature[i].properties.id)
          }
        }
      }*/
      return arrayToCheck;
    },

    //Verifica se una certa via way_to_analyze è all'interno di un certo poligono pol
    checkWayInPol(way_to_analyze, pol){
      var inside=false;
      var j;
      if(way_to_analyze.geometry.type=="Polygon"||way_to_analyze.geometry.type=="MultiLineString"){
        for(j in way_to_analyze.geometry.coordinates){
          for(var p in way_to_analyze.geometry.coordinates[j]){
            inside = booleanPointInPol(way_to_analyze.geometry.coordinates[j][p],pol)
            if(inside){
              return true
            }
          }
        }
      }else{
        for(j in way_to_analyze.geometry.coordinates)
          inside = booleanPointInPol(way_to_analyze.geometry.coordinates[j],pol)
          if(inside){
            return true
          }
      }
      return false;
    },

    //function to gain the questions associated to a way or a node
    async getQuestion(id, node_or_way){
      try{
        const my_url = this.$api_url + "/posts/"+id+"&"+node_or_way
        const requestSpatialite = {
          method:"get",
          headers:{ "Content-Type":"application/json"},
        };
        const fetchdata = await fetch(my_url,requestSpatialite)
          .then(response => response.json())
          .then((new_response_data)=>{
            return new_response_data;
          }).catch((err)=>console.log(err)) 
          return fetchdata
      }catch(e){
        alert("Error init");
      }
    },

    //function used to change the layer to show to the user
    changeWayLayer(ref, my_completed_ways){
      var my_layer = document.getElementById("my_layer")
      var chosenValue = my_layer.value
      switch(chosenValue){
          case "show_all": ref.removeAllLayers(ref, ref.way_layer_list, ref.node_layer_list, ref.center_points_layer_list, ref.cluster_layer_list);
                           if(ref.showHigher){
                            ref.removeAndReAddCenterSource(ref,ref.completed_w);
                           }
                           ref.showHigher = false;
                           ref.createAllWayLayers(ref, ref.way_layer_list, my_completed_ways);
                           ref.createAllNodeLayers(ref, ref.node_layer_list, ref.completed_n);
                           ref.createAllClusterLayers(ref, ref.way_layer_list);
                           ref.createAllCenterLayers(ref, ref.way_layer_list, ref.completed_w);
                           //console.log(ref.way_layer_list)
                           //console.log(ref.node_layer_list)
                           break;    
          case "node_choice": ref.removeAllLayers(ref, ref.way_layer_list, ref.node_layer_list, ref.center_points_layer_list, ref.cluster_layer_list);
                              ref.createAllNodeLayers(ref, ref.node_layer_list, ref.completed_n); break;
          case "way_choice": ref.removeAllLayers(ref, ref.way_layer_list, ref.node_layer_list, ref.center_points_layer_list, ref.cluster_layer_list);
                             if(ref.showHigher){
                                ref.removeAndReAddCenterSource(ref,ref.completed_w);
                             }
                             ref.showHigher = false;
                             ref.createAllWayLayers(ref, ref.way_layer_list, my_completed_ways);
                             ref.createAllClusterLayers(ref, ref.way_layer_list);
                             ref.createAllCenterLayers(ref, ref.way_layer_list, ref.completed_w);
                             break;
          case "nothing": ref.removeAllLayers(ref, ref.way_layer_list, ref.node_layer_list, ref.center_points_layer_list, ref.cluster_layer_list); 
                          break;
          case "show_higher": console.log("showing higher...")
                              ref.removeAllLayers(ref, ref.way_layer_list, ref.node_layer_list, ref.center_points_layer_list, ref.cluster_layer_list);
                              ref.removeAndReAddCenterSource(ref,ref.higherScoreWayList);
                              ref.createAllHighLayers(ref, ref.higherScoreWayList, ref.higherScoreNodeList, ref.way_layer_list, ref.node_layer_list);
                              ref.showHigher = true;
                              break;
          default:  ref.removeAllLayers(ref, ref.way_layer_list, ref.node_layer_list, ref.center_points_layer_list, ref.cluster_layer_list);
                    if(ref.showHigher){
                      ref.removeAndReAddCenterSource(ref,ref.completed_w);
                    }
                    ref.showHigher = false;
                    ref.createLayer(ref,"my_ways",chosenValue,chosenValue, my_completed_ways);
                    ref.createCenterLayer(ref,chosenValue + "-centered",chosenValue + "Center",my_completed_ways,chosenValue); 
                    ref.createClusters(ref,chosenValue + "-centered","clusters" + chosenValue,"cluster-count" + chosenValue,chosenValue);
                    break;
        }
    },

    removeAndReAddCenterSource(ref, list_to_hide){
        for(var i=0;i<ref.way_layer_names.length;i++){
          ref.map.removeSource(ref.way_layer_names[i]+"-centered");
          ref.createGeojsonSource(ref,list_to_hide, ref.way_layer_names[i]+"-centered",ref.center_json_url[i]);
        }
    },

    async getAllLayerNames(_callback,type){
      try{
        var my_url = ""
        if(type == "way"){
          my_url = this.$api_url + "/posts/way/getAllLayerNames"
        }else{
          my_url = this.$api_url + "/posts/node/getAllLayerNames"
        }
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

    //function used to gain all the nodes and ways that are completed
    async getAllCompletedWaysAndNodes(_callback,type){
      try{
        var my_url = ""
        if(type == "way"){
          my_url = this.$api_url + "/posts/way/checkcompleted"
        }else{
          my_url = this.$api_url + "/posts/node/checkcompleted"
        }
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

    async getAllCenteredPoints(_callback,geojsonName){
      var my_body = {
        "geojsonName": geojsonName
      }
      var my_url = this.$api_url + "/posts/getAllPoints"
      try{
        const requestSpatialite = {
          method:"post",
          headers:{ "Content-Type":"application/json"},
          body: JSON.stringify(my_body)
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

    //hides all the layers except one way layer
    hideAllExceptOneWay(map, exceptId, layerId){
      map.setPaintProperty(layerId, "line-color",
          ["match",
          ["get","id"], exceptId, "#6667AB ", "transparent"]);
      //map.setLayoutProperty("clusters","visibility","none")
      //map.setLayoutProperty("cluster-count","visibility","none")
    },

    //hides all the layer except one central point layer
    hideAllExceptOneCentered(map, exceptId, layerId){
      map.setPaintProperty(layerId, "circle-color",
          ["match",
          ["get","id"], exceptId, "#ECC478", "transparent"]);
      map.setPaintProperty(layerId, "circle-stroke-color",
          ["match",
          ["get","id"], exceptId, "#6667AB", "transparent"]);
    },

    hideAllExceptOneNode(map,exceptId,layerId){
      map.setPaintProperty(layerId, "circle-color",
          ["match",
          ["get","id"], exceptId, "#E4455E", "transparent"]);
      map.setPaintProperty(layerId, "circle-stroke-color",
          ["match",
          ["get","id"], exceptId, "#E4455E", "transparent"]);
    },

    //hides all the layer of the map
    hideAll(ref,map){
      //hide nodes
      for(var i=0; i<ref.node_layer_list;i++){
        map.setPaintProperty(ref.node_layer_list[i], "circle-color", "transparent");
        map.setPaintProperty(ref.node_layer_list[i], "circle-stroke-color", "transparent");
      }
      //hide central points
      for(i=0; i<ref.way_layer_list;i++){
        map.setPaintProperty(ref.way_layer_list[i],"line-color","transparent");
      }
      //hide ways
      for(i=0;i<ref.center_layer_list;i++){
        map.setPaintProperty(ref.center_layer_list[i], "circle-color", "transparent");
        map.setPaintProperty(ref.center_layer_list[i], "circle-stroke-color", "transparent");
      }
    },

    //update the map layers and show them
    showEverything(ref, map, my_completed_w, my_completed_n){
      if(ref.showHigher){
        my_completed_w = ref.higherScoreWayList;
        my_completed_n = ref.higherScoreNodeList;
      }
      for(var i in ref.active_way_layer){
        map.setPaintProperty(ref.active_way_layer[i], "line-color",
          ["match",
          ["get","id"], my_completed_w, "transparent", "#6667AB"]);
      }
      for(i in ref.active_center_layer){
        map.setPaintProperty(ref.active_center_layer[i], "circle-color", ["match",["get","id"],my_completed_w,"transparent","#ECC478"]);
        map.setPaintProperty(ref.active_center_layer[i], "circle-stroke-color", ["match",["get","id"],my_completed_w,"transparent","#6667AB"]);
      }
      for(i in ref.active_node_layer){
        map.setPaintProperty(ref.active_node_layer[i], "circle-color", ["match",["get","id"],my_completed_n,"transparent","#E4455E"]);
        map.setPaintProperty(ref.active_node_layer[i], "circle-stroke-color", ["match",["get","id"],my_completed_n,"transparent","#E4455E"]);
      }

      for(i in ref.cluster_active_list){
        map.setLayoutProperty(ref.cluster_active_list[i],"visibility","visible");
        map.setLayoutProperty(ref.cluster_active_list[i],"visibility","visible");
      }
    },

    //function used to update all the nodes and ways that have been completed
    async updateAllCompleted(){
      //first of all I make a res call in order to know which ways to show 
      var my_completed_ways_dt = await this.getAllCompletedWaysAndNodes(function(){
        console.log("finished getting all ways....")
      },"way")
      var my_completed_nodes_dt = await this.getAllCompletedWaysAndNodes(function(){
        console.log("finished getting all nodes....")
      },"node")
      this.initializeCompleted(my_completed_ways_dt,"way");
      this.initializeCompleted(my_completed_nodes_dt,"node");
      this.showEverything(this,this.map,this.completed_w,this.completed_n);
      //I close the popups
      this.closePopupOfTest();
    },

    async updatePage(){
      var my_completed_ways_dt = await this.getAllCompletedWaysAndNodes(function(){
        console.log("finished getting all ways....")
      },"way")
      var my_completed_nodes_dt = await this.getAllCompletedWaysAndNodes(function(){
        console.log("finished getting all nodes....")
      },"node")
      this.initializeCompleted(my_completed_ways_dt,"way");
      this.initializeCompleted(my_completed_nodes_dt,"node");

      //Check if I need to update the higherScore missions
      var powerArray = this.$userData.getPowerUps()
      if(powerArray.includes("seeEverything")){
        var higherScores = await this.getHigherScore(function(){
          //this.addHighField();
        },"5.0")
        var set = new Set(higherScores[0]);
        this.higherScoreWayList = Array.from(set);
        set = new Set(higherScores[1]);
        this.higherScoreNodeList = Array.from(set);
      }else{
        //rimuovi l'elemento dal select
        var higherOption = document.getElementById("show_higher");
        if(higherOption!=null){
          higherOption.remove();
        }

      }
      //load the map again
      this.showEverything(this,this.map,this.completed_w,this.completed_n)
    },

    closePopupOfTest(){
      var popup = document.getElementsByClassName("mapboxgl-popup");
      if(popup){
        while(popup[0]){
          popup[0].parentNode.removeChild(popup[0])
        }
      }
    },

    createHTML(item){
      for(const i in item){
        this.createQuestion(item[i])
      }
      return '<h1> THIS IS MY QUESTION: <h1>'+'<p>'+item[0].QUESTION+'</p>'
    },

    //Get the user geolocation
    async askGeoLocation(){
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log(position.coords.latitude);
          console.log(position.coords.longitude);
          this.location_permission=true;
          this.$userData.geoLocationPermission = true;
        },
        error => {
          console.log("couldn't get coordinates"+error.message);
          this.location_permission=false;
          this.$refs.no_location_alert.second=true;
          this.$userData.geoLocationPermission = true;
        },
      )   
    },

    //check if the user is too far from the mission to answer it
    checkDistance(geolocate,e){
      var distance
      if(geolocate._userLocationDotMarker == undefined){
        distance = 50000
      }else{
        if(geolocate._userLocationDotMarker._lngLat == undefined){
          distance = 50000;
        }else{
          distance = (geolocate._userLocationDotMarker._lngLat).distanceTo(e.lngLat);
        }
      }
      return distance
    },

    //Function needed to make the links of the pbfs work
    polishURLS(url){
      if (url) {
        // Patch protocol-relative URL
        if (url.match(/^\/\//)) {
          url = location.protocol + url;
        }
        // Patch domain-relative URL
        else if (url.match(/^\//)) {
          url = location.protocol + '//' + location.host + url;
        }
      }
      return url;
    },

    //The function lets the user gain the question about a way or a node
    async getMapQuestions(ref, id, nodeOrWay, geolocate, e, nameTag){
      ref.getQuestion(id,nodeOrWay).then(items =>{
        const open_list = []
        const validate_list = []
        if(items.length!=0){
          for(var i in items){
            if(items[i].VALIDATING=="no"){
              open_list.push(items[i])
            }else{
              validate_list.push(items[i])
            }
          }
          ref.my_items = items;
          ref.my_open_quest = open_list;
          ref.my_validate_quest = validate_list;
          ref.my_title = nameTag;
          var distance;
          //Check the user distance in order to check if he can answer or not
          distance = ref.checkDistance(geolocate, e);
          ref.my_distance = distance;
          ref.$nextTick(()=>{
            var my_popup = new maplibre.Popup().
            setLngLat(e.lngLat).
            setDOMContent(ref.$refs.htmlPopup.$el).
            addTo(ref.map);
            my_popup._container.style.backgroundColor = "#6667AB";
            my_popup._content.style.backgroundColor= "rgba(255,255,255,1)";
          })
        }        
      })
    },

    checkAllTags(AllTags, tags){
      if(tags!=undefined && tags!="undefined"){
        AllTags = JSON.parse(tags);
      }
      if(AllTags == undefined || AllTags == "undefined"){
        AllTags = "NoTagsForAllTags"
      }
      return AllTags
    },

    //Creates the source that contains the layer
    createSource(ref,sourceName,way_url,minZoom){
      ref.map.addSource(sourceName,{
          type:'vector',
          tiles:[way_url],
          'minzoom': minZoom,
          'maxzoom': 21,
      });
    },

    createGeojsonSource(ref,completed_ways,sourceName,url){
      ref.map.addSource(sourceName,{
        type:'geojson',
        data: url,
        cluster: true,
        clusterMaxZoom: 16, // Max zoom to cluster points on
        clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
        clusterProperties: {
          point_showed:["+",["match",["get","id",["properties"]],completed_ways,0,1]],
          //active_city:["+",["match",["get","id",["properties"]],ref.active_city,0,1]], //controlla se è una città attiva, se sì mostra la via
        }
      })
    },

    createGeojsonSourceNoCluster(ref,sourceName,url){
      ref.map.addSource(sourceName,{
        type:'geojson',
        data: url,
        cluster: false,
      })
    },

    //Create the layer about the ways in the map
    createLayer(ref,sourceName, sourceLayer,id,my_completed_ways){
      ref.map.addLayer({
        'id': id,
        'type': 'line',
        'source': sourceName,
        'source-layer': sourceLayer,
        'filter': ['!', ['has', 'point_count']],
        'maxzoom':21,
        'minzoom' : 10,
        'layout':{
                'line-join': 'round',
                'line-cap': 'round',
              },
              'paint': {//'line-color': ["get","color"],
                "line-color":[
                  "match",
                  ["get","id"],
                  my_completed_ways,
                  "transparent", //If I use transparent it is clickable but it is hided
                  "#6667AB"//["get","color"],
                ],
                'line-width': 9,
              },
      })
      if(ref.active_center_layer.length!=0){
        for(var i in ref.active_center_layer){
          ref.map.moveLayer(id,ref.active_center_layer[i])
        }
      }
      ref.active_way_layer.push(id);
    },

    createCenterLayer(ref,sourceName,id,my_completed_ways,cityName){
      console.log("city passed is" + cityName);
      ref.map.addLayer({
        'id': id,
        'type': 'circle',
        'source': sourceName,
        'filter': ["all",['!has','point_count'],['==','city',cityName]],
        //["in",121212,my_completed_ways]
        "icon-allow-overlap": true,
        'maxzoom':20,
        'minzoom' : 14,
        'paint':{
          'circle-radius': 10,
          'circle-stroke-width': 3,
          'circle-color' : ["match",["get","id"],my_completed_ways,"transparent","#ECC478"],
          "circle-stroke-color" : ["match",["get","id"],my_completed_ways,"transparent","#6667AB"]
        },
        //'filter': ['==','$city', cityName]
      })
      ref.active_center_layer.push(id);
    },

    //https://stackoverflow.com/questions/51481471/adding-custom-icons-for-each-feature-in-feature-collection-with-mapbox-gl-js
    //https://maplibre.org/maplibre-gl-js-docs/example/add-image/
    createUserPinsLayer(ref,sourceName,id){
      ref.map.addLayer({
        'id': id,
        'type': 'circle',
        'source': sourceName,
        'filter': ['!', ['has', 'point_count']],
        "icon-allow-overlap": true,
        'maxzoom':20,
        'minzoom' : 14,
        'paint':{
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-color' :"white", //"#FAF3E3",
          "circle-stroke-color" :"black", //"#FF9F29"
        }
      })
    },

    //Creates the node layer
    createNodeLayer(ref,sourceName, sourceLayer, id, my_completed_nodes){
      ref.map.addLayer({
        'id': id,
        'type':"circle",
        'source': sourceName,
        'source-layer': sourceLayer,
        'maxzoom':22,
        'minzoom' : 14,
        'paint':{
          'circle-radius': 15,
          'circle-stroke-width': 3,
          'circle-color': ["match", ["get","id"],my_completed_nodes,"transparent",'#E4455E'],
          'circle-stroke-color': ["match", ["get","id"],my_completed_nodes,"transparent",'#E4455E']
        }
      });
      ref.active_node_layer.push(sourceLayer)
    },

    clickOnWayLayer(ref, otherLayerNameList, geolocate, e){
      //First of all I check if the way can be seen or not, after that I verify if it is in the completed ones or not
      console.log(e)
      console.log(e.features) 
      if(!ref.completed_w.includes(e.features[0].properties.id)){ 
        console.log(e.features[0])
        ref.hideAllExceptOneWay(ref.map,e.features[0].properties.id, e.features[0].layer.id);
        for(var i in otherLayerNameList){
          ref.hideAllExceptOneCentered(ref.map,e.features[0].properties.id, otherLayerNameList[i]);
        }
        ref.map.flyTo({
          center: e.lngLat,
          zoom:18
        })
        var AllTags
        AllTags = ref.checkAllTags(AllTags, e.features[0].properties.tags)
        var nameTag = AllTags.name;
        var highwayType = AllTags.highway;
        if(nameTag==undefined||nameTag=="undefined"||nameTag==""){
          if(highwayType==undefined||highwayType=="undefined"){
            if(e.features[0].properties.type==undefined||e.features[0].properties.type=="undefined"){
              if(e.features[0].properties.nome == "undefined" || e.features[0].properties.nome == undefined){
                nameTag = "Strada"
              }else{
                nameTag = e.features[0].properties.nome
              }
            }else{
              nameTag = e.features[0].properties.type;
            }
          }else{
            nameTag = "Strada: " + highwayType
          }
        }
        ref.my_title = nameTag;
        ref.getMapQuestions(ref,e.features[0].properties.id, "WAY",geolocate,e,nameTag);
      }else{
        //this.createPopup("Troppo Tardi!", "Degli user hanno completato tutte le domande riguardanti questa via mentre la volevi visualizzare. La via non ha più domande associate!");
        console.log("niente da vedere qua");
      }
    },

    clickOnNodeLayer(ref,geolocate, e){
      if(!ref.completed_n.includes(e.features[0].properties.id)){
        ref.hideAll(ref,ref.map);
        ref.hideAllExceptOneNode(ref.map,e.features[0].properties.id, e.features[0].layer.id);
        ref.map.flyTo({
          center: e.lngLat,
          zoom:18
        })
        var AllTags = JSON.parse(e.features[0].properties.tags);
        var nameTag = AllTags.name;
        if(nameTag==undefined||nameTag=="undefined"){
          nameTag=e.features[0].properties.type;
          nameTag = "Punto Interesse"
        }
        ref.my_title=nameTag;
        //Getting All The Questions
        ref.getMapQuestions(ref,e.features[0].properties.id, "NODE",geolocate,e,nameTag);       
      }else{
        //this.createPopup("Troppo Tardi!", "Degli user hanno completato tutte le domande riguardanti questo punto d'interesse mentre lo volevi visualizzare. Il punto di interesse non ha più domande associate!");
        console.log("niente da vedere qua");
      }
    },

    clickOnCenterLayer(ref, way_layers, geolocate, e ){
      //Check if the way can be seen or not (if it is in the completed ones or not)
      //console.log(e.features[0])
      if(!ref.completed_w.includes(e.features[0].properties.id)){
        for(var i in way_layers){
          ref.hideAllExceptOneWay(ref.map,e.features[0].properties.id, way_layers[i]);
        }
        ref.hideAllExceptOneCentered(ref.map,e.features[0].properties.id, e.features[0].layer.id);
        ref.map.flyTo({
          center: e.lngLat,
          zoom:18
        })
        //If there's no popup I need to make it appear 
        var popup_prova = document.getElementsByClassName("maplibregl-popup");
        if(popup_prova[0]==undefined){
          //I search for the way with the same Id in order to obtain the tags too
          var allTags = e.features[0].properties;
          var nameTag = "Strada"
          if(allTags.name!=undefined && allTags.name != null && allTags.name!=""){
            nameTag = allTags.name;
          }else{
            if(allTags.nome!=undefined && allTags.nome != null && allTags.nome!=""){
              nameTag = allTags.nome;
            }else{
              if(allTags.highway!=undefined && allTags.highway != null && allTags.highway!=""){
                nameTag = "Strada: " + allTags.highway;
              }
            }
          }
          //get the questions of the clicked element
          ref.getMapQuestions(ref,e.features[0].properties.id, "WAY",geolocate,e,nameTag);
        }
      }else{
        //this.createPopup("Troppo Tardi!", "Degli user hanno completato tutte le domande riguardanti questa via mentre la volevi visualizzare. La via non ha più domande associate!");
        console.log("niente da vedere qua");
      }
    },

    clickOnUserPinsLayer(ref, e){
      ref.hideAll(ref,ref.map);
      ref.map.flyTo({
        center: e.lngLat,
        zoom:18
      })
      //console.log(e.features[0]);
      ref.description = e.features[0].properties.description;
      ref.image = e.features[0].properties.image
      ref.userPinName = e.features[0].properties.user;
      ref.my_title = "UserPin"
      ref.showPin = true;

      ref.$nextTick(()=>{
        var my_popup = new maplibre.Popup().
        setLngLat(e.lngLat).
        setDOMContent(ref.$refs.userPin.$el).
        addTo(ref.map);
        my_popup._container.style.backgroundColor = "black";
        my_popup._content.style.backgroundColor= "rgba(255,255,255,1)";
      })
    },

    clickOnCluster(ref,e){
      console.log(e.features[0]);
      var cLayer = e.features[0].layer.id;
      var cSource = e.features[0].layer.source;
      var features = ref.map.queryRenderedFeatures(e.point, {
        layers: [cLayer]
      });
      var clusterSource = ref.map.getSource(/* cluster layer data source id */cSource);
      var clusterId = e.features[0].properties.cluster_id
      //console.log(features);
      //var point_count = e.features[0].properties.point_count;
      clusterSource.getClusterExpansionZoom(
        clusterId, function(err,zoom){
          if(err){console.log(err);return;}
          ref.map.easeTo({ center: features[0].geometry.coordinates, zoom: zoom})
        }
      )
      /*clusterSource.getClusterChildren(clusterId, function(err, aFeatures){
        console.log('getClusterChildren', err, aFeatures);
      });
      clusterSource.getClusterLeaves(clusterId, point_count, 0, function(err, aFeatures){
        console.log('getClusterLeaves', err, aFeatures);
      })*/
    },

    removeAllCertainLayer(list_to_remove, ref){
      for(var i in list_to_remove){
        console.log(list_to_remove[i]);
        if(ref.map.getLayer(list_to_remove[i])){
          ref.map.removeLayer(list_to_remove[i])
        }
      }
    },

    reloadUserPins(){
      this.map.removeLayer("pins_data");
      this.map.removeSource('pins');
      var pin_user_url = this.public_path+"pbfFiles/pinUser.geojson"
      this.createGeojsonSourceNoCluster(this,"pins", pin_user_url)
      this.createUserPinsLayer(this,"pins","pins_data")
    },

    removeAllLayers(ref, way_layers, node_layers, center_layers, cluster_layers){
      ref.removeAllCertainLayer(way_layers,ref)
      ref.removeAllCertainLayer(node_layers,ref)
      ref.removeAllCertainLayer(center_layers,ref)
      ref.removeAllCertainLayer(cluster_layers, ref)
      ref.active_way_layer = []
      ref.active_center_layer = []
      ref.active_node_layer = []
      ref.cluster_active_list = []
    },

    createClusters(ref, sourceName, idCircleLayer, idTextLayer){
      //Creo i clusters
      ref.map.addLayer({
        id: idCircleLayer,
        type: 'circle',
        source: sourceName,
        filter: [">",["get","point_showed"],0],
        //filter:["all",['>',['get','point_showed'],0],[">",['get','active_city'],0]],
        //["all",['>',['get','point_showed'],0],["==",['get','city',["properties"]],cityName]], Non va perchè non riesco ad aggiungere la proprietà city.
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#6667AB',//'#51bbd6',
            50,
            "white",//'#80cc80',
            100,
            '#ECC478',//'#f1f075',
            750,
            '#E4455E',//'#f28cb1',
          ],
          'circle-opacity': [
            'step',
            ['get', 'point_count'],
            0.9,
            50, 0.7,
            100, 0.6,
            750, 0.4,
          ],////////
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            30,
            100, 40,
            750, 50
          ]
        },
        layout:{
          visibility:"visible",
        }
      });
      ref.map.addLayer({
        id: idTextLayer,
        type: 'symbol',
        source: sourceName,
        filter: [">",["get","point_showed"],0],
        layout: {
          'text-field': ['get','point_showed'],//{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });
      ref.cluster_active_list.push(idCircleLayer)
      ref.cluster_active_list.push(idTextLayer)
    },

    createPopup(title,text){
      this.$refs.tutPop.title = title;
      this.$refs.tutPop.text = text;
      this.$refs.tutPop.second=true
    },

    initializeCompleted(my_array,type){
      var my_completed = []
      for(var i in my_array){
        my_completed.push(my_array[i].id)
      }
      if(my_completed.length == 0){
        my_completed.push(0);
      }
      if(type=="way"){
        this.completed_w = my_completed;
      }else{
        this.completed_n = my_completed;
      }
    },

    createAllWayLayers(ref,wayLayerNames, completed_ways){
      var way_layers_list = [];
      for(var i=0;i<wayLayerNames.length;i++){
        ref.createLayer(ref,"my_ways",wayLayerNames[i],wayLayerNames[i],completed_ways)
        way_layers_list.push(wayLayerNames[i])
      }
      ref.way_layer_list = way_layers_list;
    },

    createAllNodeLayers(ref,nodeLayerNames,completed_nodes){
      var node_layers_list = [];
      for(var i=0;i<nodeLayerNames.length;i++){
        ref.createNodeLayer(ref,"my_nodes",nodeLayerNames[i],nodeLayerNames[i],completed_nodes)
        node_layers_list.push(nodeLayerNames[i])
      }
      ref.node_layer_list = node_layers_list
    },

    createAllClusterLayers(ref, wayLayerNames){
      var cluster_layer_list = []
      for(var i=0;i<wayLayerNames.length;i++){
        ref.createClusters(ref,wayLayerNames[i]+"-centered","clusters"+wayLayerNames[i],"cluster-count"+wayLayerNames[i])
        cluster_layer_list.push("clusters"+wayLayerNames[i])
        cluster_layer_list.push("cluster-count"+wayLayerNames[i])
      }
      ref.cluster_layer_list = cluster_layer_list;
    },

    createAllCenterLayers(ref,wayLayerNames, completed_ways){
      var center_layers_list = []
      for(var i=0;i<wayLayerNames.length;i++){
        ref.createCenterLayer(ref,wayLayerNames[i]+"-centered",wayLayerNames[i] + "Center",completed_ways, wayLayerNames[i])
        center_layers_list.push(wayLayerNames[i] + "Center")
      }
      ref.center_points_layer_list = center_layers_list
    },

    //get all the ways and nodes id with question score higher than a certain value
    async getHigherScore(_callback, score){
      try{
        var my_url = this.$api_url + "/posts/higherScore/" + score;
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
        alert("Error init HIGHER SCORE");
        console.log(e)
      }
    },

    //create all the node and ways layers with the higher scores
    createAllHighLayers(ref, higherWayList, higherNodeList, way_layer_list, node_layer_list){
      ref.createAllWayLayers(ref, way_layer_list, higherWayList);
      ref.createAllNodeLayers(ref, node_layer_list, higherNodeList);
      ref.createAllCenterLayers(ref, way_layer_list, higherWayList);
      ref.createAllClusterLayers(ref, way_layer_list);
    },

    //Add an option to see only the ways and nodes with the highest score inside the select tag
    addHighField(){
      var checkIfExist = document.getElementById("show_higher");
      if(checkIfExist==null){
        var option = document.createElement("option");
        option.setAttribute("id", "show_higher");
        var select = document.getElementById("my_layer");
        option.value = "show_higher";
        option.innerHTML = this.$gettext("showHigher");
        if(select!=null){
          select.append(option);
        }
      }else{
        return;
      }
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
  background-color: #6667AB;
}

.maplibregl-popup-content {
  background-color:white;
}

.mapboxgl-popup-content{
  background-color:white;
}
.maplibregl-popup{background-color:transparent;}
.mapboxgl-popup{background-color:transparent;} 
.maplibregl-popup-anchor-bottom{background-color:transparent;}
.mapboxgl-popup-anchor-bottom{background-color:transparent;}

.maplibregl-popup-anchor-top {background-color:transparent;}
.mapboxgl-popup-anchor-top{background-color:transparent;}

.div.maplibregl-popup.mapboxgl-popup.maplibregl-popup-anchor-bottom.mapboxgl-popup-anchor-bottom{
  background-color: transparent;
}

.map-overlay {
font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
position: absolute;
width: 200px;
top: 0;
left: 0;
padding: 10px;
}
 
.map-overlay .map-overlay-inner {
background-color: #fff;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
border-radius: 3px;
padding: 10px;
margin-bottom: 10px;
}

.map-overlay-down{
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 10px;
}

.addingPinDiv{
    z-index: 19;
    height: 100%;
    position: absolute;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    pointer-events: none
}
 
.map-overlay-inner fieldset {
border: none;
padding: 0;
margin: 0 0 10px;
}
 
.map-overlay-inner fieldset:last-child {
margin: 0;
}
 
.map-overlay-inner select {
width: 100%;
}
 
.map-overlay-inner label {
display: block;
font-weight: bold;
margin: 0 0 5px;
}
 
.map-overlay-inner button {
display: inline-block;
width: 36px;
height: 20px;
border: none;
cursor: pointer;
}
 
.map-overlay-inner button:focus {
outline: none;
}
 
.map-overlay-inner button:hover {
box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.1);
}
</style>