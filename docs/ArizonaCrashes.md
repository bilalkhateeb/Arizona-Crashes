---
title: "Arizona Crashes"
theme: dark
toc: true
---


```html
<style>
  body {
    transform-origin: top center;
    width: 95%;  /* Compensate for shrinkage */
    min-width: 1024px;
    word-spacing: 3px;
  }
</style>

```

# Arizona: More than Two Decades of Change Through Arizona’s Roads.
## County by County

```html
<div style="width:90%; margin-top: 0px; margin-left: 20px; font-size:17px">
  Arizona’s roads weave through a landscape as diverse as its counties—from the
  bustling streets of Phoenix in Maricopa County to the remote highways cutting
  through the Navajo Nation and Apache County. Yet, each county tells a different
  tale when it comes to traffic safety, with its own unique challenges. As we
  delve into the data, we uncover stories of policy changes, infrastructure
  investments, and community responses that have shaped the safety of Arizona’s
  roads.
</div>
```

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
  <div id="MapArizona" style="width: 100%; height: 650px; margin-top: 0px;">
  <!-- Legend Container -->
<div id="legend"></div>
</div>
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
  Cochise: "Rural",
  Coconino: "Rural",
  Gila: "Rural",
  Graham: "Rural",
  Greenlee: "Rural",
  "La Paz": "Rural",
  Maricopa: "Urban",
  Mohave: "Rural",
  Navajo: "Rural",
  Pima: "Urban",
  Pinal: "Urban",
  "Santa Cruz": "Rural",
  Yavapai: "Rural",
  Yuma: "Rural",
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
// 1) Declare a reference variable so we can store the last-selected layer
// 1) Keep a reference to the currently selected Leaflet layer
let selectedLayer = null;

// 2) Also store the selected county name globally so we can re-highlight it after year changes
window.selectedCountyName = null;

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

      // Tooltip
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

      // Mouseover highlight (unless it’s currently selected)
      layer.on("mouseover", function () {
        if (selectedLayer !== layer) {
          this.setStyle({ color: "#04D9FF", weight: 2, opacity: 1 });
        }
      });

      // Mouseout revert (if not selected)
      layer.on("mouseout", function () {
        if (selectedLayer !== layer) {
          this.setStyle({ color: "#111", weight: 1.2, opacity: 0.8 });
        }
      });

      // Click handler
      layer.on("click", () => {
        // Revert old selected if it’s a different layer
        if (selectedLayer && selectedLayer !== layer) {
          selectedLayer.setStyle({
            color: "#111",
            weight: 1.2,
            opacity: 0.8,
          });
        }

        // Store the newly selected county + layer
        window.selectedCountyName = countyName;
        selectedLayer = layer;

        // Apply a thicker highlight border
        layer.setStyle({
          color: "#04D9FF",
          weight: 4,
          opacity: 1,
        });

        // Update donut chart
        window.selectedCounty = countyName;
        updateDonutChart(
          countyName,
          crashData.filter(
            (d) => d.county.trim() === countyName && d.Year == selectedYear
          )
        );
      });

      // 3) Check if this county was selected previously
      //    If so, re-apply the highlight style
      if (window.selectedCountyName === countyName) {
        selectedLayer = layer;
        layer.setStyle({
          color: "#04D9FF",
          weight: 4,
          opacity: 1,
        });
      }
    },
  }).addTo(map);

  // Finally, re-create the legend
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
    bottom: "10px",
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
    position: relative;
    height: 500px;
    max-width: 1000px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #111;
    margin: 0 auto;
    border-radius: 10px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
    transform: scale(0.95);  /* 120% zoom */
  }
  #container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin: 0 auto;
    margin-top: -20px;
    margin-left: -40px;
    width: 102%;
    transform: scale(0.95);  /* 120% zoom */
  }
  #chartContainer {
    width: 35%;
    height: 630px;
    background: rgba(6, 6, 6, 0.3);
    border-radius: 12px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 3px 3px 12px rgba(0, 0, 0, 0.4);
    transform: scale(0.95);  /* 120% zoom */
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

```html
<div style="width: 90%; margin-top: 20px; margin-left: 20px; font-size:17px">
  Arizona’s roads reflect unique safety challenges. <b>Maricopa</b> County improved
  congestion with <b>hands-free</b> driving laws (2021) and light rail expansion
  (2008-2022). <b>Pima County</b> adopted <b>Vision Zero (2020), a strategy to eliminate 
    traffic deaths and severe injuries through safer road design and policies,
  </b> and stricter motorcycle safety laws (2019), but its impact is yet to be seen. 
  <b>Coconino County</b> invested in <b>road maintenance (2018)</b> and
  <b>wildlife crossings (2022)</b> to reduce crashes. Apache County enhanced <b>emergency
  response (2017)</b> and <b>DUI awareness (2019)</b>. <b>Gila County</b> addressed truck-related
  crashes and ATV accidents with <b>stricter safety measures (2021)</b>. Between
  <b>2008-2010</b>, crashes dropped due to the <b>economic downturn</b>, better enforcement,
  and improved road safety. Statewide efforts like highway expansions
  (2015-2022), medical response improvements (2016), and DUI crackdowns (2018)
  have shown mixed results.

  <div
    style="font-size: 17px; font-style: italic; color: gray; border-left: 4px solid #ccc; padding-left: 10px; padding-top: 10px"
  >
    Sources: Arizona Governor’s Office of Highway Safety https://gohs.az.gov - Arizona Department of Transportation https://azdot.gov
  </div>
</div>
```

---


# Rising Crashes, Rising Fatals?

## Urban vs. Rural

<div style="width: 90%; margin-left: 20px; margin-top: 25px; margin-bottom: 30px; font-size:17px">
In the bustling streets of Phoenix and Tucson, honking horns and stop-and-go traffic create an environment where crashes are frequent but rarely fatal. Meanwhile, on the long, open highways of Apache and Gila Counties, a single moment of distraction can turn deadly, with emergency responders sometimes miles away.
</div>

<div id="Barchart"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

// ===============================
// Global Configurations & Helper Functions
// ===============================
async function loadData() {
  try {
    // Load the CSV file from "FileAttachment"
    const data = await FileAttachment("data/Arizona county crashes.csv").csv({
      typed: true,
    });
    console.log("CSV data loaded:", data);
    return data;
  } catch (e) {
    console.error("Error loading CSV file:", e);
    return [];
  }
}

