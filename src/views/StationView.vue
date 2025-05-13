<template>
  <div style="background: rgba(0,0,0,0.2);margin:0;padding:10px;">
       <div class="leaflet-touch leaflet-top leaflet-right">
        <div class="leaflet-bar leaflet-control lfh-control-basket">
          <a class="icon-palette" title="Basket">
            <svg xmlns="http://www.w3.org/2000/svg" width="30" viewBox="0 0 576 512">
              <path d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192 32 192c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463.5C91 492 116.6 512 146 512L430 512c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32l-85.6 0L365.3 12.9C359.2 1.2 344.7-3.4 332.9 2.7s-16.3 20.6-10.2 32.4L404.3 192l-232.6 0L253.3 35.1zM192 304l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16zm96-16c8.8 0 16 7.2 16 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16zm128 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16z"></path>
            </svg>
          </a>
          <div class="leaflet-basket-list">
             <BasketComponent></BasketComponent>
          </div>
        </div>
      </div>
    <div class="station-page" :class="data.group">
      <PopupComponent :group="data.group" :feature="data.feature" mode="page"></PopupComponent>
   
      <template v-if="data.selectedFile">
        <GraphComponent :file="data.selectedFile" :group="data.group" @close="data.selectedFile=null"></GraphComponent>
      </template>
      <div class="station-form" style="margin: 10px 0;">
        <div><label style="width:60px;display:inline-block;">Start</label> <input type="date" v-model="data.start" @change="paramsChange('start')"/></div>
       
        <div v-if="!data.available">
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
        <div v-else>
          <label style="width:150px;display:inline-block;">Frequency</label>
          <select v-model="data.frequency" @change="paramsChange('frequency')">
            <option value="">---</option>
            <option v-for="item, key in data.frequencies" :value="key">{{ key }}</option>
          </select>
        </div>
        <div><label>Show best available</label> <input type="checkbox" v-model="data.available" @change="paramsChange('available')"/></div>
         <div><label style="width:60px;display:inline-block;">End</label> <input type="date" v-model="data.end" @change="paramsChange('end')"/> </div>
        <div>
          <label style="width:150px;display:inline-block;">Sampling period </label>
          <select v-model="data.sampling" @change="paramsChange('sampling')">
            <option value="">---</option>
            <option v-for="item in data.samplings" :value="item">{{ item }}</option>
          </select>
        </div>
       
      </div>
      <div class="to-basket">
        <button class="bcmt-button" :class="{disabled: basketSize >= basketLimit}" @click="addListToBasket()">Add list to Basket (in:{{basketSize}} &le; max:{{basketLimit}})</button></div>
      <div class="paging">
        <span class="bcmt-button" :class="{disabled: data.paging.offset=== 0}" @click="first">&laquo;</span>
        <span class="bcmt-button" :class="{disabled: data.paging.offset=== 0}" @click="previous">&lsaquo;</span>
       Results:
       <template v-if="data.available"><b>{{ data.files.length }}</b> best available from
         <template v-if="data.lastIndex.length > 1">
            <b>{{ data.lastIndex[data.lastIndex.length - 2] + 1 }}</b> to <b>{{ data.lastIndex[data.lastIndex.length - 1]}}</b> among {{ data.total }}
         </template>
       </template>
       <template v-else>
       <b>{{ from }}</b> to <b>{{ to }}</b> 
       </template>
        &nbsp; (<select v-model="data.paging.nb" @change="pagingChange">

          <option value="30">30 per page</option>
          <option value="100">100 per page</option>
        </select>) &nbsp;
        <span class="bcmt-button" :class="{disabled: to >= data.total}" @click="next">&rsaquo;</span>
        <span class="bcmt-button" :class="{disabled: to >= data.total || data.available}" @click="last">&raquo;</span>
      </div>
      
     <template v-if="data.files.length > 0 || loading">
      <div class="header-file">
        <div>Download / Draw</div>
        <div>Dates</div>
        <div style="text-align:left;">Analysis Centre</div>
        <div>DOI</div>
        <div>Sampling</div>
        <div>License</div>
      </div>
      <template v-if="loading">
        <div style="text-align:center;margin-top:10px;">
          <span class="loader"></span>
        </div>
      </template>
    </template>
    
    <template v-else><div style="text-align:center;margin: 20px;"><em>No file found</em></div></template>
      <div ref="filesNode" style="overflow-y:scroll;" >
      
      <FileComponent v-for="file in data.files" :file="file" :group="data.group" :selected="data.selectedFile" @draw="data.selectedFile = file"></FileComponent>
      </div>
    </div>
  </div>
