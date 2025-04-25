<template>
  <div style="background: rgba(0,0,0,0.2);margin:0;padding:10px;">
    <div class="station-page" :class="data.group">
      <PopupComponent :group="data.group" :feature="data.feature" mode="page"></PopupComponent>
      <div class="station-form" style="margin: 10px 0;">
        <div><label style="width:60px;display:inline-block;">Start</label> <input type="date" v-model="data.start" @change="paramsChange('start')"/></div>
       
        <div>
        <label style="width:150px;display:inline-block;">Data type </label>
          <select v-model="data.dataType" @change="paramsChange('dataType')">
            <option value="">---</option>
            <option v-for="item in data.dataTypes" :value="item.value" >{{item.name}}</option>
          </select>
          <select v-if="data.dataType && data.dataTypes[data.dataType]" v-model="data.observedProperty" @change="paramsChange('observed')">
            <option value="">---</option>
            <option  v-for="item in data.dataTypes[data.dataType].list" :value="item.frequency" >{{item.frequency}}</option>
          </select>
        </div>
        <div><label>Show best available</label> <input type="checkbox" v-model="data.available" @change="paramsChange('available')"/></div>
         <div><label style="width:60px;display:inline-block;">End</label> <input type="date" v-model="data.end" @change="paramsChange('end')"/> </div>
        <div>
          <label style="width:150px;display:inline-block;">Sampling period </label>
          <select v-model="data.frequency" @change="paramsChange('frequency')">
            <option value="">---</option>
            <option v-for="item in data.frequencies" :value="item">{{ item }}</option>
          </select>
        </div>
       
      </div>
      <div class="paging">
        <span class="bcmt-button" :class="{disabled: data.paging.offset=== 0}" @click="first">&laquo;</span>
        <span class="bcmt-button" :class="{disabled: data.paging.offset=== 0}" @click="previous">&lsaquo;</span>
       Results: <b>{{ from }}</b> to <b>{{ to }}</b> among {{ data.total }}
        &nbsp; (<select v-model="data.paging.nb" @change="pagingChange">

          <option value="30">30 per page</option>
          <option value="100">100 per page</option>
        </select>) &nbsp;
        <span class="bcmt-button" :class="{disabled: to >= data.total}" @click="next">&rsaquo;</span>
        <span class="bcmt-button" :class="{disabled: to >= data.total}" @click="last">&raquo;</span>
      </div>
     <template v-if="data.files.length > 0">
      <div class="header-file">
        <div>Download / Draw</div>
        <div>Analysis Centre</div>
        <div>DOI</div>
        <div>Sampling period</div>
        <div>License</div>
      </div>
    </template>
    <template v-else><div style="text-align:center;margin: 20px;"><em>No file found</em></div></template>
      <div ref="filesNode" style="overflow-y:scroll;" >
        
      <FileComponent v-for="file in data.files" :file="file" :group="data.group"></FileComponent>
      </div>
    </div>
  </div>