function createSlider(uniqueYears) {
  const sliderContainer = document.createElement("div");
  sliderContainer.style.marginBottom = "20px";
  sliderContainer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
      <span style="font-size: 16px; font-weight: bold; color: white;">Select Year:</span>
      <input type="range" id="BarChartyearRange" 
             min="${uniqueYears[0]}" 
             max="${uniqueYears[uniqueYears.length - 1]}" 
             step="1" 
             value="${uniqueYears[uniqueYears.length - 1]}"
             style="width: 200px; height: 6px; accent-color: #4c8cff; margin: 0;">
      <span id="BaryearDisplay" style="font-size: 16px; font-weight: bold; color: #fff;">
        ${uniqueYears[uniqueYears.length - 1]}
      </span>
    </div>
  `;
  return sliderContainer;
}

function createLegend() {
  // Legend container for charts
  const legendContainer = document.createElement("div");
  legendContainer.style.display = "flex";
  legendContainer.style.justifyContent = "center";
  legendContainer.style.alignItems = "center";
  legendContainer.style.gap = "20px";
  legendContainer.style.marginTop = "30px";
  legendContainer.innerHTML = `
    <div style="display: flex; align-items: center; gap: 5px;">
      <div style="width: 12px; height: 12px; background: steelblue; border: 1px solid white;"></div>
      <span style="color: white; font-size: 16px;">Total Crashes</span>
    </div>
    <div style="display: flex; align-items: center; gap: 5px;">
      <div style="width: 12px; height: 12px; background: red; border: 1px solid white;"></div>
      <span style="color: white; font-size: 16px;">Fatal Crashes</span>
    </div>
  `;
  return legendContainer;
}

// Function to aggregate crash data by county for a given year.
function aggregateData(crashData, selectedYear) {
  // Filter and aggregate data.
  const filteredData = crashData.filter((d) => d.Year === selectedYear);
  const aggregated = d3
    .rollups(
      filteredData,
      (v) => ({
        Total_Crashes: d3.sum(v, (d) => d.crashes_n_total) || 0,
        Fatal_Crashes: d3.sum(v, (d) => d.crashes_n_fatal) || 0,
      }),
      (d) => d.county
    )
    .map(([county, values]) => ({
      County: county,
      Total_Crashes: values.Total_Crashes || 1, // default 1 to avoid /0
      Fatal_Crashes: values.Fatal_Crashes || 0, // or 0 if none
    }));

  // Sort descending by Total Crashes
  aggregated.sort((a, b) => b.Total_Crashes - a.Total_Crashes);
  return aggregated;
}

// ===============================
// Chart Creation Functions
// ===============================

// We'll set up the sqrt domains for x-axis in each chart
const totalCrashesXDomain = [0, Math.sqrt(83000)]; // ~ sqrt(60,000)
const totalCrashesXTicks = [
  Math.sqrt(2000),
  Math.sqrt(10000),
  Math.sqrt(30000),
  Math.sqrt(60000),
];

const fatalCrashesXDomain = [0, Math.sqrt(500)]; // ~ sqrt(300)
const fatalCrashesXTicks = [
  Math.sqrt(50),
  Math.sqrt(100),
  Math.sqrt(200),
  Math.sqrt(300),
];

// 1) Create the "Total Crashes" Chart
function createTotalCrashesChart(aggregatedData, fixedCountyOrder) {
  // Transform data so we store sqrt for x, but also keep the original
  const transformedData = aggregatedData.map((d) => ({
    County: d.County,
    TotalC_sqrt: Math.sqrt(d.Total_Crashes), // for x-axis
    TotalC: d.Total_Crashes, // store original total
    FatalC: d.Fatal_Crashes, // store fatal crashes
  }));

  return Plot.plot({
    width: 650,
    height: 600,
    marginLeft: 140,
    marginRight: 0,
    marginBottom: 60,
    x: {
      label: "Total Crashes",
      domain: totalCrashesXDomain,
      ticks: totalCrashesXTicks,
      tickFormat: (d) => {
        const original = Math.round((d * d) / 1000) * 1000;
        return d3.format("~s")(original);
      },
      tickSize: 10,
      labelAnchor: "center",
      labelOffset: 60,
    },
    y: {
      domain: fixedCountyOrder,
      type: "band",
      label: "County",
      grid: true,
      tickSize: 10,
    },
    style: { fontSize: "17px", fontWeight: "bold" },
    marks: [
      Plot.barX(transformedData, {
        x: "TotalC_sqrt",
        y: "County",
        fill: "steelblue",
        title: (d) => {
          const classification = countyClassification[d.County] ?? "Unknown";
          const ratio = (d.FatalC / d.TotalC) * 100;
          return `${d.County}: ${d.TotalC.toLocaleString()} Total Crashes.`
          +`\nType: ${classification}`+`\nFatality Ratio: ${ratio.toFixed(2)}% `;
        },
        stroke: "white",
        strokeWidth: 0.5,
      }),
      Plot.ruleY(fixedCountyOrder, {
        stroke: "white",
        strokeWidth: 0.1,
        strokeDasharray: "3,2",
      }),
      Plot.ruleX([0]),
    ],
    color: { legend: false, domain: ["Total Crashes"], range: ["steelblue"] },
  });
}

// 2) Create the "Fatal Crashes" Chart
function createFatalCrashesChart(aggregatedData, fixedCountyOrder) {
  const transformedData = aggregatedData.map((d) => ({
    County: d.County,
    FatalC_sqrt: Math.sqrt(d.Fatal_Crashes),
    FatalC: d.Fatal_Crashes,
    TotalC: d.Total_Crashes,
  }));

  return Plot.plot({
    width: 350,
    height: 600,
    marginLeft: 30,
    marginBottom: 60,
    x: {
      label: "Fatal Crashes",
      domain: fatalCrashesXDomain,
      ticks: fatalCrashesXTicks,
      tickFormat: (d) => {
        const original = Math.round(d * d);
        return d3.format("~s")(original);
      },
      tickSize: 10,
      labelAnchor: "center",
      labelOffset: 60,
    },
    y: {
      domain: fixedCountyOrder,
      type: "band",
      label: "",
      ticks: [],
      tickSize: 10,
    },
    style: { fontSize: "17px", fontWeight: "bold" },
    marks: [
      Plot.barX(transformedData, {
        x: "FatalC_sqrt",
        y: "County",
        fill: "red",
        // This is where we show ratio in the tooltip
        title: (d) => {
          const classification = countyClassification[d.County] ?? "Unknown";
          const ratio = (d.FatalC / d.TotalC) * 100; // fatal / total * 100
          return (
            `${d.County}: ` +
            `${d.FatalC.toLocaleString()} Fatal Crashes\n` +
            `Type: ${classification}`+
            `\nFatality Ratio: ${ratio.toFixed(2)}%`
          );
        },
        stroke: "white",
        strokeWidth: 0.5,
      }),
      Plot.ruleX([0]),
      Plot.ruleY(fixedCountyOrder, {
        stroke: "white",
        strokeWidth: 0.3,
        strokeDasharray: "3,2",
      }),
    ],
    color: { legend: false, domain: ["Fatal Crashes"], range: ["red"] },
  });
}

// ===============================
// Update Charts Function
// ===============================
function updateCharts(selectedYear, crashData, chartsDiv, fixedCountyOrder) {
  selectedYear = Number(selectedYear);
  const aggregatedData = aggregateData(crashData, selectedYear);

  const totalChart = createTotalCrashesChart(aggregatedData, fixedCountyOrder);
  const fatalChart = createFatalCrashesChart(aggregatedData, fixedCountyOrder);

  // Put both charts side-by-side
  const chartsContainer = document.createElement("div");
  chartsContainer.style.display = "flex";
  chartsContainer.style.gap = "20px";

  chartsContainer.appendChild(totalChart);
  chartsContainer.appendChild(fatalChart);

  chartsDiv.innerHTML = "";
  chartsDiv.appendChild(chartsContainer);
}

// ===============================
// Main Initialization
// ===============================
(async () => {
  const app = document.getElementById("Barchart");
  app.innerHTML = ""; // Clear container

  const crashData = await loadData();
  if (!crashData || crashData.length === 0) {
    app.innerHTML =
      "<p style='color:red;'>No data loaded. Please check the CSV file attachment.</p>";
    return;
  }

  const uniqueYears = Array.from(new Set(crashData.map((d) => d.Year))).sort(
    (a, b) => a - b
  );
  if (uniqueYears.length === 0) {
    app.innerHTML = "<p style='color:red;'>No year data found in the file.</p>";
    return;
  }

  // We'll use 2023 as a reference for the Y-axis fixed order
  const aggregated2023 = aggregateData(crashData, 2023);
  const fixedCountyOrder = aggregated2023.map((d) => d.County);

  // 1. Create the slider
  const sliderContainer = createSlider(uniqueYears);
  app.appendChild(sliderContainer);

  // 2. Create placeholder for charts
  const chartsDiv = document.createElement("div");
  chartsDiv.id = "countyBarCharts";
  chartsDiv.innerHTML = "Loading Charts...";
  app.appendChild(chartsDiv);

  // 3. Legend
  const legendContainer = createLegend();
  app.appendChild(legendContainer);

  // Initial render with the latest year
  updateCharts(
    uniqueYears[uniqueYears.length - 1],
    crashData,
    chartsDiv,
    fixedCountyOrder
  );

  // Listen for slider changes
  const slider = document.getElementById("BarChartyearRange");
  slider.addEventListener("input", function () {
    document.getElementById("BaryearDisplay").textContent = this.value;
    updateCharts(this.value, crashData, chartsDiv, fixedCountyOrder);
  });
})();
```

```html
<style>
  #Barchart {
    width: 90%;
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px;
    margin-left: 0px;
    background: #111;
    border-radius: 12px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.5);
    font-family: sans-serif;
  }
</style>
```

```html
<div style="width: 90%; margin-left: 20px; margin-top: 50px; font-size:17px">
  Arizona’s traffic safety landscape presents a stark contrast between
  <b>urban and rural</b> regions. Urban counties like
  <b>Maricopa and Pima</b> experience the highest number of crashes due to dense
  traffic, frequent stop-and-go movement, and a rising number of distracted
  drivers. However, improved infrastructure, law enforcement, and traffic
  regulations, have helped mitigate fatalities despite high crash volumes.<br/>

  <b>Rural counties, including Apache, Navajo, Graham and Gila,</b> face the opposite
  challenge: fewer crashes but a disproportionately <b>high fatality rate</b>. The lack
  of immediate emergency response, long highway stretches, and high-speed travel
  contribute to severe crash outcomes. Efforts like <b>enhanced DUI enforcement</b>
  (2018) and <b>road safety investments (2015-2022)</b> have aimed to improve rural
  crash survival rates, but challenges persist.<br/>

  Tourist-heavy regions like <b>Coconino and Yavapai</b> Counties also see
  spikes in crash rates due to seasonal traffic, winter road hazards, and
  wildlife collisions. <b>Wildlife overpasses, introduced in 2022</b>, have helped
  reduce animal-vehicle accidents, but icy conditions remain a major hazard.
  <div
    style="font-size: 17px; font-style: italic; color: gray; border-left: 4px solid #ccc; padding-left: 10px; padding-top: 10px"
  >
    Sources: Arizona Department of Transportation, 2023 Traffic Safety Report https://azdot.gov - Arizona Governor’s Office of Highway Safety https://gohs.az.gov - Valley Metro Annual Report https://www.valleymetro.org - City of Tucson Transportation Department https://www.tucsonaz.gov/transportation
  </div>
</div>
```

---


# The Growth of Licensed Drivers and Registered Vehicles
## More Drivers, More Roads, More Challenges

<div style="width: 90%; margin-left: 20px; margin-top: 25px; margin-bottom: 30px; font-size:17px">
Arizona’s roads are a reflection of its evolution—shaped by booming cities, economic highs and lows, 
and world-changing events that influenced the way people drive. 
Between 1997 and 2023, the state saw a relentless rise in licensed drivers and registered vehicles.
</div>

<div id="connectedScatter"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

(async () => {
  const app = document.getElementById("connectedScatter");
  app.innerHTML = ""; // Clear previous content

  // Load the CSV file.
  const data = await FileAttachment(
    "data/Licensed drivers and registered vehicles.csv"
  ).csv({ typed: true });
  if (!data || data.length === 0) {
    app.innerHTML =
      "<p style='color:red;'>No data loaded. Please check the CSV file attachment.</p>";
    return;
  }

  // Create a container for the visualization.
  const container = document.createElement("div");
  container.className = "vis-container";

  // Create a toggle container for the two checkboxes.
  const toggleContainer = document.createElement("div");
  toggleContainer.className = "toggle-container";

  // Create checkbox for Licensed Drivers.
  const checkboxLicensed = document.createElement("input");
  checkboxLicensed.type = "checkbox";
  checkboxLicensed.className = "toggle-checkbox";
  checkboxLicensed.checked = true; // default checked

  const labelLicensed = document.createElement("span");
  labelLicensed.className = "toggle-label";
  labelLicensed.textContent = "Licensed Drivers";

  // Create checkbox for Registered Vehicles.
  const checkboxRegistered = document.createElement("input");
  checkboxRegistered.type = "checkbox";
  checkboxRegistered.className = "toggle-checkbox";
  checkboxRegistered.checked = false; // default unchecked

  const labelRegistered = document.createElement("span");
  labelRegistered.className = "toggle-label";
  labelRegistered.textContent = "Registered Vehicles";

  // Append the checkboxes and labels to the toggle container.
  toggleContainer.appendChild(checkboxLicensed);
  toggleContainer.appendChild(labelLicensed);
  toggleContainer.appendChild(checkboxRegistered);
  toggleContainer.appendChild(labelRegistered);

  container.appendChild(toggleContainer);

  // Create a div to hold the chart.
  const chartDiv = document.createElement("div");
  container.appendChild(chartDiv);

  // Append the container to the #app element.
  app.appendChild(container);

  // Helper function to get the currently selected variable.
  function getSelectedVariable() {
    if (checkboxLicensed.checked) return "Total Licensed Drivers";
    if (checkboxRegistered.checked) return "Total Registered Vehicles";
    return "Total Licensed Drivers";
  }

  // Render the chart based on the selected variable.
  function renderChart() {
    const variable = getSelectedVariable();
    chartDiv.innerHTML = ""; // Clear any previous chart

    // Compute the chart width based on the container.
    const chartWidth = container.clientWidth;

    const chart = Plot.plot({
      width: chartWidth,
      height: 520,
      background: "#111",
      marginBottom: 70,
      marginTop: 50,
      marginLeft: 60,
      marginRight: 25,
      x: {
        label: variable,
        labelOffset: 60,
        tickFormat: (d) => d3.format(".2s")(d),
        ticks: 7,
        tickSize: 15,
        nice: true,
        grid: true,
        tickColor: "#888",
        labelColor: "white",
      },
      y: {
        label: "Total Crashes",
        labelOffset: 30,
        tickFormat: (d) => d3.format(".2s")(d),
        ticks: 7,
        tickSize: 12,
        nice: true,
        grid: true,
        tickColor: "#888",
        labelColor: "white",
      },
      marks: [
        // Line connecting data points.
        Plot.line(data, {
          x: (d) => d[variable],
          y: "Total Crashes",
          stroke: variable === "Total Licensed Drivers" ? "#4c8cff" : "#ff4c4c",
          strokeWidth: 2,
          curve: "linear",
        }),
        // Dots at each data point.
        Plot.dot(data, {
          x: (d) => d[variable],
          y: "Total Crashes",
          fill: variable === "Total Licensed Drivers" ? "#4c8cff" : "#ff4c4c",
          r: 6,
          stroke: "white",
          strokeWidth: 1,
          title: (d) =>
            `Year: ${d.Year}\n${variable}: ${d3.format(",")(
              d[variable]
            )}\nTotal Crashes: ${d3.format(",")(d["Total Crashes"])}`,
        }),

        // Optional annotation for the year 2020.
        Plot.text(
          data.filter((d) => d.Year === 2020),
          {
            x: (d) => d[variable],
            y: "Total Crashes",
            text: (d) => "COVID-19",
            dx: -45,
            dy: -30,
            fill: "white",
            fontSize: 14,
            fontWeight: "bold",
          }
        ),
        // --- Year labels next to point ---
        Plot.text(
          data.filter((d, i) => i % 3 === 0), // Only every third point gets a label
          {
            x: (d) => d[variable],
            y: "Total Crashes",
            text: (d) => d.Year,
            dx: -22,
            dy: -10,
            textAnchor: "top",
            fontSize: 12,
            fill: "white",
          }
        ),
      ],

      style: {
        fontSize: "17px",
        fontFamily: "sans-serif",
      },
    });

    chartDiv.innerHTML = "";
    chartDiv.appendChild(chart);
  }

  // Enforce mutually exclusive checkbox behavior.
  checkboxLicensed.addEventListener("change", () => {
    if (checkboxLicensed.checked) {
      checkboxRegistered.checked = false;
    } else {
      if (!checkboxRegistered.checked) {
        checkboxLicensed.checked = true;
      }
    }
    renderChart();
  });

  checkboxRegistered.addEventListener("change", () => {
    if (checkboxRegistered.checked) {
      checkboxLicensed.checked = false;
    } else {
      if (!checkboxLicensed.checked) {
        checkboxRegistered.checked = true;
      }
    }
    renderChart();
  });

  // Initially render the chart.
  renderChart();

  // Listen for window resize events and re-render the chart.
  window.addEventListener("resize", renderChart);
})();
```

```html
<style>
  /* Basic styling for the app container */
  #connectedScatter {
    width: 90%;
    max-width: 1100px;
    margin: 0 auto;
    margin-left: 0px ;
    padding: 20px;
    font-family: sans-serif;
    background: #111;
    border-radius: 12px;
  }
  /* Center the visualization container */
  .vis-container {
    text-align: center;
  }

  /* Style for the toggle container */
  .toggle-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
  }
  /* Style for each checkbox */
  .toggle-checkbox {
    width: 20px;
    height: 20px;
  }
  /* Style for the toggle labels */
  .toggle-label {
    font-size: 16px;
    color: white;
  }
