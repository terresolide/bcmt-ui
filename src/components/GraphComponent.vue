<template>
    le graphe
   <div  class="grah-container" :class="group">
       <div id="Xcomp"></div>
       <div id="Ycomp"></div>
       <div id="Zcomp"></div>
    </div>
</template>
<script setup>
import BcmtReader from '@/modules/bcmt-reader.js'
import * as Highcharts from 'highcharts'
import { onBeforeMount, reactive } from 'vue'
const {file, group} = defineProps({file: Object, group: String})

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

        }
    }, (error) => {console.log(error)})
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
             min = serie[i]
        } 
        if (max === null || max < serieData[i]) {
            max = serie[i]
        } 
    }
    data.graphs[comp] = Highcharts.chart(comp + 'comp', {
        chart: {
          zoomType: 'x'
        },
        title: 'Test',
        width: '680px',
        height: '200px',
        credits: {
          enabled:false
        },
        legend: {
          enabled: false
        },
        exporting: {
          enabled: false
        },
        tooltip: {
          enabled: true,
          formatter (e) {
            if (!this.point) {
              return false
            }
            var values = []
            for (var key in _this.colors) {
              var chart = data.graphs[key];
              if (chart && typeof chart !== 'undefined') {
                 var pt = chart.series[0].points.find(el => el.x === this.point.x )
                 if (pt !== undefined) {
                   data.pointDate[key] = pt.open || pt.y
                   values.push('<div><span style="color:'+ pt.color +';">&#9632;</span> ' + key + ': ' + (Math.round(pt.y * 1000) / 1000) + '</div>')
                 }
               }
               if (key !== type && chart) {
                 chart.tooltip.hide();
               }
            }
            data.pointDate.date = moment.unix(this.point.x/ 1000).format('ll')
            var s = '<b>' + moment.unix(this.point.x/ 1000).format('ll') + '</b><br />'
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
               var xMin = e.min
               var xMax = e.max
               for(var key in data.graphs) {
                 if (key !== type && data.graphs[key]) {
                   data.graphs[key].xAxis[0].setExtremes(xMin, xMax, true, false)
                 }
               }
             }
           },
           gridLineWidth: 0,
           plotLines: plotlines,
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
            // color: color,
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