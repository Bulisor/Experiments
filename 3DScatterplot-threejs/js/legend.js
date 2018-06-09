

// ########### Legend JS ############

// each time you change dat.gui, 
// the legend is deleted, and is 
// created a new one based on params parsed
function drawLegend(params) {
  var defaults = {
    sentimentLegend: false,
    sizeLegend: false,
    tweetsDomain: [24, 255],
    sentimetHeight:45,
    sizeHeight: 40,
  };
  var params = Object.assign({}, defaults, params);

  var svg = d3.select('svg');
  svg.selectAll("*").remove();
  
  var height = 0;

  // show sentiment Legend
  if (params.sentimentLegend) {
    height += params.sentimetHeight;

    var ordinal = d3.scaleOrdinal()
      .domain(
        Object.keys(config.sentimentColors)
        .map(function (s) { return capitalize(s) })
      )
      .range(Object.values(config.sentimentColors));

    var svg = d3.select("svg");

    svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(30,35)");

    var legendOrdinal = d3.legendColor()
      // .title('Sentiment')
	  .scale(ordinal)
      .shape("path", d3.symbol().type(d3.symbolCircle).size(200)())
      .shapePadding(50)
	  .labelOffset(20)
      .orient("horizontal");
    svg.select(".legendOrdinal")
      .call(legendOrdinal);
  }

  // show size Legend
  if (params.sizeLegend) {
    height += params.sizeHeight; //+ 20;

    var linearSize = d3.scaleLinear()
      .domain(params.tweetsDomain)
      .range(config.bounds.radius2);

    svg.append("g")
      .attr("class", "legendSize")
      .attr("transform", "translate( 240 , 20 )");

    var legendSize = d3.legendSize()
      // .title('No of Tweets')
      .scale(linearSize)
      .labelFormat('.2s')
      .shape('circle')
      .shapePadding(15)
      .labelOffset(20)
      .orient('horizontal');

    svg.select(".legendSize")
      .call(legendSize);
  }
  
  // show shape Legend
  if (params.shapeLegend) {
    height += params.sizeHeight; //+ 20;
	
	var circle = d3.symbol().type(d3.symbolCircle).size(200)(),
	rect = d3.symbol().type(d3.symbolSquare).size(200)();
	
	var symbolScale =  d3.scaleOrdinal()
	  .domain([0,1])
	  .range([circle, rect]);

    svg.append("g")
      .attr("class", "legendSize")
      .attr("transform", "translate( 240 , 35 )");

    var legendSize = d3.legendSymbol()
      // .title('No of Tweets')
      .scale(symbolScale)
      .labelFormat('.2s')
      .labels(["Hilary","Trump"]) //to add dynamic
      .shapePadding(35)
      .labelOffset(20)
      .orient('horizontal');

    svg.select(".legendSize")
      .call(legendSize);
	
	if(params.diffColor)
	{
		var colorScale = d3.scaleOrdinal()
		  .domain([0,1])
		  .range(["red", "blue"])
		  
		svg.selectAll(".cell path").each(function(d) {
		  d3.select(this).style("fill", colorScale(d))
		})
	}
  }
  
  // show ordinal size Legend 
  if (params.ordinalSizeLegend) {
    height += params.sentimetHeight;

    var ordinal = d3.scaleLinear()
      .domain([0,1])
      .range(config.bounds.radius2);

    var svg = d3.select("svg");

    svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(30,30)");

    var legendOrdinal = d3.legendSize()
      // .title('Sentiment')
	  .scale(ordinal)
	  .labelFormat('.2s')
      .shape('circle')
	  .labels(Object.keys(config.sentimentColors).map(function (s) { return capitalize(s) }))
      .shapePadding(50)
	  .cellFilter(function(d){ return d.label !== "1.0" && d.label !== "750m" })
	  .labelOffset(20) 
      .orient("horizontal");
    svg.select(".legendOrdinal")
      .call(legendOrdinal);
  }

  svg
    .attr('width', 550)
    // .attr('height', 100)
    //.attr('height', height);
}
