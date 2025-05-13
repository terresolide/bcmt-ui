<template>
   <div  class="file" :class="group">
      <div class="download"><a @click="download()" title="Download" style="cursor:pointer;" :class="{visited: visited}">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" viewBox="0 0 384 512">
         <path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-288-128 0c-17.7 0-32-14.3-32-32L224 0 64 0zM256 0l0 128 128 0L256 0zM216 232l0 102.1 31-31c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-72 72c-9.4 9.4-24.6 9.4-33.9 0l-72-72c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l31 31L168 232c0-13.3 10.7-24 24-24s24 10.7 24 24z"/></svg>   </a>
       <a title="add to zip" style="margin-left:10px;" @click="toggleFile">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" viewBox="0 0 576 512"><path d="M253.3 35.1c6.1-11.8 1.5-26.3-10.2-32.4s-26.3-1.5-32.4 10.2L117.6 192 32 192c-17.7 0-32 14.3-32 32s14.3 32 32 32L83.9 463.5C91 492 116.6 512 146 512L430 512c29.4 0 55-20 62.1-48.5L544 256c17.7 0 32-14.3 32-32s-14.3-32-32-32l-85.6 0L365.3 12.9C359.2 1.2 344.7-3.4 332.9 2.7s-16.3 20.6-10.2 32.4L404.3 192l-232.6 0L253.3 35.1zM192 304l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16zm96-16c8.8 0 16 7.2 16 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16zm128 16l0 96c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-96c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>  <template v-if="inBasket"> - </template>
           <template v-else> + </template>
        </a>
       <div class="draw" title="Draw" @click="$emit('draw')"><svg data-name="Layer 1" width="12" height="12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="m.64 11.85-.66-.75 2.57-2.25 2.02 1.55 4.68-5.15 3.72 3.59 2.4-2.05.65.75-3.08 2.66-3.65-3.52-4.6 5.08-2.1-1.62-1.95 1.71z"/></svg>
       </div>
      </div>
      <div class="title">{{ file.name }}</div>
      <div class="dates">{{ start }}
        <template v-if="file.properties.samplingPeriod !== 'daily'">
            <span class="arrow" :class="group">&rarr;</span> {{ end }}
        </template>
      </div>
      <div class="center">{{ file.properties.analysisCentre }}</div>
      <div class="doi">
        <a v-if="file.properties.doi" :href="'https://doi.org/' + file.properties.doi" target="_blank">DOI: {{ file.properties.doi }}</a>
      </div>
      <div class="sampling">{{extension}}, {{ file.properties.samplingPeriod }}</div>
      <div class="license">
        <template v-if="file.properties.license">
            <template v-if="file.properties.licenseTerms">
               <a :href="file.properties.licenseTerms" target="_blank">{{ file.properties.license }}</a>
            </template>
        </template>
      </div>
    </div>
</template>
<script setup>
import { saveAs } from 'file-saver';
import moment from 'moment';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
const {file} = defineProps({file: Object, group: String})
const extension = computed(() => {
    var matches = /[^\.]*\.([^.]*)$/.exec(file.name)
    if (matches.length > 1) {
        return matches[1]
    }
    return ''
})
const store = useStore()
const start = computed(() => {
    return moment(file.properties.start).format('ll')
})
const end = computed(() => {
    return moment(file.properties.end).format('ll')
})
const inBasket = computed(() => {
    return store.getters['basket/in'](file.name)
})
const visited = ref(false)

async function download() {
    const f = await fetch(file.properties.file).then(res => res.blob())
    saveAs(f, file.name)
    visited.value = true
}
function toggleFile() {
    if (store.getters['basket/in'](file.name)) {
        console.log('remove')
        store.commit('basket/remove', file.name)
    } else {
        store.commit('basket/add', file).then((res) => {console.log(res)})
    }
}
</script>
<style>
.file {
  display: grid;
 /* grid-template-columns: 100px minmax(150px,1fr) minmax(150px,1fr) 125px minmax(150px,1fr);*/
  grid-template-columns: 130px  minmax(170px,1fr)  90px minmax(170px,1fr) 90px 110px;
  grid-gap: 5px;
  line-height:1;
  grid-template-rows: 18px auto; 
  grid-auto-rows: minmax(100px, auto);
  font-size: 12px;
  padding:0 5px;
  border-bottom:1px solid lightgrey;
}
.file .title {
    text-transform: uppercase;
    font-weight: 700;
    grid-column: 1/4;
    grid-row: 1;
    padding: 2px 0 0 3px;
    color: #333;
}
.file .download {
    grid-column: 1;
    grid-row: 2;
    text-align: center;
} 
.file .download a {
    padding: 0 4px;
    text-decoration: none;
}
div.draw {
    display:inline-block;
    vertical-align:top;
    margin-left:10px;
    padding:1px;
    border-radius:1px;
    cursor: pointer;
}  
.bcmtStation a,
.bcmtObservatory a {
    color:#cc852a;
    cursor: pointer;
}
.bcmtStation a path,
.bcmtObservatory a path {
   fill: #cc852a;
}
.bcmtStation a:hover path,
.bcmtObservatory a:hover path {
   fill: #f98a00;
}
.bcmtStation a:hover,
.bcmtObservatory a:hover {
   color: #f98a00;
}
.intermagnetStation a,
.intermagnetObservatory a {
   color: #2880ca;
   cursor: pointer;
}
.intermagnetStation a path,
.intermagnetObservatory a path {
    fill: #2880ca;
}
.intermagnetStation div.draw,
.intermagnetObservatory div.draw {
    background:#2880ca;
}
.bcmtStation div.draw,
.bcmtObservatory div.draw {
    background: #cc852a;
}
span.arrow.bcmtStation,
span.arrow.bcmtObservatory {
  color: #cc852a;
  background: transparent;
  font-weight:700;
  border: none;
  width: auto;
  height: auto;
  margin: 0;
}
span.arrow.intermagnetStation,
span.arrow.intermagnetObservatory {
  color:#2880ca;
  background: transparent;
  font-weight:700;
  border: none;
  width: auto;
  height: auto;
  margin: 0;
}
.intermagnetStation div.draw path,
.intermagnetObservatory div.draw path,
.bcmtStation div.draw path,
.bcmtObservatory div.draw path { 
    fill:#ffffff;
    stroke: #ffffff;
}
.intermagnetStation a:hover,
.intermagnetObservatory a:hover {
    color: #2067a1;
}  
.intermagnetStation a:hover path,
.intermagnetObservatory a:hover path {
    fill: #2067a1;
}
.intermagnetStation div.draw:hover,
.intermagnetObservatory div.draw:hover {
    background:#2067a1;
}
.bcmtStation div.draw:hover,
.bcmtObservatory div.draw:hover {
   background: #f98a00;
}
.file .dates {
    grid-column:2;
    grid-row:2;
}
.file .center {
    grid-column: 3;
    grid-row: 2;
    padding-bottom:3px;
} 
.file .doi {
    grid-column: 4;
    grid-row: 2;
}
.file .sampling {
    grid-column: 5;
    grid-row: 2;
}
.file .license {
    grid-column: 6;
    grid-row: 2;
}    
</style>
<style scoped>
a.visited {
    opacity:0.7;
}
</style>