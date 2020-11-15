// Variable for the visualization instance
let myChordChart;


d3.csv("data/movies_on_streaming_platforms.csv").then(function(data) {
    gettingStarted(data);
});


// function that gets called once data has been fetched.
// We're handing over the fetched data to this function.
// From the data, we're creating the final data structure we need and create a new instance of the StationMap
function gettingStarted(data) {

    // log data


    // Instantiate visualization object (bike-sharing stations in Boston)
    myChordChart = new ChordChart("chord-vis", data);
}

// // Function to convert date objects to strings or reverse
// let dateFormatter = d3.timeFormat("%Y-%m-%d");
// let dateParser = d3.timeParse("%Y-%m-%d");

// // (1) Load data with promises
// let promises = [
//     d3.json("data/perDayData.json"),
//     d3.json("data/myWorldFields.json")
// ];

// Promise.all(promises)
//     .then(function (data) {
//         createVis(data)
//     })
//     .catch(function (err) {
//         console.log(err)
//     });

// function createVis(data) {
//     let perDayData = data[0]
//     let metaData = data[1]
//     // (2) Make our data look nicer and more useful
//     allData = perDayData.map(function (d) {

//         let result = {
//             time: dateParser(d.day),
//             count: +d["count(*)"] + 1
//         };

//         // Convert votes for the 15 priorities from key-value format into one single array (for each day)
//         result.priorities = d3.range(0, 15).map(function (counter) {
//             return d["sum(p" + counter + ")"]
//         });
//         // [d["sum(p0)"], d["sum(p1)"], d["sum(p2)"],...]
//         // Example: [10,200,500,... ]

//         // Create an array of values for age 0 - 99
//         result.ages = d3.range(0, 99).map(function () {
//             return 0;
//         });

//         // Insert the votes in the newly created array 'result.ages'
//         d.age.forEach(function (a) {
//             if (a.age < 100) {
//                 result.ages[a.age] = a["count(*)"];
//             }
//         })

//         return result;
//     });

//     // (3) Create event handler

//     let MyEventHandler = {};

//     // (4) Create visualization instances
//     let countVis = new CountVis("countvis", allData, MyEventHandler);

//     // *** TO-DO ***
//     let ageVis = new AgeVis("agevis", allData)

//     let prioVis = new PrioVis("priovis", allData, metaData)
//     // (5) Bind event handler

//     $(MyEventHandler).bind("selectionChanged", function(event, rangeStart, rangeEnd){
//         countVis.onSelectionChange(rangeStart, rangeEnd);
//         ageVis.onSelectionChange(rangeStart, rangeEnd);
//         prioVis.onSelectionChange(rangeStart, rangeEnd);
//     });

// }
