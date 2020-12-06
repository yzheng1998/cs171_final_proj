class DotsVis {
  constructor(parentElement, movieData, genresData) {
    this.parentElement = parentElement;
    this.movieData = movieData;
    this.genresData = genresData;
    this.color = ["#E50914", "#7de39f", "#edbc51", "#66a1ed"];

    this.cs = ["Netflix", "Hulu", "Prime Video", "Disney+"];

    //create clusters
    this.clusters = new Array(this.cs.length);

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
      .text("Genres")
      .attr("transform", `translate(${vis.width / 2}, 10)`)
      .attr("text-anchor", "middle");

    vis.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .attr("id", "dotsTooltip");

    vis.textAndNodesGroup = vis.svg.append("g").attr("class", "textAndNodes");

    vis.force = d3
      .forceSimulation()
      .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
      .force("charge", d3.forceManyBody(20))
      .force(
        "x",
        d3
          .forceX()
          .strength(0.7)
          .x(vis.width / 2)
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.7)
          .y(vis.height / 2)
      );

    vis.radius = d3.scaleSqrt([0, 6000], [0, 75]);

    vis.legend = vis.svg
      .append("g")
      .attr("fill", "#777")
      .attr("transform", `translate(${50}, ${vis.height})`)
      .attr("text-anchor", "middle")
      .style("font", "10px sans-serif")
      .selectAll("g")
      .data(vis.radius.ticks(5).slice(1))
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

    this.wrangleData();
  }

  wrangleData() {
    let vis = this;

    var selectedGenres = $("#genres").val();

    vis.displayData = [];
    vis.platforms = {
      Netflix: new Set(),
      Hulu: new Set(),
      "Prime Video": new Set(),
      "Disney+": new Set(),
    };

    var IMDbValue = parseInt(document.getElementById("IMDb").value);
    var RTValue = parseInt(document.getElementById("rottenTomatoes").value);
    var AgeValue = parseInt(document.getElementById("Age").value);

    filteredData = vis.movieData.filter((x) => {
      return (
        x.IMDb >= IMDbValue &&
        x["Rotten Tomatoes"] >= RTValue / 100 &&
        x.Age <= AgeValue
      );
    });

    filteredData.forEach((movie) => {
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
        if (
          +indicator &&
          // filter selectedGenres
          (selectedGenres.length === 0 || selectedGenres.includes(genre))
        ) {
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

    // create nodes
    var nodes = Object.entries(vis.genreCount).map(
      ([platformGenre, count], i) => {
        const [platform, genre] = platformGenre.split(",");
        let scaledRadius = vis.radius(count),
          forcedCluster = vis.cs.indexOf(platform);

        // add cluster id and radius to array
        let d = {
          id: platformGenre,
          cluster: forcedCluster,
          radius: scaledRadius,
          platform,
          genre,
          count,
        };
        // add to clusters array if it doesn't exist or the radius is larger than another radius in the cluster
        if (
          !vis.clusters[forcedCluster] ||
          scaledRadius > vis.clusters[forcedCluster].radius
        )
          vis.clusters[forcedCluster] = d;
        return d;
      }
    );

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
        cluster = vis.clusters[node.cluster];
        node.vx -= (node.x - cluster.x) * k;
        node.vy -= (node.y - cluster.y) * k;
      }
    }

    vis.textAndNodes = vis.textAndNodesGroup
      .selectAll(".bubble")
      .data(nodes, function (d) {
        return d.id;
      });

    var textAndNodesExit = vis.textAndNodes.exit();

    textAndNodesExit
      .selectAll(".bubble-node")
      .transition()
      .duration(750)
      .style("fill", "grey")
      .attr("r", 0.0001);

    textAndNodesExit
      .selectAll(".bubble-text")
      .transition()
      .duration(750)
      .attr("opacity", 0);

    textAndNodesExit.transition().duration(750).remove();

    var newTextAndNodes = vis.textAndNodes
      .enter()
      .append("g")
      .attr("class", "bubble")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      )
      .on("mouseover", function (event, d) {
        d3.select(this).style("opacity", 0.7);
        vis.tooltip
          .style("opacity", 1)
          .style("left", event.pageX + 20 + "px")
          .style("top", event.pageY + "px").html(`
         <div style="border: thin solid grey; border-radius: 5px; background: rgba(0, 0, 0, .7); padding: 5px;">
            <p style="font-size: 10px; color: white; margin: 0px">Platform: ${d.platform}<br>Genre: ${d.genre}<br>Count: ${d.count}
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

    newTextAndNodes
      .append("circle")
      .attr("class", "bubble-node")
      .style("fill", function (d) {
        return vis.color[d.cluster];
      });

    newTextAndNodes
      .append("text")
      .attr("class", "bubble-text")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .attr("font-family", "Space Mono")
      .attr("font-size", 9);

    vis.textAndNodes = newTextAndNodes.merge(vis.textAndNodes);

    vis.textAndNodes
      .selectAll(".bubble-node")
      .transition()
      .duration(750)
      .attr("r", function (d) {
        return nodes.find((el) => el.id === d.id).radius;
      });

    vis.textAndNodes
      .selectAll(".bubble-text")
      .transition()
      .duration(750)
      .text(function (d) {
        if (nodes.find((el) => el.id === d.id).count > 200)
          return `${d.genre}  `;
      });

    function tick() {
      vis.textAndNodes.attr("transform", function (d) {
        return `translate(${d.x}, ${d.y})`;
      });
    }

    // reset force
    vis.force
      .nodes(nodes)
      .force("collide", forceCollide)
      .force("cluster", forceCluster)
      .on("tick", tick);

    vis.force.alpha(0.2).restart();

    // Drag functions used for interactivity
    function dragstarted(event, d) {
      if (!d.active) {
        vis.force.alphaTarget(0.15).restart();
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
        vis.force.alphaTarget(0);
      }
      d.fx = null;
      d.fy = null;
    }
  }
}
