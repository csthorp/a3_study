// ---------- DATA ----------
// var dataset = [["A", 15], ["B", 12], ["C", 20], ["D", 7], ["E", 16], ["F", 25], ["G", 9]];
// var dataset = [["A", 7], ["B", 22], ["C", 17], ["D", 25], ["E", 5], ["F", 10], ["G", 18]];
var dataset = [["A", 15], ["B", 10], ["C", 20], ["D", 16], ["E", 25], ["F", 22], ["G", 18]];

var labels = dataset.map(d => d[0]);
var values = dataset.map(d => d[1]);

var maxValue = d3.max(values);
var maxIndex = values.indexOf(maxValue);

var minValue = d3.min(values);
var minIndex = values.indexOf(minValue);

// ---------- DIMENSIONS ----------
var w = 600, h = 400;

// Big margins so outside labels/ticks aren't clipped
var margin = { top: 60, right: 110, bottom: 70, left: 110 };
var innerW = w - margin.left - margin.right;
var innerH = h - margin.top - margin.bottom;

var strokeW = 1;

// ---------- COLOR SCALES ----------
var colorScaleByValue = d3.scaleSequential(
  t => d3.interpolateOranges(0.35 + t * 0.65)
).domain([0, maxValue]);

var colorScaleByIndex = d3.scaleSequential(
  t => d3.interpolateOranges(0.45 + t * 0.55)
).domain([0, dataset.length - 1]);

// ---------- TREEMAP DATA ----------
var children = dataset.map((d, i) => ({
  label: d[0],
  value: d[1],
  index: i
}));

// ---------- TREEMAP LAYOUT ----------
var treemap = d3.treemap()
  .size([innerW, innerH])
  .paddingInner(3);

// ---------- HELPERS ----------
function center(d) {
  return [(d.x0 + d.x1) / 2, (d.y0 + d.y1) / 2];
}

// outside labels: short tick on nearest outer edge + label outside (no long lines)
function addOutsideLabelsNoLeaderLines(g, leaves, innerW, innerH) {
  var tickLen = 10;
  var textPad = 6;

  function center(d) {
    return [(d.x0 + d.x1) / 2, (d.y0 + d.y1) / 2];
  }

  leaves.forEach(function (d) {
    var c = center(d);
    var cx = c[0], cy = c[1];

    // choose NEAREST outer edge
    var distLeft = cx;
    var distRight = innerW - cx;
    var distTop = cy;
    var distBottom = innerH - cy;

    var edge = "left";
    var best = distLeft;
    if (distRight < best) { best = distRight; edge = "right"; }
    if (distTop < best)   { best = distTop;   edge = "top"; }
    if (distBottom < best){ best = distBottom;edge = "bottom"; }

    if (edge === "left") {
      g.append("line")
        .attr("x1", 0).attr("y1", cy)
        .attr("x2", -tickLen).attr("y2", cy)
        .attr("stroke", "black");

      g.append("text")
        .text(d.data.label)
        .attr("x", -tickLen - textPad)
        .attr("y", cy + 4)
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "black");
    }

    if (edge === "right") {
      g.append("line")
        .attr("x1", innerW).attr("y1", cy)
        .attr("x2", innerW + tickLen).attr("y2", cy)
        .attr("stroke", "black");

      g.append("text")
        .text(d.data.label)
        .attr("x", innerW + tickLen + textPad)
        .attr("y", cy + 4)
        .attr("text-anchor", "start")
        .attr("font-size", "14px")
        .attr("fill", "black");
    }

    if (edge === "top") {
      g.append("line")
        .attr("x1", cx).attr("y1", 0)
        .attr("x2", cx).attr("y2", -tickLen)
        .attr("stroke", "black");

      g.append("text")
        .text(d.data.label)
        .attr("x", cx)
        .attr("y", -tickLen - textPad)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "black");
    }

    if (edge === "bottom") {
      g.append("line")
        .attr("x1", cx).attr("y1", innerH)
        .attr("x2", cx).attr("y2", innerH + tickLen)
        .attr("stroke", "black");

      g.append("text")
        .text(d.data.label)
        .attr("x", cx)
        .attr("y", innerH + tickLen + 14)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "black");
    }
  });
}

// outlined symbol in tile center
function placeSymbol(g, tile, char, fillColor) {
  var c = center(tile);
  g.append("text")
    .text(char)
    .attr("x", c[0])
    .attr("y", c[1] + 6)
    .attr("text-anchor", "middle")
    .attr("font-size", "22px")
    .attr("fill", fillColor)
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("paint-order", "stroke");
}

// ---------- DRAW MOSAIC ----------
function drawMosaic(opts) {
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("display", "block")
    .style("margin-bottom", "18px");

  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // layout
  var root = d3.hierarchy({ children: children })
    .sum(d => d.value)
    .sort((a, b) => (a.data.index ?? -1) - (b.data.index ?? -1)); // keep A..F order

  treemap(root);
  var leaves = root.leaves();

  // tiles
  g.selectAll("rect")
    .data(leaves)
    .enter()
    .append("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", function(d) {
      if (opts.colorMode === "value") return colorScaleByValue(d.data.value);
      if (opts.colorMode === "index") return colorScaleByIndex(d.data.index);
      return "white";
    })
    .attr("stroke", "black")
    .attr("stroke-width", strokeW)
    .attr("shape-rendering", "crispEdges");

  // symbols: ★ max, ● min
  var maxTile = leaves.find(d => d.data.index === maxIndex);
  var minTile = leaves.find(d => d.data.index === minIndex);

  placeSymbol(g, maxTile, "★", opts.symbolFill || "white");
  placeSymbol(g, minTile, "●", opts.symbolFill || "white");

  // outside labels with short ticks (no leader lines)
  addOutsideLabelsNoLeaderLines(g, leaves, innerW, innerH);
}

// ---------- DRAW 3 MOSAICS ----------
drawMosaic({ colorMode: "value", symbolFill: "white" });
drawMosaic({ colorMode: "none",  symbolFill: "black" });
drawMosaic({ colorMode: "index", symbolFill: "white" });