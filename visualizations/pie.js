// ------------------ PIE CHARTS --------------------------

// ---------- DATA ----------
//var dataset = [["A", 15], ["B", 12], ["C", 20], ["D", 7], ["E", 16], ["F", 25], ["G", 9]];
// var dataset = [["A", 7], ["B", 22], ["C", 17], ["D", 25], ["E", 5], ["F", 10], ["G", 18]];
var dataset = [["A", 15], ["B", 10], ["C", 20], ["D", 16], ["E", 25], ["F", 22], ["G", 18]];

var labels = dataset.map(d => d[0]);
var values = dataset.map(d => d[1]);

var maxValue = d3.max(values);
var maxIndex = values.indexOf(maxValue);

var minValue = d3.min(values);
var minIndex = values.indexOf(minValue);

var w = 600, h = 400;
var margin = { top: 20, right: 20, bottom: 20, left: 20 };
var innerW = w - margin.left - margin.right;
var innerH = h - margin.top - margin.bottom;
var radius = Math.min(innerW, innerH) / 2;

var strokeW = 1;

var colorScaleByValue = d3.scaleSequential(
  t => d3.interpolateOranges(0.35 + t * 0.65)
).domain([0, maxValue]);

var colorScaleByIndex = d3.scaleSequential(
  t => d3.interpolateOranges(0.45 + t * 0.55)
).domain([0, dataset.length - 1]);

var pie = d3.pie()
  .sort(null) // keep input order
  .value(d => d[1]);

var arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius);

var labelArc = d3.arc()
  .innerRadius(radius * 1.08)
  .outerRadius(radius * 1.08);

function drawPie(opts) {
  var svg = d3.select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("display", "block")
    .style("margin-bottom", "18px");

  var g = svg.append("g")
    .attr("transform",
      "translate(" + (margin.left + innerW / 2) + "," + (margin.top + innerH / 2) + ")"
    );

  var pieData = pie(dataset);

  // slices
  g.selectAll("path")
    .data(pieData)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", function(d, i) {
      if (opts.colorMode === "value") return colorScaleByValue(d.data[1]);
      if (opts.colorMode === "index") return colorScaleByIndex(i);
      return "white";
    })
    .attr("stroke", "black")
    .attr("stroke-width", strokeW);

    // letter labels (A, B, C...) outside slices
    g.selectAll(".slice-label")
        .data(pieData)
        .enter()
        .append("text")
        .attr("class", "slice-label")
        .text(d => d.data[0])
        .attr("x", d => labelArc.centroid(d)[0])
        .attr("y", d => labelArc.centroid(d)[1] + 4)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        .attr("paint-order", "stroke");

  // symbol with outline
  function placeSymbol(sliceIndex, char, fillColor) {
    var c = arc.centroid(pieData[sliceIndex]);
    g.append("text")
      .text(char)
      .attr("x", c[0])
      .attr("y", c[1] + 6)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("fill", fillColor)
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("stroke-linejoin", "round")
      .attr("paint-order", "stroke");
  }

  // ★ on max slice, ● on min slice (guaranteed different since values are unique)
  placeSymbol(maxIndex, "★", opts.symbolFill || "white");
  placeSymbol(minIndex, "●", opts.symbolFill || "white");
}

// 3 pie charts
drawPie({ colorMode: "value", symbolFill: "white", labelFill: "black" });
drawPie({ colorMode: "none",  symbolFill: "black", labelFill: "black" });
drawPie({ colorMode: "index", symbolFill: "white", labelFill: "black" });