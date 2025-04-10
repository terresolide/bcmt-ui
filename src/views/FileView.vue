<template>
  <div style="background: rgba(0,0,0,0.2);margin:0;padding:10px;">
    <div class="station-page" >
        <h3 class="bcmtObservatory">FILES
          <span class="back" @click="close">
            &times;
          </span>
        </h3>
      <label>DataType</label>
      <select v-model="data.dataType" @change="dataTypeChange">
        <option value="">---</option>
        <option v-for="item in data.dataTypes" :value="item.value">{{item.name}}</option>
      </select>
    
      <select v-if="data.dataType" v-model="data.observedProperty" @change="observedChange">
        <option value="">---</option>
        <option  v-for="item in data.dataTypes[data.dataType].list" :value="item.frequency" >{{item.frequency}}</option>
      </select>
      <label>Sampling period</label>
      <select v-model="data.frequency" @change="frequencyChange">
        <option value="">---</option>
        <option v-for="item in data.frequencies" :value="item">{{ item }}</option>
      </select>
      <label>Sensor</label>
      <select v-model="data.sensor">
        <option value="">---</option>
        <option v-for="s in data.sensors" :value="s['@iot.id']">{{ s.name }}</option>
      </select>
      <FileComponent v-for="file in data.files" :file="file" :group="data.group"></FileComponent>
    </div>
  </div>
</template>
<script setup>
import PopupComponent from '@/components/PopupComponent.vue';
import FileComponent from '@/components/FileComponent.vue'
import {computed, ref, reactive, onBeforeMount, watch} from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useStore } from 'vuex'
const store = useStore()
const server = store.state.api
const route = useRoute()
const router = useRouter()
const data= reactive({
  id: null,
  group: null,
  feature: null,
  files: [],
  sensor: '',
  sensors: [],
  dataType: '',
  dataTypes: { },
  observedProperty: '',
  observedProperties: [],
  frequency: '',
  frequencies: []

})
function close () {
  router.push({name: 'map'})

}
function initData () {
  data.group = null
  data.feature = null
  data.files = []
  data.sensors = []
  data.observedProperties = []
  data.frequencies = []
}
function initialize () {
    getSensors()
    getFiles()
    getFrequency()
    getObservedProperties()
}

function getSensors () {
  var url = server + '/Sensors?$expand=Datastreams($top=1;$expand=Thing($filter=id eq ' + data.id + '))'
  var url = server + '/Sensors?$filter=Datastreams/@iot.id gt 0'
  fetch(url)
  .then(resp => {
        if (resp.ok) {
          return resp.json()
          } else {
            return {error : resp.status + ' - ' + resp.statusText}
          }
    })
    .then(json => {
      console.log(json)
      if (json.value) {
        console.log(json.value)
        data.sensors = json.value
        console.log(data.sensors[0])
      }
    })
}
function getFrequency () {
  var url = server + '/Datastreams?$select=distinct:properties/samplingPeriod'
  fetch(url)
  .then(resp => resp.json(), err => err)
  .then(json => {
      json.value.forEach(function (item) {
        console.log(json)
        data.frequencies.push(item.properties.samplingPeriod)
      })
  })
}
function getObservedProperties () {

  var url = server + '/ObservedProperties?$expand=Datastreams($top=1;$expand=Thing($filter=id eq ' + data.id + '))'
  var url = server + '/ObservedProperties?$filter=Datastreams/@iot.id gt 0' 
  fetch(url)
  .then(resp => {
        if (resp.ok) {
          return resp.json()
          } else {
            return {error : resp.status + ' - ' + resp.statusText}
          }
    })
    .then(json => {
      if (json.value) {
        // var observedProperties = json.value.filter(x => x.Datastreams.length > 0)
        var observedProperties = json.value
        var tab = ['variation', 'quasidefinitive', 'definitive']
        data.dataTypes = {}
        observedProperties.forEach(function (item) {
          for (var i in tab) {
            var key = tab[i]
            if (item.name.indexOf(key) >=0 ) {
              if (!data.dataTypes[key]) {
                 data.dataTypes[key] = {
                  value: key,
                  name: key,
                  list: []}
              }
              item.frequency = item.name.replace(key, '')
              data.dataTypes[key].list.push(item)
              break
            }
          }
        })
        console.log(data.dataTypes)
      }
    })
}
function getFiles () {

    // ?$filter=Sensor/@iot.id eq 2 and ObservedProperty/@iot.id eq 5
    var url = server + '/Datastreams?$top=30&$expand=Sensor,Thing/Locations&$orderBy=name desc'
    fetch(url)
    .then(resp => {
        if (resp.ok) {
          return resp.json()
          } else {
            return {error : resp.status + ' - ' + resp.statusText}
          }
    })
    .then(json => {
      if (json.value) {
        data.files = json.value
       
      }
    })
}
function dataTypeChange () {
  var query = Object.assign({}, route.query.op)
  if (!data.dataType) {
    data.observedProperty = ''
    console.log('pas de dataType')
    if (query.op) {
       delete query.op
    }
  } else {
    if (data.observedProperty) {
      var op = data.dataTypes[data.dataType].list.find(x => x.frequency === data.observedProperty)
      if (!op && query.op) {
        data.observedProperty = ''
        delete query.op
      } else {
        query.op = op['@iot.id']
      }
    } else {
      query.op = data.dataTypes[data.dataType].list.map(x => x['@iot.id']).join(',')
    }
    
  }
 // router.push({name: 'station', params: route.params.id, query: query})
}
function frequencyChange () {
  console.log(data.frequency)
}
function observedChange (e) {
  var query = Object.assign({}, route.query.op)
  if (data.observedProperty) {
      var op = data.dataTypes[data.dataType].list.find(x => x.frequency === data.observedProperty)
      query.op = op['@iot.id']
    
  } else {
    if (!op && query.op) {
        data.observedProperty = ''
        delete query.op
    }
  }
 // router.push({name: 'station', params: route.params.id, query: query})
  console.log(query)

}
onBeforeMount(() => {
   
   initialize()
 
 })

watch(route.query, () => {
  console.log('getFiles')
});
</script>
<style scoped>
.station-page {
  max-width: 900px;
  max-height: calc(100vh - 30px);
  height: 2000px;
  margin:  auto;
  background: white;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4);
  position: relative;
  padding: 0 10px 10px 10px;
  border-radius: 10px 10px 0 0;
}
.bcmtStation .file:nth-child(2n),
.bcmtObservatory .file:nth-child(2n) {
  background: #f5f0ea;
}
.intermagnetStation .file:nth-child(2n),
.intermagnetObservatory .file:nth-child(2n) {
  background: #e6ebf0;
}
</style>

