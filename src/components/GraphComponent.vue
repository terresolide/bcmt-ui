<template>
   <div  class="graph-container" ref="graphcontainer" :style="{top: data.top + 'px', left: data.left + 'px'}" >
      <h3 :class="group" @mousedown="movestart">{{file.name}}
        <span class="back" @click="$emit('close')">
          &times;
        </span>
      </h3>
      <div v-if="data.error" style="color:darkred;">{{data.error }}</div>
      <div v-if="data.loading" style="text-align:center"><span class="loader"></span></div>
      <div>
        <div id="Xcomp" @mousemove="highlight($event, 'X')"></div>
        <div id="Ycomp" @mousemove="highlight($event, 'Y')"></div>
        <div id="Zcomp" @mousemove="highlight($event, 'Z')"></div>
      </div>
    </div>
</template>
<script setup>
import BcmtReader from '@/modules/bcmt-reader.js'
import * as Highcharts from 'highcharts'
import moment from 'moment'
import { onBeforeMount, onBeforeUnmount, reactive, ref, watch } from 'vue'

const {file, group} = defineProps({file: Object, group: String})
const comps = ["X", "Y", "Z"]
const colors = {X: "#2caffe", Y: "#544fc5", Y: "#00e272", Z: "#fe6a35"}
const data = reactive({
    top: 5,
    left: 20,
    pos: {x: 0, y: 0},
    delta: {x: 0, y: 0},
    selected: false,
    mousemoveListener: null,
    mouseupListener: null,
    series: null,
    error: null,
    graphs: {X:null, Y:null, Z:null},
    pointDate: {date: null, X:null, Y:null, Z:null},
    loading: false
})
const graphcontainer = ref(null)

