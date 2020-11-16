let myChordChart;
let myMapVis;

let promises = [
    d3.csv("data/movies_on_streaming_platforms.csv"),
    d3.csv("data/streaming_movies_countries.csv"),
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"),
];

Promise.all(promises).then((data) => {
    gettingStarted(data);
});

function gettingStarted([moviesData, countryData, geoData]) {
    myChordChart = new ChordChart("chord-vis", moviesData);
    myMapVis = new MapVis("map-vis", countryData, geoData);
}
