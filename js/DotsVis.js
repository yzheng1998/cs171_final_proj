class DotsVis {
  constructor(parentElement, movieData, genresData) {
    this.parentElement = parentElement;
    this.movieData = movieData;
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

    // add title
    vis.svg
      .append("g")
      .attr("class", "title bar-title")
      .append("text")
      .text("Exploratory Vis")
      .attr("transform", `translate(${vis.width / 2}, 10)`)
      .attr("text-anchor", "middle");

    vis.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", vis.parentElement + "_ttip");

    // let simulation = d3
    //   .forceSimulation(nodes)
    //   .force("charge", d3.forceManyBody())
    //   .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
    //   .on("tick", ticked);

    // function ticked() {
    //   var u = vis.svg.selectAll("circle").data(nodes);

    //   u.enter()
    //     .append("circle")
    //     .attr("r", 5)
    //     .merge(u)
    //     .attr("cx", function (d) {
    //       return d.x;
    //     })
    //     .attr("cy", function (d) {
    //       return d.y;
    //     });

    //   u.exit().remove();
    // }

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    let platforms = ["Netflix", "Hulu", "Prime Video", "Disney+"];

    // first, filter according to selectedTimeRange, init empty array
    let filteredData = [];
    vis.displayData = [];
    vis.platforms = {
      Netflix: new Set(),
      Hulu: new Set(),
      "Prime Video": new Set(),
      "Disney+": new Set()
    };

    vis.movieData.forEach((movie) => {
      for (let platform of platforms) {
        if (movie[platform]) {
          vis.platforms[platform].add(movie.Id);
        }
      }
    });

    vis.genreCount = {};

    vis.genresData.forEach((movie, i) => {
      for (const [genre, indicator] of Object.entries(movie)) {
        if (genre === "") {
          continue;
        }
        if (+indicator) {
          Object.keys(vis.platforms).forEach((platform) => {
            if (vis.platforms[platform].has(i)) {
              vis.genreCount[platform + "," + genre] = vis.genreCount[
                platform + "," + genre
              ]
                ? vis.genreCount[platform + "," + genre] + 1
                : 1;
            }
          });
        }
      }
    });

    vis.updateVis();
  }

  updateVis() {
    let vis = this;

    // var color = d3.scaleOrdinal().range(["#7A99AC", "#E4002B"]);
    var color = ["#E50914", "#7de39f", "#edbc51", "#66a1ed"];

    // d3.text("word_groups.csv", function (error, text) {
    //   if (error) throw error;
    //   var colNames = "text,size,group\n" + text;
    //   var data = d3.csv.parse(colNames);

    //   data.forEach(function (d) {
    //     d.size = +d.size;
    //   });

    var cs = ["Netflix", "Hulu", "Prime Video", "Disney+"];

    var n = vis.genreCount.length, // total number of nodes
      m = cs.length; // number of distinct clusters

    //create clusters and nodes
    var clusters = new Array(m);
    var nodes = Object.entries(vis.genreCount).map(([platformGenre, count]) => {
      const [platform, genre] = platformGenre.split(",");
      let scaledRadius = Math.sqrt(count),
        forcedCluster = cs.indexOf(platform);

      // add cluster id and radius to array
      let d = {
        cluster: forcedCluster,
        radius: scaledRadius,
        platform,
        genre,
        count
      };
      // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
      if (
        !clusters[forcedCluster] ||
        scaledRadius > clusters[forcedCluster].radius
      )
        clusters[forcedCluster] = d;
      return d;
    });

    console.log("nodes", nodes);

    // var force = d3
    //   .forceSimulation(nodes)
    //   .force("charge", 0)
    //   .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
    //   .on("tick", tick);

    var forceCollide = d3
      .forceCollide()
      .radius(function (d) {
        return d.radius + 1.5;
      })
      .iterations(1);

    function forceCluster(alpha) {
      for (
        var i = 0, n = nodes.length, node, cluster, k = alpha * 1;
        i < n;
        ++i
      ) {
        node = nodes[i];
        cluster = clusters[node.cluster];
        node.vx -= (node.x - cluster.x) * k;
        node.vy -= (node.y - cluster.y) * k;
      }
    }
    console.log("clusters", clusters);

    var circle = vis.svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", function (d) {
        return d.radius;
      })
      .style("fill", function (d) {
        return color[d.cluster];
      });
    //    TODO: Update for v4
    //    .call(force.drag);

    function tick() {
      circle
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    }

    var force = d3
      .forceSimulation()
      .nodes(nodes)
      .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
      .force("collide", forceCollide)
      .force("cluster", forceCluster)
      .force("gravity", d3.forceManyBody(30))
      .force("x", d3.forceX().strength(0.7))
      .force("y", d3.forceY().strength(0.7))
      .on("tick", tick);

    var node = vis.svg
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("g")
      .call(force.drag);

    // node
    //   .append("text")
    //   .attr("dy", ".3em")
    //   .style("text-anchor", "middle")
    //   .text(function (d) {
    //     return d.text.substring(0, d.radius / 3);
    //   });
  }
}
