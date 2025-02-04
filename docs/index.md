---
title: "Arizona Crash Reports Dashboard"
toc: false
---

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;900&display=swap');

/* Dark Theme Styling */
:root {
  --primary-color: #ff9800;
  --secondary-color: #03a9f4;
  --text-color: white;
  --background-color: #121212;
}

/* Page Background */
body {
  background: var(--background-color);
  color: var(--text-color);
  font-family: "Poppins", Arial, sans-serif;
  text-align: center;
}

/* Navigation Menu */
.navbar {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 10px;
  margin: 20px auto;
  width: 90%;
}

.navbar a {
  text-decoration: none;
  color: var(--primary-color);
  font-weight: bold;
  font-size: 1.2rem;
  text-transform: uppercase;
  padding: 10px 15px;
  border-radius: 8px;
  transition: all 0.3s;
}

.navbar a:hover {
  background: var(--primary-color);
  color: white;
}

/* Hero Section with Arizona Crash Image */
.hero {
  padding: 5rem 0;
  background-image: url("accident");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  border-radius: 10px;
  margin: 20px auto;
  box-shadow: 0px 4px 10px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 90%;
  height: 300px;
  position: relative;
}

/* Dark Overlay to Improve Text Readability */
.hero::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
}

/* Centered Title */
.hero h1, .hero h2 {
  position: relative;
  z-index: 1;
}

.hero h1 {
  font-size: 4rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 15px;
  border-radius: 10px;
  display: inline-block;
}

.hero h2 {
  font-size: 1.8rem;
  font-style: italic;
  padding: 10px;
  border-radius: 8px;
  display: inline-block;
}

/* Team Section */
.team-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin: 3rem 0;
}

.team-member {
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 3rem;
  border-radius: 12px;
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  text-transform: uppercase;
  border: 3px solid var(--primary-color);
  transition: all 0.3s;
}

.team-member:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}
</style>

<!-- Navigation Bar -->
<div class="navbar">
  <a href="/">🏠 Home</a>
  <a href="/map">🗺️ Map</a>
  <a href="Bar%20chart%20(small%20multiples)">📊 Bar Chart</a>
  <a href="ConnectedScatter">📈 Connected Scatter</a>
  <a href="Ridgeline">📉 Ridgeline</a>
  <a href="Heatmap">🔥 Heatmap</a>
</div>

<div class="hero">
  <h1>Crash Trends in Arizona</h1>
  <h2>Data-Driven Insights for Arizona Roads</h2>
</div>

<div class="team-container">
  <div class="team-member">BILAL KHATEEB</div>
</div>
