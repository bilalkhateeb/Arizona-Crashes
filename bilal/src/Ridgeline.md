---
title: "Ridgeline"
theme: dark
toc: false
---

# 🚗 Visualization 4: Driver Involvement by Age in Crash Severity

This visualization lets you toggle between two views for 2023:
- **Separate:** Three panels (PDO, Fatal, and Injury) are shown in separate graphs with a legend below.
- **Overlap:** A single graph shows two overlapping ridgelines—one for PDO and one for (Fatal + Injury)—with its own legend.

Select a view below, then hover over a point for details.

<div id="Ridgeline"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

// Global state variables
let globalData = null;
let selectedYear = null;

// Ensure a persistent main container exists.
let main = document.getElementById("Ridgeline");
if (!main) {
  main = document.createElement("div");
  main.id = "Ridgeline";
  document.body.appendChild(main);
}

// Create (or get) the toggle container.
let toggleDiv = document.getElementById("toggle");
if (!toggleDiv) {
  toggleDiv = document.createElement("div");
  toggleDiv.id = "toggle";
  main.insertAdjacentElement("afterbegin", toggleDiv);
} else {
  toggleDiv.innerHTML = "";
}

// Create (or get) the slider container.
let sliderDiv = document.getElementById("slider");
if (!sliderDiv) {
  sliderDiv = document.createElement("div");
  sliderDiv.id = "slider";
  main.insertAdjacentElement("afterbegin", sliderDiv);
} else {
  sliderDiv.innerHTML = "";
}

// Create (or get) the charts container.
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
  dataTypeCheckbox.checked = false; // Default: unchecked ("All")
  let dataTypeLabel = document.createElement("label");
  dataTypeLabel.htmlFor = "dataTypeCheckbox";
  dataTypeLabel.textContent = "Alcohol Only";
  let dataTypeContainer = document.createElement("div");
  dataTypeContainer.appendChild(dataTypeCheckbox);
  dataTypeContainer.appendChild(dataTypeLabel);
  // Insert at the beginning of the toggle container.
  toggleDiv.insertAdjacentElement("afterbegin", dataTypeContainer);
}
dataTypeCheckbox.addEventListener("change", () => {
  console.log("Data type checkbox changed. Checked =", dataTypeCheckbox.checked);
  loadDataAndRender();  // Reloads data but preserves the global selectedYear if available.
});

