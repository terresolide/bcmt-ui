<template>
    le graphe
   <div  class="grah-container" :class="group">
       <div id="Xcomp" @mousemove="highlight($event, 'X')"></div>
       <div id="Ycomp" @mousemove="highlight($event, 'Y')"></div>
       <div id="Zcomp" @mousemove="highlight($event, 'Z')"></div>
    </div>
</template>
<script setup>
import BcmtReader from '@/modules/bcmt-reader.js'
import * as Highcharts from 'highcharts'
import moment from 'moment'
import { onBeforeMount, reactive } from 'vue'

const {file, group} = defineProps({file: Object, group: String})
const comps = ["X", "Y", "Z"]
const colors = {X: "#2caffe", Y: "#544fc5", Y: "#00e272", Z: "#fe6a35"}
const data = reactive({
    series: null,
    graphs: {X:null, Y:null, Z:null},
    pointDate: {date: null, X:null, Y:null, Z:null}
})
function load () {
    let reader = new BcmtReader(file.properties.file)
    reader.read()
    .then((done) => {
        if (done) {
          data.series = reader.getSeries()
          draw('X')
          draw('Y')
          draw('Z')

        }
    }, (error) => {console.log(error)})
}
function highlight (e, comp) {
  var chart,
    point,
    i,
    event;
  var _this = this
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
    if (data.graphs[comp]) {
        data.graphs[comp].destroy()
        data.graphs[comp] = null
    }
    var plotlines = []
    var dates = data.series.dates
    var serieData = data.series[comp]
    var len = dates.length
    var serie = []
    var min = null
    var max = null
    for(var i=0; i < len; i++) {
       serie.push([dates[i],serieData[i]])
       plotlines.push({
            color: '#ccd6eb',
            value: dates[i],
            width: 1,
            id: i
        })
        if (min === null || min > serieData[i]) {
             min = serieData[i]
        } 
        if (max === null || max < serieData[i]) {
            max = serieData[i]
        } 
    }
    var title = null
    if (comp === 'X') {
      title = {text: file.name}
    }
    // date format
    var matches = /[^\.]*\.([^.]*)$/.exec(file.name)
    console.log(matches)
    var formatDate = 'll'
    if (matches[1]) {
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

    data.graphs[comp] = Highcharts.chart(comp + 'comp', {
        chart: {
          zooming:{type: 'x'},
          height: 200,
          marginLeft: 120
        },
        title: title,
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
           events: {
//              setExtremes (e) {
//                _this.syncExtremes(e, type)
//              },
             afterSetExtremes (e) {
               console.log(e)
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
onBeforeMount(() => {load()})
</script>
<style>

</style>