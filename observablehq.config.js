export default {
  root: "docs",
  title: "Arizona Crash Report",
  base: "/DV_arizona_crash_reports/",
  files: {
    "accident-image": "data/accident.jpg",  // ✅ Ensure image is included
    "crash-data": "data/Arizona county crashes.csv",
    "counties-data": "data/counties_rural_urban.csv",
    "hourly-crashes": "data/Crashes by Hour and Day of Week.csv",
    "alcohol-involvement": "data/Driver Involvement by Age Alcohol-Related.csv",
    "age-involvement": "data/Driver Involvement by Age.csv",
    "vehicle-data": "data/Licensed drivers and registered vehicles.csv"
  },
  pages: [
    { name: "Home", path: "/" },
    { name: "Map", path: "map" },
    { name: "Bar chart", path: "Bar chart (small multiples)" },
    { name: "ConnectedScatter plot", path: "ConnectedScatter" },
    { name: "Ridgeline", path: "Ridgeline" },
    { name: "Heatmap", path: "Heatmap" }
  ]
};

