/* -------------------- DATA (unique values) --------------------
var dataset = [];
var used = new Set();

while (dataset.length < 6) {
  var v = Math.floor(Math.random() * 10) + 1; // 1..18
  if (!used.has(v)) {
    used.add(v);
    dataset.push(v);
  }
}*/

var dataset=[5, 8, 10, 7, 2, 4];

// -------------------- DIMENSIONS --------------------
var w = 500, h = 300;
var margin = { top: 20, right: 20, bottom: 20, left: 20 };
var innerW = w - margin.left - margin.right;
var innerH = h - margin.top - margin.bottom;

var radius = Math.min(innerW, innerH) / 2;
var strokeW = 1;

// -------------------- INDICES FOR SYMBOLS --------------------
var maxValue = d3.max(dataset);
var maxIndex = dataset.indexOf(maxValue);

// choose a random slice that is NOT the max slice
var randomIndex;
do {
  randomIndex = Math.floor(Math.random() * dataset.length);
} while (randomIndex === maxIndex);

// -------------------- COLOR SCALES --------------------
// Chart 1 color (by value)
var colorScaleByValue = d3.scaleSequential(d3.interpolateOranges)
  .domain([0, maxValue]);

// Chart 3 color (by position: around the pie, by index)
var colorScaleByIndex = d3.scaleSequential(d3.interpolateOranges)
  .domain([0, dataset.length - 1]);

// -------------------- PIE + ARC GENERATORS --------------------
var pie = d3.pie()
  .sort(null)            // keep input order
  .value(function(d){ return d; });

var arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

var arcCentroid = function(d){ return arc.centroid(d); };

// -------------------- DRAW PIE FUNCTION --------------------
function drawPie(opts) {
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("display", "block")
    .style("margin-bottom", "18px");

  var g = svg.append("g")
    .attr("transform",
      "translate(" + (margin.left + innerW/2) + "," + (margin.top + innerH/2) + ")"
    );

  var pieData = pie(dataset);

  // slices
  g.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", function(d, i) {
      if (opts.colorMode === "value") return colorScaleByValue(d.data); // chart 1
      if (opts.colorMode === "index") return colorScaleByIndex(i);     // chart 3 (by slice position)
      return "white";                                                  // chart 2
    })
    .attr("stroke", "black")
    .attr("stroke-width", strokeW);

  // symbols placed INSIDE their slices (near centroid)
  function placeSymbol(sliceIndex, symbolChar, fillColor) {
    var c = arcCentroid(pieData[sliceIndex]); // [x, y] inside slice
    g.append("text")
      .text(symbolChar)
      .attr("x", c[0])
      .attr("y", c[1] + 6) // nudge for font baseline
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("fill", fillColor)
      .attr("stroke", "black")       // outline color
      .attr("stroke-width", 1.5)     // outline thickness
      .attr("paint-order", "stroke"); // draw stroke behind fill
  }

  // ★ on largest slice, ● on random slice
  placeSymbol(maxIndex, "★", opts.symbolFill || "white");
  placeSymbol(randomIndex, "●", opts.symbolFill || "white");
}

// -------------------- DRAW 3 PIE CHARTS --------------------
// 1) Gradient by VALUE
drawPie({ colorMode: "value", symbolFill: "white" });

// 2) No color (white fill)
drawPie({ colorMode: "none",  symbolFill: "black" });

// 3) Gradient by POSITION (index around the pie), not numeric value
drawPie({ colorMode: "index", symbolFill: "white" });