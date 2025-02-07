---
title: "Map2"
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

// Define threshold color scale for crash counts
const colorScale = d3
  .scaleThreshold()
  .domain([1000, 2000, 5000, 10000, 15000, 40000, 60000, 90000])
  .range([
    "#F1A7A7", // Values below 1000
    "#EA7B7B", // 1000 to 2000
    "#E34F4F", // 2000 to 5000
    "#DC2323", // 5000 to 10000
    "#C61F1F", // 10000 to 15000
    "#B01C1C", // 15000 to 40000 – strong red variation
    "#841515", // 40000 to 60000 – even darker
    "#580E0E", // 60000 to 90000 – very dark red
    "#2C0707", // Above 90000 – darkest red
  ]);

const getColor = (crashCount) => colorScale(crashCount);

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
  const crashData = await FileAttachment("data/Arizona county crashes.csv").csv(
    { typed: true }
  );
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
        weight: 1.2,
        opacity: 0.8,
        color: "#111",
        fillOpacity: 0.7,
      };
    },
    onEachFeature: (feature, layer) => {
      const countyName = arizonaFIPS[feature.id];
      const crashCount = countyCrashMap[countyName] || 0;
      const classification = countyClassification[countyName] || "Unknown";


      // Bind tooltip as before
      layer.bindTooltip(
        `<div class="county-tooltip">
      <strong>${countyName}</strong><br>
      ${crashCount.toLocaleString()} crashes<br>
      <em>type: </em> ${classification}
    </div>`,
        {
          permanent: false,
          direction: "auto",
          opacity: 0.9,
          className: "county-tooltip",
        }
      );

      // Add event listeners to change the border color on hover.
      layer.on("mouseover", function () {
        this.setStyle({ color: "#04D9FF", weight: 2, opacity: 1 }); // light blue border on hover
      });

      layer.on("mouseout", function () {
        this.setStyle({ color: "#111", weight: 1.2, opacity: 0.8 }); // revert border color to black
      });

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
// Discrete Legend (Gradient Legend) Function
// ===============================
function createGradientLegend() {
  const legendContainer = document.getElementById("legend");
  legendContainer.innerHTML = ""; // Clear any existing content

  // Set legend container styles
  Object.assign(legendContainer.style, {
    position: "absolute",
    left: "10px",
    bottom: "77px",
    zIndex: "1000",
    background: "rgba(0, 0, 0, 0.75)",
    padding: "8px",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    color: "#ddd",
  });

  // Define the color mapping as an array of objects
  const colorMapping = [
    { label: "0 – 1k", color: "#F1A7A7" },
    { label: "1k – 2k", color: "#EA7B7B" },
    { label: "2k – 5k", color: "#E34F4F" },
    { label: "5k – 10k", color: "#DC2323" },
    { label: "10k – 15k", color: "#C61F1F" },
    { label: "15k – 40k", color: "#B01C1C" },
    { label: "40k – 60k", color: "#841515" },
    { label: "60k – 90k", color: "#580E0E" },
    { label: "≥ 90k", color: "#2C0707" },
  ];

  // Build the HTML for the legend items
  let legendHTML = "";
  colorMapping.forEach((item) => {
    legendHTML += `
      <div style="display: flex; align-items: center; margin-bottom: 0px;">
        <div style="width: 30px; height: 20px; background: ${item.color}; margin-right: 3px;"></div>
        <span>${item.label}</span>
      </div>
    `;
  });
  legendContainer.innerHTML = legendHTML;
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
