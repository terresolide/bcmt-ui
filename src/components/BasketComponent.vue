<template>
    <h3>Basket</h3>
    <ul>
        <li v-for="file in files">{{file}}</li>
    </ul>
    <button @click="download">Download</button>
</template>
<script setup>
import {computed} from 'vue'
import {useStore} from 'vuex'
const store = useStore()
const files = computed(() => {
    return store.getters['basket/files']
})
function download () {
    store.commit('basket/download')
}
</script>