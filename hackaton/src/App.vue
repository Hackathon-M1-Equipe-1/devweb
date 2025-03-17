<template>
  <div class="dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">🏠 Smart Dashboard</div>
      <ul class="nav-links">
        <li>🏠 Home</li>
        <li>📊 Analytics</li>
        <li>⚙️ Settings</li>
        <li>👤 Profile</li>
      </ul>
    </aside>

    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <h1>Dashboard Overview</h1>
        <button class="add-item">+ Add Item</button>
      </header>

      <!-- Widget Container -->
      <div class="widgets">
        <div class="widget" v-for="n in 4" :key="n">
          <h3>Widget {{ n }}</h3>
          <p>Content goes here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}

.dashboard {
  display: flex;
  font-family: Arial, sans-serif;
  height: 100vh;
  width: 100vw;
  background: #f4f4f4;
  margin: 0;
}

.sidebar {
  width: 200px;
  background: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 2px 0px 10px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.nav-links {
  list-style: none;
  padding: 0;
  width: 100%;
}

.nav-links li {
  padding: 15px;
  text-align: left;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;
}

.nav-links li:hover {
  background: #f0f0f0;
}

.main-content {
  flex-grow: 1;
  padding: 20px;
  margin: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}

.add-item {
  background: blue;
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  border: none;
}

.widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.widget {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
