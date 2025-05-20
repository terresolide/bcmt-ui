<template>
  <div class="about">
    <div ref="map" id="map" style="width:100%;" :style="{height: height + 'px'}">
      </div>
  </div>
  <div ref="popup" v-show="data.selected.feature">
  <PopupComponent :group="data.selected.group" :feature="data.selected.feature" mode="popup"></PopupComponent>
  </div>
  <div ref="basket">
  <BasketComponent></BasketComponent>
  </div>
  </template>
  <script setup>
  import L from 'leaflet'
  import iconBlue from '@/assets/images/marker-icon-blue.png'
  import iconOrange from '@/assets/images/marker-icon-orange.png'
  import iconShadow from '@/assets/images/marker-shadow.png'
  import bcmtFavicon from '@/assets/images/bcmt.png'
  import formaterreFavicon from '@/assets/images/favicon-96x96.png'
  // import stations from '@/data/Things-locations.json'
  import PopupComponent from './PopupComponent.vue'
  import '@/leaflet/leaflet.control.mylayers.js'
  import '@/leaflet/leaflet.control.logo.js'
  import '@/leaflet/leaflet.control.basket.js'
  import BasketComponent from './BasketComponent.vue'
  import {reactive, ref, onMounted, watch} from 'vue'
  import { useStore } from 'vuex'
  import {useRoute, useRouter} from 'vue-router'
  const map = ref(null)
  const popup = ref(null)
  const basket = ref(null)
  const store = useStore()
  const server = store.state.api
  const props = defineProps({
	height: {
        type: Number,
        default: 500
    }
  }) 
  const route = useRoute()
  const router = useRouter()
  const data = reactive({
      map: null,
      layers: {},
      bounds: null,
      popup: null,
      selected: {group: null, feature: null},
      stations: {
        bcmtObservatory: null,
        intermagnetObservatory: null,
        bcmtStation: null,
        intermagnetStation: null
      }
  })
  // EN ATTENDANT
  // const quicklook = {
  //   CLF: 'http://www.bcmt.fr/images/clfnormal.jpg',
  //   CMF: 'http://www.bcmt.fr/images/cmfsmall.jpg',
  //   REU: 'http://www.bcmt.fr/images/REUnormal.png',
  //   VLJ: 'http://www.bcmt.fr/images/vljnormal.jpg',
  //   PSM: 'http://www.bcmt.fr/images/psmnormal.jpg'
  // }
  /* const bcmtStIcon = new L.Icon({
      iconUrl: iconOrange,
      shadowUrl: iconShadow,
      iconSize: [20, 33],
      iconAnchor: [10, 33],
      popupAnchor: [1, -27],
      shadowSize: [33, 33]
  }); */
  
  const markerSvg = '<svg height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>'
  const bcmtStIcon = L.divIcon({
    className: 'icon-orange', 
    iconSize: [15,15],
    html: '<span></span>'
  })
  const bcmtIcon = new L.Icon({
      iconUrl: iconOrange,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });
  const intermagnetIcon = new L.Icon({
      iconUrl: iconBlue,
      shadowUrl: iconShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
  });
  // const intermagnetStIcon = new L.Icon({
  //     iconUrl: iconBlue,
  //     shadowUrl: iconShadow,
  //     iconSize: [20, 33],
  //     iconAnchor: [10, 33],
  //     popupAnchor: [1, -27],
  //     shadowSize: [33, 33]
  // });
  const intermagnetStIcon = L.divIcon({
    className: 'icon-blue', 
    iconSize: [15,15],
    html: '<span></span>'
  })
  const icons = {
    bcmtObservatory: bcmtIcon,
    intermagnetObservatory: intermagnetIcon,
    bcmtStation: bcmtStIcon,
    intermagnetStation: intermagnetStIcon
  }
  function openPopup() {
    if (route.name !== 'map') {
      return
    }
    if (route.query && route.query.id) {
      var find = null
      for(var group in data.stations) {
        if (data.stations[group]) {
          find = data.stations[group].features.find(f => f.id === parseInt(route.query.id))
          if (find) {
            data.selected.group = group
            data.selected.feature = find
            var coord = find.geometry.coordinates
            data.popup.setLatLng([coord[1], coord[0]])
            var offset = [0, 7]
            if (group.indexOf('Observatory') > 0) {
              var offset = [0, -20]
            }
            data.popup.options.offset = offset
            data.popup.openOn(data.map)
          }
        }
      }
    } else {
      data.selected = {group: null, feature: null}
      data.popup.close()
    }
  }
  function initMap () {
      if (data.map) {
         return;
      }
      var container = map.value
      data.map = L.map( container).setView([35, 0], 3);
      data.basketLayer = new L.Control.Basket(basket.value);
      L.DomEvent.disableScrollPropagation(basket.value);
      data.controlLayer = new L.Control.MyLayers(null, null,{position: 'topright'})
      data.basketLayer.addTo(data.map)
      data.controlLayer.tiles.arcgisTopo.layer.addTo(data.map)    
      data.controlLayer.addTo(data.map)
      L.control.scale().addTo(data.map)
      var logo = new L.Control.logo(store.state.logo, store.state.logo === 'bcmt' ? bcmtFavicon : formaterreFavicon)
      logo.addTo(data.map)
      
      data.popup = L.popup({
        autoPan:true, 
        offset: [0,-20],
        minWidth: 300, 
        autoPanPaddingTopLeft: [0,0], 
        closeButton: false
      })
      data.popup.setContent(popup.value)
      // data.map.whenReady(function (e) {
      //    setTimeout(scrollTop,1000)
      // })
      data.map.on('click', function (e) {
        router.push({name: 'map'})
      })
      getStations()
   }
  function getStations () {
    //   displayStations(stations)
    //   return
      var url = server + '/Things?$expand=Locations($top=1)'
      fetch(url)
      .then(resp => resp.json())
      .then(json => {
          data.map.invalidateSize()
          displayStations(json)
          // 
          scrollTop()
      })
      .catch(err => {
           data.map.invalidateSize()
           scrollTop()
      })
  }
  function addStation(station) {
    if (!station.Locations[0]) {
      console.log('no location for ' + station.name)
      console.log(station['@iot.id'])
      return
    }
    var group = 'bcmt'
    var x = station.properties.Intermagnet || station.properties.intermagnet
    if (x && x === "true" ) {
       group = 'intermagnet'
    }
    if (station.properties.Type === "Observatory" ||
        station.properties.type === 'Observatory'
    ) {
       group +=  'Observatory'
    } else {
        group += 'Station'
    }
    if (!data.stations[group]) {
        data.stations[group] = {
            type: 'FeatureCollection',
            features: []
        }
    }
    if (station.Locations[0].location.type === 'Feature') {
      var json = station.Locations[0].location
    } else {
      var json = {type: 'Feature'}
      json.geometry = station.Locations[0].location
    }
    json.id = station['@iot.id']
    json.properties =  station.properties
    json.properties.name = station.name
    json.properties.description = station.description
    data.stations[group].features.push(json)
  }


 
  function groupName(group) {
    switch(group) {
      case 'bcmtObservatory':
        return 'BCMT Observatories'
      case 'bcmtStation':
        return 'BCMT Stations'
      case 'intermagnetObservatory':
        return 'INTERMAGNET Observatories'
      case 'intermagnetStation':
        return 'INTERMAGNET Stations'
    }
  }
  function addGroupLayer (group) {
    if (data.stations[group]) {
      
      data.layers[group] = L.geoJSON(data.stations[group], {
          pointToLayer: function (feature, latlng) {
              return L.marker(latlng, {title: feature.properties.name, icon: icons[group]})
          } 
      }).addTo(data.map);
      data.layers[group].on('click', function (e) {
        if (e.layer && e.layer.feature) {
          if (data.selected.feature && data.selected.feature.id === e.layer.feature.id) {
            data.selected = {group: null, feature: null}
            router.push({name: 'map'})
          } else {
            router.push({name: 'map', query: {id: e.layer.feature.id}})
          }
          // data.selected = {
          //   group: group,
          //   feature: e.layer.feature
          // }
        }
        // if (data.selected.feature)
        // router.push(name: 'map', query: {id: e.})
        // data.popup.options.offset = offset
        // data.popup.setLatLng(e.latlng)
        // data.popup.openOn(data.map)
      })
      console.log(group)
       if (!data.bounds) {
         data.bounds = data.layers[group].getBounds()
       }  else {
        data.bounds.extend(data.layers[group].getBounds())
      }
      if (group === 'bcmtStation' || group === 'intermagnetStation') {
        data.controlLayer.addOverlay(data.layers[group], '<span class="' + group + '"> </span>' + groupName(group))
      } else {
        data.controlLayer.addOverlay(data.layers[group], '<span class="svg-' + group + '"> ' + markerSvg  + '<span> ' + groupName(group))
      }
    }
  }
  function displayStations (json) {
      json.value.forEach(function(st) {
        addStation(st)
      })
      for (var group in data.stations) {
        addGroupLayer(group)
      }
      data.layers['intermagnetObservatory'].bringToFront()
      data.layers['bcmtObservatory'].bringToFront()
      if (data.bounds) {
        data.map.fitBounds([[-75, -170], [65, 170]])
        //data.map.fitWorld()
      }
      openPopup()
     
      return
     
  }
  function scrollTop() {
      console.log('scroll top')
      var top = document.querySelector('#app')
   
      if (top) {
            top.scrollIntoView({ behavior: 'smooth' });
      }
  }
  watch( () => props.height, (height) => {
    if (data.map) {
	    data.map.invalidateSize()
        // scrollTop()
    }
  })
  watch(route, () => {
   
      openPopup(route)
  });
  onMounted(() => {
        initMap()
   })
  </script>
  <style src='leaflet/dist/leaflet.css' />
  <style >
  div[id="map"] {
      position:relative;
      height:500px;
      width:100%;
  }
  .leaflet-bottom.leaflet-left div.leaflet-control {
      float: none;
      display:inline-block;
      vertical-align:middle;
      border:none;
  }
 .leaflet-bottom.leaflet-left div.leaflet-control.logo-control a {
      width:120px;
      background-color:transparent;
      margin-right:5px;
  } 
 .leaflet-bottom.leaflet-left div.leaflet-control.logo-control a.bcmt-logo {
     background-color:rgba(255,255,255,0.5);
     height:35px;
 }
