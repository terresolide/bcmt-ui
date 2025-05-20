<template>
    <div class="basket-container">
        <h3>Your basket
            <template v-if="files.length > 0">( {{ files.length }} / {{ basketLimit }} files )</template>
        </h3>
        <template v-if="files.length === 0">
            Your basket is empty!
        </template>
        <template v-else>
            <div style="text-align:right;">
                <button @click="clean">Empty</button>  
                <button @click="download">Download</button>
            </div>
            <ul>
                <li v-for="file in files" class="basket-file">
                    <span>{{file}}</span>
                    <span @click="remove(file)" class="close" title="Remove">&times;</span>
                </li>
            </ul>
            
        </template>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
const store = useStore()
const files = computed(() => {
    return store.getters['basket/files']
})
const basketLimit = store.getters['basket/limit']
function download () {
    store.commit('basket/download')
}
function clean () {
    store.commit('basket/clean')
}
function remove (filename) {
    store.commit('basket/remove', filename)
}
</script>
<style scoped>
.basket-container {
    padding: 5px 10px;
    margin-bottom:20px;
}
ul {
    padding-left: 20px;
    list-style:none;
    max-height:calc(80vh - 80px);
    overflow-y:auto;

   
}
.basket-file .close {
  position: relative;
 top:0;
 left:0;
}
   
li.basket-file {
    line-height:1.4;
    margin-right: 10px;
}
li.basket-file > span:first-child {
    display:inline-block;
    min-width:250px;
}
li.basket-file {
    border-bottom: 1px solid lightgrey;
}
li.basket-file:nth-child(2n) {
  background: #e6ebf0;
}
.close {
    border: 1px dotted white;
    color:darkred;
    font-weight: 700;
    padding: 2px 3px;
    cursor:pointer;
}
.close:hover {
    border-color: darkgrey;
}
.basket-container button{
   display: inline-block;
   margin: 0px 7px 3px 5px;
   padding: 3px 12px;
   height: auto;
   line-height: 1.43;
   white-space: normal;
   text-align: center;
   background: #ececea;
   border-width: 1px;
   border-style: solid;
   border-radius: 3px;
   border-color: #ffffff #d4d4cf #d4d4cf;
   color: #000;
   text-decoration: none;
  /* text-shadow: 0 -1px 1px #bcbcb4, 1px 0 1px #d4d4cf, 0 1px 1px #d4d4cf, -1px 0 1px #bcbcb4;*/
   vertical-align: top;
   cursor: pointer;
   pointer-events: auto;
   box-sizing: border-box;
   box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
   opacity: 0.8;

  }
.basket-container button:hover{
   background: #f0f0e6;
   text-decoration: none;
   opacity: 1
 }
</style>