</style>
```

```html
<div style="width: 90%; margin-left: 20px; margin-top: 50px; font-size:17px">
The early 2000s brought a surge in vehicle ownership due to economic prosperity and migration, 
leading to more traffic congestion and crashes. 
However, the <b>2008 financial crisis</b> caused a dip as fewer people could afford cars or insurance, 
leading to a temporary decline in crashes. By <b>2011-2019, economic recovery</b> and infrastructure expansions, 
like the Loop 202 and Loop 303 projects (major freeway expansions in the Phoenix metropolitan area 
to improve connectivity and reduce congestion), encouraged more drivers on the road, 
which also resulted in fluctuating crash rates. The <b>COVID-19 pandemic (2020-2021)</b> led to a sharp 
decline in vehicle registrations as lockdowns and remote work limited travel, causing a significant drop in crashes. 
However, post-pandemic 2022-2023 saw a rapid rebound in registrations and licensing, 
resulting in increased road activity and a rise in crashes due to higher traffic volumes 
and commuting patterns returning to pre-pandemic levels. External factors like safety laws (Hands-Free Law, 2021), 
DUI enforcement (2010 - 2018), and highway improvements (2015-2022) played key roles in <b>shaping driver trends</b>. 
While safety laws have helped curb distracted driving-related accidents, increased vehicle numbers continue 
to challenge road safety. As Arizona continues to expand, balancing vehicle growth with safety 
measures remains crucial for the future of road travel.
  <div
    style="font-size: 17px; font-style: italic; color: gray; border-left: 4px solid #ccc; padding-left: 10px; padding-top: 10px"
  >
    Sources: Arizona Department of Transportation https://azdot.gov - Arizona Governor’s Office of Highway Safety https://gohs.az.gov - National Highway Traffic Safety Administration (NHTSA) https://www.nhtsa.gov
  </div>
