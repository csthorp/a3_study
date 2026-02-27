// -------------------- DATA (unique heights) --------------------
var dataset = [];
var used = new Set();

while (dataset.length < 7) {
  var v = Math.floor(Math.random() * 18) + 1; // 1..18
  if (!used.has(v)) {
    used.add(v);
    dataset.push(v);
  }
}

// -------------------- DIMENSIONS --------------------
var w = 500, h = 300;
var margin = { top: 20, right: 20, bottom: 30, left: 40 };
var innerW = w - margin.left - margin.right;
var innerH = h - margin.top - margin.bottom;

var strokeW = 1;
var gap = 3;
var slot = innerW / dataset.length;
var barW = slot - gap;

// -------------------- INDICES FOR SYMBOLS --------------------
var maxValue = d3.max(dataset);
var maxIndex = dataset.indexOf(maxValue);
var randomIndex = Math.floor(Math.random() * dataset.length);

// -------------------- SCALES --------------------
var yScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([0, innerH]);

// Chart 1 color (by value)
var colorScaleByValue = d3.scaleSequential(d3.interpolateOranges)
  .domain([0, maxValue]);

// Chart 3 color (by position: left->right)
var colorScaleByIndex = d3.scaleSequential(d3.interpolateOranges)
  .domain([0, dataset.length - 1]);

// -------------------- HELPERS --------------------
function barCenterX(i) {
  return i * slot + gap / 2 + barW / 2;
}
function barTopY(i) {
  return innerH - yScale(dataset[i]);
}
function symbolInsideY(i) {
  return barTopY(i) + 16; // inside bar near the top
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

  // bars
  g.selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("x", function(d, i) { return i * slot + gap / 2; })
    .attr("y", function(d) { return innerH - yScale(d); })
    .attr("width", barW)
    .attr("height", function(d) { return yScale(d); })
    .attr("fill", function(d, i) {
      if (opts.colorMode === "value") return colorScaleByValue(d);     // chart 1
      if (opts.colorMode === "index") return colorScaleByIndex(i);     // chart 3 (left->right)
      return "white";                                                  // chart 2
    })
    .attr("stroke", "black")
    .attr("stroke-width", strokeW)
    .attr("shape-rendering", "crispEdges");

  // symbols (same positions on all charts)
  g.append("text")
    .text("★")
    .attr("x", barCenterX(maxIndex))
    .attr("y", symbolInsideY(maxIndex))
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("fill", opts.symbolFill || "white");

  g.append("text")
    .text("●")
    .attr("x", barCenterX(randomIndex))
    .attr("y", symbolInsideY(randomIndex))
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("fill", opts.symbolFill || "white");

  // axis lines only (optional)
  if (opts.axes) {
    g.append("line") // y-axis
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", innerH)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    g.append("line") // x-axis
      .attr("x1", 0).attr("y1", innerH)
      .attr("x2", innerW).attr("y2", innerH)
      .attr("stroke", "black")
      .attr("stroke-width", 2);
  }
}

// -------------------- DRAW 3 CHARTS --------------------
// 1) Gradient by VALUE + axes
drawChart({ colorMode: "value", axes: false,  symbolFill: "white" });

// 2) No color + no axes
drawChart({ colorMode: "none",  axes: false, symbolFill: "black" });

// 3) Gradient LEFT->RIGHT (by index) + (choose axes true/false)
drawChart({ colorMode: "index", axes: false, symbolFill: "white" });