</template>
<script setup>
import BasketComponent from '@/components/BasketComponent.vue';
import FileComponent from '@/components/FileComponent.vue';
import GraphComponent from '@/components/GraphComponent.vue';
import PopupComponent from '@/components/PopupComponent.vue';
import { computed, onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
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
  frequencies: {},
  start: '',
  end: '',
  sampling: '',
  samplings: [],
  paging: {
    offset: 0,
    nb: 30
  },
  lastIndex: [0],
  selectedFile: null,
  resizeListener: null,
  adding: false
})
const filesNode = ref(null)
const loading = ref(false)
const from = computed(() => {return data.paging.offset + 1})
const to = computed(() => {return data.paging.offset + data.files.length})
const basketSize = computed(() => {
    return store.getters['basket/size']
})
const basketLimit = computed(() => {
    return store.getters['basket/limit']
})
window.addEventListener('resize', initSize)
function initSize () {
  if (filesNode && filesNode.value) {
    var pos = filesNode.value.getBoundingClientRect()
    filesNode.value.style.maxHeight = (window.innerHeight - pos.y + (loading.value ? 30 : -30)) + 'px'
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
  data.samplings = []
}
function addListToBasket () {
  var count = basketSize.value
  var list = []

  for (var i=0; i < data.files.length && count < basketLimit.value; i++) {
    console.log(i)
    if (!store.getters['basket/in'](data.files[i].name)) {
        list.push(store.dispatch('basket/add', data.files[i]).then(res => {return res}))
        count++
    }
  }
  return Promise.all(list).then((values) => {console.log(values)})
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
    loading.value = true
    Promise.all([getSensors(), getSamplings(), getObservedProperties()])
    .then(values => {
      initSize()
      getFiles()}
    ).catch((reason) => {
       loading.value = false
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
function  getSamplings () {
  return new Promise((resolve, reject) => {
    var url = server + '/Datastreams?$select=distinct:properties/samplingPeriod&$filter=Thing/@iot.id eq (' + data.id + ')'
    fetch(url)
    .then(resp => resp.json(), err => err)
    .then(json => {
        json.value.forEach(function (item) {
          data.samplings.push(item.properties.samplingPeriod)
          
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
                var frequency = item.name.replace(key, '')
                item.frequency = frequency
                data.dataTypes[key].list.push(item)
                if (!data.frequencies[frequency]) {
                  data.frequencies[frequency] = []
                }
                data.frequencies[frequency].push(item['@iot.id'])
                break
              }
            }
          })
          resolve(true)
        }
      })
  })
}

function getFiles () {
    data.files = []
    // ?$filter=Sensor/@iot.id eq 2 and ObservedProperty/@iot.id eq 5
    var url = server + '/Things(' + data.id + ')/Datastreams?'
    url += '$skip=' + (data.available ? data.lastIndex[data.lastIndex.length - 1] : data.paging.offset) + '&$top=' + data.paging.nb * (data.available ? 3 : 1) + '&$count=true&$expand=ObservedProperty($select=@iot.id)&$orderBy=name desc'
    var filters = []
    if (!data.available && data.dataType) {
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
    } else if (data.available && data.frequency) {
      var observed = data.frequencies[data.frequency].map(j => 'ObservedProperty/@iot.id eq ' + j)
      filters.push('(' + observed.join(' or ') + ')')
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
    if (data.sampling) {
      filters.push("properties/samplingPeriod eq '" + data.sampling +"'")
    }
    if (filters.length > 0) {
      url +='&$filter=' + filters.join(' and ')
    }
    loading.value = true
    fetch(url)
    .then(resp => {
        
        if (resp.ok) {
          return resp.json()
          } else {
            loading.value = false
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
            var count = 0
            data.files = []
            for(var key in groups) {
              count += groups[key].length
              groups[key].sort(function (a, b) {
                if (a.order < b.order ) {
                  return -1
                } else {
                  return 1
                }
              })

              data.files.push(groups[key][0])
              if (data.files.length === data.paging.nb) {
                data.lastIndex.push(data.lastIndex[data.lastIndex.length - 1] + count)
                break
              }
            }
        } else {
            data.files = json.value
        }
      }
      if (json['@iot.count']) {
        data.total = json['@iot.count']
      }
      loading.value = false
    })
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
  if (data.available) {
    if (data.lastIndex.length > 2) {
      data.lastIndex.pop()
      data.lastIndex.pop()
    } else {
      data.lastIndex = [0]
    }
  }
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
  data.lastIndex = [0]
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
      if (data.frequency === '') {
        delete query.frequency
      } else {
        query.frequency = data.frequency
      }
      data.lastIndex = [0]
      query.index = 1
      break
    case 'sampling':
        if (data.sampling) {
          query.sampling=data.sampling
        } else {
          delete query.sampling
        }
        break
    case 'available':
        data.lastIndex = [0]
        query.index = 1
        if (data.available) {
          delete query.type
          delete query.op
          query.available = data.available
          
          if (data.frequency) {
            query.frequency = data.frequency
          }
        } else {
          delete query.available
          delete query.frequency
          if (data.dataType) {
            query.type = data.dataType
          }
          if (data.observedProperty) {
            var op = data.dataTypes[data.dataType].list.find(x => x.frequency === data.observedProperty)
            if (op) {
              query.op = op.frequency
            } else {
              delete query.op
            }
          }
        }
        break
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
  window.addEventListener('resize', initSize)
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
    data.sampling = query.sampling
   }
   if (query.frequency) {
     data.frequency = query.frequency
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
   if (query.frequency) {
     data.frequency = query.frequency
   }
   if (query.available) {
    data.available = true
   }
   getFiles()
});
</script>
<style>
.loader {
  width: 48px;
  height: 48px;
  border: 5px dotted #333;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  box-sizing: border-box;
  animation: rotation 3s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
} 

.header-file {
  display: grid;
 /* grid-template-columns: 130px minmax(150px,1fr) minmax(150px,1fr) 125px minmax(150px,1fr);*/
  grid-template-columns: 130px  minmax(170px,1fr)  90px minmax(170px,1fr) 90px 110px;
  grid-gap: 5px;
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
.to-basket {
  display:inline-block;
  width: 130px;
  max-width: 130px;
}
.paging {
  display: inline-block;
  width:calc(100% - 130px);
  text-align:center;
  padding-bottom:3px;
}
button.bcmt-button,
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
button.bcmt-button {
  font-size:.9em;
  border-radius:3px;
  border:none;
  margin-bottom:2px;
}
.intermagnetObservatory button.bcmt-button,
.intermagnetStation button.bcmt-button,
.intermagnetObservatory span.bcmt-button,
.intermagnetStation span.bcmt-button {
  background:#2880ca;
}
span.bcmt-button:hover {
  opacity:1;
}
button.bcmt-button.disabled,
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

