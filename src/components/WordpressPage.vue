<template>
  <div v-show="data.show" class="wordpress-page" :style="{maxHeight: maxHeight + 'px'}" @click="data.show=false">

    <div class="close">&times</div>
    <h2>Information</h2>
    <div class="wpp-content" :style="{maxHeight: (maxHeight - 100) + 'px'}">
      <img v-if="data.img" :src="data.img"  />
      <div v-for="text in data.texts" v-html="text.innerHTML" style="margin-bottom:5px;"></div>
    </div>
  </div>
</template>
<script setup>
  import {reactive, onBeforeMount, onUnmounted} from 'vue'
  import {useRoute} from 'vue-router'
  import {useStore} from 'vuex'
  const {maxHeight} = defineProps({maxHeight: Number})
  const data = reactive({
    show: false,
    texts: [],
    img: null,
    clickListener: null
  })
  const store = useStore()
  const route = useRoute()

  function toggle () {
    data.show = !data.show
  }
  onBeforeMount(() => {
    var texts = document.querySelectorAll('.entry-content > p.hidden')
    if (texts.length > 0) {
      store.commit('setWordpress', true)
      data.texts = texts
     
      data.clickListener = document.addEventListener('bcmt:information', toggle) 
      setTimeout(function () {
         if (route.name === 'map' && !route.query.id ) {
          data.show = true
        }
      }, 100)
    }
    var img = document.querySelector('header[id="cover"] img')
    if (img) {
      data.img = img.src
    }

  })
  onUnmounted(() => {
    if (data.clickListener) {
      document.removeEventListener('bcmt:information', toggle)
      data.clickListener = null
    }

  })
</script>
<style scoped>
.wordpress-page {
    position: absolute;
    top:5px;
    width: 600px;
    margin-left:calc(50% - 300px);
    background:white;
    padding:0px 20px 20px 20px;
    z-index:1001;
    box-shadow: 0 3px 14px rgba(0,0,0,0.4);

    cursor:pointer;
}
.wpp-content {
  max-height:calc(100vh - 120px);
  overflow-y:scroll;
}
.wordpress-page img {
  max-width:600px;
  max-height:250px;
}
.wordpress-page .close {
  position:absolute;
  right:3px;
}
</style>