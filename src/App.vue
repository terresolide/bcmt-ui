<script setup>
import { RouterView } from 'vue-router'

import { computed, onBeforeUnmount, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import MapComponent from './components/MapComponent.vue'
import WordpressPage from './components/WordpressPage.vue'
const data = reactive({
    height: 600,
    resizeListener: null
})
const store = useStore()
let progress = computed(() => {return store.getters['basket/progress']})
function initSize () {
    var node = document.querySelector('#masthead')
    if (store.state.logo === 'formaterre') {
        node = document.querySelector('header')
        node.style.height = '178px';
    }
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

<template>
  <nav></nav>
   <template v-if="progress" >
    <div class="progress" style="position:fixed;top:0;left:0;margin-top:70px;margin-left:calc(50% - 150px);z-index:10000;background:white;height:30px;">
        <b>Generating zip</b>: {{ progress }} %
    </div>
  </template>
  <wordpress-page :max-height="data.height"></wordpress-page>
  <MapComponent :height="data.height"></MapComponent>
  <div class="page">
    <RouterView />
  </div>
</template>
<style>
#app {
    position:relative;
    font-family: Arial, Helvetica, sans-serif;
    z-index:1;
}
.wrapper-content  div[id="app"] ul li,
.wrapper-content  div[id="app"] ul li:last-child {
  margin-bottom: 0px;
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
div.progress {
    position:fixed;
    top:0;
    left:0;
    margin-top:100px;
    margin-left:calc(50% - 150px);
    z-index:10000;
    background:white;
    min-height:30px;
    padding:10px;
    border-radius:5px;
    box-shadow: 0 3px 14px rgba(0,0,0,0.4);
}

</style>
