// @TODO: YOUR CODE HERE!

// Define variables for size of the graph, margin sizes, and width and height
// Grab code from activities 16-D3

// Step 1: Set up our chart
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
console.log(margin.bottom)

// Step 2: Create an SVG wrapper
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//  Initial Params Healthcare vs. Poverty or Smokers vs. Age. Used 16-D3-Day 3 Activity 12
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(stateData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.95,
        d3.max(stateData, d => d[chosenXAxis]) * 1.05
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}

function yScale(stateData, chosenYAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.8,
        d3.max(stateData, d => d[chosenYAxis]) * 1
      ])
      .range([height, 0]);
  
    return xLinearScale;
  
}

function renderXAxis (newXScale, XAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    XAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return XAxis;
}

function renderYAxis (newYScale, YAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    YAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return YAxis;
}

// Initial Circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return textGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup) {

    if (chosenXAxis === "poverty") {
        var xlabel = "% of Poverty:";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Median Age:";
    }
    else {
        var xlabel = "Household Income";
    }
    if (chosenYAxis === "healthcare") {
        var ylabel = "% of the Lack of Healthcare";
    }
    else if (chosenYAxis === "obesity") {
        var ylabel= "$ of Obesity";
    }
    else {
        var ylabel = "% of Smokers";
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(data) {
        return(`<br>State Abbr: ${data.abbr}<br>`)
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

        return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(stateData, err) {
    console.log(stateData);

    if (err) throw err;

    stateData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.poverty = +data.poverty;
    });

    // xLinearScale function aboce csv import
    // Create y scale function

    var xLinearScale = xScale(stateData, chosenXAxis);
    var yLinearScale = yScale(stateData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    console.log(height)
    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);
    
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(stateData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 20)
        .attr("fill", "teal")
        .attr("opacity", ".5");

    var textGroup = chartGroup.selectAll("text.abbr")
        .data(stateData)
        .enter()
        .append("text")
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("font-sized", "15px")
        .attr("class", "abbr")
        .text(d => d.abbr)
        .attr("text-anchor", "middle");

    // Create a group for two-axis labels
    var xLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    // Poverty Label
    var povertyLabel = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .classed("inactive", false)
        .classed("axis-text", true)
        .text("The Average % of Poverty");
    
    // income label
    var incomeLabel = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .classed("active", false)
        .classed("axis-text", true)
        .text("Amount of Income");

    // age label
    var ageLabel = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .classed("active", false)
        .classed("axis-text", true)
        .text("Median Age");

    // Y Labels
    var yLabelGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))

    // healthcare label
    var heathLabel = yLabelGroup.append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", 40 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("active", true)
        .classed("inactive", false)
        .classed("axis-text", true)
        .text("Avg. % of Healthcare");

    // obesity label
    var obesityLabel = yLabelGroup.append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", 20 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("active", false)
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Avg. % of Obesity");

    // smoke label
    var smokeLabel = yLabelGroup.append("text")
        // .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("active", false)
        .classed("inactive", true)
        .classed("axis-text", true)
        .text("Avg. % of Smokers");

    // var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

    xLabelGroup.selectAll("text.axis-text")
        .on("click", function(){

            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis){
                chosenXAxis = value;
                xLinearScale = xScale(stateData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                // conditionals 
                if (chosenXAxis === "poverty"){
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
    yLabelGroup.selectAll("text.axis-text")
        .on("click", function(){

            var value = d3.select(this).attr("value");

            if (value !== chosenYAxis) {
                chosenYAxis = value;

                yLinearScale = yScale(stateData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);

                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, textGroup);

                if (chosenYAxis === "healthcare") {
                    heathLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else if (chosenYAxis === "obesity"){
                    heathLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false)
                    smokeLabel
                        .classed("active", false)
                        .classed("inactive", true)
                }
                else {
                    heathLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    smokeLabel
                        .classed("active", true)
                        .classed("inactive", false)
                }
            }});
        });


