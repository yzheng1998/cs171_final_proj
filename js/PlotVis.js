/* * * * * * * * * * * * * *
 *      class BarVis        *
 * * * * * * * * * * * * * */

class PlotVis {
  constructor(parentElement, streamingData, genresData) {
    this.parentElement = parentElement;
    this.displayData = [];
    this.streamingData = streamingData;
    this.genresData = genresData;

    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 20, right: 20, bottom: 20, left: 40 };
    vis.width =
      $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height =
      $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // init drawing area
    vis.svg = d3
      .select("#" + vis.parentElement)
      .append("svg")
      .attr("width", vis.width + vis.margin.left + vis.margin.right)
      .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
      .append("g")
      .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

    vis.x = d3.scaleLinear().range([20, vis.width]);

    vis.y = d3.scaleLinear().range([vis.height, 0]);

    vis.xAxis = d3.axisBottom().scale(vis.x);

    vis.yAxis = d3.axisLeft().scale(vis.y);

    vis.svg
      .append("g")
      .attr("class", "x-axis axis")
      .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g").attr("class", "y-axis axis");

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.displayData = [];

    var selectedGenres = $("#genres").val();

    console.log(vis.streamingData);
    console.log("genres", selectedGenres);

    vis.displayData = vis.streamingData.filter((movie) => {
      return (
        movie[plotPlatform] === 1 &&
        (selectedGenres.length === 0 ||
          selectedGenres.filter((value) =>
            movie.Genres.split(",").includes(value)
          ).length !== 0) &&
        movie["Rotten Tomatoes"] !== null
      );
    });

    console.log("displaydata", vis.displayData);

    // document.getElementById("netflix-count").innerHTML = platformCounts.Netflix;
    // document.getElementById("hulu-count").innerHTML = platformCounts.Hulu;
    // document.getElementById("disney-count").innerHTML =
    //   platformCounts["Disney+"];
    // document.getElementById("prime-video-count").innerHTML =
    //   platformCounts["Prime Video"];

    // platforms.forEach((id) => {
    //   let index = vis.streamingData.findIndex((x) => x.Id === id);

    //   if (
    //     !vis.displayData.includes(vis.streamingData[index]) &&
    //     vis.streamingData[index]["Rotten Tomatoes"] !== null
    //   ) {
    //     vis.displayData.push(vis.streamingData[index]);
    //   }
    // });

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.x.domain(d3.extent(vis.displayData, (d) => d["Rotten Tomatoes"]));
    // .domain(d3.extent(vis.displayData, d => d['Rotten Tomatoes'])).nice()

    vis.y.domain(d3.extent(vis.displayData, (d) => d["IMDb"]));
    // .domain([0, 10])

    // console.log(d3.extent(vis.displayData, (d) => d["IMDb"]));

    // vis.color = d3.scaleOrdinal(vis.displayData.map(d => d.Netflix), d3.schemeCategory10)

    // vis.shape = d3.scaleOrdinal(vis.displayData.map(d => d.Netflix), d3.symbols.map(s => d3.symbol().type(s)()))
    // console.log(vis.shape('1'));

    let circle = vis.svg.selectAll("circle").data(vis.displayData);

    circle
      .enter()
      .append("circle")
      .attr("fill", "green")
      .attr("r", 5)
      .on("mouseover", function (event, d) {
        // console.log("mouseover");

        let mouseLeft = d3.pointer(event)[0];
        let mouseTop = d3.pointer(event)[1];
        // console.log(mouseLeft);
        // console.log(mouseTop);

        let xPosition = vis.margin.left + mouseLeft + 40;
        let yPosition = vis.margin.top + mouseTop + 40;

        // let RTScore = vis.x.invert(mouseLeft);
        // console.log(RTScore);
        // let index = vis.displayData.findIndex(d => d['Rotten Tomatoes'] === RTScore);
        // console.log(index)
        // let IMDbScore = vis.displayData[index][plotPlatform];

        // console.log(IMDbScore)

        //Update the tooltip position and value

        let html =
          "<span style='font-weight: bold;'>" +
          d.Title +
          "</span><br/>" +
          "<span>" +
          "Genres: " +
          d.Genres.replace(/,(?=[^\s])/g, ", ") +
          "</span><br/>" +
          "<span>" +
          "IMDb score: " +
          d.IMDb +
          "</span><br/>" +
          "<span>" +
          "Rotten Tomatoes score: " +
          d["Rotten Tomatoes"] +
          "</span><br/>";

        d3.select("#tooltip")
          .style("left", xPosition + 45 + "px")
          .style("top", yPosition + "px")
          .html(html);

        //Show the tooltip
        d3.select("#tooltip").attr("hidden", null);
      })
      .on("mouseout", function (d) {
        //Hide the tooltip
        d3.select("#tooltip").attr("hidden", true);
      })
      .merge(circle)
      .transition()
      .duration(800)
      .attr("cx", (d) => vis.x(d["Rotten Tomatoes"]))
      .attr("cy", (d) => vis.y(d["IMDb"]))
      .attr("opacity", "0.7");

    circle.exit().remove();

    // vis.svg.append("g")
    //     .attr("stroke-width", 1.5)
    //     .attr("font-family", "sans-serif")
    //     .attr("font-size", 10)
    //     .selectAll("path")
    //     .data(vis.displayData)
    //     .join("path")
    //     .attr("transform", d => `translate(${vis.x(d['Rotten Tomatoes'])},${vis.y(d['IMDb'])})`)
    //     .attr("fill", 'red')
    //     .attr("d", 'M4.51351666838205,0A4.51351666838205,4.51351666838205,0,1,1,-4.51351666838205,0A4.51351666838205,4.51351666838205,0,1,1,4.51351666838205,0')
    //     .attr('opacity', '0.7');
    //     // .attr("fill", d => vis.color(d.Netflix))
    //     // .attr("d", d => vis.shape(d.Netflix));
    //     // .attr("fill", d => color(d.category))
    //     // .attr("d", d => shape(d.category));

    vis.svg.select(".y-axis").call(vis.yAxis);
    vis.svg.select(".x-axis").call(vis.xAxis);
  }
}
