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

    vis.margin = { top: 20, right: 20, bottom: 30, left: 40 };
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

    vis.svg.append("text")
        .attr("transform",
            "translate(" + (vis.width/2) + " ," +
            (vis.height + vis.margin.top + 10) + ")")
        .style("text-anchor", "middle")
        .style('font-size', '12px')
        .text("Rotten Tomatoes Score");

    vis.svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - vis.margin.left)
        .attr("x",0 - (vis.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style('font-size', '12px')
        .text("IMDB score");

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.displayData = [];
    vis.platformCounts = {
      Netflix: 0,
      Hulu: 0,
      'Disney+': 0,
      'Prime Video': 0,
    };
    // vis.netflixCount = {};
    // vis.huluCount = {};
    // vis.disneyCount = {};
    // vis.primeCount = {};

    var selectedGenres = $("#genres").val();

    console.log(selectedGenres);

    filteredData.map(item => {
      if (item.Netflix === 1 &&
          (selectedGenres.length === 0 ||
              selectedGenres.filter((value) =>
                  item.Genres.split(",").includes(value)
              ).length !== 0)) {
        vis.platformCounts.Netflix += 1;
      }

      if (item.Hulu === 1 &&
          (selectedGenres.length === 0 ||
              selectedGenres.filter((value) =>
                  item.Genres.split(",").includes(value)
              ).length !== 0)) {
        vis.platformCounts.Hulu += 1;
      }

      if (item['Disney+'] === 1 &&
          (selectedGenres.length === 0 ||
              selectedGenres.filter((value) =>
                  item.Genres.split(",").includes(value)
              ).length !== 0)) {
        vis.platformCounts['Disney+'] += 1;
      }

      if (item['Prime Video'] === 1 &&
          (selectedGenres.length === 0 ||
              selectedGenres.filter((value) =>
                  item.Genres.split(",").includes(value)
              ).length !== 0)) {
        vis.platformCounts['Prime Video'] += 1;
      }
    })



    document.getElementById("netflix-count").innerHTML = vis.numberWithCommas(vis.platformCounts.Netflix);
    document.getElementById("hulu-count").innerHTML = vis.numberWithCommas(vis.platformCounts.Hulu);
    document.getElementById("disney-count").innerHTML =
      vis.numberWithCommas(vis.platformCounts["Disney+"]);
    document.getElementById("prime-video-count").innerHTML =
      vis.numberWithCommas(vis.platformCounts["Prime Video"]);


    vis.finalPlatform = Object.keys(vis.platformCounts).find(key => vis.platformCounts[key] === Math.max(vis.platformCounts.Netflix,
        vis.platformCounts.Hulu,
        vis.platformCounts["Disney+"],
        vis.platformCounts["Prime Video"]));

    console.log(vis.finalPlatform);


    document.getElementById('final-chosen-platform').innerHTML = 'We think that ' +  vis.finalPlatform + ' is the best platform for you!'
    document.getElementById('fcp-description').innerHTML =  'Based on your viewing preferences, we think ' +  vis.finalPlatform + ' is most ' +
    'suited for you because it has ' + vis.numberWithCommas(vis.platformCounts[vis.finalPlatform]) + ' movies that: <br /> ' +
    'have an IMDb rating of at least ' + document.getElementById("IMDb").value + ', <br />have a Rotten Tomatoes rating of at least ' + document.getElementById("rottenTomatoes").value +
    ', <br />and fall under your preferred genres: ' + $("#genres").val().join(', ')

    document.getElementById('fcp-image-container').innerHTML = '<img src="img/' + vis.finalPlatform + '.png" />'

    vis.displayData = filteredData.filter((movie) => {
      return (
        movie[plotPlatform] === 1 &&
        (selectedGenres.length === 0 ||
          selectedGenres.filter((value) =>
            movie.Genres.split(",").includes(value)
          ).length !== 0) &&
        movie["Rotten Tomatoes"] !== null
      );
    });

    //
    // vis.netflixCount = vis.displayData.reduce((a, b) => ({Netflix: a.Netflix + b.Netflix}));
    // vis.huluCount = vis.displayData.reduce((a, b) => ({Hulu: a.Hulu + b.Hulu}));
    // vis.disneyCount = vis.displayData.reduce((a, b) => ({'Disney+': a['Disney+'] + b['Disney+']}));
    // vis.primeCount = vis.displayData.reduce((a, b) => ({'Prime Video': a['Prime Video'] + b['Prime Video']}));
    //
    // console.log(vis.netflixCount)
    // console.log(vis.huluCount)
    // console.log(vis.disneyCount)
    // console.log(vis.primeCount)

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


    vis.x.domain(d3.extent(filteredData, (d) => d["Rotten Tomatoes"]));
    // .domain(d3.extent(vis.displayData, d => d['Rotten Tomatoes'])).nice()

    vis.y.domain(d3.extent(filteredData, (d) => d["IMDb"]));
    // .domain([0, 10])

    // console.log(d3.extent(vis.displayData, (d) => d["IMDb"]));

    // vis.color = d3.scaleOrdinal(vis.displayData.map(d => d.Netflix), d3.schemeCategory10)

    // vis.shape = d3.scaleOrdinal(vis.displayData.map(d => d.Netflix), d3.symbols.map(s => d3.symbol().type(s)()))
    // console.log(vis.shape('1'));

    const colorSelector = (platform) => {
      if (platform === 'Netflix'){
        return '#e50914';
      }

      else if (platform === 'Hulu'){
        return '#7de39f';
      }

      else if (platform === 'Prime Video'){
        return '#edbc51';
      }

      else {
        return '#66a1ed';
      }

    }

    let circle = vis.svg.selectAll("circle")
        .data(vis.displayData, function(d) {
          return d.Title;
        });

    circle
      .enter()
      .append("circle")
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
          d["Rotten Tomatoes"] * 100 +
          "%" +
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
        .attr("fill", colorSelector(plotPlatform))
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

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
}
