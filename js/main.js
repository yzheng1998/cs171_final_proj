let myChordChart;
let myMapVis;
let myDotsVis;
let myGenreVis;
let myPlotVis;
let plotPlatform = "";
let myGenreSelector;
let platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"];
let filteredData;
let mapFilter = "";

let promises = [
  d3.csv("data/movies_on_streaming_platforms.csv", function (d) {
    return {
      Country: d.Country,
      Age: d.Age ? parseInt(d.Age.slice(0, -1)) : null,
      Directors: d.Directors,
      "Disney+": +d["Disney+"],
      Hulu: +d.Hulu,
      "Prime Video": +d["Prime Video"],
      Netflix: +d.Netflix,
      IMDb: +d.IMDb,
      Language: d.Language,
      Title: d.Title,
      "Rotten Tomatoes": d["Rotten Tomatoes"]
        ? +d["Rotten Tomatoes"].slice(0, -1) / 100
        : null,
      Runtime: +d.Runtime,
      Year: +d.Year,
      Genres: d.Genres,
      Id: +d[""],
    };
  }),
  d3.csv("data/streaming_movies_countries.csv"),
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
  d3.csv("data/streaming_movies_genres.csv"),
];

Promise.all(promises).then((data) => {
  gettingStarted(data);
});

function gettingStarted([moviesData, countryData, geoData, genresData]) {
  var genresCount = genresData.reduce((acc, cur) => {
    for (var key in cur) {
      if (key === "") continue;
      acc[key] = (parseInt(acc[key]) || 0) + parseInt(cur[key]);
    }
    return acc;
  }, {});

  // myChordChart = new ChordChart("chord-vis", moviesData);
  myMapVis = new MapVis("map-vis", countryData, geoData, moviesData);
  myDotsVis = new DotsVis("exploratory-vis", moviesData, genresData);
  myGenreVis = new GenreVis("radial-genre-vis", moviesData, genresData);
  myGenreSelector = new GenreSelector("genres", genresCount);
  myPlotVis = new PlotVis("results-vis", moviesData, genresData);
}

$("#button-disney").on("click", function (e) {
  mapFilter = "Disney+";
  myMapVis.wrangleData();
});

$("#button-prime").on("click", function (e) {
  mapFilter = "Prime Video";
  myMapVis.wrangleData();
});

$("#button-hulu").on("click", function (e) {
  mapFilter = "Hulu";
  myMapVis.wrangleData();
});

$("#button-netflix").on("click", function (e) {
  mapFilter = "Netflix";
  myMapVis.wrangleData();
});

$("#button-all").on("click", function (e) {
  mapFilter = "";
  myMapVis.wrangleData();
});

/********/

$("#button-disney-2").on("click", function (e) {
  plotPlatform = "Disney+";
  myPlotVis.wrangleData();
});

$("#button-prime-2").on("click", function (e) {
  plotPlatform = "Prime Video";
  myPlotVis.wrangleData();
});

$("#button-hulu-2").on("click", function (e) {
  plotPlatform = "Hulu";
  myPlotVis.wrangleData();
});

$("#button-netflix-2").on("click", function (e) {
  plotPlatform = "Netflix";
  myPlotVis.wrangleData();
});

$("#button-all-2").on("click", function (e) {
  plotPlatform = "";
  myPlotVis.wrangleData();
});

