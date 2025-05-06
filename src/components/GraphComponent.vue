<template>
    le graphe
   <div  class="grah-container" :class="group">
       <div id="xcomp"></div>
       <div id="ycomp"></div>
       <div id="zcomp"></div>
    </div>
</template>
<script setup>
import {onBeforeMount, watch} from 'vue'
import BcmtReader from '@/modules/bcmt-reader.js'
const {file, group} = defineProps({file: Object, group: String})

function load () {
    let reader = new BcmtReader(file.properties.file)
    reader.read()
    .then((text) => {console.log(text)})
    
    return
    
}
onBeforeMount(() => {load()})
</script>
<style>

</style>