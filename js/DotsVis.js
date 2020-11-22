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
      .attr("id", "dotsTooltip");

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
    var color = ["#E50914", "#7de39f", "#edbc51", "#66a1ed"];

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

    var forceCollide = d3
      .forceCollide()
      .radius(function (d) {
        return d.radius + 2;
      })
      .iterations(5);

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
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", function (d) {
        return d.radius;
      })
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .style("fill", function (d) {
        return color[d.cluster];
      })
      .style("opacity", 1)
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.7);
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px").html(`
         <div style="border: thin solid grey; border-radius: 5px; background: rgba(0, 0, 0, .7); padding: 5px;">
            <p style="font-size: 10px; color: white; margin: 0px">Platform: ${d.platform}<br>Genre: ${d.genre}<br>Count: ${d.count}<p>
         </div>`);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).style("opacity", 1);

        vis.tooltip
          .style("opacity", 0)
          .style("left", 0)
          .style("top", 0)
          .html(``);
      });

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
      //.force("gravity", d3.forceManyBody(20))
      .force("charge", d3.forceManyBody(20))
      .force("x", d3.forceX().strength(0.7))
      .force("y", d3.forceY().strength(0.7))
      .on("tick", tick);

    // Drag functions used for interactivity
    function dragstarted(event, d) {
      if (!d.active) {
        force.alphaTarget(0.15).restart();
      }
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!d.active) {
        force.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    }
  }
}