<script setup>
import NavBar from './components/NavBar.vue';
</script>

<template>
  <NavBar />

  <main id="app">
    <div id="center">
      <router-view v-slot="{ Component }" :key="$route.fullPath">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
    
    <div id="spacer">
      <div class="ticks"></div>
    </div>
  </main>
</template>

<style>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  #center {
    width: 100%;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  main#app {
    border-inline: 1px solid var(--border);
    margin: 0 auto;
  }
</style>