</div>
```

---

# The Truth About Young Adult Drivers
## Young, Fast, Drunk, and Dangerous

<div style="width: 90%; margin-left: 20px; margin-top: 25px; margin-bottom: 30px; font-size:17px">
The roads of Arizona reveal a compelling history—one that unfolds through the statistics of traffic incidents, 
shaped by age, alcohol use, and the policies that have evolved over time. For many Arizonans, 
the first exposure to driving begins in their teenage years. This period, marked by inexperience, overconfidence, 
and frequent distractions, contributes to the disproportionately high number of crashes.
</div>

<div id="Ridgeline"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

// Global variables
let globalData = null;
let selectedYear = null;

// Ensure a main container #Ridgeline
let main = document.getElementById("Ridgeline");
if (!main) {
  main = document.createElement("div");
  main.id = "Ridgeline";
  document.body.appendChild(main);
}

// Create or get toggle container
let toggleDiv = document.getElementById("toggle");
if (!toggleDiv) {
  toggleDiv = document.createElement("div");
  toggleDiv.id = "toggle";
  main.insertAdjacentElement("afterbegin", toggleDiv);
} else {
  toggleDiv.innerHTML = "";
}

// Create or get slider container
let sliderDiv = document.getElementById("slider");
if (!sliderDiv) {
  sliderDiv = document.createElement("div");
  sliderDiv.id = "slider";
  main.insertAdjacentElement("afterbegin", sliderDiv);
} else {
  sliderDiv.innerHTML = "";
}

// Create or get charts container
let chartsDiv = document.getElementById("charts");
if (!chartsDiv) {
  chartsDiv = document.createElement("div");
  chartsDiv.id = "charts";
  main.appendChild(chartsDiv);
} else {
  chartsDiv.innerHTML = "";
}

// ----- Create Data Type Checkbox Control -----
let dataTypeCheckbox = document.getElementById("dataTypeCheckbox");
if (!dataTypeCheckbox) {
  dataTypeCheckbox = document.createElement("input");
  dataTypeCheckbox.type = "checkbox";
  dataTypeCheckbox.id = "dataTypeCheckbox";
  dataTypeCheckbox.checked = false; // Default: "All"
  let dataTypeLabel = document.createElement("label");
  dataTypeLabel.htmlFor = "dataTypeCheckbox";
  dataTypeLabel.textContent = "Alcohol Only";
  let dataTypeContainer = document.createElement("div");
  dataTypeContainer.appendChild(dataTypeCheckbox);
  dataTypeContainer.appendChild(dataTypeLabel);
  // Insert at top of toggleDiv
  toggleDiv.insertAdjacentElement("afterbegin", dataTypeContainer);
}
dataTypeCheckbox.addEventListener("change", () => {
  console.log(
    "Data type checkbox changed. Checked =",
    dataTypeCheckbox.checked
  );
  loadDataAndRender(); // Reload data but keep selectedYear
});

// ----- Create the View Toggle Control (Separate vs. Overlap) -----
let selectControl = document.getElementById("selectControl");
if (!selectControl) {
  selectControl = document.createElement("select");
  selectControl.id = "selectControl";
  ["Separate", "Overlap"].forEach((mode) => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    selectControl.appendChild(option);
  });
  selectControl.addEventListener("change", () => {
    renderChart(selectControl.value, selectedYear);
  });
  toggleDiv.appendChild(selectControl);
}

// ----- Create Year Slider Control -----
if (!document.getElementById("RidgelineYearSlider")) {
  sliderDiv.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px">
      <span style="font-size: 16px; font-weight: bold; color: white;">Select Year:</span>
      <input type="range" id="RidgelineYearSlider" style="width: 200px; height: 6px; accent-color: #4c8cff; margin: 0;">
      <span id="RidglineyearDisplay" style="font-size: 16px; font-weight: bold; color: #fff;"></span>
    </div>
  `;
  const yearSlider = document.getElementById("RidgelineYearSlider");
  yearSlider.addEventListener("input", () => {
    selectedYear = +yearSlider.value;
    document.getElementById("RidglineyearDisplay").textContent = selectedYear;
    renderChart(selectControl.value, selectedYear);
  });
}

