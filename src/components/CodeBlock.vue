<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps(['authorFolder', 'fileName', 'lang']);
const rawCode = ref('');

const codeFiles = import.meta.glob('/src/archive/**/*.txt', { 
  query: '?raw', 
  import: 'default' 
});

const loadCodeContent = async () => {
  if (!props.authorFolder || !props.fileName) return;
  const expectedSuffix = `${props.authorFolder}/${props.fileName}`;
  const targetPath = Object.keys(codeFiles).find(path => path.endsWith(expectedSuffix));

  if (targetPath) {
    try {
      const resolver = codeFiles[targetPath];
      rawCode.value = typeof resolver === 'function' ? await resolver() : resolver;
    } catch (err) {
      rawCode.value = "Error loading code file.";
    }
  } else {
    rawCode.value = `File not found.`;
  }
};

onMounted(loadCodeContent);
watch([() => props.fileName, () => props.authorFolder], loadCodeContent);
</script>

<template>
  <div v-if="rawCode" class="code-block-container">
    <div class="code-header">
      <span class="file-name">{{ fileName }}</span>
      <span v-if="lang" class="lang-label">{{ lang }}</span>
    </div>
    <div class="code-body">
      <pre><code>{{ rawCode }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.code-block-container {
  margin: 1.5rem 0;
  background: #121212;
  border: 1px solid #333;
  border-radius: 6px;
  overflow: hidden;
  text-align: left;
}
.code-header {
  background: #252525;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  color: #aaa;
  font-family: monospace;
}
.lang-label {
  font-weight: 700;
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #666;
}
pre {
  margin: 0;
  padding: 1.25rem;
  overflow: auto;
  color: #ccc;
  font-size: 0.9rem;
}
</style>