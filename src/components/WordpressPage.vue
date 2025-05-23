<template>
  <div v-show="data.show" class="wordpress-page" @click="data.show=false">
    <div class="close">&times</div>
    <h2>Information</h2>
    <img v-if="data.img" :src="data.img" width="400" />
    <div v-for="text in data.texts" v-html="text.innerHTML" style="margin-bottom:5px;"></div>
  </div>
</template>
<script setup>
  import {reactive, onMounted} from 'vue'
  const data = reactive({
    show: false,
    texts: [],
    img: null
  })
  onMounted(() => {
    var texts = document.querySelectorAll('.entry-content > p.hidden')
    if (texts) {
      data.texts = texts
      data.show = true
    }
    var img = document.querySelector('header[id="cover"] img')
    if (img) {
      data.img = img.src
    }

  })
</script>
<style scoped>
.wordpress-page {
    position: absolute;
    top:50px;
    width: 600px;
    margin-left:calc(50% - 300px);
    background:white;
    padding:0px 20px 20px 20px;
    z-index:1001;
    box-shadow: 0 3px 14px rgba(0,0,0,0.4);
    max-height:calc(100vh - 70px);
    overflow-y: scroll;
    cursor:pointer;
}
.wordpress-page .close {
  position:absolute;
  right:3px;
}
</style>