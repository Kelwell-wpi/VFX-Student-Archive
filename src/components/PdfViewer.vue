<script setup>
import { ref, watchEffect } from 'vue';

const props = defineProps({
  pdfUrl: String, // The resolved URL from the parent
  fileName: String
});

const isFullscreen = ref(false);

watchEffect(() => {
  document.body.style.overflow = isFullscreen.value ? 'hidden' : '';
});
</script>

<template>
  <div v-if="pdfUrl" class="pdf-wrapper" :class="{ 'is-fs': isFullscreen }">
    <div class="pdf-header">
      <div class="file-info">
        <span class="pdf-icon">PDF</span>
        <span class="file-title">{{ fileName }}</span>
      </div>
      <div class="actions">
        <button @click="isFullscreen = !isFullscreen" class="ui-btn">
          {{ isFullscreen ? 'Close' : 'Fullscreen' }}
        </button>
        <a :href="pdfUrl" download class="ui-btn dark">Download</a>
      </div>
    </div>
    
    <div class="pdf-frame">
      <iframe 
        :src="`${pdfUrl}#view=FitH`" 
        width="100%" 
        height="100%" 
        frameborder="0"
      ></iframe>
    </div>
  </div>
  <div v-else class="pdf-error-state">
    <p>Document not found in archive: <strong>{{ fileName }}</strong></p>
  </div>
</template>

<style scoped>
.pdf-wrapper { margin: 2rem 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: #fff; }
.pdf-wrapper.is-fs { position: fixed; inset: 0; z-index: 9999; margin: 0; border-radius: 0; }
.pdf-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background: #fff; border-bottom: 1px solid #eee; }
.file-info { display: flex; align-items: center; gap: 10px; }
.pdf-icon { background: #e74c3c; color: white; font-size: 0.6rem; font-weight: 900; padding: 2px 5px; border-radius: 3px; }
.file-title { font-size: 0.8rem; font-weight: 700; color: #333; }
.actions { display: flex; gap: 8px; }
.ui-btn { font-size: 0.7rem; font-weight: 700; padding: 6px 14px; border-radius: 4px; border: 1px solid #ccc; cursor: pointer; text-decoration: none; color: #444; }
.ui-btn.dark { background: #1a1a1a; color: #fff; border: none; }
.pdf-frame { height: 700px; background: #525659; }
.is-fs .pdf-frame { height: calc(100vh - 54px); }
.pdf-error-state { padding: 20px; border: 1px dashed #ccc; color: #888; text-align: center; font-size: 0.8rem; }
</style>