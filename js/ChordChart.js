/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class ChordChart {

    constructor(parentElement, movieData) {
        this.parentElement = parentElement;
        this.movieData = movieData;
        this.displayData = [];
        this.matrix = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];


        this.initVis()
    }

    initVis() {
        let vis = this;

        console.log(vis.movieData);

        vis.margin = {top: 250, right: 20, bottom: 20, left: 250};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);



        let chord = d3.chord();

        vis.colors = [ "#E50914", "#3DBB3D", "#00A8E1", "#000000"]

        // var matrix = [
        //     [11975,  5871, 8916, 2868],
        //     [ 1951, 10048, 2060, 6171],
        //     [ 8010, 16145, 8090, 8045],
        //     [ 1013,   990,  940, 6907]
        // ];

        // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
        // var res = d3.chord()
        //     .padAngle(0.05)     // padding between entities (black arc)
        //     .sortSubgroups(d3.descending)
        //     (vis.matrix)
        //
        // // add the groups on the inner part of the circle
        // vis.svg
        //     .datum(res)
        //     .append("g")
        //     .selectAll("g")
        //     .data(function(d) { return d.groups; })
        //     .enter()
        //     .append("g")
        //     .append("path")
        //     .style("fill", "grey")
        //     .style("stroke", "black")
        //     .attr("d", d3.arc()
        //         .innerRadius(200)
        //         .outerRadius(210)
        //     )
        //
        // // Add the links between groups
        // vis.svg
        //     .datum(res)
        //     .append("g")
        //     .selectAll("path")
        //     .data(function(d) { return d; })
        //     .enter()
        //     .append("path")
        //     .attr("d", d3.ribbon()
        //         .radius(200)
        //     )
        //     .style("fill", "#69b3a2")
        //     .style("stroke", "black");






        this.wrangleData();
    }

    wrangleData() {
        let vis = this

        // Netflix row
        // vis.matrix[0][0] = vis.movieData.filter(item => {
        //     return item.Netflix === '1' && item.Hulu === '0'
        //         && item['Prime Video'] === '0'
        //         && item['Disney+'] === '0' ;
        // }).length

        vis.matrix[0][1] = vis.movieData.filter(item => {
            return item.Netflix === '1' && item.Hulu === '1';
        }).length

        vis.matrix[0][2] = vis.movieData.filter(item => {
            return item.Netflix === '1' && item['Prime Video'] === '1';
        }).length

        vis.matrix[0][3] = vis.movieData.filter(item => {
            return item.Netflix === '1' && item['Disney+'] === '1';
        }).length

        // Hulu row
        // vis.matrix[1][1] = vis.movieData.filter(item => {
        //     return item.Netflix === '0' && item.Hulu === '1'
        //         && item['Prime Video'] === '0'
        //         && item['Disney+'] === '0' ;
        // }).length

        vis.matrix[1][0] = vis.movieData.filter(item => {
            return item.Hulu === '1' && item.Netflix === '1';
        }).length

        vis.matrix[1][2] = vis.movieData.filter(item => {
            return item.Hulu === '1' && item['Prime Video'] === '1';
        }).length

        vis.matrix[1][3] = vis.movieData.filter(item => {
            return item.Hulu === '1' && item['Disney+'] === '1';
        }).length

        // Prime Video row
        // vis.matrix[2][2] = vis.movieData.filter(item => {
        //     return item.Netflix === '0' && item.Hulu === '0'
        //         && item['Prime Video'] === '1'
        //         && item['Disney+'] === '0' ;
        // }).length

        vis.matrix[2][0] = vis.movieData.filter(item => {
            return item['Prime Video'] === '1' && item.Netflix === '1';
        }).length

        vis.matrix[2][1] = vis.movieData.filter(item => {
            return item['Prime Video'] === '1' && item['Hulu'] === '1';
        }).length

        vis.matrix[2][3] = vis.movieData.filter(item => {
            return item['Prime Video'] === '1' && item['Disney+'] === '1';
        }).length

        // Disney+ row
        // vis.matrix[3][3] = vis.movieData.filter(item => {
        //     return item.Netflix === '0' && item.Hulu === '0'
        //         && item['Prime Video'] === '0'
        //         && item['Disney+'] === '1' ;
        // }).length

        vis.matrix[3][0] = vis.movieData.filter(item => {
            return item['Disney+'] === '1' && item.Netflix === '1';
        }).length

        vis.matrix[3][1] = vis.movieData.filter(item => {
            return item['Disney+'] === '1' && item['Hulu'] === '1';
        }).length

        vis.matrix[3][2] = vis.movieData.filter(item => {
            return item['Disney+'] === '1' && item['Prime Video'] === '1';
        }).length


        console.log(vis.matrix);


        vis.updateVis()

    }

    updateVis() {
        let vis = this;

        var res = d3.chord()
            .padAngle(0.05)     // padding between entities (black arc)
            .sortSubgroups(d3.descending)
            (vis.matrix)

        // add the groups on the inner part of the circle
        vis.svg
            .datum(res)
            .append("g")
            .selectAll("g")
            .data(function(d) { return d.groups; })
            .enter()
            .append("g")
            .append("path")
            .style("fill", function(d,i){ return vis.colors[i] })
            .style("stroke", "black")
            .attr("d", d3.arc()
                .innerRadius(200)
                .outerRadius(210)
            )

        // Add the links between groups
        vis.svg
            .datum(res)
            .append("g")
            .selectAll("path")
            .data(function(d) { return d; })
            .enter()
            .append("path")
            .attr("d", d3.ribbon()
                .radius(200)
            )
            .style("fill", "#69b3a2")
            .style("stroke", "black")
            .style('opacity', .7);

    }


}