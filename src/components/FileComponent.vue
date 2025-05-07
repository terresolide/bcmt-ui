<template>
   <div  class="file" :class="group">
      <div class="download"><a :href="file.properties.file" target="_blank" download>
        <svg xmlns="http://www.w3.org/2000/svg" width="12" viewBox="0 0 384 512"><path d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"/></svg>
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
import moment from 'moment'
import { computed } from 'vue'
const {file} = defineProps({file: Object, group: String})
const extension = computed(() => {
    var matches = /[^\.]*\.([^.]*)$/.exec(file.name)
    if (matches.length > 1) {
        return matches[1]
    }
    return ''
})
const start = computed(() => {
    return moment(file.properties.start).format('ll')
})
const end = computed(() => {
    return moment(file.properties.end).format('ll')
})
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
.bcmtStation a path,
.bcmtObservatory a path {
   fill: #cc852a;
}
.bcmtStation a:hover path,
.bcmtObservatory a:hover path {
   fill: #f98a00;
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