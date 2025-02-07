---
title: "Heatmap"
theme: dark
toc: false
---

# 🚗 Visualization 5: Crashes by Hour and Day of Week

This heatmap explores the correlation between car crashes per hour and days of the week for 2023. The color intensity (in red) represents the crash count.  
Hover over a cell to see its crash count with projection lines to the axes.

<div id="Heatmap"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.16/+esm";

(async () => {
  const app = document.getElementById("Heatmap");
  app.innerHTML = ""; // Clear previous content

  // Function to render/update the heatmap chart for a given year.
  function renderHeatmap(selectedYear, csvData) {
    // Dynamically calculate chart width (90% of window width, minimum 1000)
    const chartWidth = Math.max(window.innerWidth * 0.9, 1000);

    // Filter data for the selected year.
    const filteredData = csvData.filter((d) => d.Year === Number(selectedYear));

    // Define the days of the week in order.
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    // Transform the data from wide to long format.
    const longData = [];
    filteredData.forEach((d) => {
      const hour = d["Hour Beginning"]; // e.g., "12:00 AM", "01:00 AM", etc.
      days.forEach((day) => {
        const col = `${day} All`;
        const crashes =
          typeof d[col] === "number" ? d[col] : +d[col].replace(/,/g, "");
        longData.push({
          hour,
          day,
          crashes,
          title: `Hour: ${d["Hour Beginning"]}\nDay: ${day}\nCrashes: ${crashes}`,
        });
      });
    });

    // Create the heatmap using Plot.cell with band scales.
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

    // Clear previous chart and append the new one.
    const chartContainer = document.getElementById("HeatmapchartContainer");
    chartContainer.innerHTML = "";
    chartContainer.appendChild(chart);

    // -----------------------------
    // Interactive Projection Lines
    // -----------------------------
    const svg = d3.select(chartContainer).select("svg");

    function addProjectionLines(cell) {
      const bbox = cell.getBBox();
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;

      const chartHeight = 500;
      const marginBottom = 110;
      const marginLeft = 140;
      const xAxisY = chartHeight - marginBottom; // e.g. 390
      const yAxisX = marginLeft;                 // e.g. 140

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

    // -----------------------------
    // Legend Construction
    // -----------------------------
    const stops = [0, 500, 1000, 1500, 2000];
    let boxesHtml = "";
    for (let i = 0; i < stops.length - 1; i++) {
      const midValue = (stops[i] + stops[i + 1]) / 2;
      const t = midValue / 1800;
      const color = d3.interpolateReds(t);
      boxesHtml += `<div class="legend-box" style="background: ${color};"></div>`;
    }

    let labelsHtml = stops.map((stop) => `<span>${stop}</span>`).join("");

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

  // -----------------------------
  // Build UI Directly in #Heatmap
  // -----------------------------

  // 1. Year Slider
  const sliderContainer = document.createElement("div");
  sliderContainer.style.marginBottom = "20px";
  sliderContainer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
      <span style="font-size: 16px; font-weight: bold; color: white;">Select Year:</span>
      <input type="range" id="HeatmapYearRange" 
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
  app.appendChild(sliderContainer);

  // 2. Chart Container
  const chartContainer = document.createElement("div");
  chartContainer.id = "HeatmapchartContainer";
  app.appendChild(chartContainer);

  // 3. Legend Container
  const legendContainer = document.createElement("div");
  legendContainer.id = "HeatmaplegendContainer";
  legendContainer.className = "custom-legend"; 
  app.appendChild(legendContainer);

  // Initial Render
  renderHeatmap(uniqueYears[uniqueYears.length - 1], csvData);

  // Slider Listener
  const slider = document.getElementById("HeatmapYearRange");
  slider.addEventListener("input", function () {
    document.getElementById("yearDisplay").textContent = this.value;
    renderHeatmap(this.value, csvData);
  });

  // Rerender on window resize
  window.addEventListener("resize", () => {
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
  padding: 20px;
  background: #111;
  font-family: sans-serif;
  border-radius: 12px;
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
  height: 30px;  /* Fixed unit without extra space */
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
