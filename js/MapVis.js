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

    // vis.svg
    //   .append("g")
    //   .attr("class", "title map-title")
    //   .append("text")
    //   .text("Where are movies produced?")
    //   .attr("transform", `translate(${vis.width / 2}, 20)`)
    //   .attr("text-anchor", "middle");

    vis.projection = d3
      .geoMercator()
      .center([0, 20])
      .translate([vis.width / 2, vis.height / 2])
      .scale(130);

    vis.path = d3.geoPath().projection(vis.projection);

    // vis.svg
    //   .append("path")
    //   .datum(d3.geoGraticule())
    //   .attr("class", "graticule")
    //   .attr("fill", "rgba(0, 0, 0, 0)")
    //   .attr("stroke", "rgba(129,129,129,0.35)")
    //   .attr("d", vis.path);

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

    vis.centroids = vis.countries.data().reduce(
      (obj, item) =>
        Object.assign(obj, {
          [item.properties.name]: vis.path.centroid(item),
        }),
      {}
    );
    // hardcode France's Centroid
    // vis.centroids.France = [180.54553255080222, 165.14844120403816];

    vis.radius = d3.scaleSqrt([0, 12000], [0, 50]);

    vis.legend = vis.svg
      .append("g")
      .attr("fill", "#777")
      .attr("transform", `translate(${70}, ${vis.height - 30})`)
      .attr("text-anchor", "middle")
      .style("font", "10px sans-serif")
      .selectAll("g")
      .data(vis.radius.ticks(4).slice(1))
      .join("g");

    vis.legend
      .append("circle")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("cy", (d) => -vis.radius(d))
      .attr("r", vis.radius);

    vis.legend
      .append("text")
      .attr("y", (d) => -2 * vis.radius(d))
      .attr("dy", "1.3em")
      .text(vis.radius.tickFormat(4, "s"));

    vis.wrangleData();
  }

  wrangleData() {
    let vis = this;
    vis.filteredCountryData = vis.countryData;

    if (mapFilter !== "") {
      vis.filteredCountryData = vis.countryData.filter(
        (val, i) => vis.moviesData[i][mapFilter]
      );
    }

    vis.countryInfo = vis.filteredCountryData.reduce(function (acc, curVal) {
      vis.geoData.objects.countries.geometries.forEach((country) => {
        const { name } = country.properties;
        acc[name] = (acc[name] || 0) + (parseInt(curVal[name]) || 0);
      });
      return acc;
    }, {});

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    vis.circles = vis.svg.selectAll(".bubble").data(
      Object.entries(vis.countryInfo).sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
      }),
      function (d) {
        return d[0];
      }
    );

    var platformColors = {
      Hulu: "#7de39f",
      Netflix: "#e50914",
      "Disney+": "#66a1ed",
      "Prime Video": "#edbc51",
    };

    vis.circles.exit().transition().duration(750).remove();

    vis.circles
      .enter()
      .append("circle")
      .attr("class", "bubble")
      .merge(vis.circles)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", "1px");

        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px").html(`
          <div style="border: thin solid grey; border-radius: 5px; background: rgba(0, 0, 0, .7); padding: 5px;">
            <p style="font-size: 14px; color: white; margin: 0px">${
              d[0]
            }:<br>${d[1] || 0} movie${d[1] !== 1 ? "s" : ""}
         </div>
                 `);
      })
      .attr("transform", function ([country, value]) {
        var t = vis.centroids[country];
        return "translate(" + t + ")";
      })
      .attr("stroke", "white")
      .attr("stroke-width", 0.2)
      .on("mouseout", function (event, d) {
        d3.select(this).attr("stroke-width", ".2px");

        vis.tooltip
          .style("opacity", 0)
          .style("left", 0)
          .style("top", 0)
          .html(``);
      })
      .attr("fill-opacity", 0.7)
      .transition()
      .duration(750)
      .attr("r", function ([country, value]) {
        return vis.radius(value);
      })
      .attr("fill", (d) => {
        return platformColors[mapFilter] || "rgb(79,98,112)";
      });

    vis.labels = vis.svg.selectAll(".labels").data(
      Object.entries(vis.countryInfo).sort((a, b) => {
        if (a[0] < b[0]) return -1;
        if (a[0] > b[0]) return 1;
        return 0;
      }),
      function (d) {
        return d[0];
      }
    );

    vis.labels.exit().remove();

    vis.labels
      .enter()
      .append("text")
      .attr("class", "labels")
      .merge(vis.labels)
      .attr("transform", function ([country, value]) {
        var t = vis.centroids[country];
        return "translate(" + t + ")";
      })
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-family", "Space Mono")
      .attr("font-size", 12)
      .transition()
      .delay(500)
      .text(function (d) {
        if (d[1] > 500) {
          return d[1];
        }
      });

    vis.countries
      .attr("fill", "rgb(180, 180, 180)")
      .attr("stroke-width", ".2px")
      .attr("stroke", "white")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", "1px");
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px").html(`
        <div style="border: thin solid grey; border-radius: 5px; background: rgba(0, 0, 0, .7); padding: 5px;">
          <p style="font-size: 14px; color: white; margin: 0px">${
            d.properties.name
          }:<br>${vis.countryInfo[d.properties.name] || 0} movie${vis.countryInfo[d.properties.name] !== 1 ? "s" : ""}
       </div>
               `);
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
