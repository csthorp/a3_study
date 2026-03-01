// Data is now [label, value]
// var dataset = [["A", 15], ["B", 12], ["C", 20], ["D", 7], ["E", 16], ["F", 25], ["G", 9]];
// var dataset = [["A", 7], ["B", 22], ["C", 17], ["D", 25], ["E", 5], ["F", 10], ["G", 18]];
var dataset = [["A", 15], ["B", 10], ["C", 20], ["D", 16], ["E", 25], ["F", 22], ["G", 18]];


// -------------------- DIMENSIONS --------------------
var w = 600, h = 400;
var margin = { top: 20, right: 20, bottom: 45, left: 55 }; // more room for axes/labels
var innerW = w - margin.left - margin.right;
var innerH = h - margin.top - margin.bottom;

// bar spacing
var strokeW = 1;
var gap = 10; // bigger gap so bars are clearly spaced

// -------------------- HELPERS: pull labels/values --------------------
var labels = dataset.map(d => d[0]);
var values = dataset.map(d => d[1]);

// max/min indices (by VALUE)
var maxValue = d3.max(values);
var maxIndex = values.indexOf(maxValue);

var minValue = d3.min(values);
var minIndex = values.indexOf(minValue);

// -------------------- SCALES --------------------
// x: band scale for spacing + A/B/C labels
var xScale = d3.scaleBand()
  .domain(labels)
  .range([0, innerW])
  .paddingInner(0.2)   // space between bars
  .paddingOuter(0.15); // space on chart edges

// y: IMPORTANT — domain goes 10 above max
var yScale = d3.scaleLinear()
  .domain([0, maxValue + 10])
  .range([innerH, 0]);  // standard y (top=0)

// color scales
var colorScaleByValue = d3.scaleSequential(
  t => d3.interpolateOranges(0.35 + t * 0.65)
).domain([0, maxValue]);

var colorScaleByIndex = d3.scaleSequential(
  t => d3.interpolateOranges(0.45 + t * 0.55)
).domain([0, dataset.length - 1]);

// -------------------- SYMBOL HELPERS --------------------
function barCenterX(i) {
  return xScale(labels[i]) + xScale.bandwidth() / 2;
}
function barTopY(i) {
  return yScale(values[i]);
}
function symbolInsideY(i) {
  // inside the top of the bar; clamp so it stays inside very short bars
  var inside = barTopY(i) + 16;
  var bottom = yScale(0) - 4;
  return Math.min(inside, bottom);
}

// -------------------- DRAW FUNCTION --------------------
function drawChart(opts) {
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("display", "block")
    .style("margin-bottom", "18px");

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // -------------------- AXES (with padding + x labels) --------------------
  var xAxis = d3.axisBottom(xScale).tickSize(0); // keep labels only
  var yAxis = d3.axisLeft(yScale)
                .tickValues([maxValue + 10]); // only show the top value

  g.append("g")
    .attr("transform", "translate(0," + innerH + ")")
    .call(xAxis)
    .call(g => g.select(".domain").attr("stroke", "black"))
    .call(g => g.selectAll("text").attr("dy", "1.2em"));

  g.append("g")
    .call(yAxis)
    .call(g => g.select(".domain").attr("stroke", "black"));

  // -------------------- BARS --------------------
  g.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function(d) { return xScale(d[0]); })
    .attr("y", function(d) { return yScale(d[1]); })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) { return innerH - yScale(d[1]); })
    .attr("fill", function(d, i) {
      if (opts.colorMode === "value") return colorScaleByValue(d[1]); // by numeric value
      if (opts.colorMode === "index") return colorScaleByIndex(i);    // left->right
      return "white";                                                 // no color
    })
    .attr("stroke", "black")
    .attr("stroke-width", strokeW)
    .attr("shape-rendering", "crispEdges");

  // -------------------- SYMBOLS (★ max, ● min) --------------------
  function addOutlinedSymbol(char, idx, fill) {
    g.append("text")
      .text(char)
      .attr("x", barCenterX(idx))
      .attr("y", symbolInsideY(idx))
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("fill", fill)
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("paint-order", "stroke");
  }

  addOutlinedSymbol("★", maxIndex, opts.symbolFill || "white");
  addOutlinedSymbol("●", minIndex, opts.symbolFill || "white");
}

// -------------------- DRAW 3 CHARTS --------------------
drawChart({ colorMode: "value", symbolFill: "white" }); // gradient by value
drawChart({ colorMode: "none",  symbolFill: "black" }); // no color
drawChart({ colorMode: "index", symbolFill: "white" }); // gradient left->right