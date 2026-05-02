<script setup>
  import { ref, computed } from 'vue';
  import missingThumb from '@/assets/missing-thumb.png';

  const modules = import.meta.glob('/src/archive/**/*.json', { eager: true });

  const searchQuery = ref('');
  const selectedTag = ref('');

  const allProjects = computed(() => {
    const projects = [];
    try {
      Object.keys(modules).forEach((path) => {
        const data = modules[path].default || modules[path];
        if (!data || !data.author) return; // Safety check

        const pathParts = path.split('/');
        const semester = pathParts[3]; 

        if (data.projects) {
          data.projects.forEach((proj) => {
            const authorSlug = data.author.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const titleSlug = proj.project_title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
            const slug = `${authorSlug}-${titleSlug}`;
            
            // Handle both the old string format and the new array format for video_file
            const videoSource = Array.isArray(proj.video_file) ? proj.video_file[0] : proj.video_file;

            projects.push({
              ...proj,
              id: slug,
              authorName: data.author.name,
              videoUrl: videoSource, 
              semesterLabel: proj.semester || semester,
              tags: proj.tags || [] // Ensure tags is always an array
            });
          });
        }
      });
    } catch (err) {
      console.error("Archive Build Error:", err);
    }
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
    allProjects.value.forEach(p => {
      if (p.tags) p.tags.forEach(t => tags.add(t));
    });
    return Array.from(tags).sort();
  });

  const getYouTubeId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getVimeoId = (url) => {
    if (!url || typeof url !== 'string') return null;
    const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
    return match ? match[1] : null;
  };

  const getGoogleDriveId = (url) => {
    if (!url) return null;
    const match = url.match(/\/d\/([^/]+)/);
    return match ? match[1] : null;
  };

  const getThumbnailUrl = (url) => {
    if (!url) return '';
    const ytId = getYouTubeId(url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    const vimeoId = getVimeoId(url);
    if (vimeoId) return `https://vumbnail.com/${vimeoId}.jpg`;
    const gdId = getGoogleDriveId(url);
    if (gdId) return `https://drive.google.com/thumbnail?id=${gdId}&sz=w1280`;
    return '';
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

    <div v-if="filteredProjects.length > 0" class="project-grid">
      <router-link 
        v-for="project in filteredProjects" 
        :key="project.id" 
        :to="{ name: 'project-detail', params: { id: project.id } }"
        class="vfx-card compact"
      >
        <div class="media-container">
          <img 
            v-if="project.videoUrl"
            :src="getThumbnailUrl(project.videoUrl)" 
            @error="(e) => e.target.src = missingThumb"
            referrerpolicy="no-referrer"
            class="gallery-thumb"
            alt="Video Thumbnail"
          />  
        </div>

        <div class="card-body">
          <h2>{{ project.project_title }}</h2>
          <code class="semester-code">{{ project.semesterLabel }}</code>
          <span class="author-subtext">by {{ project.authorName }}</span>
        </div>
      </router-link>
    </div>
    
    <div v-else class="loading-state">
      <p>Loading Research Archive...</p>
      <p v-if="allProjects.length === 0" style="color: red; font-size: 0.8rem;">
        No JSON modules detected. Check console for build errors.
      </p>
    </div>
</template>

<style scoped>
/* Styles remain unchanged as requested */
  .gallery-header {
    width: 75%;
    height: 200px;
    margin: 0 auto;
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
    width: 100%;
    max-width: 1500px;
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

  .loading-state {
    text-align: center;
    margin-top: 50px;
    font-family: monospace;
  }
</style>