function load () {
    data.error = null
    comps.forEach(function (comp) {
      if (data.graphs[comp]) {
        data.graphs[comp].destroy()
        data.graphs[comp] = null
      }
    })
    data.loading = true

    let reader = new BcmtReader(file.properties.file)
    reader.read()
    .then((done) => {
        if (done) {
          data.series = reader.getSeries()
          data.loading = false
          comps.forEach(function (comp) {draw(comp)})
        }
    }, (error) => {
      data.error = error
      data.loading = false
    })
}
function highlight (e, comp) {
  var chart,
    point,
    event;
  if (!data.graphs[comp]) {
    return false
  }
  event = data.graphs[comp].pointer.normalize(e);
  var point = data.graphs[comp].series[0].searchPoint(event, true);

  if (!point) {
    return
  }  
  data.pointDate.date = moment.unix(point.x / 1000).format('ll')
  data.pointDate[comp] = point.open || point.y

  for (var key in data.graphs) {
    var chart = data.graphs[key];
    if (chart && typeof chart !== 'undefined') {
      var pt = chart.series[0].points.find(el => el.x === point.x )
      if (pt !== undefined) {
        data.pointDate[key] = pt.open || pt.y
      }
      chart.xAxis[0].removePlotLine('highlight')
      chart.xAxis[0].addPlotLine({
        color: '#999999',
        value:  point.x,
        width: 1,
        id: 'highlight'
      })
    }
  } 
  
}
function draw (comp) {
    
    var plotlines = []
    var dates = data.series.dates
    var serieData = data.series[comp]
    var len = dates.length
    var serie = []
    var min = null
    var max = null
     // date format
    var matches = /[^\.]*\.([^.]*)$/.exec(file.name)
    var formatDate = 'll'
    var extension = 'min'
    if (matches[1]) {
       extension = matches[1]
       switch (matches[1]) {
        case 'sec':
          formatDate = 'LTS'
          break
        case 'min':
        case 'hour':
          formatDate = 'lll'
          break

       }
    }
    for(var i=0; i < len; i++) {
      if (extension === 'sec' && i%10 != 0) {
        continue
      }
       serie.push([dates[i],serieData[i]])
      //  plotlines.push({
      //       color: '#ccd6eb',
      //       value: dates[i],
      //       width: 1,
      //       id: i
      //   })
        if (min === null || min > serieData[i]) {
             min = serieData[i]
        } 
        if (max === null || max < serieData[i]) {
            max = serieData[i]
        } 
    }
    data.graphs[comp] = Highcharts.chart(comp + 'comp', {
        chart: {
          zooming:{type: 'x'},
          height: 200,
          marginLeft: 110
        },
        title: null,
        width: '680px',
        
        credits: {
          enabled:false
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        numberFormatter: function (nb) {
             return nb.toLocaleString()
        },
        tooltip: {
          enabled: true,
         
          formatter (e) {
            if (!this.point) {
              return false
            }
            var values = []
            for (var key in colors) {
              var chart = data.graphs[key];
              if (chart && typeof chart !== 'undefined') {
                 var pt = chart.series[0].points.find(el => el.x === this.point.x )
                 if (pt !== undefined) {
                   data.pointDate[key] = pt.open || pt.y
                   values.push('<div><span style="color:'+ pt.color +';">&#9632;</span> ' + key + ': ' + pt.y.toLocaleString() + '</div>')
                 }
               }
               if (key !== comp && chart) {
                 chart.tooltip.hide();
               }
            }
            data.pointDate.date = moment.unix(this.point.x/ 1000).format(formatDate)
            var s = '<b>' + moment.unix(this.point.x/ 1000).format(formatDate) + '</b><br />'
            return s + values.join('<br />')
          },
          shared: false
        },
        plotOptions: {},
        xAxis: {
           type: 'datetime',
           lineColor:'#666',
           zoomEnabled: true,
           events: {
//              setExtremes (e) {
//                _this.syncExtremes(e, type)
//              },
             afterSetExtremes (e) {
               var xMin = e.min
               var xMax = e.max
               for(var key in data.graphs) {
                 if (key !== comp && data.graphs[key]) {
                   data.graphs[key].xAxis[0].setExtremes(xMin, xMax, true, false)
                 }
               }
             }
           },
           gridLineWidth: 1
         },
         yAxis: {
             title: {
                 text: comp
             },
             labels: {
              formatter: function () {
                return this.value.toLocaleString()
              }
             },
             min: min,
             max: max,
             plotLines: [{
               value: 0,
               color: 'lightgrey',
               width: 2
             }]
         },
         series: [{
             name: comp,
             color: colors[comp],
             type: 'line',
             id: comp,
             zIndex:10,
             data:serie,
             lineWidth: 1
         }  
      ]})
}
function initPosition () {
      data.left = (window.innerWidth - 900) / 2;
      if (window.innerHeight > 650) {
        data.top = (window.innerHeight - 650) / 2;
      }
      data.pos.x = data.left
      data.pos.y = graphcontainer.value.offsetTop
      data.mousemovelistener = document.addEventListener('mousemove', move)
      data.mouseupListener = document.addEventListener('mouseup', moveEnd)
    }
 function movestart (evt) {
      data.selected = true
      data.delta = {
          x: data.pos.x - graphcontainer.value.offsetLeft,
          y: data.pos.y - graphcontainer.value.offsetTop
      }
    }
  function  move (evt) {
      data.pos.x = evt.clientX
      data.pos.y = evt.clientY
      if (data.selected) {
        data.left = (data.pos.x - data.delta.x) 
        if (data.pos.y > data.delta.y) {
          data.top = (data.pos.y - data.delta.y) 
        } else {
          data.top = 0
        }
      }
    }
  function moveEnd () {
      data.selected = false
    }
onBeforeMount(() => {
  
  load()
  setTimeout(initPosition, 0)
})
onBeforeUnmount(() => {
  if (data.mousemoveListener) {
    document.removeEventListener('mousemove', move)
    data.mousemoveListener = null
  }
  if (data.mouseupListener) {
    document.removeEventListener('mouseup', moveEnd)
    data.mouseupListener = null
  }
})
watch(() => file, 
  (file) => {
    load()
  })
</script>
<style>
.graph-container {
  position: fixed;
  top:0;
  left:calc(50% - 450px);
  z-index: 100;
  max-width:900px;
  width:900px;
  min-height:600px;
  background: white;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4);
  padding: 0 10px 10px 10px;
  border-radius: 10px 10px 0 0;
  max-height:100vh;
  
}
.graph-container h3 {
  cursor: move;
}
.graph-container > div {
  max-height:calc(100vh - 45px);
  overflow-y: auto;
}
</style>