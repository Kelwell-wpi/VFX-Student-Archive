<script setup>
import { computed } from 'vue';

// Use eager glob to grab all student metadata
const modules = import.meta.glob('/public/archive/**/*.json', { eager: true });

const allProjects = computed(() => {
  const projects = [];
  Object.keys(modules).forEach((path) => {
    // Vite glob imports can have different structures; this handles both
    const data = modules[path].default || modules[path];
    
    const pathParts = path.split('/');
    const semester = pathParts[3]; 
    const studentFolder = pathParts[4];
    const assetBase = `/archive/${semester}/${studentFolder}/`;

    if (data.projects) {
      data.projects.forEach((proj) => {
        projects.push({
          ...proj,
          authorName: data.author.name,
          videoUrl: `${assetBase}${proj.video_file}`,
          semesterLabel: proj.semester || semester // Fallback to folder name
        });
      });
    }
  });
  return projects;
});
</script>

<template>
  <div id="center">
    <header class="gallery-header">
      <div class="counter">VFX Research Archive</div>
      <h1>Student Submissions</h1>
      <p>A searchable database of technical art, shaders, and generative soundscapes.</p>
    </header>

    <div class="project-grid">
      <article v-for="project in allProjects" :key="project.project_title" class="vfx-card">
        <div class="media-container">
          <video controls preload="metadata">
            <source :src="project.videoUrl" type="video/mp4">
          </video>
        </div>

        <div class="card-body">
          <div class="card-meta">
            <h2>{{ project.project_title }}</h2>
            <code class="semester-code">{{ project.semesterLabel }}</code>
          </div>
          
          <p class="description">{{ project.description }}</p>
          
          <div class="tag-cloud">
            <span v-for="tag in project.tags" :key="tag" class="tech-tag">
              {{ tag }}
            </span>
          </div>

          <footer class="card-footer">
            <span class="author">{{ project.authorName }}</span>
            <a :href="project.blueprint_url" target="_blank" class="blueprint-link">
              BlueprintUE ↗
            </a>
          </footer>
        </div>
      </article>
    </div>
    
    <div id="spacer">
      <div class="ticks"></div>
    </div>
  </div>
</template>

<style scoped>
/* Leveraging your existing :root variables */
.gallery-header {
  margin-bottom: 48px;
  max-width: 800px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
  width: 100%;
  padding: 0 32px;
  box-sizing: border-box;
  text-align: left;
}

.vfx-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow);
  }
}

.media-container video {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--text-h);
  display: block;
}

.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.semester-code {
  font-size: 12px;
  background: var(--accent-bg);
  color: var(--accent);
}

.description {
  font-size: 16px;
  line-height: 1.5;
  color: var(--text);
  margin-bottom: 20px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  margin-bottom: 24px;
}

.tech-tag {
  font-family: var(--mono);
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  text-transform: uppercase;
  color: var(--text);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border);
}

.author {
  font-weight: 500;
  color: var(--text-h);
}

.blueprint-link {
  font-size: 14px;
  color: var(--accent);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

@media (max-width: 1024px) {
  .project-grid {
    grid-template-columns: 1fr;
    padding: 0 20px;
  }
}
</style>