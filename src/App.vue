<script setup>
import { RouterView } from 'vue-router'

import { onBeforeUnmount, onMounted, reactive } from 'vue'
import MapComponent from './components/MapComponent.vue'
const data = reactive({
    height: 600,
    resizeListener: null
})
function initSize () {
    data.height = window.innerHeight
    
}
onMounted(() => {
    data.resizeListener = initSize.bind()
    window.addEventListener('resize', data.resizeListener)
    initSize()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', data.resizeListener)
    data.resizeListener = null
})

</script>

<template>
  <nav></nav>
  <MapComponent :height="data.height"></MapComponent>
  <div class="page">
    <RouterView />
  </div>
</template>
<style>
#app {
    position:relative;
    font-family: Arial, Helvetica, sans-serif;
}
</style>
<style scoped>

.page {
    position:absolute;
    top:0;
    left:0;
    width: 100%;
    z-index: 1000;
}

</style>