.leaflet-bottom.leaflet-left div.leaflet-control.logo-control img {
      width:35px;
      display:inline-block;
      vertical-align:middle;
      background-color:transparent;
  } 
.leaflet-bottom.leaflet-left div.leaflet-control.logo-control span {
      max-width:calc(100% - 40px);
      display:inline-block;
      vertical-align:middle;
      line-height:1;
  }   
 .lfh-control-basket a {
  width: 30px;
  height: 30px;
  padding: 7px;
 } 
 .lfh-control-basket a path {
  fill: #333;
 }  
 .lfh-control-basket {
  background: white;
 }
 .lfh-control-basket div.leaflet-basket-list {
  display:none;
 }
 .lfh-control-basket:hover > a {
    display:none;
 }
 .lfh-control-basket:hover div.leaflet-basket-list {
  min-height:50px;
  display:block;
 }
  div.icon-orange span,
  div.icon-blue span {
  color: white;
  width: 13px;
  height: 13px;
  font-size:8px;
  display: inline-block;
  border: 1px solid grey;
  border-radius:3px;
  text-align:center;
  font-family:Arial;
  /*background: #C45200;*/
}
.leaflet-popup-content {
  margin: 0px 10px 13px 10px;
  line-height: 1.3;
  font-size: 13px;
  font-size: 1.08333em;
  min-height: 200px;
}
.leaflet-popup-content label {
    font-weight:700;
}
h3.bcmtStation,
h3.bcmtObservatory,
h3.intermagnetStation,
h3.intermagnetObservatory{
    margin: -1px -11px 10px -11px;
    padding: 5px 5px 5px 10px;
    color: white;
    background: #cc852a;
    border-radius: 12px 12px 0 0;
}
span.bcmtStation,
span.bcmtObservatory,
span.intermagnetStation,
span.intermagnetObservatory{
  display: inline-block;
  vertical-align: middle;
  width:8px;
  height:8px;
  margin-right:3px;
  border:1px solid grey;
}
h3.bcmtStation,
h3.bcmtObservatory,
span.bcmtStation,
span.bcmtObservatory,
div.icon-orange
{
    background: #cc852a;
}
span.svg-bcmtObservatory path {
  fill: #cc852a;
  stroke: grey;
}
h3.intermagnetStation,
h3.intermagnetObservatory,
span.intermagnetStation,
span.intermagnetObservatory, 
div.icon-blue{
    background: #2880ca;
}
span.svg-intermagnetObservatory path {
  fill: #2880ca;
}
.leaflet-popup-content ul {
  margin: 0;
  padding-left:15px;
}
.leaflet-container a.leaflet-popup-close-button{
  color: #Fafafa;
}
.leaflet-container a.leaflet-popup-close-button:hover{
  color: #FFFFFF;
  font-weight:700;
}
.status {
  float: right;
  width: 20px;
  height:20px;
   border-radius: 20px;
   line-height:20px;
   border: 1px solid black;

}
.status-open{
  background:radial-gradient(circle at 30%, #00FF00, #008000);
}
.status-closed{
  background:radial-gradient(circle at 30%, #FF0000, #800000);
}
.status-maintenance{
  background:radial-gradient(circle at 30%, #FFA500, #FF5733);
}
  </style>
  