<template>
    <div class="basket-container">
        <h3>Your basket
            <template v-if="files.length > 0">({{ files.length }} files)</template>
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
.basket-container button {
    margin-left:5px;
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
</style>