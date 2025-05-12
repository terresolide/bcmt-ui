<template>
    <h3>Basket</h3>
    <ul>
        <li v-for="file in files">{{file}}</li>
    </ul>
</template>
<script setup>
import {computed} from 'vue'
import {useStore} from 'vuex'
const store = useStore()
const files = computed(() => {
    return store.getters['basket/files']
})
</script>