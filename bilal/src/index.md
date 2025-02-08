---
title: "Arizona Crash"
theme: dark
toc: false
---

<div class="hero">
  <div class="hero-overlay">
    <h1>Crash Trends in Arizona</h1>
    <h2>Data-Driven Insights for Arizona Roads</h2>
  </div>
  <img src="data/accident.jpg" alt="Crash Data" class="hero-image">
</div>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;900&display=swap');

/* 🎨 Dark Theme Styling */
:root {
  --primary-color: #ff9800;
  --secondary-color: #03a9f4;
  --text-color: white;
  --background-color: #121212;
}

/* 📌 Page Background */
body {
  color: var(--text-color);
  font-family: "Poppins", Arial, sans-serif;
  text-align: center;
}

/* 🖼 Hero Section */
.hero {
  position: relative;
  width: 90%;
  max-width: 900px;
  height: 450px;
  margin: 0 auto;
  border-radius: 20px;
  overflow: hidden;
}

/* 🌄 Hero Image */
.hero-image {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
}

/* 🔲 Overlay (Dark Background for Readability) */
.hero-overlay {
  position: absolute;
  inset: 0; /* Shorthand for top: 0; left: 0; width: 100%; height: 100%; */
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
}

/* 🏆 Title & Subtitle */
.hero-overlay h1 {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 10px;
}

.hero-overlay h2 {
  font-size: 2rem;
  font-style: italic;
}

/* 👤 Team Section */
.team-container {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 20px;
}

.team-member {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 3rem;
  border-radius: 12px;
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
  text-transform: uppercase;
  border: 3px solid var(--primary-color);
  transition: background 0.3s, transform 0.3s;
}

.team-member:hover {
  background: var(--primary-color);
  color: white;
  transform: scale(1.1);
}

/* 📌 RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .hero-overlay h1 { font-size: 3.5rem; }
  .hero-overlay h2 { font-size: 1.8rem; }
}

@media (max-width: 768px) {
  .hero-overlay h1 { font-size: 3rem; }
  .hero-overlay h2 { font-size: 1.5rem; }
}

@media (max-width: 480px) {
  .hero-overlay h1 { font-size: 2.5rem; }
  .hero-overlay h2 { font-size: 1.3rem; }
  
  .team-container {
    flex-direction: column;
    gap: 1.5rem;
  }

  .team-member {
    font-size: 1.5rem;
    padding: 0.8rem 2rem;
  }
}
</style>

<div class="team-container">
  <div class="team-member">BILAL KHATEEB
    <div style="font-size:25px; color:white">s5835711</div>
  </div>
</div>
