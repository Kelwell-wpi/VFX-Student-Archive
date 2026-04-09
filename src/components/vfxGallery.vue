<script setup>
  import { ref, computed } from 'vue';

  const modules = import.meta.glob('/public/archive/**/*.json', { eager: true });

  const searchQuery = ref('');
  const selectedTag = ref('');

  const allProjects = computed(() => {
    const projects = [];
    Object.keys(modules).forEach((path) => {
      const data = modules[path].default || modules[path];
      const pathParts = path.split('/');
      const semester = pathParts[3]; 
      const studentFolder = pathParts[4];
      const assetBase = `/archive/${semester}/${studentFolder}/`;

      if (data.projects) {
        data.projects.forEach((proj) => {
          const slug = `${data.author.name}-${proj.project_title}`.toLowerCase().replace(/\s+/g, '-');
          projects.push({
            ...proj,
            id: slug,
            authorName: data.author.name,
            videoUrl: `${assetBase}${proj.video_file}`,
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
</script>

<template>
  <div id="center">
    <header class="gallery-header">
      <div class="counter">VFX Research Archive</div>
      <h1>Student Submissions</h1>
      
      <div class="filter-controls">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by project or author..." 
          class="search-input"
        />
        <select v-model="selectedTag" class="tag-select">
          <option value="">All Specialties</option>
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
          <video muted loop onmouseover="this.play()" onmouseout="this.pause();this.currentTime=0;">
            <source :src="project.videoUrl" type="video/mp4">
          </video>
        </div>

        <div class="card-body">
          <h2>{{ project.project_title }}</h2>
          <code class="semester-code">{{ project.semesterLabel }}</code>
          <span class="author-subtext">by {{ project.authorName }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
  .filter-controls {
    display: flex;
    gap: 15px;
    margin-top: 24px;
    justify-content: center;
  }

  .search-input, .tag-select {
    padding: 10px 15px;
    background: var(--code-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text-h);
    font-family: var(--sans);
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 300px);
    grid-auto-rows: auto;
    justify-content: space-between; 
    gap: 15px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px;
    box-sizing: border-box;
  }

  .vfx-card.compact {
    text-decoration: none;
    max-width: 300px; 
    border: 1px solid #DDD;
    border-radius: 15px;
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 4;
    margin-bottom: 30px;
  }

  .media-container {
    grid-row: 1;
    width: 100%;
    aspect-ratio: 16 / 9;
    background-image: url('src/assets/missing-thumb.png'); 
    background-size: cover;
    background-position: center;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-container video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: relative;
    z-index: 1;
    pointer-events: none; 
  }

  .card-body {
    grid-row: span 3;
    display: grid;
    grid-template-rows: subgrid;
    justify-items: center;
    margin-bottom: 15px;
  }

  .vfx-card.compact h2 {
    grid-row: 1;
    font-size: 1rem;
    margin: 0;
    line-height: 1.2;
  }

  .semester-code {
    background-color: #AAA;
    color: #333;
    font-size: 12px;
    align-self: center;
    width: fit-content;
    grid-row: 2;
  }

  .author-subtext {
    grid-row: 3;
    font-size: 0.8rem;
    color: var(--text);
    display: block;
  }
</style>