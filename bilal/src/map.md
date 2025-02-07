---
title: "Map"
theme: dark
toc: false
---

# 📍 Arizona Crash Distribution by County

This interactive map displays **the number of crashes per county**, colored by crash density.

<!-- Load Leaflet from CDN -->
<link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
<script src="https://d3js.org/d3.v6.min.js"></script> <!-- Load D3 for color scaling -->

<!-- Slider Container -->
<div id="sliderContainer" style="max-width: 900px; height: 50px; margin: 0; display: flex; align-items: center; justify-content: center; gap: 20px; border-radius: 10px;">
  <span style="font-size: 18px; font-weight: bold; color: white;">Select Year:</span>
  <input type="range" id="yearRange" min="" max="" step="1" value="" style="width: 230px; height: 6.2px; accent-color: #4c8cff; margin: 0;">
  <span id="yearDisplay" style="font-size: 18px; font-weight: bold; color: #fff;"></span>
</div>

<div id="container">
  <!-- Map Container -->
  <div id="MapArizona" style="width: 100%; height: 650px; margin-bottom: 50px;"></div>
  <!-- Donut Chart Container -->
  <div id="chartContainer">
    <h3 id="chartTitle">
      <span class="highlight-text">🔍 Select a County</span>  
      <br>  
      <span class="subtitle">to Explore Crash Insights</span>
    </h3>   
    <svg id="donutChart"></svg>
    <div id="donutLegend"></div>
  </div>
</div>

<!-- Legend Container -->
<div id="legend"></div>

