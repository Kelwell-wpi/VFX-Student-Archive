<script setup>
  import { ref, watchEffect, onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const project = ref(null);
  const authorWork = ref([]);
  const isLoading = ref(true);

  // Load modules eagerly from the file system
  const modules = import.meta.glob('/src/archive/**/*.json', { eager: true });

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const getThumbnailUrl = (url) => {
    const ytId = getYouTubeId(url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return '';
  };

  // Process all data and find the target project
  watchEffect(() => {
    const targetId = route.params.id;
    if (!targetId) return;

    let foundProject = null;
    const allProjects = [];

    // Flatten all projects into one array
    for (const path in modules) {
      const data = modules[path]?.default || modules[path];
      if (!data?.author || !data?.projects) continue;

      const pathParts = path.split('/');
      const semesterFolder = pathParts[3]; 

      data.projects.forEach((proj) => {
        const slug = `${data.author.name}-${proj.project_title}`
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, ''); // Defensive: strip special chars
        
        const projectObj = {
          ...proj,
          id: slug,
          authorName: data.author.name,
          videoUrl: proj.video_file,
          semesterLabel: proj.semester || semesterFolder
        };

        allProjects.push(projectObj);
        if (slug === targetId) {
          foundProject = projectObj;
        }
      });
    }

    if (foundProject) {
      project.value = foundProject;
      authorWork.value = allProjects.filter(p => 
        p.authorName === foundProject.authorName && p.id !== foundProject.id
      );
    }
    
    isLoading.value = false;
  });

  onMounted(() => window.scrollTo(0, 0));
</script>

<template>
  <div class="page-container">
    <div v-if="project" class="detail-layout">
      
      <main class="content-hero">
        <div class="video-stage">
          <iframe 
            v-if="getYouTubeId(project.videoUrl)"
            :src="`https://www.youtube.com/embed/${getYouTubeId(project.videoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(project.videoUrl)}`"
            frameborder="0"
            allow="autoplay; fullscreen"
            allowfullscreen
          ></iframe>
          <video v-else autoplay muted loop controls :src="project.videoUrl"></video>
        </div>

        <section v-if="project.blueprint_url" class="logic-viewer">
          <h3>Technical Implementation</h3>
          <iframe :src="project.blueprint_url" width="100%" height="600" scrolling="no"></iframe>
        </section>

        <section class="description">
          <h3>Project Summary</h3>
          <p>{{ project.description }}</p>
        </section>
      </main>

      <aside class="project-sidebar">
        <header>
          <h1>{{ project.project_title }}</h1>
          <p class="byline">Student Researcher: {{ project.authorName }}</p>
        </header>

        <div class="metadata-grid">
          <div class="meta-row"><span>Engine</span><strong>{{ project.engine_version }}</strong></div>
          <div class="meta-row"><span>Instructions</span><strong>{{ project.instruction_count }}</strong></div>
          <div class="meta-row"><span>Semester</span><strong>{{ project.semesterLabel }}</strong></div>
        </div>

        <div v-if="authorWork.length > 0" class="related-work">
          <h3>Other Portfolio Items</h3>
          <div class="related-list">
            <router-link v-for="other in authorWork" :key="other.id" :to="'/project/' + other.id" class="related-item">
              <img :src="getThumbnailUrl(other.videoUrl)" />
              <p>{{ other.project_title }}</p>
            </router-link>
          </div>
        </div>
      </aside>
    </div>

    <div v-else-if="!isLoading" class="missing-project">
      <h2>Project "{{ $route.params.id }}" not found.</h2>
      <p>Verify that the student metadata file exists in <code>src/archive/</code>.</p>
      <router-link to="/">← Back to Archive</router-link>
    </div>
  </div>
</template>

<style scoped>
  .page-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
  .detail-layout { display: grid; grid-template-columns: 1fr 360px; gap: 40px; text-align: left; }
  
  .video-stage { aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; margin-bottom: 30px; }
  .video-stage iframe, .video-stage video { width: 100%; height: 100%; }

  .project-sidebar h1 { font-size: 2.2rem; margin-bottom: 5px; line-height: 1.1; }
  .byline { color: #777; font-size: 1.1rem; margin-bottom: 30px; }

  .metadata-grid { background: #f4f4f4; padding: 20px; border-radius: 6px; margin-bottom: 30px; }
  .meta-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; font-size: 0.9rem; }
  .meta-row span { color: #666; text-transform: uppercase; font-size: 0.75rem; }

  .related-list { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
  .related-item { text-decoration: none; color: inherit; }
  .related-item img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 4px; }
  .related-item p { font-size: 0.7rem; margin-top: 5px; font-weight: bold; }

  .missing-project { text-align: center; padding: 100px; }

  @media (max-width: 1024px) {
    .detail-layout { grid-template-columns: 1fr; }
  }
</style>