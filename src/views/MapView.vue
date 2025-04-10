<template>
  <MapComponent :height="data.height"></MapComponent>
</template>
<script setup>
import {reactive, onMounted, onBeforeUnmount} from 'vue'
import MapComponent from '../components/MapComponent.vue'
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