```js
// ===============================
// Global Declarations & Configurations
// ===============================
const arizonaFIPS = {
  "04001": "Apache",
  "04003": "Cochise",
  "04005": "Coconino",
  "04007": "Gila",
  "04009": "Graham",
  "04011": "Greenlee",
  "04012": "La Paz",
  "04013": "Maricopa",
  "04015": "Mohave",
  "04017": "Navajo",
  "04019": "Pima",
  "04021": "Pinal",
  "04023": "Santa Cruz",
  "04025": "Yavapai",
  "04027": "Yuma",
};

const countyClassification = {
  Apache: "Rural",
  Cochise: "Urban",
  Coconino: "Urban",
  Gila: "Urban",
  Graham: "Rural",
  Greenlee: "Rural",
  "La Paz": "Urban",
  Maricopa: "Urban",
  Mohave: "Urban",
  Navajo: "Rural",
  Pima: "Urban",
  Pinal: "Urban",
  "Santa Cruz": "Rural",
  Yavapai: "Urban",
  Yuma: "Urban",
};

const fixedDomainMin = 100;
const fixedDomainMax = 75000;
const fixedLegendStops = [100, 2000, 10000, 60000];

// D3 color scale (for county colors & legend)
const getColorScale = d3
  .scaleSequential((t) => d3.interpolateViridis(1 - t))
  .domain([Math.log10(fixedDomainMin), Math.log10(fixedDomainMax)]);

const getColor = (crashCount) =>
  getColorScale(Math.log10(Math.max(fixedDomainMin, crashCount)));

// ===============================
// Initialize Map
// ===============================
const map = L.map("MapArizona", {
  center: [34.2, -111.5],
  zoom: 6.9,
  minZoom: 6.5,
  maxZoom: 9,
  maxBounds: [
    [31.0, -116.0],
    [37.5, -108.5],
  ],
  maxBoundsViscosity: 0.8,
});

L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors',
}).addTo(map);

// ===============================
// Data Loading and Event Setup
// ===============================
async function loadCrashData() {
  const crashData = await FileAttachment(
    "data/Arizona county crashes.csv"
  ).csv({ typed: true });
  console.log("Crash Data Sample:", crashData.slice(0, 5));

  // Extract unique years and initialize slider
  const uniqueYears = [...new Set(crashData.map((d) => d.Year))].sort(
    (a, b) => a - b
  );
  const yearRangeEl = document.getElementById("yearRange");
  const yearDisplayEl = document.getElementById("yearDisplay");
  yearRangeEl.min = uniqueYears[0];
  yearRangeEl.max = uniqueYears[uniqueYears.length - 1];
  yearRangeEl.value = uniqueYears[uniqueYears.length - 1];
  yearDisplayEl.textContent = yearRangeEl.value;

  // Store data globally for later use
  window.crashData = crashData;
  createCountyLayer(crashData, yearRangeEl.value);

  // Slider change event
  yearRangeEl.addEventListener("input", function () {
    const selectedYear = this.value;
    yearDisplayEl.textContent = selectedYear;
    createCountyLayer(window.crashData, selectedYear);
    if (window.selectedCounty) {
      updateDonutChart(
        window.selectedCounty,
        window.crashData.filter(
          (d) =>
            d.county.trim() === window.selectedCounty && d.Year == selectedYear
        )
      );
    }
  });
}

// ===============================
// Create County Layer Function
// ===============================
async function createCountyLayer(crashData, selectedYear) {
  const response = await fetch(
    "https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json"
  );
  const geojson = await response.json();

  // Filter to Arizona counties only
  geojson.features = geojson.features.filter((f) => arizonaFIPS[f.id]);

  // Build lookup for county crash counts for the selected year
  const countyCrashMap = {};
  crashData
    .filter((d) => d.Year == selectedYear)
    .forEach((d) => {
      const countyName = d.county.trim();
      countyCrashMap[countyName] = d.crashes_n_total || 0;
    });

  // Remove any existing county layer
  if (window.countyLayer) {
    map.removeLayer(window.countyLayer);
  }

  // Create new GeoJSON layer
  window.countyLayer = L.geoJSON(geojson, {
    style: (feature) => {
      const countyName = arizonaFIPS[feature.id];
      const crashCount = countyCrashMap[countyName] || 0;
      return {
        fillColor: getColor(crashCount),
        weight: 1.5,
        opacity: 1,
        color: "#000",
        fillOpacity: 0.7,
      };
    },
    onEachFeature: (feature, layer) => {
      const countyName = arizonaFIPS[feature.id];
      const crashCount = countyCrashMap[countyName] || 0;
      // Bind tooltip
      const classification = countyClassification[countyName] || "Unknown";
      layer.bindTooltip(
        `<div class="county-tooltip">
          <strong>${countyName}</strong><br>
          ${crashCount.toLocaleString()} crashes<br>
          <em>type:  </em> ${classification}
        </div>`,
        {
          permanent: false,
          direction: "auto",
          opacity: 0.9,
          className: "county-tooltip",
        }
      );

      // On click, update donut chart
      layer.on("click", () => {
        window.selectedCounty = countyName;
        updateDonutChart(
          countyName,
          crashData.filter(
            (d) => d.county.trim() === countyName && d.Year == selectedYear
          )
        );
      });
    },
  }).addTo(map);

  // Create legend after county layer is updated
  createGradientLegend();
}

// ===============================
// Gradient Legend Function
// ===============================
function createGradientLegend() {
  const legendContainer = document.getElementById("legend");
  legendContainer.innerHTML = ""; // Clear existing content

  // Set legend container styles
  Object.assign(legendContainer.style, {
    position: "absolute",
    left: "20px",
    bottom: "100px",
    zIndex: "1000",
    background: "rgba(0, 0, 0, 0.75)",
    padding: "5px",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    color: "#ddd",
  });

  const gradientWidth = "350px";
  const stops = fixedLegendStops;
  const logMin = Math.log10(fixedDomainMin);
  const logMax = Math.log10(fixedDomainMax);
  const positions = stops.map(
    (value) => ((Math.log10(value) - logMin) / (logMax - logMin)) * 100
  );

  const colorScale = d3
    .scaleSequential((t) => d3.interpolateViridis(1 - t))
    .domain([logMin, logMax]);

  const gradientStops = stops
    .map((value, i) => {
      const pos = positions[i].toFixed(0);
      const col = colorScale(Math.log10(value));
      return `${col} ${pos}%`;
    })
    .join(", ");

  const gradientLine = `<div style="width: ${gradientWidth}; height: 15px; background: linear-gradient(to right, ${gradientStops});"></div>`;
  const labelsHTML = `<div style="display: flex; justify-content: space-between; width: ${gradientWidth};">
      <span>${stops[0]}</span>
      <span>${stops[1]}</span>
      <span>${stops[2]}</span>
      <span>+${stops[3]}</span>
    </div>`;

  legendContainer.innerHTML = gradientLine + labelsHTML;
}

// ===============================
// Donut Chart Update Function
// ===============================
function updateDonutChart(countyName, data) {
  const chartContainer = document.getElementById("chartContainer");
  chartContainer.innerHTML = `
      <h4 id="chartTitle">County Insights: ${countyName}</h4>
      <svg id="donutChart"></svg>
      <div id="donutLegend"></div>
    `;

  if (!data.length) return;

  const crashData = {
    Fatal: data[0].crashes_n_fatal || 0,
    Injury: data[0].crashes_n_injury || 0,
    PDO: data[0].crashes_n_PDO || 0,
  };

  const totalCrashes = crashData.Fatal + crashData.Injury + crashData.PDO;
  const width = 270,
    height = 270,
    radius = Math.min(width, height) / 2;
  const color = d3
    .scaleOrdinal()
    .domain(Object.keys(crashData))
    .range(["#ff4c4c", "#ff9900", "#ffdb4d"]);

  const svg = d3
    .select("#donutChart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie().value((d) => d[1]);
  const data_ready = pie(Object.entries(crashData));
  const arc = d3.arc().innerRadius(70).outerRadius(radius);

  svg
    .append("defs")
    .append("filter")
    .attr("id", "shadow")
    .append("feDropShadow")
    .attr("dx", "2")
    .attr("dy", "2")
    .attr("stdDeviation", "4");

  svg
    .selectAll("path")
    .data(data_ready)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (d) => color(d.data[0]))
    .attr("class", "donut-shadow")
    .attr("stroke", "#ffffff")
    .style("stroke-width", "2px")
    .style("opacity", "0.9");

  svg
    .selectAll("text")
    .data(data_ready)
    .enter()
    .append("text")
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .attr("class", "donut-label")
    .text((d) => `${((d.data[1] / totalCrashes) * 100).toFixed(1)}%`);

  svg
    .append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("class", "donut-center")
    .text(`${totalCrashes.toLocaleString()} crashes`);

  // Build donut legend
  const legendContainer = document.getElementById("donutLegend");
  legendContainer.innerHTML = Object.keys(crashData)
    .map(
      (category) => `
          <div class="donut-legend-item">
              <div class="donut-legend-box" style="background: ${color(
                category
              )}"></div>
              ${category}
          </div>
      `
    )
    .join("");
  legendContainer.innerHTML += `
      <div>
          <p id="pdoInfo" class="pdo-description">
              ℹ️ PDO (Property Damage Only)
          </p>
      </div>`;
}

// ===============================
// Initialize
// ===============================
loadCrashData();
```

