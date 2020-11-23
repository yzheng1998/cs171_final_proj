/* * * * * * * * * * * * * *
 *          MapVis          *
 * * * * * * * * * * * * * */

class MapVis {
  constructor(parentElement, countryData, geoData, moviesData) {
    this.parentElement = parentElement;
    this.countryData = countryData;
    this.geoData = geoData;
    this.moviesData = moviesData;

    // define colors
    this.colors = ["#fddbc7", "#f4a582", "#d6604d", "#b2182b"];

    this.initVis();
    console.log(this.moviesData);
  }

  initVis() {
    let vis = this;

    vis.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    vis.width =
      $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
    vis.height =
      $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

    // init drawing area
    vis.svg = d3
      .select("#" + vis.parentElement)
      .append("svg")
      .attr("width", vis.width)
      .attr("height", vis.height)
      .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);
    // add title

    vis.svg
      .append("g")
      .attr("class", "title map-title")
      .append("text")
      .text("Movie Availability Across the World")
      .attr("transform", `translate(${vis.width / 2}, 20)`)
      .attr("text-anchor", "middle");

    vis.projection = d3
      .geoNaturalEarth1()
      .translate([vis.width / 2, vis.height / 2])
      .scale(100);

    vis.path = d3.geoPath().projection(vis.projection);

    vis.svg
      .append("path")
      .datum(d3.geoGraticule())
      .attr("class", "graticule")
      .attr("fill", "rgba(0, 0, 0, 0)")
      .attr("stroke", "rgba(129,129,129,0.35)")
      .attr("d", vis.path);

    vis.world = topojson.feature(
      vis.geoData,
      vis.geoData.objects.countries
    ).features;

    vis.countries = vis.svg
      .selectAll(".country")
      .data(vis.world)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", vis.path);

    vis.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "mapTooltip");

    // vis.legend = vis.svg
    //   .append("g")
    //   .attr("class", "legend")
    //   .attr(
    //     "transform",
    //     `translate(${(vis.width * 2.8) / 4}, ${vis.height - 60})`
    //   );

    // vis.scaleLegend = d3
    //   .scaleLinear()
    //   .domain([0, 100])
    //   .range([0, vis.width / 6]);

    // vis.legend
    //   .selectAll("rect")
    //   .data(vis.colors)
    //   .enter()
    //   .append("rect")
    //   .attr("x", (d, i) => vis.scaleLegend(25) * i)
    //   .attr("y", 0)
    //   .attr("fill", (d) => d)
    //   .attr("width", vis.scaleLegend(25))
    //   .attr("height", vis.scaleLegend(25));

    // vis.legendAxis = d3.axisBottom().scale(vis.scaleLegend).ticks(3);

    // vis.legend.call(vis.legendAxis);

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;

    vis.countryInfo = vis.countryData.reduce(function (acc, curVal) {
      vis.geoData.objects.countries.geometries.forEach((country) => {
        const { name } = country.properties;
        acc[name] = (acc[name] || 0) + parseInt(curVal[name]);
      });
      return acc;
    }, {});

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.svg
      .selectAll("circle")
      .data(Object.entries(vis.countryInfo))
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .attr("r", function ([country, value]) {
        return value ? Math.sqrt(value) / 2 : 0;
      })
      .attr("fill", "rgba(255, 0, 0, .2)")
      .attr("stroke", "black")
      .attr("stroke-width", 0.2)
      // using the map data
      // position a circle for matches in cd array
      .attr("transform", function ([country, value]) {
        for (var i = 0; i < vis.countries.data().length; i++) {
          var p = vis.countries.data()[i];
          if (p.properties.name === country) {
            var t = vis.path.centroid(p);
            return "translate(" + t + ")";
          }
        }
      })
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", "1px");
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px").html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h6>Country: ${d[0]}<h6>
                     <h6>Count: ${d[1] || 0}<h6>
                 </div>`);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-width", ".2px");

        vis.tooltip
          .style("opacity", 0)
          .style("left", 0)
          .style("top", 0)
          .html(``);
      });

    vis.countries
      .attr("fill", "rgb(120, 120, 120)")
      .attr("stroke-width", ".2px")
      .attr("stroke", "black")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", "1px");
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px").html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h6>Country: ${d.properties.name}<h6>
                     <h6>Count: ${vis.countryInfo[d.properties.name] || 0}<h6>
                 </div>`);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-width", ".2px");

        vis.tooltip
          .style("opacity", 0)
          .style("left", 0)
          .style("top", 0)
          .html(``);
      });
  }
}
