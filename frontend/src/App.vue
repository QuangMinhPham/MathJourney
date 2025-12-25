<script setup>
// App.vue là component gốc, nơi router-view sẽ hiển thị các trang (pages)
</script>

<template>
  <router-view v-slot="{ Component }">
      <component :is="Component" />
  </router-view>
</template>

<style>
/* Không cần style nhiều ở đây vì đã có main.css */
/* Đảm bảo #app chiếm full màn hình */
#app {
  width: 100vw;
  min-height: 100vh;
  position: relative;
}
</style>