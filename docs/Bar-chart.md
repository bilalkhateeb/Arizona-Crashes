---
title: "Arizona County Crash Comparison"
theme: dark
toc: false
---

# 🚗 Arizona County Crash Trends

This visualization uses **small multiple bar charts** to compare **Total Crashes (🔵) vs. Fatal Crashes (🔴)** in Arizona by county.

<div id="app"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

// ===============================
// Global Configurations & Helper Functions
// ===============================
async function loadData() {
  try {
    const data = await FileAttachment("data/Arizona county crashes.csv").csv({ typed: true });
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
      <input type="range" id="yearRange" min="${uniqueYears[0]}" max="${uniqueYears[uniqueYears.length - 1]}" step="1" value="${uniqueYears[uniqueYears.length - 1]}" style="width: 200px; height: 6px; accent-color: #4c8cff; margin: 0;">
      <span id="yearDisplay" style="font-size: 16px; font-weight: bold; color: #fff;">${uniqueYears[uniqueYears.length - 1]}</span>
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
  const filteredData = crashData.filter(d => d.Year === selectedYear);
  const aggregated = d3.rollups(
    filteredData,
    v => ({
      Total_Crashes: d3.sum(v, d => d.crashes_n_total) || 0,
      Fatal_Crashes: d3.sum(v, d => d.crashes_n_fatal) || 0
    }),
    d => d.county
  ).map(([county, values]) => ({
    County: county,
    Total_Crashes: values.Total_Crashes || 1,  // default to 1 to avoid log issues
    Fatal_Crashes: values.Fatal_Crashes || 1
  }));
  
  // Sort descending by Total Crashes.
  aggregated.sort((a, b) => b.Total_Crashes - a.Total_Crashes);
  return aggregated;
}

// ===============================
// Chart Creation Functions
// ===============================
function createTotalCrashesChart(aggregatedData) {
  // Use square-root transform for Total Crashes.
  const transformedData = aggregatedData.map(d => ({
    County: d.County,
    Crashes: Math.sqrt(d.Total_Crashes),
    Original: d.Total_Crashes
  }));
  const maxAdjusted = d3.max(transformedData, d => d.Crashes);

  return Plot.plot({
    width: 650,
    height: 600,
    marginLeft: 140,
    marginRight: 0,
    marginBottom: 60,
    x: {
      label: "Total Crashes",
      domain: [0, maxAdjusted],
      ticks: [
        Math.sqrt(2000),
        Math.sqrt(10000),
        Math.sqrt(30000),
        Math.sqrt(60000)
      ],
      tickFormat: d => {
        const original = Math.round((d * d) / 1000) * 1000;
        return d3.format("~s")(original);
      },
      tickSize: 10,
      labelAnchor: "center",
      labelOffset: 60
    },
    y: {
      domain: aggregatedData.map(d => d.County),
      type: "band",
      label: "County",
      grid: true,
      tickSize: 10
    },
    color: { legend: false, domain: ["Total Crashes"], range: ["steelblue"] },
    style: { fontSize: "17px", fontWeight: "bold" },
    marks: [
      Plot.barX(transformedData, {
        x: "Crashes",
        y: "County",
        fill: "steelblue",
        title: d => `${d.County}: ${d.Original.toLocaleString()} Total Crashes`,
        stroke: "white",
        strokeWidth: 0.5
      }),
      Plot.ruleY(aggregatedData.map(d => d.County), {
        stroke: "white",
        strokeWidth: 0.1,
        strokeDasharray: "3,2"
      }),
      Plot.ruleX([0])
    ]
  });
}

function createFatalCrashesChart(aggregatedData) {
  // Use square-root transform for Fatal Crashes.
  const transformedData = aggregatedData.map(d => ({
    County: d.County,
    Crashes: Math.sqrt(d.Fatal_Crashes),
    Original: d.Fatal_Crashes
  }));
  const maxAdjusted = d3.max(transformedData, d => d.Crashes);

  return Plot.plot({
    width: 350,
    height: 600,
    marginLeft: 30,
    marginBottom: 60,
    x: {
      label: "Fatal Crashes",
      domain: [0, maxAdjusted],
      ticks: [
        Math.sqrt(50),
        Math.sqrt(100),
        Math.sqrt(200),
        Math.sqrt(300)
      ],
      tickFormat: d => {
        const original = Math.round(d * d);
        return d3.format("~s")(original);
      },
      tickSize: 10,
      labelAnchor: "center",
      labelOffset: 60
    },
    y: {
      domain: aggregatedData.map(d => d.County),
      type: "band",
      ticks: [],
      tickSize: 10
    },
    color: { legend: false, domain: ["Fatal Crashes"], range: ["red"] },
    style: { fontSize: "17px", fontWeight: "bold" },
    marks: [
      Plot.barX(transformedData, {
        x: "Crashes",
        y: "County",
        fill: "red",
        title: d => `${d.County}: ${d.Original.toLocaleString()} Fatal Crashes`,
        stroke: "white",
        strokeWidth: 0.5
      }),
      Plot.ruleX([0]),
      Plot.ruleY(aggregatedData.map(d => d.County), {
        stroke: "white",
        strokeWidth: 0.3,
        strokeDasharray: "3,2"
      })
    ]
  });
}

// ===============================
// Update Charts Function
// ===============================
function updateCharts(selectedYear, crashData, chartsDiv) {
  selectedYear = Number(selectedYear);
  const aggregatedData = aggregateData(crashData, selectedYear);
  const countyOrder = aggregatedData.map(d => d.County);

  const totalChart = createTotalCrashesChart(aggregatedData);
  const fatalChart = createFatalCrashesChart(aggregatedData);

  const chartsContainer = document.createElement("div");
  chartsContainer.style.display = "flex";
  chartsContainer.style.gap = "20px";
  chartsContainer.innerHTML = "";
  chartsContainer.appendChild(totalChart);
  chartsContainer.appendChild(fatalChart);

  chartsDiv.innerHTML = "";
  chartsDiv.appendChild(chartsContainer);
}

// ===============================
// Main Initialization
// ===============================
(async () => {
  const app = document.getElementById("app");
  app.innerHTML = ""; // Clear app container

  const crashData = await loadData();
  if (!crashData || crashData.length === 0) {
    app.innerHTML = "<p style='color:red;'>No data loaded. Please check the CSV file attachment.</p>";
    return;
  }

  // Extract unique years
  const uniqueYears = Array.from(new Set(crashData.map(d => d.Year))).sort((a, b) => a - b);
  if (uniqueYears.length === 0) {
    app.innerHTML = "<p style='color:red;'>No year data found in the file.</p>";
    return;
  }

  // Create main container and add slider, charts, and legend
  const container = document.createElement("div");
  container.style.maxWidth = "1000px";
  container.style.margin = "0 auto";
  container.style.padding = "20px";
  container.style.background = "#111";
  container.style.borderRadius = "10px";
  container.style.boxShadow = "2px 2px 10px rgba(0,0,0,0.5)";
  container.style.textAlign = "center";

  // Create slider and append
  const sliderContainer = createSlider(uniqueYears);
  container.appendChild(sliderContainer);

  // Create charts container placeholder
  const chartsDiv = document.createElement("div");
  chartsDiv.id = "countyBarCharts";
  chartsDiv.innerHTML = "Loading Charts...";
  container.appendChild(chartsDiv);

  // Create legend and append
  const legendContainer = createLegend();
  container.appendChild(legendContainer);

  // Append main container to app
  app.appendChild(container);

  // Initial chart rendering
  updateCharts(uniqueYears[uniqueYears.length - 1], crashData, chartsDiv);

  // Set up slider event listener
  const slider = document.getElementById("yearRange");
  slider.addEventListener("input", function () {
    document.getElementById("yearDisplay").textContent = this.value;
    updateCharts(this.value, crashData, chartsDiv);
  });
})();
```

```html
<style>
  #app {
    width: 90%;
    padding: 20px;
  }
</style>
```