```html
<style>
  /* Map and container styling */
  #MapArizona {
    width: 75%;
    height: 500px;
    max-width: 900px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #111;
    margin: 0 auto;
    border-radius: 10px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
  }
  #container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
  }
  #chartContainer {
    width: 35%;
    height: 610px;
    background: rgba(6, 6, 6, 0.3);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 3px 3px 12px rgba(0, 0, 0, 0.4);
    margin-left: 10px;
  }
  #donutChart {
    width: 270px;
    height: 270px;
  }
  /* Chart Title styling */
  #chartTitle {
    font-size: 19px;
    font-weight: bold;
    text-align: center;
    color: #ffffff;
    padding: 19px;
    border-radius: 15px;
    background: linear-gradient(135deg, rgb(26, 22, 22), #4d4d4d);
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.6);
    margin-bottom: 20px;
  }
  .highlight-text {
    font-size: 24px;
    font-weight: bold;
    color: rgba(255, 217, 0, 0.77);
    text-shadow: 1px 1px 4px rgba(255, 215, 0, 0.3);
  }
  .subtitle {
    font-size: 16px;
    color: #ddd;
    font-style: italic;
    text-shadow: 1px 1px 4px rgba(255, 255, 255, 0.25);
  }
  /* Donut chart styling */
  .donut-label {
    font-size: 14px;
    font-weight: bold;
    text-anchor: middle;
    fill: white;
    stroke: black;
    stroke-width: 2px;
    paint-order: stroke fill;
  }
  .donut-center {
    font-size: 18px;
    font-weight: bold;
    fill: #ffffff;
    stroke: black;
    stroke-width: 0.2px;
    text-anchor: middle;
    pointer-events: none;
  }
  .donut-shadow {
    filter: drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.4));
  }
  #donutLegend {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
  }
  .donut-legend-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    color: white;
  }
  .donut-legend-box {
    width: 14px;
    height: 14px;
    margin-right: 6px;
    border-radius: 3px;
    border: 1px solid #ddd;
  }
  .pdo-description {
    font-size: 11px;
    color: #ddd;
    margin-top: 12px;
    text-align: center;
    font-style: italic;
    background: rgba(0, 0, 0, 0.3);
    padding: 6px 10px;
    border-radius: 6px;
    max-width: 240px;
  }
  @media (max-width: 900px) {
    #container {
      flex-direction: column;
      align-items: center;
    }
    #MapArizona,
    #chartContainer {
      width: 90%;
      margin-bottom: 20px;
    }
  }
  /* County tooltip styling */
  .county-tooltip {
    font-size: 14px;
    color: #fff;
    background: rgba(17, 17, 17, 0.6);
    padding: 1px;
    border-radius: 5px;
    text-align: center;
    border: 0;
  }
  .county-crash {
    font-size: 15px;
    font-weight: bold;
    color: #fff;
  }
  /* Remove default focus outline from Leaflet interactive layers */
  .leaflet-interactive:focus,
  .leaflet-interactive:active {
    outline: none !important;
  }
  /* Legend styling */
  #legend {
    position: absolute;
    left: 20px;
    bottom: 20px;
    z-index: 1000;
  }
</style>
```
