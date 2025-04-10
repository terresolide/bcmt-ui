<template>
  <div class="popup" v-if="feature">
    <h3 :class="group">{{feature.properties.name}}
      <span class="back" @click="close">
        &times;
      </span>
    </h3>
    <div class="status" :class="statusToClass(status)" :title="status.key"></div>
    <div class="popup-content" :class="{mult: contacts && contacts.length > 1}">
        <div style="float:left;" :style="{width: mode === 'page' ? '90px': '150px'}">
        <img :src="image" :width="mode === 'page' ? 90 : 140" style="margin: 0 5px 5px 0;"/>
        <div v-if="mode === 'page' && intermagnet" style="width:90px;display:inline-block;vertical-align:top;text-align:center;padding-bottom:5px;font-size:9px;">
            <template v-if="intermagnet==='true'">
            <a href="https://intermagnet.org/" target="_blank">
              INTERMAGNET
            </a>
          </template>
           <template v-else-if="intermagnet && intermagnet==='closed'">Ex Intermagnet</template>
          </div>
        </div>
        <div>
          <div v-if="mode === 'popup' && intermagnet && intermagnet!=='false'" style="width:120px;display:inline-block;vertical-align:top;text-align:center;padding-bottom:5px;font-size:9px;">
            <template v-if="intermagnet === 'true'"> 
              <a href="https://intermagnet.org/" target="_blank">
                <img src="../assets/images/intermagnet-logo.png" width="30"> <br>
                INTERMAGNET
              </a>
            </template>
            <template v-else-if="intermagnet === 'closed'">Ex intermagnet</template>
          </div>
          <div><label>Lat: </label>{{feature.geometry.coordinates[1].toLocaleString()}}°</div>
          <div><label>Lng: </label>{{feature.geometry.coordinates[0].toLocaleString()}}°</div>
          <div><label>Elevation: </label>{{(feature.properties.elevation || feature.properties.Elevation)}} m</div>
          <div><label>Orientation: </label>{{(feature.properties.orientation || feature.properties.Orientation)}}</div>
          <div><label>Status: </label>{{(status.key)}}</div>
          <div v-if="status.started"><label>Started: </label>{{ date2lang(status.started)}}</div>
        </div>
        <div v-if="mode === 'popup'" style="clear:both;"></div>
        <div>
          <div><label>Page: </label><a :href="feature.properties.informations || feature.properties.Informations" target="_blanck">{{ feature.properties.name }} {{ feature.properties.type }}</a></div>
          <div v-if="institutions" class="institutions">
              <label>{{ institutions.length < 2 ? 'Institution': 'Institutions'}}: </label>
              <ul>
                  <li v-for="item in institutions">{{ item.institution || item.Institution }}</li>
              </ul>
          </div>
        </div>
        <div>
          <template v-if="contacts && contacts.length > 0">
            <label>{{ contacts.length < 2 ? 'Contact' : 'Contacts' }}</label>
            <ul class="contacts">
              <li v-for="item in contacts" v-html="item"></li>
            </ul>
          </template>
          <div v-if="mode === 'popup'"><RouterLink :to="{name: 'station', params: {id: feature.id }}" >See data</RouterLink></div>
        </div>
      </div>   
  </div>
</template>
<script setup>
import {RouterLink , useRouter} from 'vue-router'
import {computed} from 'vue'
import moment from 'moment'
const {group, feature, mode } = defineProps({
  group: String,
  feature: Object,
  mode: 'popup'
})
const router = useRouter()
const image = computed(() =>  new URL('../assets/quicklooks/' + feature.properties.name + '.jpg', import.meta.url).href)
const intermagnet = computed(() =>  feature.properties.intermagnet || feature.properties.Intermagnet)
const institutions = computed(() => feature.properties.institutions || feature.properties.Institutions)
const status = computed(() => feature.properties.status || feature.properties.Status)
const contacts = computed(() => {
    var contacts = feature.properties.contacts || feature.properties.Contacts
    var returned = []
    if (contacts) {
        contacts.forEach(function (item) {
            var ct = []
            ct.push('<b>' + item.contact + '</b>')
            if (item.adresse) {
              var tabs = item.adresse.split('-')
              tabs.forEach(x => {ct.push(x)})
            }
            if (item.email) {
                ct.push(item.email)
            }
            returned.push(ct.join('<br />'))
        })
    }
    return returned
})
function close () {
    if (mode === 'page') {
      router.push({name: 'map', query: {id: feature.id}})
    } else {
      router.push({name: 'map'})
    }
  
}
function statusToClass(status) {

    switch(status.key) {
      case 'In activity':
        return 'status-open'
      default:
        return 'status-closed'
    }

}
function date2lang (date) {
    if (date.length === 10) {
      return moment(date, 'YYYY-MM-DD').format('ll')
    } else {
      return date
    }
}
</script>
<style>
.popup-content {
  line-height: 1.1;
}
.popup-content label {
  font-weight:700;
}
.popup-content ul {
  padding: 0px 0px 3px 20px;
  margin: 0;
}

.station-page .popup-content {
  display: grid;
 /* grid-template-columns: 100px minmax(150px,1fr) minmax(150px,1fr) 125px minmax(150px,1fr);*/
  grid-template-columns: 90px 150px minmax(140px,1fr)  minmax(100px, 1fr);
  grid-gap: 5px;
  line-height:1.1;
 /* grid-template-rows: 110px; */
  grid-auto-rows: minmax(110px, auto);
  font-size: 12px;
  border-bottom: 1px dotted grey;
  margin-bottom: 10px;
}
.station-page .popup-content.mult {
  grid-template-columns: 90px 150px minmax(140px,1fr)  minmax(200px, 2fr);
}
.station-page .popup-content .institutions {
  margin-top:4px;
}
.station-page .popup-content.mult ul.contacts li {
  display: inline-block;
  width: 50%;
  vertical-align:top;
}
  span.back {
  position:absolute;right:16px;
  cursor: pointer;
}
span.back a {
  text-decoration:none;
  color:white;
  
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
.station-page .popup {
  font-size: 0.8rem;
}
</style>