// ===== Helper Functions =====
function getAgeGroups() {
  return {
    "15 and Under": { low: 10, high: 15 },
    "16-24": { low: 16, high: 24 },
    "25-34": { low: 25, high: 34 },
    "35-44": { low: 35, high: 44 },
    "45-54": { low: 45, high: 54 },
    "55-64": { low: 55, high: 64 },
    "65-74": { low: 65, high: 74 },
    "75 & Older": { low: 75, high: 85 },
  };
}

function groupLabel(ageGroup) {
  const s = String(ageGroup).trim();
  if (s.toLowerCase().includes("unknown")) return null;
  if (s === "15 & Under") return "15 and Under";
  if (["16", "17", "18", "19", "20", "21", "22", "23", "24"].includes(s))
    return "16-24";
  if (s.includes("-")) return s;
  return s;
}

function toNumber(str) {
  return typeof str === "number" ? str : +str.replace(/,/g, "");
}

// Aggregate the data by year
function aggregateDataByYear(data, year) {
  const ageGroups = getAgeGroups();
  const groupsOrder = Object.keys(ageGroups);
  const aggregated = {};
  data
    .filter((d) => d.Year === year)
    .forEach((d) => {
      const group = groupLabel(d["Driver Age Group"]);
      if (!group || !(group in ageGroups)) return;
      if (!aggregated[group])
        aggregated[group] = { pdo: 0, fatal: 0, injury: 0 };
      aggregated[group].pdo += toNumber(d["In PDO Crashes"]);
      aggregated[group].fatal += toNumber(d["In Fatal Crashes"]);
      aggregated[group].injury += toNumber(d["In Injury Crashes"]);
    });
  const aggregatedPoints = groupsOrder.map((group, i) => ({
    x: i + 1,
    group,
    midpoint: (ageGroups[group].low + ageGroups[group].high) / 2,
    pdo: aggregated[group]?.pdo || 0,
    fatal: aggregated[group]?.fatal || 0,
    injury: aggregated[group]?.injury || 0,
  }));
  const overlappingPoints = aggregatedPoints.map((d) => ({
    ...d,
    combined: d.fatal + d.injury,
  }));
  return { aggregatedPoints, overlappingPoints, groupsOrder };
}

// ===== Chart Creation Functions (from your existing code) =====

// createSeparateChart
function createSeparateChart(
  aggregatedPoints,
  groupsOrder,
  customTicks,
  tickMapping,
  containerWidth,
  isAlcohol
) {
  const chartsContainer = document.createElement("div");
  chartsContainer.className = "charts-container";
  chartsContainer.style.display = "flex";
  chartsContainer.style.flexDirection = "column";
  chartsContainer.style.gap = "10px";

  // Define measures with fixed y-axis ticks and fixed domains.
  const measures = [
    {
      key: "fatal",
      label: "Fatal",
      fill: "rgba(214,39,40,0.5)",
      stroke: "#d62728",
      yTicks: isAlcohol ? [0, 25, 50, 75, 100] : [0, 100, 200, 300],
      yDomain: isAlcohol ? [0, 100] : [0, 350],
    },
    {
      key: "injury",
      label: "Injury",
      fill: "rgba(255,165,0,0.5)",
      stroke: "#FFA500",
      yTicks: isAlcohol ? [0, 250, 500, 750, 1000] : [0, 5000, 10000, 15000],
      yDomain: isAlcohol ? [0, 1200] : [0, 20000],
    },
    {
      key: "pdo",
      label: "PDO",
      fill: "rgba(44,160,44,0.5)",
      stroke: "#2ca02c",
      yTicks: isAlcohol
        ? [0, 500, 1000, 1500]
        : [0, 10000, 20000, 30000, 40000],
      yDomain: isAlcohol ? [0, 1500] : [0, 40000],
    },
  ];

  measures.forEach((m, i) => {
    const dataToPlot = aggregatedPoints;
    const chart = Plot.plot({
      width: containerWidth,
      height: 150,
      background: "#111",
      marginBottom: 30,
      marginTop: 24,
      marginLeft: 80,
      marginRight: 40,
      x: {
        label:
          m.key === "fatal" || m.key === "injury"
            ? null
            : i === measures.length - 1
            ? "Driver Age Group"
            : null,
        domain: [1, groupsOrder.length],
        ticks: customTicks,
        tickFormat:
          m.key === "fatal" || m.key === "injury"
            ? () => ""
            : (d) => tickMapping[d] || d,
        tickSize: 12,
        grid: true,
        tickColor: "#888",
        labelColor: "white",
        labelOffset: 55,
      },
      y: {
        domain: m.yDomain,
        grid: true,
        tickColor: "#888",
        labelColor: "white",
        labelRotate: -90,
        labelOffset: 40,
        ticks: m.yTicks,
        nice: false,
      },
      marks: [
        Plot.areaY(dataToPlot, {
          x: (d) => d.x,
          y: (d) => d[m.key],
          y0: () => 0,
          fill: m.fill,
          curve: "catmull-rom",
        }),
        Plot.line(dataToPlot, {
          x: (d) => d.x,
          y: (d) => d[m.key],
          stroke: m.stroke,
          strokeWidth: 2,
          curve: "catmull-rom",
        }),
        Plot.dot(dataToPlot, {
          x: (d) => d.x,
          y: (d) => d[m.key],
          r: 4,
          fill: "#fff",
          title: (d) => `${d.group}\n${m.label}: ${d[m.key]}`,
        }),
      ],
      style: {
        fontSize: "16px",
        fontFamily: "sans-serif",
      },
    });
    chartsContainer.appendChild(chart);
  });

  // Create legend for Separate view
  let legend = document.createElement("div");
  legend.className = "legend";

  const legendItems = [
    { label: "Fatal", color: "#d62728" },
    { label: "Injury", color: "#FFA500" },
    { label: "PDO", color: "#2ca02c" },
  ];

  let legendHTML = `
    <span style="
      color: white;
      font-weight: bold;
      margin-right: 10px;
    ">Counts by Category:</span>
  `;

  legendHTML += legendItems
    .map(
      (item) => `
    <div class="legend-item" style="display: flex; align-items: center; gap: 5px;">
      <div class="legend-color"
           style="width:15px; height:15px; border:1px solid #fff; background-color:${item.color};"></div>
      <span>${item.label}</span>
    </div>
  `
    )
    .join("");

  legend.innerHTML = legendHTML;
  chartsContainer.appendChild(legend);

  return chartsContainer;
}