// ----- Create the View Toggle Control (Separate vs. Overlap) -----
let selectControl = document.getElementById("selectControl");
if (!selectControl) {
  selectControl = document.createElement("select");
  selectControl.id = "selectControl";
  ["Separate", "Overlap"].forEach(mode => {
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

// ----- Create the Year Slider Control -----
// Here we use innerHTML to create the slider similar to our previous finished code.
if (!document.getElementById("yearSlider")) {
  sliderDiv.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin: 20px">
      <span style="font-size: 16px; font-weight: bold; color: white;">Select Year:</span>
      <input type="range" id="yearSlider" style="width: 200px; height: 7px; accent-color: #4c8cff; margin: 0;">
      <span id="yearDisplay" style="font-size: 16px; font-weight: bold; color: #fff;"></span>
    </div>
  `;
  // Get the slider element
  let yearSlider = document.getElementById("yearSlider");
  yearSlider.addEventListener("input", () => {
    selectedYear = +yearSlider.value;
    document.getElementById("yearDisplay").textContent = selectedYear;
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
    "75 & Older": { low: 75, high: 85 }
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

// ===== Data Aggregation Function =====
function aggregateDataByYear(data, year) {
  const ageGroups = getAgeGroups();
  const groupsOrder = Object.keys(ageGroups);
  const aggregated = {};
  data.filter(d => d.Year === year).forEach(d => {
    const group = groupLabel(d["Driver Age Group"]);
    if (!group || !(group in ageGroups)) return;
    if (!aggregated[group]) aggregated[group] = { pdo: 0, fatal: 0, injury: 0 };
    aggregated[group].pdo += toNumber(d["In PDO Crashes"]);
    aggregated[group].fatal += toNumber(d["In Fatal Crashes"]);
    aggregated[group].injury += toNumber(d["In Injury Crashes"]);
  });
  const aggregatedPoints = groupsOrder.map((group, i) => ({
    x: i + 1,
    group,
    midpoint: (ageGroups[group].low + ageGroups[group].high) / 2,
    pdo: aggregated[group] ? aggregated[group].pdo : 0,
    fatal: aggregated[group] ? aggregated[group].fatal : 0,
    injury: aggregated[group] ? aggregated[group].injury : 0
  }));
  const overlappingPoints = aggregatedPoints.map(d => ({
    ...d,
    combined: d.fatal + d.injury
  }));
  return { aggregatedPoints, overlappingPoints, groupsOrder };
}

// ===== Chart Creation Functions =====
function createSeparateChart(aggregatedPoints, groupsOrder, customTicks, tickMapping, containerWidth, isAlcohol) {
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
      yDomain: isAlcohol ? [0, 100] : [0, 350]
    },
    {
      key: "injury",
      label: "Injury",
      fill: "rgba(255,165,0,0.5)",
      stroke: "#FFA500",
      yTicks: isAlcohol ? [0, 250, 500, 750, 1000] : [0, 5000, 10000, 15000],
      yDomain: isAlcohol ? [0, 1200] : [0, 20000]
    },
    {
      key: "pdo",
      label: "PDO",
      fill: "rgba(44,160,44,0.5)",
      stroke: "#2ca02c",
      yTicks: isAlcohol ? [0, 500, 1000, 1500] : [0,10000, 20000, 30000, 40000],
      yDomain: isAlcohol ? [0, 1500] : [0, 40000]
    }
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
        // Use a label only when appropriate.
        label: (m.key === "fatal" || m.key === "injury")
          ? null
          : (i === measures.length - 1 ? "Driver Age Group" : null),
        domain: [1, groupsOrder.length],
        ticks: customTicks, // always use the custom ticks for grid lines
        // For fatal/injury, return an empty string, otherwise use the tickMapping.
        tickFormat: (m.key === "fatal" || m.key === "injury")
          ? () => ""
          : d => tickMapping[d] || d,
        tickSize: 12,
        grid: true,
        tickColor: "#888",
        labelColor: "white",
        labelOffset: 55
      },
      y: {
        domain: m.yDomain,
        grid: true,
        tickColor: "#888",
        labelColor: "white",
        labelRotate: -90,
        labelOffset: 40,
        ticks: m.yTicks,
        nice: false
      },
      marks: [
        Plot.areaY(dataToPlot, {
          x: d => d.x,
          y: d => d[m.key],
          y0: () => 0,
          fill: m.fill,
          curve: "catmull-rom"
        }),
        Plot.line(dataToPlot, {
          x: d => d.x,
          y: d => d[m.key],
          stroke: m.stroke,
          strokeWidth: 2,
          curve: "catmull-rom"
        }),
        Plot.dot(dataToPlot, {
          x: d => d.x,
          y: d => d[m.key],
          r: 4,
          fill: "#fff",
          title: d => `${d.group}\n${m.label}: ${d[m.key]}`
        })
      ],
      style: {
        fontSize: "16px",
        fontFamily: "sans-serif"
      }
    });
    chartsContainer.appendChild(chart);
  });
  
  // Create legend for Separate view with a "Counts by Category:" prefix
  let legend = document.createElement("div");
  legend.className = "legend";

  const legendItems = [
    { label: "Fatal", color: "#d62728" },
    { label: "Injury", color: "#FFA500" },
    { label: "PDO", color: "#2ca02c" }
  ];

  // Start the HTML with "Counts by Category:"
  let legendHTML = `
    <span style="
      color: white;
      font-weight: bold;
      margin-right: 10px;
    ">Counts by Category:</span>
  `;

  // Generate each legend item
  legendHTML += legendItems
    .map(
      item => `
        <div class="legend-item" style="display: flex; align-items: center; gap: 5px;">
          <div
            class="legend-color"
            style="width: 15px; height: 15px; border: 1px solid #fff; background-color: ${item.color};"
          ></div>
          <span>${item.label}</span>
        </div>
      `
    )
    .join("");

  legend.innerHTML = legendHTML;
  chartsContainer.appendChild(legend);

  return chartsContainer;
}


function createOverlapChart(aggregatedPoints, overlappingPoints, groupsOrder, customTicks, tickMapping, containerWidth, isAlcohol) {
  // Fixed y-axis for Overlap view.
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
      tickFormat: d => tickMapping[d] || d,
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
      ticks: isAlcohol ? [0, 750, 1500] : [0, 20000, 40000]
    },
    marks: [
      Plot.areaY(aggregatedPoints, {
        x: d => d.x,
        y: d => d.pdo,
        y0: () => 0,
        fill: "rgba(44,160,44,0.5)",
        curve: "catmull-rom"
      }),
      Plot.line(aggregatedPoints, {
        x: d => d.x,
        y: d => d.pdo,
        stroke: "#2ca02c",
        strokeWidth: 2,
        curve: "catmull-rom"
      }),
      // Use blend mode for the red (Fatal+Injury) area.
      Plot.areaY(overlappingPoints, {
        x: d => d.x,
        y: d => d.combined,
        y0: () => 0,
        fill: isAlcohol ? "rgba(214,39,40,0.6)" : "rgba(214,39,40,0.75)",
        curve: "catmull-rom",
        style: { mixBlendMode: "multiply" }
      }),
      Plot.line(overlappingPoints, {
        x: d => d.x,
        y: d => d.combined,
        stroke: "#d62728",
        strokeWidth: 2,
        curve: "catmull-rom"
      }),
      Plot.dot(aggregatedPoints, {
        x: d => d.x,
        y: d => d.pdo,
        r: 3,
        fill: "#fff",
        title: d => `${d.group}\nPDO: ${d.pdo}`
      }),
      Plot.dot(overlappingPoints, {
        x: d => d.x,
        y: d => d.combined,
        r: 3,
        fill: "#fff",
        title: d => `${d.group}\nFatal: ${d.fatal}\nInjury: ${d.injury}`
      })
    ],
    style: {
      fontSize: "16px",
      fontFamily: "sans-serif"
    }
  });
  
  // --- Modified Legend Code with "Number of:" prefix and innerHTML ---
  let legend = document.createElement("div");
  legend.className = "legend";

  const legendItems = [
    { label: "PDO", color: "#2ca02c" },
    { label: "Fatal+Injury", color: "#d62728" }
  ];

  // Start the HTML with a "Number of:" prefix
  let legendHTML = `
    <span style="
      color: white;
      font-weight: bold;
      margin-right: 10px;
    ">Counts by Category:</span>
  `;

  // Add each item to the legendHTML
  legendHTML += legendItems
    .map(
      item => `
        <div class="legend-item" style="display: flex; align-items: center; gap: 5px;">
          <div
            class="legend-color"
            style="width: 15px; height: 15px; border: 1px solid #fff; background-color: ${item.color};"
          ></div>
          <span>${item.label}</span>
        </div>
      `
    )
    .join("");

  legend.innerHTML = legendHTML;
  // ------------------------------------------

  let overlapContainer = document.createElement("div");
  overlapContainer.appendChild(chart);
  overlapContainer.appendChild(legend);
  
  return overlapContainer;
}



// ===== Persistent Containers and Controls =====
if (!document.getElementById("Ridgeline")) {
  const mainContainer = document.createElement("div");
  mainContainer.id = "Ridgeline";
  document.body.appendChild(mainContainer);
}

if (!document.getElementById("toggle")) {
  const toggleContainer = document.createElement("div");
  toggleContainer.id = "toggle";
  document.getElementById("Ridgeline").insertAdjacentElement("afterbegin", toggleContainer);
}

if (!document.getElementById("slider")) {
  const sliderContainer = document.createElement("div");
  sliderContainer.id = "slider";
  document.getElementById("Ridgeline").insertAdjacentElement("afterbegin", sliderContainer);
}

if (!document.getElementById("charts")) {
  const chartsContainer = document.createElement("div");
  chartsContainer.id = "charts";
  document.getElementById("Ridgeline").appendChild(chartsContainer);
} else {
  document.getElementById("charts").innerHTML = "";
}

if (!document.getElementById("selectControl")) {
  selectControl = document.createElement("select");
  selectControl.id = "selectControl";
  ["Separate", "Overlap"].forEach(mode => {
    const option = document.createElement("option");
    option.value = mode;
    option.textContent = mode;
    selectControl.appendChild(option);
  });
  selectControl.addEventListener("change", () => {
    renderChart(selectControl.value, selectedYear);
  });
  document.getElementById("toggle").appendChild(selectControl);
}

if (!document.getElementById("yearSlider")) {
  // (The slider has been created above using innerHTML.)
  // Nothing more to do here.
}

// ===== Data Loading and Initialization =====
async function loadDataAndRender() {
  const dataType = dataTypeCheckbox.checked ? "Alcohol" : "All";
  console.log("Loading data for:", dataType);
  if (dataType === "Alcohol") {
    globalData = await FileAttachment("data/Driver Involvement by Age Alcohol-Related.csv").csv({ typed: true });
  } else {
    globalData = await FileAttachment("data/Driver Involvement by Age.csv").csv({ typed: true });
  }
  if (!globalData || globalData.length === 0) {
    document.getElementById("Ridgeline").innerHTML =
      "<p style='color:red;'>No data loaded. Please check the CSV file attachment.</p>";
    return;
  }
  let years = [...new Set(globalData.map(d => d.Year))].sort((a, b) => a - b);
  // Update slider attributes based on loaded years.
  let yearSlider = document.getElementById("yearSlider");
  yearSlider.min = years[0];
  yearSlider.max = years[years.length - 1];
  if (selectedYear && years.includes(selectedYear)) {
    // keep selectedYear
  } else {
    selectedYear = years[years.length - 1];
  }
  yearSlider.value = selectedYear;
  document.getElementById("yearDisplay").textContent = selectedYear;
  
  renderChart(selectControl.value, selectedYear);
}

loadDataAndRender();

// ===== Main Rendering Function =====
async function renderChart(viewMode, year) {
    // Save current scroll position
  const scrollPos = window.scrollY; 
  chartsDiv.innerHTML = "";
  
  // Filter data for the selected year.
  const dataForYear = globalData.filter(d => d.Year === year);
  const { aggregatedPoints, overlappingPoints, groupsOrder } = aggregateDataByYear(dataForYear, year);
  
  const customTicks = aggregatedPoints.map(d => d.x);
  const tickMapping = {
    1: "15 and Under",
    2: "16-24",
    3: "25-34",
    4: "35-44",
    5: "45-54",
    6: "55-64",
    7: "65-74",
    8: "75 & Older"
  };
  
  let chartDiv = document.createElement("div");
  
  // Determine if we are showing Alcohol-related data.
  const isAlcohol = dataTypeCheckbox.checked;
  
  
  if (viewMode === "Separate") {
    chartDiv.appendChild(createSeparateChart(aggregatedPoints, groupsOrder, customTicks, tickMapping, main.clientWidth, isAlcohol));
  } else if (viewMode === "Overlap") {
    chartDiv.appendChild(createOverlapChart(aggregatedPoints, overlappingPoints, groupsOrder, customTicks, tickMapping, main.clientWidth, isAlcohol));
  }
  
  chartsDiv.innerHTML = "";
  chartsDiv.appendChild(chartDiv);
  // Restore scroll position
  window.scrollTo({ top: scrollPos });
}

```

```html
<style>
  /* Main container styling */
  #Ridgeline {
    width: 90%;
    max-width: 1000px;
    margin: 0 auto;
    padding: 22px;
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
    text-align: center;
    z-index: 100;
    color: white;
  }
  /* Slider container styling */
  #slider {
    background: #111;
    padding: 5px;
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
