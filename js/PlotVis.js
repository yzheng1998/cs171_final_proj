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

    vis.xAxis = d3.axisBottom().scale(vis.x)
        .tickFormat(d3.format(".0%"));

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

    vis.sortablePlatforms = [];

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

    console.log(vis.platformCounts);

    vis.sortablePlatforms = [];
    for (let platform in vis.platformCounts) {
      vis.sortablePlatforms.push([platform, vis.platformCounts[platform]]);
    }

    vis.sortablePlatforms.sort(function(a, b) {
      return b[1] - a[1];
    });

    console.log(vis.sortablePlatforms);

    document.getElementById("top-platform-count").innerHTML = '<b>' + vis.numberWithCommas(vis.sortablePlatforms[0][1]) + '</b>';
    document.getElementById("top-platform").innerHTML = vis.numberWithCommas(vis.sortablePlatforms[0][0]);
    document.getElementById("second-platform-count").innerHTML = vis.numberWithCommas(vis.sortablePlatforms[1][1]);
    document.getElementById("second-platform").innerHTML = vis.numberWithCommas(vis.sortablePlatforms[1][0]);
    document.getElementById("third-platform-count").innerHTML = vis.numberWithCommas(vis.sortablePlatforms[2][1]);
    document.getElementById("third-platform").innerHTML = vis.numberWithCommas(vis.sortablePlatforms[2][0]);
    document.getElementById("fourth-platform-count").innerHTML = vis.numberWithCommas(vis.sortablePlatforms[3][1]);
    document.getElementById("fourth-platform").innerHTML = vis.numberWithCommas(vis.sortablePlatforms[3][0]);



    vis.finalPlatform = Object.keys(vis.platformCounts).find(key => vis.platformCounts[key] === Math.max(vis.platformCounts.Netflix,
        vis.platformCounts.Hulu,
        vis.platformCounts["Disney+"],
        vis.platformCounts["Prime Video"]));

    console.log(vis.finalPlatform);


    document.getElementById('final-chosen-platform').innerHTML = 'We think that ' +  vis.finalPlatform + ' is the best platform for you!'
    document.getElementById('fcp-description').innerHTML =  'Based on your viewing preferences, we think <b>' +  vis.finalPlatform + '</b> is most ' +
    'suited for you because it has <b>' + vis.numberWithCommas(vis.platformCounts[vis.finalPlatform]) + '</b> movies that: <br /> ' +
    'have an <b>IMDb</b> rating of at least <b>' + document.getElementById("IMDb").value + '</b>, <br />have a <b>Rotten Tomatoes</b> rating of at least <b>' + document.getElementById("rottenTomatoes").value +
    '</b>, <br />and fall under your preferred genres: <b>' + $("#genres").val().join(', ') + '</b>'

    let link = vis.assignLink(vis.finalPlatform);

    document.getElementById('fcp-image-container').innerHTML = '' +
        '<a id="fcp-image" href="' + link + '" target="_blank">' +
          '<img class="final-image" src="img/' + vis.finalPlatform + '.png" />' +
        '</a>'

    if (plotPlatform !== '') {
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
    }

    if (plotPlatform === '') {
      console.log('plotPlatform all')
      vis.displayData = filteredData.filter(movie => {
        return (selectedGenres.length === 0 ||
            selectedGenres.filter((value) =>
                movie.Genres.split(",").includes(value)
            ).length !== 0) && movie['Rotten Tomatoes'] !== null && movie['IMDb'] !== 0;
      });
    }



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

    const colorSelector = (platform, d) => {

      if (platform === '') {
        if (d.Netflix === 1){
          return '#e50914';
        }

        else if (d.Hulu === 1){
          return '#7de39f';
        }

        else if (d['Prime Video'] === 1){
          return '#edbc51';
        }

        else {
          return '#66a1ed';
        }
      }

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

    d3.select("#tooltip").attr("hidden", true);

    let circle = vis.svg.selectAll("circle")
        .data(vis.displayData, function(d) {
          return d.Title;
        });

    circle
        .exit()
        .transition()
        .duration(800)
        .attr('opacity', 0)
        .remove();

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
        let platformList = ["Netflix", "Disney+", "Prime Video", "Hulu"].filter(ptfm => d[ptfm])

        let html =

            // `<span>${["Netflix", "Disney+", "Prime Video", "Hulu"].filter(ptfm => d[ptfm]).join(', ')}</span>` +
          "<span style='font-weight: bold;'>" +
          d.Title +
          "</span><br/>" +
            "<span>" +
            `Platform${platformList.length > 1 ? 's: ' : ': '}` +
            `${platformList.join(', ')}` +
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
          "</span><br/>" +
          "<span>" +
          "Age rating: " +
            vis.ageRatingNullHandler(d["Age"])+
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
      .attr('opacity', '0')
      .merge(circle)
      .attr("cx", (d) => vis.x(d["Rotten Tomatoes"]))
      .attr("cy", (d) => vis.y(d["IMDb"]))
      .transition()
      .duration(800)
      .attr("fill", d => colorSelector(plotPlatform, d))
      .attr("opacity", "0.7");



    vis.svg.select(".y-axis").transition().call(vis.yAxis);
    vis.svg.select(".x-axis").transition().call(vis.xAxis);
  }

  numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  assignLink = (platform) => {
    if (platform === 'Netflix') {
      return 'https://www.netflix.com/'
    }

    else if (platform === 'Prime Video') {
      return 'https://www.primevideo.com/'
    }

    else if (platform === 'Disney+') {
      return 'https://www.disneyplus.com/'
    }

    else {
      return 'https://www.hulu.com/welcome'
    }
  }

  ageRatingNullHandler = (rating) => {
    if (rating === null) {
      return 'not rated'
    }

    else {
      return rating
    }
  }
}