// createOverlapChart
function createOverlapChart(
  aggregatedPoints,
  overlappingPoints,
  groupsOrder,
  customTicks,
  tickMapping,
  containerWidth,
  isAlcohol
) {
  const localYDomain = isAlcohol ? [0, 1500] : [0, 40000];

  const chart = Plot.plot({
    width: containerWidth,
    height: 500,
    background: "#111",
    marginBottom: 60,
    marginTop: 50,
    marginLeft: 80,
    marginRight: 40,
    x: {
      label: "Driver Age Group",
      domain: [1, groupsOrder.length],
      ticks: customTicks,
      tickFormat: (d) => tickMapping[d] || d,
      tickSize: 12,
      grid: true,
      tickColor: "#888",
      labelColor: "white",
      labelOffset: 55,
    },
    y: {
      domain: localYDomain,
      grid: true,
      tickColor: "#888",
      labelColor: "white",
      labelRotate: -90,
      labelOffset: 40,
      ticks: isAlcohol ? [0, 750, 1500] : [0, 20000, 40000],
    },
    marks: [
      Plot.areaY(aggregatedPoints, {
        x: (d) => d.x,
        y: (d) => d.pdo,
        y0: () => 0,
        fill: "rgba(44,160,44,0.5)",
        curve: "catmull-rom",
      }),
      Plot.line(aggregatedPoints, {
        x: (d) => d.x,
        y: (d) => d.pdo,
        stroke: "#2ca02c",
        strokeWidth: 2,
        curve: "catmull-rom",
      }),
      Plot.areaY(overlappingPoints, {
        x: (d) => d.x,
        y: (d) => d.combined,
        y0: () => 0,
        fill: isAlcohol ? "rgba(214,39,40,0.6)" : "rgba(214,39,40,0.75)",
        curve: "catmull-rom",
        style: { mixBlendMode: "multiply" },
      }),
      Plot.line(overlappingPoints, {
        x: (d) => d.x,
        y: (d) => d.combined,
        stroke: "#d62728",
        strokeWidth: 2,
        curve: "catmull-rom",
      }),
      Plot.dot(aggregatedPoints, {
        x: (d) => d.x,
        y: (d) => d.pdo,
        r: 4,
        fill: "#fff",
        title: (d) => `${d.group}\nPDO: ${d.pdo}`,
      }),
      Plot.dot(overlappingPoints, {
        x: (d) => d.x,
        y: (d) => d.combined,
        r: 4,
        fill: "#fff",
        title: (d) => `${d.group}\nFatal: ${d.fatal}\nInjury: ${d.injury}`,
      }),
    ],
    style: {
      fontSize: "16px",
      fontFamily: "sans-serif",
    },
  });

  let legend = document.createElement("div");
  legend.className = "legend";

  const legendItems = [
    { label: "PDO", color: "#2ca02c" },
    { label: "Fatal+Injury", color: "#d62728" },
  ];

  let legendHTML = `
    <span style="
      color: white;
      font-weight: bold;
      margin-right: 10px;
    ">Counts by Category:</span>
  `;

  legendHTML += legendItems
    .map(
      (item) => `
    <div class="legend-item" style="display:flex; align-items:center; gap:5px;">
      <div class="legend-color"
           style="width:15px; height:15px; border:1px solid #fff; background-color:${item.color};"></div>
      <span>${item.label}</span>
    </div>
  `
    )
    .join("");

  legend.innerHTML = legendHTML;

  let overlapContainer = document.createElement("div");
  overlapContainer.appendChild(chart);
  overlapContainer.appendChild(legend);

  return overlapContainer;
}

// ===== Data Loading and Initialization =====
async function loadDataAndRender() {
  const dataType = dataTypeCheckbox.checked ? "Alcohol" : "All";
  console.log("Loading data for:", dataType);

  if (dataType === "Alcohol") {
    globalData = await FileAttachment(
      "data/Driver Involvement by Age Alcohol-Related.csv"
    ).csv({ typed: true });
  } else {
    globalData = await FileAttachment("data/Driver Involvement by Age.csv").csv(
      { typed: true }
    );
  }
  if (!globalData || globalData.length === 0) {
    document.getElementById("Ridgeline").innerHTML = `
      <p style='color:red;'>No data loaded. Please check the CSV file attachment.</p>`;
    return;
  }

  let years = [...new Set(globalData.map((d) => d.Year))].sort((a, b) => a - b);
  const yearSlider = document.getElementById("RidgelineYearSlider");

  // If selectedYear is valid, keep it; otherwise fallback to last year
  if (!selectedYear || !years.includes(selectedYear)) {
    selectedYear = years[years.length - 1];
  }

  // Initialize slider + label
  yearSlider.min = years[0];
  yearSlider.max = years[years.length - 1];
  yearSlider.value = selectedYear;
  // Show the selected year in the label
  document.getElementById("RidglineyearDisplay").textContent = selectedYear;

  renderChart(selectControl.value, selectedYear);
}

// Main rendering function
function renderChart(viewMode, year) {
  chartsDiv.innerHTML = "";

  // Filter data
  const dataForYear = globalData.filter((d) => d.Year === year);
  const { aggregatedPoints, overlappingPoints, groupsOrder } =
    aggregateDataByYear(dataForYear, year);

  const customTicks = aggregatedPoints.map((d) => d.x);
  const tickMapping = {
    1: "15 and Under",
    2: "16-24",
    3: "25-34",
    4: "35-44",
    5: "45-54",
    6: "55-64",
    7: "65-74",
    8: "75 & Older",
  };

  const isAlcohol = dataTypeCheckbox.checked;
  let chartDiv = document.createElement("div");

  if (viewMode === "Separate") {
    chartDiv.appendChild(
      createSeparateChart(
        aggregatedPoints,
        groupsOrder,
        customTicks,
        tickMapping,
        main.clientWidth,
        isAlcohol
      )
    );
  } else {
    chartDiv.appendChild(
      createOverlapChart(
        aggregatedPoints,
        overlappingPoints,
        groupsOrder,
        customTicks,
        tickMapping,
        main.clientWidth,
        isAlcohol
      )
    );
  }

  chartsDiv.appendChild(chartDiv);
}

