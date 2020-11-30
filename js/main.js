let myChordChart;
let myMapVis;
let myDotsVis;
let myGenreVis;
let myPlotVis;
let plotPlatform = "Netflix";
let myGenreSelector;
let platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"];
let filteredData;

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
  // myChordChart = new ChordChart("chord-vis", moviesData);
  myMapVis = new MapVis("map-vis", countryData, geoData, moviesData);
  myDotsVis = new DotsVis("exploratory-vis", moviesData, genresData);
  myGenreVis = new GenreVis("radial-genre-vis", moviesData, genresData);
  myGenreSelector = new GenreSelector("genres", genresData.columns.slice(1));
  myPlotVis = new PlotVis("results-vis", moviesData, genresData);
}
