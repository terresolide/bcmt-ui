<template>
   
  <MapComponent :height="data.height"></MapComponent>
</template>
<script setup>
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import MapComponent from '../components/MapComponent.vue'
// import { Store } from '../../node_modules_saved/vuex/dist/vuex.cjs'
const data = reactive({
    height: 600,
    resizeListener: null
})
const store = useStore()
let progress = computed(() => {return store.getters['basket/progress']})
function initSize () {
    console.log('initsize')
    var node = document.querySelector('#masthead')
    console.log(node)
    var h = 0
    if (node) {

       h = node.offsetHeight
    }
    data.height = window.innerHeight - h 
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