// Load data on page load
loadDataAndRender();
```

```html
<style>
  /* Main container styling */
  #Ridgeline {
    width: 90%;
    max-width: 1100px;
    margin: 0 auto;
    margin-left: 0px ;
    padding-right: 20px;
    padding-left: 10px;
    font-family: sans-serif;
    background: #111;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: 12px;
  }
  /* Toggle container styling */
  #toggle {
    background: #111;
    margin-top: -20px;
    text-align: center;
    z-index: 100;
    color: white;
  }
  /* Slider container styling */
  #slider {
    background: #111;
    padding: 0px;
    text-align: center;
    color: white;
  }
  /* Style for the select element inside the toggle */
  #toggle select {
    font-size: 18px;
    padding: 10px 15px;
    color: #fff;
    background: #111;
  }
  /* Style for the slider input */
  #slider input[type="range"] {
    width: 200px;
    height: 6px;
    margin: 0 10px;
  }
  #slider span {
    font-size: 18px;
    font-weight: bold;
  }
  /* Charts container styling */
  #charts {
    background: #111;
  }
  /* Legend styling */
  .legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 16px;
    color: white;
  }
  .legend-color {
    width: 15px;
    height: 15px;
    border: 1px solid #fff;
  }
  /* Container for decade charts */
  .decade-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  .year-chart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
  }
  /* Custom style for the data type checkbox */
  #dataTypeCheckbox {
    width: 20px;
    height: 20px;
    border: 2px solid #fff;
    border-radius: 4px;
    background: #111;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;
    position: relative;
    top: -5px;
  }
  /* Optional hover effect */
  #dataTypeCheckbox:hover {
    border-color: #4c8cff;
  }
  /* Style the label associated with the checkbox */
  #dataTypeCheckbox + label {
    font-size: 18px;
    color: #fff;
    margin-left: 5px;
    vertical-align: middle;
    cursor: pointer;
  }
</style>
```

```html
<div style="width: 90%; margin-left: 20px; margin-top: 50px; font-size:17px">
In the late 1990s and early 2000s, young drivers in Arizona faced significantly high crash rates, with statistics <b>peaking in the early 2000s</b>. 
This increase in accidents was primarily attributed to inexperience and risk-taking behaviors among young adults. 
In response, the state implemented the <b>Graduated Driver Licensing (GDL) program in 2000, introducing restrictions 
such as nighttime driving limitations and passenger restrictions</b> to provide young drivers with a safer learning environment.
Following the introduction of GDL laws, Arizona witnessed a <b>gradual decline in teenage crash rates</b>, particularly after 2010. 
However, another contributing factor was the 2008-2010 economic recession, which likely led to fewer young drivers on the road due to financial constraints. 
As a result, the number of crashes naturally declined during this period. Despite these improvements, new challenges emerged after 2015, 
particularly due to <b>smartphone distractions</b>. The use of mobile devices while driving contributed to fluctuations in crash rates. 
Arizona enforced <b>cell phone bans in 2021</b> to reduce distractions and improve road safety. Another persistent issue has been alcohol-related crashes, 
which peak among drivers in their twenties, particularly <b>after the age of 21</b>. This trend aligns with the legal drinking age 
where <b>Arizonans young adults gain access to alcohol at this age (21 years old)</b>. Newly legal drinkers often engage in riskier behaviors, 
including impaired driving. Arizona has some of the strictest DUI (Driving Under the Influence) laws in the country, enforcing zero-tolerance policies 
for drivers under 21 and imposing severe penalties for DUI offenses. However, despite these regulations, 
drivers in 20s of their age continue to have a high incidence of alcohol-related crashes.
As individuals gain more driving experience and develop a greater sense of responsibility <b>in their 30s, crash rates steadily decline</b>, 
suggesting that maturity and experience play a crucial role in road safety. While young drivers face risks due to inexperience, 
older drivers (65 and older)</b> encounter challenges related to physical and cognitive decline. To address this, 
Arizona introduced <b>senior driving assessments in 2016</b>, aiming to balance elders independence with road safety.
  <div
    style="font-size: 17px; font-style: italic; color: gray; border-left: 4px solid #ccc; padding-left: 10px; padding-top: 10px">
Sources: Arizona Department of Transportation https://azdot.gov - National Highway Traffic Safety Administration https://www.nhtsa.gov - Governors Highway Safety Association https://www.ghsa.org
  </div>
