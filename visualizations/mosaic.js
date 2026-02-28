document.addEventListener("DOMContentLoaded", function () {


/* -------------------- DATA (unique values) --------------------
var dataset = [];
var used = new Set();

while (dataset.length < 7) {
  var v = Math.floor(Math.random() * 18) + 1; // 1..18
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

var strokeW = 1;

// -------------------- INDICES FOR SYMBOLS --------------------
var maxValue = d3.max(dataset);
var maxIndex = dataset.indexOf(maxValue);

// random index MUST differ from maxIndex
var randomIndex;
do {
  randomIndex = Math.floor(Math.random() * dataset.length);
} while (randomIndex === maxIndex);

// -------------------- COLOR SCALES --------------------
var colorScaleByValue = d3.scaleSequential(d3.interpolateOranges)
  .domain([0, maxValue]);

var colorScaleByIndex = d3.scaleSequential(d3.interpolateOranges)
  .domain([0, dataset.length - 1]);

// -------------------- MOSAIC DATA STRUCTURE --------------------
var children = dataset.map(function(v, i) {
  return { value: v, index: i };
});

// -------------------- TREEMAP LAYOUT --------------------
var treemap = d3.treemap()
  .size([innerW, innerH])
  .paddingInner(3);

// -------------------- DRAW MOSAIC FUNCTION --------------------
function drawMosaic(opts) {
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("display", "block")
    .style("margin-bottom", "18px");

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // hierarchy + layout
  var root = d3.hierarchy({ children: children })
    .sum(function(d) { return d.value; })

  treemap(root);

  var leaves = root.leaves();

  // tiles
  g.selectAll("rect")
    .data(leaves)
    .enter()
    .append("rect")
    .attr("x", function(d) { return d.x0; })
    .attr("y", function(d) { return d.y0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .attr("height", function(d) { return d.y1 - d.y0; })
    .attr("fill", function(d) {
      if (opts.colorMode === "value") return colorScaleByValue(d.data.value);
      if (opts.colorMode === "index") return colorScaleByIndex(d.data.index);
      return "white"; // no color
    })
    .attr("stroke", "black")
    .attr("stroke-width", strokeW)
    .attr("shape-rendering", "crispEdges");

  // center of a tile
  function center(d) {
    return [(d.x0 + d.x1) / 2, (d.y0 + d.y1) / 2];
  }

  // symbol with black outline
  function placeSymbol(tile, char, fillColor) {
    var c = center(tile);
    g.append("text")
      .text(char)
      .attr("x", c[0])
      .attr("y", c[1] + 6) // baseline nudge
      .attr("text-anchor", "middle")
      .attr("font-size", "22px")
      .attr("fill", fillColor)
      .attr("stroke", "black")          // outline
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("paint-order", "stroke");   // stroke behind fill
  }

  // select tiles for max + random (different)
  var maxTile = leaves.find(function(d) { return d.data.index === maxIndex; });
  var rndTile = leaves.find(function(d) { return d.data.index === randomIndex; });

  placeSymbol(maxTile, "★", opts.symbolFill || "white");
  placeSymbol(rndTile, "●", opts.symbolFill || "white");
}

// -------------------- DRAW 3 MOSAIC CHARTS --------------------
// 1) Gradient by VALUE
drawMosaic({ colorMode: "value", symbolFill: "white" });

// 2) No color
drawMosaic({ colorMode: "none",  symbolFill: "black" });

// 3) Gradient by POSITION (index)
drawMosaic({ colorMode: "index", symbolFill: "white" });

});