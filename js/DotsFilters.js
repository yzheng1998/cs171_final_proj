d3.select("#plot-platform").on("change", () => {
  let value = d3.select("#plot-platform").property("value");

  plotPlatform = value;

  myPlotVis.wrangleData();
});

$("#genres").on("select2:closing", function (event) {
  myDotsVis.wrangleData();
  myPlotVis.wrangleData();
});

var sliderRT = document.getElementById("rottenTomatoes");
var outputRT = document.getElementById("rottenTomatoesValue");
outputRT.innerHTML = sliderRT.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderRT.oninput = function () {
  outputRT.innerHTML = this.value;
  myDotsVis.wrangleData();
  myPlotVis.wrangleData();
};

var sliderIMDb = document.getElementById("IMDb");
var outputIMDb = document.getElementById("IMDbValue");
outputIMDb.innerHTML = sliderIMDb.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderIMDb.oninput = function () {
  console.log("oninput");
  outputIMDb.innerHTML = this.value;
  myDotsVis.wrangleData();
  myPlotVis.wrangleData();
};

var sliderAge = document.getElementById("Age");
var outputAge = document.getElementById("AgeValue");
outputAge.innerHTML = sliderAge.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
sliderAge.oninput = function () {
  outputAge.innerHTML = this.value;
  myDotsVis.wrangleData();
  myPlotVis.wrangleData();
};