</div>
```


---

# From Rush Hour to Weekend Chaos
## Weekdays vs. Weekends

<div style="width: 90%; margin-left: 20px; margin-top: 25px; margin-bottom: 30px; font-size:17px">
This pattern isn’t random—it reflects the habits, culture, and movement of Arizona’s people. From the daily grind of rush hour to the thrill-seeking weekend energy, the state’s roads tells how human behavior shapes traffic safety. 
</div>

<div id="Heatmap"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.16/+esm";

(async () => {
  const app = document.getElementById("Heatmap");
  app.innerHTML = ""; // Clear previous content

  // ------------------------------------
  // 1. Build the UI: Checkbox + Slider
  // ------------------------------------

  // Create a container for the Fatal/All toggle
  const toggleContainer = document.createElement("div");
  toggleContainer.style.display = "flex";
  toggleContainer.style.alignItems = "center";
  toggleContainer.style.justifyContent = "center";
  toggleContainer.style.gap = "10px";
  toggleContainer.style.marginBottom = "15px";

  // Create the checkbox & label
  const fatalCheckbox = document.createElement("input");
  fatalCheckbox.type = "checkbox";
  fatalCheckbox.id = "HeatmapFatalCheckbox";
  fatalCheckbox.checked = false; // default: show all columns
  const fatalLabel = document.createElement("label");
  fatalLabel.htmlFor = "HeatmapFatalCheckbox";
  fatalLabel.style.color = "white";
  fatalLabel.style.fontSize = "16px";
  fatalLabel.textContent = "Fatals Only";

  // Append them
  toggleContainer.appendChild(fatalCheckbox);
  toggleContainer.appendChild(fatalLabel);

  // Insert this toggleContainer into #Heatmap
  app.appendChild(toggleContainer);

  // Next, create the slider container
  const sliderContainer = document.createElement("div");
  sliderContainer.style.marginBottom = "20px";
  sliderContainer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
      <span style="font-size: 16px; font-weight: bold; color: white;">Select Year:</span>
      <input type="range" id="HeatmapYearRange" 
             min="0" max="1" step="1" value="0"
             style="width: 200px; height: 6px; accent-color: #4c8cff; margin: 0;">
      <span id="HeatmapYearDisplay" style="font-size: 16px; font-weight: bold; color: #fff;"></span>
    </div>
  `;
  app.appendChild(sliderContainer);

  // Create the container for the chart
  const chartContainer = document.createElement("div");
  chartContainer.id = "HeatmapchartContainer";
  app.appendChild(chartContainer);

  // Create the container for the legend
  const legendContainer = document.createElement("div");
  legendContainer.id = "HeatmaplegendContainer";
  legendContainer.className = "custom-legend";
  app.appendChild(legendContainer);

  // ------------------------------------
  // 2. The renderHeatmap function
  // ------------------------------------
  function renderHeatmap(selectedYear, csvData) {
    // Check if "Show Fatal Only" is toggled
    const showFatalOnly = document.getElementById("HeatmapFatalCheckbox").checked;

    // Filter data for the selected year
    const filteredData = csvData.filter((d) => d.Year === Number(selectedYear));

    // Days of the week
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Transform wide --> long
    const longData = [];
    filteredData.forEach((d) => {
      const hour = d["Hour Beginning"]; // e.g. "12:00 AM"
      days.forEach((day) => {
        // If "showFatalOnly" is true, read e.g. "Monday Fatal"; else read "Monday All"
        const suffix = showFatalOnly ? "Fatal" : "All";
        const colName = `${day} ${suffix}`;

        // Convert from string with commas to number
        const rawVal = d[colName];
        const crashes = (typeof rawVal === "number") ? rawVal : +rawVal.replace(/,/g, "");

        longData.push({
          hour,
          day,
          crashes,
          title: `Hour: ${hour}\nDay: ${day}\n${showFatalOnly ? "Fatal" : "All"} Crashes: ${crashes}`
        });
      });
    });

    // Dynamically compute chart width
    const chartWidth = Math.max(window.innerWidth * 0.9, 1000);

    // Construct the Plot
    const chart = Plot.plot({
      width: chartWidth,
      height: 500,
      background: "#111",
      marginLeft: 140,
      marginBottom: 110,
      x: {
        label: "Hour of Day",
        type: "band",
        tickRotate: -60,
        domain: [...new Set(longData.map((d) => d.hour))],
        padding: 0.05,
        tickFormat: (d) => {
          if (d === "12:00 AM") return "🌜";
          if (d === "12:00 PM") return "☀️";
          return d;
        },
        grid: true,
        tickColor: "#888",
        labelColor: "white",
      },
      y: {
        label: "Day of Week",
        type: "band",
        domain: days,
        padding: 0.05,
        grid: true,
        tickColor: "#888",
        labelColor: "white",
      },
      color: {
        label: "Crash Count",
        scheme: "reds",
        zero: "#111",
      },
      marks: [
        Plot.cell(longData, {
          x: "hour",
          y: "day",
          fill: "crashes",
          inset: 0,
          title: (d) => d.title,
        }),
      ],
      style: {
        fontSize: "18px",
        fontFamily: "sans-serif",
        fontWeight: "bold",
      },
    });

    // Clear & append
    const chartContainer = document.getElementById("HeatmapchartContainer");
    chartContainer.innerHTML = "";
    chartContainer.appendChild(chart);

    // Interactive Projection Lines
    const svg = d3.select(chartContainer).select("svg");

    function addProjectionLines(cell) {
      const bbox = cell.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;

      const chartHeight = 500;
      const marginBottom = 110;
      const marginLeft = 140;
      const xAxisY = chartHeight - marginBottom;
      const yAxisX = marginLeft;

      svg
        .append("line")
        .attr("class", "hover-rule-x")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", cy)
        .attr("y2", xAxisY)
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "0.7");

      svg
        .append("line")
        .attr("class", "hover-rule-y")
        .attr("x1", cx)
        .attr("x2", yAxisX)
        .attr("y1", cy)
        .attr("y2", cy)
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "0.7");
    }

    function removeProjectionLines() {
      svg.selectAll(".hover-rule-x").remove();
      svg.selectAll(".hover-rule-y").remove();
    }

    svg
      .selectAll("rect")
      .on("mouseover", function () {
        removeProjectionLines();
        addProjectionLines(this);
      })
      .on("mouseout", removeProjectionLines);

    // Legend
    const stops = [0, 500, 1000, 1500, 2000];
    let boxesHtml = "";
    for (let i = 0; i < stops.length - 1; i++) {
      const midValue = (stops[i] + stops[i + 1]) / 2;
      const t = midValue / 1800;
      const color = d3.interpolateReds(t);
      boxesHtml += `<div class="legend-box" style="background: ${color};"></div>`;
    }
    const labelsHtml = stops.map((stop) => `<span>${stop}</span>`).join("");

    const legendContainer = document.getElementById("HeatmaplegendContainer");
    legendContainer.innerHTML = `
      <div class="legend-boxes">${boxesHtml}</div>
      <div class="legend-labels">${labelsHtml}</div>
    `;
  }

  // -----------------------------
  // Load CSV and Initialize
  // -----------------------------
  const csvData = await FileAttachment("data/Crashes by Hour and Day of Week.csv").csv({ typed: true });
  if (!csvData || csvData.length === 0) {
    app.innerHTML =
      "<p style='color:red;'>No data loaded. Please check the CSV file attachment.</p>";
    return;
  }

  const uniqueYears = Array.from(new Set(csvData.map((d) => d.Year))).sort((a, b) => a - b);
  if (uniqueYears.length === 0) {
    app.innerHTML = "<p style='color:red;'>No year data found in the file.</p>";
    return;
  }

  // Update slider min/max
  const slider = document.getElementById("HeatmapYearRange");
  slider.min = uniqueYears[0];
  slider.max = uniqueYears[uniqueYears.length - 1];
  slider.value = uniqueYears[uniqueYears.length - 1];

  // Initialize year label
  document.getElementById("HeatmapYearDisplay").textContent = uniqueYears[uniqueYears.length - 1];

  // Initial Render
  renderHeatmap(uniqueYears[uniqueYears.length - 1], csvData);

  // Slider Listener
  slider.addEventListener("input", function () {
    document.getElementById("HeatmapYearDisplay").textContent = this.value;
    renderHeatmap(this.value, csvData);
  });

  // Re-render on window resize
  window.addEventListener("resize", () => {
    renderHeatmap(slider.value, csvData);
  });

  // Also re-render whenever the "Show Fatal Only" checkbox changes
  fatalCheckbox.addEventListener("change", function() {
    renderHeatmap(slider.value, csvData);
  });
})();
```

```html
<style>
  /* Basic styling for the app container */
  #Heatmap {
    width: 90%;
    max-width: 1100px;
    margin: 0 auto;
    margin-left: 0px;
    padding: 20px;
    background: #111;
    font-family: sans-serif;
    border-radius: 12px;
  }
  /* Basic styling for the checkbox */
  #HeatmapFatalCheckbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

  /* Legend container styling */
  .custom-legend {
    margin-top: 20px;
    margin-left: 30px;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 300px; /* Fixed width for the legend */
  }

  /* Container for the color boxes */
  .legend-boxes {
    display: flex;
    height: 30px; /* Fixed unit without extra space */
    width: 100%;
  }

  /* Each individual color box */
  .legend-box {
    flex: 1;
    height: 20px;
  }

  /* Container for the numerical labels below the boxes */
  .legend-labels {
    display: flex;
    width: 100%;
    justify-content: space-between;
    font-size: 12px;
    color: white;
    margin-top: 5px;
  }
</style>
```

```html
<div style="width: 90%; margin-left: 20px; margin-top: 50px; font-size:17px">
Every day <b>at 3 PM</b>, Arizona’s roads get busy fast. Schools let out, offices close, and highways fill with rushed and impatient drivers. 
Rear-end crashes, side swipes, and intersection accidents happen as traffic builds up. <b>By 5–6 PM, the roads are packed, and even a small mistake can cause a crash</b>.

<br>Then comes the weekend,a whole new kind of rush. <b>Fridays and Saturdays bring partygoers, and sports fans</b>. Weekends further amplify this risk, 
as <b>alcohol consumption</b>, late-night social events, and reckless speeding result in more deadly crashes. 
While weekdays show a steadier crash rate due to predictable commuter patterns, weekends introduce an unpredictable mix of high-risk behaviors.

<br>From weekday traffic jams to weekend risks, Arizona’s roads show how people move—and sometimes, how things go wrong.
  <div
    style="font-size: 17px; font-style: italic; color: gray; border-left: 4px solid #ccc; padding-left: 10px; padding-top: 10px">
Sources: Arizona Department of Transportation (ADOT) https://azdot.gov - National Highway Traffic Safety Administration (NHTSA) https://crashstats.nhtsa.dot.gov/
  </div>
</div>
```