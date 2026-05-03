<template>
    <h2>Tutorial Content</h2>
    <div class="tutorial-content" v-html="sanitizedHtml"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import DOMPurify from 'dompurify';

const props = defineProps(['path']);
const sanitizedHtml = ref('');

// Eagerly load all HTML files as raw text from the archive
const htmlModules = import.meta.glob('/src/archive/**/*.html', { 
  query: '?raw', 
  import: 'default', 
  eager: true 
});

// Eagerly load all images to get Vite-processed URLs
const imageModules = import.meta.glob('/src/archive/**/*.{png,jpg,jpeg,gif,webp}', { 
  eager: true, 
  import: 'default' 
});

const loadTutorial = () => {
  if (!props.path) {
    sanitizedHtml.value = "<p>No tutorial path provided.</p>";
    return;
  }

  // 1. DYNAMIC FILENAME SEARCH
  // We look for any key that contains the student's folder path AND ends in .html
  // This ignores whatever the specific filename (e.g., Tutorial_Final_v2.html) is.
  const normalizedSearchPath = props.path.toLowerCase().replace(/\/+$/, ''); // Remove trailing slash
  
  const actualKey = Object.keys(htmlModules).find(key => {
    const lowerKey = key.toLowerCase();
    return lowerKey.includes(`/${normalizedSearchPath}/`) && lowerKey.endsWith('.html');
  });

  const rawText = htmlModules[actualKey];

  if (!rawText) {
    console.group("Tutorial Search Debugger");
    console.error("Target Folder Path:", props.path);
    console.log("Normalized Search String:", normalizedSearchPath);
    console.log("All Available HTML Keys:", Object.keys(htmlModules));
    console.groupEnd();
    sanitizedHtml.value = "<p>Tutorial HTML file not found in the specified directory.</p>";
    return;
  }

  try {
    // 2. Extract content between <body> tags
    const bodyMatch = rawText.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : rawText;

    // 3. Process Images using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const images = doc.querySelectorAll('img');

    images.forEach(img => {
      const src = img.getAttribute('src');
      // Google Docs exports images into an 'images/' subfolder relative to the HTML
      if (src && (src.startsWith('images/') || src.includes('/images/'))) {
        const imageName = src.split('/').pop();
        
        // Construct the key to find the hashed image in our globbed imageModules
        const fullImagePath = `/src/archive/${props.path}/images/${imageName}`.replace(/\/+/g, '/');
        
        const viteImageKey = Object.keys(imageModules).find(key => 
          key.toLowerCase() === fullImagePath.toLowerCase()
        );

        if (viteImageKey) {
          img.src = imageModules[viteImageKey];
        }
      }
    });

    // 4. Sanitize and Inject
    sanitizedHtml.value = DOMPurify.sanitize(doc.body.innerHTML);
  } catch (err) {
    console.error("Error parsing tutorial content:", err);
    sanitizedHtml.value = "<p>Error rendering tutorial content.</p>";
  }
};

onMounted(loadTutorial);
watch(() => props.path, loadTutorial);
</script>

<style scoped>
.tutorial-content {
  text-align: left;
  max-width: 900px;
  margin: 0 auto;
}

.tutorial-content :deep(h1) {
    font-size: 36px;
    font-weight: 700;
}

.tutorial-content :deep(img) {
  width: 100%;
  height: auto;
  border: 1px solid #efefef;
  margin-inline: auto;
  margin-bottom: 45px;
  border-radius: 4px;
  display: block;
}


.tutorial-content :deep(p) {
  line-height: 1.4;
  margin-bottom: 30px;
  color: #333;
  font-size: 16px;
}

.tutorial-content :deep(p:has(img)) {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.tutorial-content :deep(a) {
    color: #AC2B37;
}

.tutorial-content :deep(h1), 
.tutorial-content :deep(h2), 
.tutorial-content :deep(h3) {
  margin-top: 2.5rem;
  margin-bottom: 1.2rem;
  font-weight: 600;
  color: #1a1a1a;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.tutorial-content :deep(h3) {
  margin-top: 100px;
}

.tutorial-content :deep(ul), 
.tutorial-content :deep(ol) {
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
}

.tutorial-content :deep(li) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}
</style>