<template>
  <nav class="main-nav">
    <div class="nav-links">
      <!-- <router-link to="/">Home</router-link>
      <router-link to="/games">Games</router-link> -->
      <div class="dropdown">
        <button class="dropbtn">Projects ▾</button>
        <div class="dropdown-content">
          <router-link to="/vfx">VFX Archive</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.main-nav {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: center;
}
.nav-links {
  display: flex;
  gap: 30px;
  align-items: center;
}
.nav-links a, .dropbtn {
  color: var(--text-h);
  text-decoration: none;
  font-weight: 500;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}
.nav-links a:hover, .dropbtn:hover { color: var(--accent); }

/* Basic Dropdown Logic */
.dropdown { position: relative; display: inline-block; }
.dropdown-content {
  display: none;
  position: absolute;
  background-color: var(--bg);
  min-width: 160px;
  border: 1px solid var(--border);
  z-index: 10;
}
.dropdown:hover .dropdown-content { display: block; }
.dropdown-content a {
  padding: 12px 16px;
  display: block;
  font-size: 14px;
}
</style>