---
title: "Bar chart"
theme: dark
toc: false
---

# 🚗 Arizona County Crash Trends

This visualization uses **small multiple bar charts** to compare **Total Crashes (🔵) vs. Fatal Crashes (🔴)** in Arizona by county.

<div id="Barchart"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

// ===============================
// Global Configurations & Helper Functions
// ===============================
async function loadData() {
  try {
    const data = await FileAttachment("data/Arizona county crashes.csv").csv({ typed: true });
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
      <span id="yearDisplay" style="font-size: 16px; font-weight: bold; color: #fff;">
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
  
  // Sort descending by Total Crashes (this sort is used only for the data).
  aggregated.sort((a, b) => b.Total_Crashes - a.Total_Crashes);
  return aggregated;
}

// ===============================
// Chart Creation Functions
// ===============================

// Fixed x-axis domains and ticks for Total Crashes & Fatal Crashes charts.
const totalCrashesXDomain = [0, Math.sqrt(83000)]; // Using 60,000 as the max total crashes
const totalCrashesXTicks = [
  Math.sqrt(2000),
  Math.sqrt(10000),
  Math.sqrt(30000),
  Math.sqrt(60000)
];

const fatalCrashesXDomain = [0, Math.sqrt(500)]; // Using 300 as the max fatal crashes
const fatalCrashesXTicks = [
  Math.sqrt(50),
  Math.sqrt(100),
  Math.sqrt(200),
  Math.sqrt(300)
];

function createTotalCrashesChart(aggregatedData, fixedCountyOrder) {
  // Apply a square-root transform for Total Crashes.
  const transformedData = aggregatedData.map(d => ({
    County: d.County,
    Crashes: Math.sqrt(d.Total_Crashes),
    Original: d.Total_Crashes
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
      tickFormat: d => {
        // reverse the sqrt transform to display original values
        const original = Math.round((d * d) / 1000) * 1000;
        return d3.format("~s")(original);
      },
      tickSize: 10,
      labelAnchor: "center",
      labelOffset: 60
    },
    y: {
      domain: fixedCountyOrder, // fixed order of counties from 2023
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
      Plot.ruleY(fixedCountyOrder, {
        stroke: "white",
        strokeWidth: 0.1,
        strokeDasharray: "3,2"
      }),
      Plot.ruleX([0])
    ]
  });
}

function createFatalCrashesChart(aggregatedData, fixedCountyOrder) {
  // Apply a square-root transform for Fatal Crashes.
  const transformedData = aggregatedData.map(d => ({
    County: d.County,
    Crashes: Math.sqrt(d.Fatal_Crashes),
    Original: d.Fatal_Crashes
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
      tickFormat: d => {
        const original = Math.round(d * d);
        return d3.format("~s")(original);
      },
      tickSize: 10,
      labelAnchor: "center",
      labelOffset: 60
    },
    y: {
      domain: fixedCountyOrder,
      type: "band",
      label: "", // no label, since we share it with the other chart
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
      Plot.ruleY(fixedCountyOrder, {
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
function updateCharts(selectedYear, crashData, chartsDiv, fixedCountyOrder) {
  selectedYear = Number(selectedYear);
  const aggregatedData = aggregateData(crashData, selectedYear);

  const totalChart = createTotalCrashesChart(aggregatedData, fixedCountyOrder);
  const fatalChart = createFatalCrashesChart(aggregatedData, fixedCountyOrder);

  // We put both charts side-by-side in a single row.
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
  const app = document.getElementById("Barchart");
  app.innerHTML = ""; // Clear #app container

  // Load the CSV data
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

  // Determine fixed county order based on 2023 data
  const aggregated2023 = aggregateData(crashData, 2023);
  const fixedCountyOrder = aggregated2023.map(d => d.County);

  // 1. Create the slider at the top
  const sliderContainer = createSlider(uniqueYears);
  app.appendChild(sliderContainer);

  // 2. Create the charts placeholder
  const chartsDiv = document.createElement("div");
  chartsDiv.id = "countyBarCharts";
  chartsDiv.innerHTML = "Loading Charts...";
  app.appendChild(chartsDiv);

  // 3. Create the legend
  const legendContainer = createLegend();
  app.appendChild(legendContainer);

  // Render charts with the most recent year
  updateCharts(uniqueYears[uniqueYears.length - 1], crashData, chartsDiv, fixedCountyOrder);

  // Slider event listener
  const slider = document.getElementById("BarChartyearRange");
  slider.addEventListener("input", function () {
    document.getElementById("yearDisplay").textContent = this.value;
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
  background: #111;
  border-radius: 12px;
  box-shadow: 2px 2px 10px rgba(0,0,0,0.5);
  font-family: sans-serif;
}

</style>
```
