<template>
  <div id="app" class="w-screen h-screen overflow-hidden">
    <router-view />
    <ToastCard />
  </div>
</template>

<script setup lang="ts">
import ToastCard from '@/components/ToastCard.vue'
</script>

<style>
/* Global styles are imported via main.ts */
</style>
