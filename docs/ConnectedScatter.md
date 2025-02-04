---
title: "Arizona County Crash Comparison"
theme: dark
toc: false
---

# 🚗 Visualization 3: Licensed Drivers, Registered Vehicles & Crashes Over Time

This connected scatter plot explores the relationship between total crashes and either licensed drivers or registered vehicles in Arizona over time. Use the toggle below to switch between **Licensed Drivers** and **Registered Vehicles**.

<div id="app"></div>

```js
// Import Plot from Observable (d3 is available globally)
import * as Plot from "@observablehq/plot";

(async () => {
  const app = document.getElementById("app");
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
            dx: 5,
            dy: -40,
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
  #app {
    width: 90%;
    margin: 0 auto;
    padding: 20px;
    font-family: sans-serif;
    background: #111;
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
