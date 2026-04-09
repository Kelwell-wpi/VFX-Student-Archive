<script setup>
    import { computed } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();
    const modules = import.meta.glob('/public/archive/**/*.json', { eager: true });

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
            semesterLabel: proj.semester || semester,
            authorProjects: data.projects // Keep track of sibling projects for the sidebar
            });
        });
        }
    });
    return projects;
    });

    const project = computed(() => {
    return allProjects.value.find(p => p.id === route.params.id);
    });

    const authorWork = computed(() => {
    if (!project.value) return [];
    return allProjects.value.filter(p => 
        p.authorName === project.value.authorName && p.id !== project.value.id
    );
    });
</script>

<template>
  <div v-if="project" class="detail-container">
    <div class="main-content">
      <video controls class="hero-video">
        <source :src="project.videoUrl" type="video/mp4">
      </video>
      
      <div class="blueprint-embed">
        <h3>Logic & Blueprints</h3>
        <iframe :src="project.blueprint_url" width="100%" height="600" scrolling="no" allowfullscreen></iframe>
      </div>
    </div>

    <aside class="sidebar">
      <h1>{{ project.project_title }}</h1>
      <p class="author-tag">by {{ project.authorName }}</p>
      
      <div class="metadata-box">
        <p><strong>Engine:</strong> {{ project.engine_version }}</p>
        <p><strong>Instructions:</strong> {{ project.instruction_count }}</p>
        <p><strong>Semester:</strong> {{ project.semesterLabel }}</p>
      </div>

        <div class="more-from-author">
            <h3>More Work by {{ project.authorName }}</h3>
            <div class="thumb-grid">
                <router-link v-for="other in authorWork" :key="other.id" :to="'/project/' + other.id" class="thumb-link">
                <video muted class="thumb-vid">
                    <source :src="other.videoUrl" type="video/mp4">
                </video>
                <p style="font-size: 10px; margin-top: 5px;">{{ other.project_title }}</p>
                </router-link>
            </div>
        </div>
    </aside>
  </div>
</template>

<style scoped>
    .detail-container {
        width: 100%;
        display: grid;
        grid-template-columns: 1fr 350px;
        gap: 40px;
        text-align: left;
        padding: 40px 0;
    }

    .hero-video {
    width: 100%;
    aspect-ratio: 16 / 9; 
    object-fit: cover;    
    border-radius: 8px;
    background: #000;
    margin-bottom: 30px;
    display: block;       
    }

    .blueprint-embed {
    background: var(--code-bg);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--border);
    }

    .sidebar h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    }

    .author-tag {
    color: var(--accent);
    font-weight: 500;
    margin-bottom: 2rem;
    }

    .metadata-box {
    background: var(--accent-bg);
    padding: 20px;
    border-radius: 8px;
    border: 1px solid var(--accent-border);
    margin-bottom: 30px;
    }

    .metadata-box p {
    margin: 10px 0;
    font-size: 0.9rem;
    }

    .thumb-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 15px;
    }

    .thumb-link {
    text-decoration: none;
    color: inherit;
    }

    .thumb-vid {
    width: 100%;
    aspect-ratio: 16/9;
    object-cover: cover;
    border-radius: 4px;
    border: 1px solid var(--border);
    }

    @media (max-width: 1024px) {
    .detail-container {
        grid-template-columns: 1fr;
    }
    }
</style>