</template>
<script setup>
import PopupComponent from '@/components/PopupComponent.vue';
import FileComponent from '@/components/FileComponent.vue'
import {computed, ref, reactive, onBeforeMount, onBeforeUnmount, watch} from 'vue'
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
  total: null,
  files: [],
  sensor: '',
  sensors: [],
  dataType: '',
  dataTypes: { },
  observedProperty: '',
  observedProperties: [],
  frequency: '',
  start: '',
  end: '',
  frequencies: [],
  paging: {
    offset: 0,
    nb: 30
  }
})
const filesNode = ref(null)
const from = computed(() => {return data.paging.offset + 1})
const to = computed(() => {return data.paging.offset + data.files.length})
window.addEventListener('resize', initSize)
function initSize () {
  if (filesNode && filesNode.value) {
    var pos = filesNode.value.getBoundingClientRect()
    filesNode.value.style.maxHeight = (window.innerHeight - pos.y - 30) + 'px'
  }
}
function initData () {
  data.id = null
  data.group = null
  data.feature = null
  data.total = null
  data.files = []
  data.sensors = []
  data.observedProperties = []
  data.frequencies = []
}
function getStation () {
  // init params
  
  initData()
  data.id = route.params.id ? route.params.id : null 
  var mode = 'int'
  if (isNaN((parseInt(data.id)))) {
    mode = 'string'
    var url = server + "/Things?$filter=name eq '" + data.id.toUpperCase() + "'&$expand=Locations($top=1)"
  } else {
    var url = server + '/Things(' + data.id + ')?$expand=Locations($top=1)'
  }
	fetch(url)
  .then(resp => {
    if (resp.ok) {
      return resp.json()
      } else {
        return {error : resp.status + ' - ' + resp.statusText}
      }
  })
  .then(station => {
    if (mode === 'string') {
      if (station.value.length === 0) {
      // not found
      } else {
        station = station.value[0]
        data.id = station['@iot.id']
      }
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
    data.group = group
    data.feature = json
    Promise.all([getSensors(), getFrequency(), getObservedProperties()])
    .then(values => {
      initSize()
      getFiles()}
    ).catch((reason) => {
       console.log(reason);
    })
  })
}
function getSensors () {
  return  new Promise((resolve, reject) => {
    var url = server + '/Sensors?$expand=Datastreams($top=1;$expand=Thing($filter=id eq ' + data.id + '))'
    var url = server + '/Sensors?$filter=Datastreams/Thing/@iot.id eq ' + data.id 
    fetch(url)
    .then(resp => {
          if (resp.ok) {
            return resp.json()
            } else {
              reject()
              return {error : resp.status + ' - ' + resp.statusText}
            }
      })
      .then(json => {
        if (json.value) {
          data.sensors = json.value
          resolve(true)
        }
      })
  })
}
function  getFrequency () {
  return new Promise((resolve, reject) => {
    var url = server + '/Datastreams?$select=distinct:properties/samplingPeriod&$filter=Thing/@iot.id eq (' + data.id + ')'
    fetch(url)
    .then(resp => resp.json(), err => err)
    .then(json => {
        json.value.forEach(function (item) {
          data.frequencies.push(item.properties.samplingPeriod)
          
        })
        resolve(true)
    })
  })
}
function getObservedProperties () {
  return new Promise ((resolve, reject) => {
    var url = server + '/ObservedProperties?$select=id,name&$filter=Datastreams/Thing/@iot.id eq ' + data.id 
    // var url = server + '/ObservedProperties'
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
          data.observedProperties = json.value
          var tab = ['variation', 'quasidefinitive', 'definitive']
          data.dataTypes = {}
          data.observedProperties.forEach(function (item, index) {
            for (var i in tab) {
              var key = tab[i]
              data.observedProperties[index].order = 3 - i
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
            console.log(data.observedProperties)
          })
          
          resolve(true)
        }
      })
  })
}
function getFiles () {

    // ?$filter=Sensor/@iot.id eq 2 and ObservedProperty/@iot.id eq 5
    var url = server + '/Things(' + data.id + ')/Datastreams?'
    url += '$skip=' + data.paging.offset + '&$top=' + data.paging.nb + '&$count=true&$expand=ObservedProperty($select=@iot.id)&$orderBy=name desc'
    var filters = []
    if (data.dataType) {
      if (data.observedProperty) {
        // verification
        var find = data.dataTypes[data.dataType].list.find(x => x.frequency === data.observedProperty)
        if (find) {
          filters.push('ObservedProperty/@iot.id eq ' + find['@iot.id'])
          
        } else {
          data.observedProperty = ''
        }
      } else if (data.dataTypes[data.dataType]) {
        var observed = data.dataTypes[data.dataType].list.map(x => 'ObservedProperty/@iot.id eq ' + x['@iot.id'])
        if (observed.length > 0) {
          filters.push('(' + observed.join(' or ') + ')')
        }
      }
    }
    if (data.start) {
      filters.push('properties/end ge \'' + data.start + 'T00:00:00Z\'')
    }
    if (data.end) {
      filters.push('properties/start le \'' + data.end + 'T23:59:59Z\'')
    }
    if (data.sensor) {
      filters.push('Sensor/@iot.id eq ' + data.sensor)
    }
    if (data.frequency) {
      filters.push("properties/samplingPeriod eq '" + data.frequency +"'")
    }
    if (filters.length > 0) {
      url +='&$filter=' + filters.join(' and ')
    }
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
        
        if (data.available) {
            // group by date and min or sec or hour or day
            var groups = {}
            var regex = /^[a-z]{3}([0-9]{8})[^\.]*\.([a-z]+)$/
            json.value.forEach((ds) => {
                console.log(ds.name)
                var matches = ds.name.match(regex)
                if (matches) {
                  var obs = data.observedProperties.find(obs => obs['@iot.id'] === ds.ObservedProperty['@iot.id'])
                  ds.order = obs.order
                  var key = matches[1]+matches[2]
                  if (!groups[key]) {
                      
                      groups[key] = [ds]
                  } else {
                      groups[key].push(ds)
                  }
                }
            })
            data.files = []
            for(var key in groups) {
              groups[key].sort(function (a, b) {
                if (a.order < b.order ) {
                  return -1
                } else {
                  return 1
                }
              })
              data.files.push(groups[key][0])
            }
        } else {
            data.files = json.value
        }
      }
      if (json['@iot.count']) {
        data.total = json['@iot.count']
      }
    })
}
function computeOrder (datastream) {
  
}
function next () {
  var query = Object.assign({}, route.query)
  query.index = to.value + 1
  query.nb = data.paging.nb
  changeRoute(query)
}
function previous () {
  var query = Object.assign({}, route.query)
  var index = from.value - data.paging.nb 
  query.index = index > 0 ? index : 1
  query.nb = data.paging.nb
  changeRoute(query)
}
function last () {
  var query = Object.assign({}, route.query)
  var nbpage = Math.floor(data.total / data.paging.nb) + (data.total % data.paging.nb === 0 ? 1 : 0)
  query.index = nbpage * data.paging.nb + 1
  query.nb = data.paging.nb
  changeRoute(query)

}
function first () {
  var query = Object.assign({}, route.query)
  query.index = 1
  query.nb = data.paging.nb
  changeRoute(query)
}
function changeRoute (query) {
  router.push({name: route.name, params: route.params, query: query})
}
function pagingChange () {
  var query = Object.assign({}, route.query)
  query.nb = data.paging.nb
  changeRoute(query)
 // router.push({name: route.name, params: route.params, query: query})
}
function paramsChange (param) {
  var query = Object.assign({}, route.query)
  
  switch (param) {
    case 'start':
      if (data.start == '') {
        delete query.start
      } else {
        query.start = data.start
      }
    break
    case 'end':
      if (data.end == '') {
        delete query.end
      } else {
        query.end = data.end
      }
    break
    case 'dataType':
      if (data.dataType === '') {
        delete query.type
        delete query.op
      } else {
        query.type = data.dataType
        if (data.observedProperty !== '') {
          var find = data.dataTypes[data.dataType].list.find(x => x.frequency === data.observedProperty)
          if (!find) {
            delete query.op
          } else {
            query.op = find.frequency
          }
        } 
      }
      break
      case 'observed':
        if (data.observedProperty !== '') {
            var op = data.dataTypes[data.dataType].list.find(x => x.frequency === data.observedProperty)
            if (op) {
              query.op = op.frequency
            } else {
              delete query.op
            }
          
        } else {
              data.observedProperty = ''
              delete query.op
        }
        break;
      case 'frequency':
        if (data.frequency) {
          query.sampling=data.frequency
        } else {
          delete query.sampling
        }
        break
      case 'available':
          if (data.available) {
              query.available = data.available
          } else {
              delete query.available
          }
      case 'sensor':
        if (data.sensor) {
          query.sensor = data.sensor
        } else {
          delete query.sensor
        }
        break
  }
  changeRoute(query)
}
onBeforeMount(() => {
   var query = route.query
   if (query.nb) {
    data.paging.nb = parseInt(query.nb)
   }
   if (query.index) {
    data.paging.offset = parseInt(query.index) - 1
   }
   if (query.type) {
     data.dataType = query.type
   }
   if (query.op) {
    // verification de cohérence avec dataType
      data.observedProperty = query.op
   }
   // if (query.sensor) {
   //  data.sensor = parseInt(query.sensor)
   // }
   if (query.sampling) {
    data.frequency = query.sampling
   }
   if (query.available) {
       data.available = true
    }
    if (query.start) {
      data.start = query.start
    }
    if (query.end) {
      data.end = query.end
    }
   getStation()
 
 })
 onBeforeUnmount(() => {
  window.removeEventListener('resize', initSize)
 })
 watch( () => route.params.id,
  id => {
    getStation()
 });
 watch( () => route.query,
  query => {
   if (query.nb) {
    data.paging.nb = parseInt(query.nb)
   }
   if (query.index) {
    data.paging.offset = parseInt(query.index) - 1
   }
   if (query.type) {
     data.dataType = query.type
   }
   if (query.op) {
    data.observedProperty = query.op
   }
   if (query.sensor) {
    data.sensor = query.sensor
   }
   if (query.start) {
    data.start = query.start
   }
   if (query.end) {
    data.end = query.end
   }
   if (query.available) {
    data.available = true
   }
   getFiles()
});
</script>
<style scoped>
.header-file {
  display: grid;
 /* grid-template-columns: 130px minmax(150px,1fr) minmax(150px,1fr) 125px minmax(150px,1fr);*/
  grid-template-columns: 130px 90px minmax(140px,1fr) 90px minmax(140px, 1fr);
  grid-gap: px;
  line-height:1;
  grid-template-rows: auto; 
  padding: 5px;
  background: lightgrey;
  font-weight:600;

  /*grid-auto-rows: minmax(100px, auto);*/
  font-size:0.9rem;
  
  border:1px solid grey;
}
.station-form {
  display: grid;
 /* grid-template-columns: 100px minmax(150px,1fr) minmax(150px,1fr) 125px minmax(150px,1fr);*/
  grid-template-columns: 0.65fr 1fr  0.65fr;
  grid-gap: 5px;
  line-height:1;
  grid-template-rows: 18px 18px; 
  /*grid-auto-rows: minmax(100px, auto);*/
  padding:10px 0;
}
label {
    font-weight:700;
    color: #333;
}
.paging {
  text-align:center;
  padding-bottom:3px;
  border-bottom: 1px dotted grey;
}
span.bcmt-button {
  font-size: 1.2em;
  cursor: pointer;
  margin: 0 1px;
  padding: 5px;
  cursor: pointer;
  border-radius: 3px;
  background: #cc852a;
  padding: 2px 5px;
  color: white;
  vertical-align: middle;
  opacity: 0.9;
}
.intermagnetObservatory span.bcmt-button,
.intermagnetStation span.bcmt-button {
  background:#2880ca;
}
span.bcmt-button:hover {
  opacity:1;
}
span.bcmt-button.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
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

