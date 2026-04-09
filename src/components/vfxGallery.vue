<script setup>
  import { ref, computed } from 'vue';

  const modules = import.meta.glob('/src/archive/**/*.json', { eager: true });

  const searchQuery = ref('');
  const selectedTag = ref('');

  const allProjects = computed(() => {
    const projects = [];
    Object.keys(modules).forEach((path) => {
      const data = modules[path].default || modules[path];
      const pathParts = path.split('/');
      
      // Fixed index: /src/archive/[semester]/[student]/metadata.json
      const semester = pathParts[3]; 

      if (data.projects) {
        data.projects.forEach((proj) => {
          const slug = `${data.author.name}-${proj.project_title}`.toLowerCase().replace(/\s+/g, '-');
          
          projects.push({
            ...proj,
            id: slug,
            authorName: data.author.name,
            videoUrl: proj.video_file, 
            semesterLabel: proj.semester || semester
          });
        });
      }
    });
    return projects;
  });

  const filteredProjects = computed(() => {
    return allProjects.value.filter(p => {
      const searchTerm = searchQuery.value.toLowerCase();
      const matchesSearch = p.project_title.toLowerCase().includes(searchTerm) || 
                            p.authorName.toLowerCase().includes(searchTerm);
      const matchesTag = !selectedTag.value || p.tags.includes(selectedTag.value);
      return matchesSearch && matchesTag;
    });
  });

  const allTags = computed(() => {
    const tags = new Set();
    allProjects.value.forEach(p => p.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  });

  const getYouTubeId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getVimeoId = (url) => {
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url) => {
    if (!url) return '';

    const ytId = getYouTubeId(url);
    if (ytId) {
      // hqdefault is the most reliable high-quality thumbnail that avoids 404 errors
      return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    }

    const vimeoId = getVimeoId(url);
    if (vimeoId) {
      return `https://vumbnail.com/${vimeoId}.jpg`;
    }

    return '';
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    const ytId = getYouTubeId(url);
    if (ytId) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`;
    }
    
    const vimeoId = getVimeoId(url);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
    
    return url;
  };
</script>

<template>
    <header class="gallery-header">
      <div class="counter">VFX Research Archive</div>

      <div class="filter-controls">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by project or author..." 
          class="search-input"
        />
        <select v-model="selectedTag" class="tag-select">
          <option value="">All Tags</option>
          <option v-for="tag in allTags" :key="tag" :value="tag">{{ tag }}</option>
        </select>
      </div>
    </header>

    <div class="project-grid">
      <router-link 
        v-for="project in filteredProjects" 
        :key="project.id" 
        :to="'/project/' + project.id"
        class="vfx-card compact"
      >
        <div class="media-container">
          <img 
            v-if="project.videoUrl"
            :src="getThumbnailUrl(project.videoUrl)" 
            @error="(e) => e.target.src = '/src/assets/missing-thumb.png'"
            class="gallery-thumb"
          />
        </div>

        <div class="card-body">
          <h2>{{ project.project_title }}</h2>
          <code class="semester-code">{{ project.semesterLabel }}</code>
          <span class="author-subtext">by {{ project.authorName }}</span>
        </div>
      </router-link>
    </div>
</template>

<style scoped>
  .gallery-header {
    /* width: 100%;
    margin-bottom: 20px; */

    max-width: max-content;
    margin: 0 auto 20px auto;
  }

  .counter {
    background-color: #333;
    color: #FFF;
    padding: 5px 10px;
    display: inline-block;
  }

  .filter-controls {
    display: flex;
    width: 100%;
    gap: 15px;
    margin-top: 20px;
    justify-content: flex-end;
  }

  .search-input, .tag-select {
    padding: 10px 15px;
    background: #EEE;
    border: 1px solid #DDD;
    border-radius: 6px;
    color: #333;
    width: 100%;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, 300px);
    grid-auto-rows: auto;
    justify-content: center; 
    gap: 30px; 
    width: max-content;
    max-width: 100%;
    margin: 0 auto; 
    box-sizing: border-box;
  }

  .vfx-card.compact {
    text-decoration: none;
    background: white;
    border: 1px solid #DDD;
    border-radius: 15px;
    overflow: hidden;
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 4;
    row-gap: 0; 
    margin-bottom: 30px;
  }

  .media-container {
    grid-row: 1;
    width: 100%;
    aspect-ratio: 16 / 9;
    background-color: #000;
    overflow: hidden;
  }

  .gallery-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none; 
    user-select: none;
  }

  .card-body {
    grid-row: span 3;
    display: grid;
    grid-template-rows: subgrid;
    padding: 15px;
    justify-items: center;
    text-align: center;
    /* FIX: Override inherited gap from parent grid */
    row-gap: 0;
  }

  .vfx-card.compact h2 {
    grid-row: 1;
    font-size: 1rem;
    margin: 0;
    margin-bottom: 15px;
    color: #333;
  }

  .semester-code {
    grid-row: 2;
    background-color: #DDD;
    color: #222;
    font-size: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    margin: 0; 
    margin-bottom: 10px; 
  }

  .author-subtext {
    grid-row: 3;
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 5px;
  }
</style>