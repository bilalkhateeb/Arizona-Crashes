---
title: "Arizona County Crash Comparison"
theme: dark
toc: false
---

# 🚗 Visualization 5: Crashes by Hour and Day of Week

This heatmap explores the correlation between car crashes per hour and days of the week for 2023. The color intensity (in red) represents the crash count.  
Hover over a cell to see its crash count with projection lines to the axes.

<div id="app"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

(async () => {
  const app = document.getElementById("app");
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
    // For each row (each hour), create a record for each day.
    const longData = [];
    filteredData.forEach((d) => {
      const hour = d["Hour Beginning"]; // e.g., "12:00 AM", "01:00 AM", etc.
      days.forEach((day) => {
        // Column name is assumed to be like "Monday All", "Tuesday All", etc.
        const col = `${day} All`;
        // Remove commas and convert to number.
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
        // Change the color scheme to "reds" for a red sequential scale.
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
    // We'll place the chart inside a dedicated container.
    const chartContainer = document.getElementById("chartContainer");
    chartContainer.innerHTML = "";
    chartContainer.appendChild(chart);

    // --- Interactive Projection Lines ---
    // Select the SVG element rendered by Plot.
    const svg = d3.select(chartContainer).select("svg");

    // Function to add projection lines from a given cell.
    function addProjectionLines(cell) {
      // Get the bounding box of the hovered cell.
      const bbox = cell.getBBox();
      // Calculate the center of the cell.
      const cx = bbox.x + bbox.width / 2;
      const cy = bbox.y + bbox.height / 2;

      // Use known chart dimensions (from Plot.plot configuration):
      const chartHeight = 500;
      const marginBottom = 110;
      const marginLeft = 140;
      const xAxisY = chartHeight - marginBottom; // should be 390
      const yAxisX = marginLeft; // 140

      // Append a vertical line from the cell center down to the x-axis.
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

      // Append a horizontal line from the cell center left to the y-axis.
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

    // Function to remove projection lines.
    function removeProjectionLines() {
      svg.selectAll(".hover-rule-x").remove();
      svg.selectAll(".hover-rule-y").remove();
    }

    // Attach event listeners to each cell (rendered as <rect> elements).
    svg
      .selectAll("rect")
      .on("mouseover", function (event, d) {
        removeProjectionLines();
        addProjectionLines(this);
      })
      .on("mouseout", function () {
        removeProjectionLines();
      });

    // Define the stops for the legend (adjust as needed)
    const stops = [0, 500, 1000, 1500, 2000];

    // Build the HTML string for the color boxes.
    let boxesHtml = "";
    for (let i = 0; i < stops.length - 1; i++) {
      // Use the midpoint of each interval for color mapping.
      const midValue = (stops[i] + stops[i + 1]) / 2;
      // Compute t in [0,1] based on the domain [0,1500]
      const t = midValue / 1800;
      const color = d3.interpolateReds(t);
      boxesHtml += `<div class="legend-box" style="background: ${color};"></div>`;
    }

    // Build the HTML string for the labels.
    let labelsHtml = stops.map((stop) => `<span>${stop}</span>`).join("");

    // Create the legend container and assign the innerHTML using the built strings.
    // We'll place the legend in its own container.
    const legendContainer = document.getElementById("legendContainer");
    legendContainer.innerHTML = `
      <div class="legend-boxes">${boxesHtml}</div>
      <div class="legend-labels">${labelsHtml}</div>
    `;
  }

  // Load the CSV file "Crashes by Hour and Day of Week.csv"
  const csvData = await FileAttachment("data/Crashes by Hour and Day of Week.csv").csv({ typed: true });
  if (!csvData || csvData.length === 0) {
    app.innerHTML =
      "<p style='color:red;'>No data loaded. Please check the CSV file attachment.</p>";
    return;
  }

  // Extract unique years from the CSV data and sort them.
  const uniqueYears = Array.from(new Set(csvData.map((d) => d.Year))).sort((a, b) => a - b);
  if (uniqueYears.length === 0) {
    app.innerHTML = "<p style='color:red;'>No year data found in the file.</p>";
    return;
  }

  // Create the main container.
  const container = document.createElement("div");
  container.style.maxWidth = "1000px";
  container.style.margin = "0 auto";
  container.style.padding = "20px";
  container.style.background = "#111";
  container.style.borderRadius = "10px";
  container.style.boxShadow = "2px 2px 10px rgba(0,0,0,0.5)";
  container.style.textAlign = "center";

  // 1. Create the slider container (year slider at the top).
  const sliderContainer = document.createElement("div");
  sliderContainer.style.marginBottom = "20px";
  sliderContainer.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
      <span style="font-size: 16px; font-weight: bold; color: white;">Select Year:</span>
      <input type="range" id="yearRange" min="${uniqueYears[0]}" max="${uniqueYears[uniqueYears.length - 1]}" step="1" value="${uniqueYears[uniqueYears.length - 1]}" style="width: 200px; height: 6px; accent-color: #4c8cff; margin: 0;">
      <span id="yearDisplay" style="font-size: 16px; font-weight: bold; color: #fff;">${uniqueYears[uniqueYears.length - 1]}</span>
    </div>
  `;
  container.appendChild(sliderContainer);

  // 2. Create the container for the heatmap chart.
  const chartContainer = document.createElement("div");
  chartContainer.id = "chartContainer";
  container.appendChild(chartContainer);

  // 3. Create the container for the legend.
  const legendContainer = document.createElement("div");
  legendContainer.id = "legendContainer";
  // Apply the custom-legend class for styling
  legendContainer.className = "custom-legend";
  container.appendChild(legendContainer);

  // Append the main container to the app.
  app.appendChild(container);

  // Initialize the heatmap with the latest year.
  renderHeatmap(uniqueYears[uniqueYears.length - 1], csvData);

  // Set up the slider event listener.
  const slider = document.getElementById("yearRange");
  slider.addEventListener("input", function () {
    document.getElementById("yearDisplay").textContent = this.value;
    renderHeatmap(this.value, csvData);
  });

  // Re-render the chart when the window is resized.
  window.addEventListener("resize", () => {
    renderHeatmap(document.getElementById("yearRange").value, csvData);
  });
})();
```
```html
<style>
 /* Basic styling for the app container */
#app {
  width: 100%;
  margin: 0 auto;
  background: #111;
  font-family: sans-serif;
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
