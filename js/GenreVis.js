class GenreVis{
    constructor(parentElement, movieData, genresData) {
        this.parentElement = parentElement;
        this.movieData = movieData;
        this.genresData = genresData;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 90, right: 20, bottom: 20, left: 50 };
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
            .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`)
            .attr("class","radar");

        // add title
        // vis.svg
        //     .append("g")
        //     .attr("class", "title bar-title")
        //     .append("text")
        //     .text("Genre Profile Vis")
        //     .attr("transform", `translate(${vis.width / 2}, 10)`)
        //     .attr("text-anchor", "middle");

        // define color scale
        vis.color = d3.scaleOrdinal()
            .range(["#66a1ed","#7de39f","#E50914","#edbc51"]);

        let platforms = ["Disney+", "#19cf75", "Netflix", "Prime Video"];


        // vis.tooltip = d3
        //     .select("body")
        //     .append("div")
        //     .attr("class", "tooltip")
        //     .attr("id", "dotsTooltip");

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;

        let platforms = ["Disney+", "Hulu", "Netflix", "Prime Video"];

        // first, filter according to selectedTimeRange, init empty array
        let filteredData = [];
        vis.displayData = [];
        vis.platforms = {
            "Disney+": new Set(),
            Netflix: new Set(),
            Hulu: new Set(),
            "Prime Video": new Set()
        };

        vis.movieData.forEach((movie) => {
            for (let platform of platforms) {
                if (movie[platform]) {
                    vis.platforms[platform].add(movie.Id);
                }
            }
        });

        console.log(vis.platforms)
        console.log(vis.platforms.Netflix.size)


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

        // console.log(vis.genreCount)

        // normalizing genre per platform into percentage within each platform
        vis.genreBreakdown = {
            "Disney+": [],
            Hulu: [],
            Netflix: [],
            "Prime Video": []
        }

        vis.maxCounter = [];

        Object.keys(vis.genreCount).forEach((movie, i) =>{
            const [platform, genre] = movie.split(",");
            const total = vis.platforms[platform].size
            vis.genreBreakdown[platform].push({
                "genre": genre,
                "percent": vis.genreCount[movie]/total,
                "platform": platform
            })
            vis.maxCounter.push(vis.genreCount[movie]/total)
        })

        // Append genres that disney+ doesnt have
        vis.genreBreakdown["Disney+"].push({
            genre: "Film-Noir",
            percent: 0,
            platform: "Disney+"
        },
            {
                genre: "Game-Show",
                percent: 0,
                platform: "Disney+"
            },
            {
                genre: "Talk-Show",
                percent: 0,
                platform: "Disney+"
            })

        console.log(vis.genreBreakdown["Disney+"])


        // Sort by genre alphabetically
        Object.keys(vis.genreBreakdown).forEach((platform,i)=>{
            vis.genreBreakdown[platform] = vis.genreBreakdown[platform].sort((a,b)=>d3.ascending(a.genre,b.genre))
        })

        console.log('sorted',vis.genreBreakdown)

        vis.arrayGenre = Object.keys(vis.genreBreakdown)
            .map(key => vis.genreBreakdown[key])


        console.log(vis.arrayGenre)


        // vis.updateVis();
        vis.filterData();
        vis.filtering = "";
    }

    filterData(){
        let vis = this;
        vis.displayData = vis.arrayGenre;

        let platforms = ["Disney+", "Hulu", "Netflix", "Prime Video"];

        // if (vis.filtering){
        //     if (platforms.indexOf(vis.filtering) != -1){
        //         var indexOfFilter = platforms.indexOf(vis.filtering);
        //         console.log(vis.filtering)
        //     }
        // }

        vis.updateVis();

    }

    updateVis(){

        let vis = this;

        let platforms = ["Disney+", "Hulu", "Netflix", "Prime Video"];

        const max = Math.max;
        const sin = Math.sin;
        const cos = Math.cos;
        const HALF_PI = Math.PI / 2;

        // setup radar chart
        var cfg = {
            w: vis.width*0.8,				//Width of the circle
            h: vis.height*0.8,				//Height of the circle
            margin: vis.margin, //The margins of the SVG
            levels: 10,				//How many levels or inner circles should there be drawn
            maxValue: d3.max(vis.maxCounter), 			//What is the value that the biggest circle will represent
            labelFactor: 1.15, 	//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
            opacityArea: 0.35, 	//The opacity of the area of the blob
            dotRadius: 4, 			//The size of the colored circles of each blog
            opacityCircles: 0.1, 	//The opacity of the circles of each blob
            strokeWidth: 2, 		//The width of the stroke around each blob
            roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
            color: vis.color	//Color function
        };

        // setup radial axes
        var allAxis = (vis.genreBreakdown.Netflix.map(function(i, j){return i.genre})),	//Names of each axis
            total = allAxis.length,					//The number of different axes
            radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
            Format = d3.format('.0%'),			 	//Percentage formatting
            angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"


        //Scale for the radius
        var rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, cfg.maxValue]);

        let g = vis.svg.append("g")
            .attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

        //Filter for the outside glow
        var filter = g.append('defs').append('filter').attr('id','glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

        //Wrapper for the grid & axes
        var axisGrid = g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
            .data(d3.range(1,(cfg.levels+1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function(d, i){return radius/cfg.levels*d;})
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter" , "url(#glow)");


        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function(d, i){ return rScale(cfg.maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("y2", function(d, i){ return rScale(cfg.maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        // wrap helper
        const wrap = (text, width) => {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.4, // ems
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
        }

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function(d, i){ return rScale(cfg.maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
            .attr("y", function(d, i){ return rScale(cfg.maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
            .text(function(d){return d})
            .call(wrap, cfg.wrapWidth);

        //The radial line function
        const radarLine = d3.radialLine()
            .curve(d3.curveLinearClosed)
            .radius(d => rScale(d.percent))
            .angle((d,i) => i * angleSlice);

        if(cfg.roundStrokes) {
            radarLine.curve(d3.curveCardinalClosed)
        }

        // var test = [0,1,2,3];

        //Create a wrapper for the blobs
        var blobWrapper = g.selectAll(".radarWrapper")
            .data(vis.displayData)
            .enter().append("g")
            .attr("class", "radarWrapper");

        //Append the backgrounds
        var blobAreas = blobWrapper
            .append("path")
            .merge(blobWrapper)
            .attr("class", "radarArea")
            .attr("id", function(d,i){
                return "blob" + i;
            })
            .attr("d", function(d,i) { return radarLine(d); })
            .style("fill", (d,i) => cfg.color(i))
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', function(d, i) {
                //Dim all blobs
                vis.svg.selectAll(".radarArea")
                    // .transition().duration(200)
                    .style("fill-opacity", 0.05);

                vis.svg.selectAll(".radarStroke")
                    .style("stroke-opacity",0.1)

                // console.log(platforms.indexOf(i[0].platform))

                const idx = platforms.indexOf(i[0].platform)

                vis.svg.select("#stroke" + idx)
                    .style("stroke-opacity", 1)

                vis.svg.select("#label"+idx)
                    .attr("fill",vis.color(idx))
                    .attr("fill-opacity", 0.5)

                // vis.svg.select("#label"+i)
                //     .style("fill", cfg.color(i))

                //Bring back the hovered over blob
                d3.select(this)
                    // .transition().duration(200)
                    .style("fill-opacity", 1);


            })
            .on('mouseout', (d,i) => {
                //Bring back all blobs
                vis.svg.selectAll(".radarArea")
                    // .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);

                vis.svg.selectAll(".radarStroke")
                    .style("stroke-opacity",1)

                const idx = platforms.indexOf(i[0].platform)

                vis.svg.select("#label"+idx)
                    .attr("fill",vis.color(idx))
                    .attr("fill-opacity", 0.1)
            });

        //Create the outlines
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("id", function(d,i){
                return "stroke" + i;
            })
            .attr("d", function(d,i) { return radarLine(d); })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", (d,i) => cfg.color(i))
            .style("fill", "none")
            .style("filter" , "url(#glow)");

        // add hover buttons
        vis.labels = vis.svg.append("g")
            .attr("class", "platform-labels")

        vis.labelButtons = vis.labels.selectAll(".platform-labels-rect")
            .data(platforms)
            .enter();

        vis.labels.selectAll(".platforms-labels-text")
            .data(platforms)
            .enter()
            .append("text")
            .attr("class", "platform-labels-text")
            .attr("x", function(d,i){
                return (vis.width)/4*i+60
            })
            .attr("y", -25)
            .text(function(d,i){return d})
            .attr("fill", "black")
            .attr("dominant-baseline","middle")
            .attr("text-anchor","middle");

        vis.labelButtons
            .append("rect")
            .attr("class", "platform-labels-rect")
            .attr("width", 120)
            .attr("height", 50)
            .attr("stroke-width", 2)
            .attr("stroke", function(d,i){
                return vis.color(i)
            })
            .attr("fill",function(d,i){
                return vis.color(i)
            })
            .attr("fill-opacity", 0.1)
            .attr("x", function(d,i){
                return (vis.width)/4*i
            })
            .attr("y", -50)
            .attr("rx", 5)
            .attr("id", function(d,i){
                return "label" + i
            })
            .on("mouseover", function(d,i){

                //Dim all blobs
                vis.svg.selectAll(".radarArea")
                    // .transition().duration(200)
                    .style("fill-opacity", 0.05);

                vis.svg.selectAll(".radarStroke")
                    .style("stroke-opacity",0.2)

                d3.select(this).attr("fill-opacity",0.5)

                const idx = platforms.indexOf(i)
                // // highlight blob

                vis.svg.select("#stroke" + idx)
                    .style("stroke-opacity", 1)

                vis.svg.selectAll("#blob" + idx)
                    .style("fill-opacity", 1);
            })
            .on("mouseout", function(d,i){

                //Dim all blobs
                vis.svg.selectAll(".radarArea")
                    // .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);

                vis.svg.selectAll(".radarStroke")
                    .style("stroke-opacity",1)

                d3.select(this).attr("fill-opacity",0.1)
            })
            .on('click', function(data,i){
                // vis.filtering = (vis.filtering) ? "" : i;
                // vis.filterData();
                // blobWrapper.exit().remove();
        });

        // Text indicating at what % each level is
        g.append("g").selectAll(".axisLabel")
            .data(d3.range(1,(cfg.levels+1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function(d){return -d*radius/cfg.levels;})
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text(function(d,i) { return Format(cfg.maxValue * d/cfg.levels); });


        // // Append the circles
        // blobWrapper.selectAll(".radarCircle")
        //     .data(vis.arrayGenre[0])
        //     .enter()
        //     .append("circle")
        //     .attr("class", "radarCircle")
        //     .attr("r", cfg.dotRadius)
        //     .attr("cx", (d,i) => rScale(d.percent) * Math.cos(angleSlice * i - Math.PI / 2))
        //     .attr("cy", (d,i) => rScale(d.percent) * Math.sin(angleSlice * i - Math.PI / 2))
        //     .style("fill", (d) => cfg.color(d.id))
        //     .style("fill-opacity", 0);

    }
}