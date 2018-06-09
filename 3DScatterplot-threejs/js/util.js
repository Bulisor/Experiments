

// ################ Util JS ###################

//basic configurations
var config = {
  sentimentColors: {
    negative: '#FE7F0E',
    neutral: '#1F78B4',
    positive: '#2BA02D',
  },
  sentimentSize: { // add Marian - for scatterplot
    neutral: 15,
    negative: 35,
    positive: 50,
  },
  axisWidth: 750,
  backgroundColor: '#000',
  startPosition: new THREE.Vector3(0, 0, 1000),
  dafaultRadius: 35,
  defaultWidthDepth: 50 // add Marian - for barchart
};

config.bounds = {
  x: [-config.axisWidth / 2, config.axisWidth / 2],
  y: [-config.axisWidth / 2, config.axisWidth / 2],
  z: [-config.axisWidth / 2, config.axisWidth / 2],
  radius: [15, 50],
  radius2: [8, 20] // add Marian
};

config.graphDimensions = {
  w: config.axisWidth,
  d: config.axisWidth,
  h: config.axisWidth
};

// split data by sentiment
function getData(rawData) {
  var data = {
    all: rawData,
    positive: rawData.filter(function (d) { return d['Sentiment'] === 'Positive'}),
    negative: rawData.filter(function (d) { return d['Sentiment'] === 'Negative'}),
    neutral: rawData.filter(function (d) { return d['Sentiment'] === 'Neutral'}),
  };
  return data;
}

// scales for mapping numbers from data to positions in 3d space
function getScales(data) {
  var scales = {
    all: {},
    // positive: {},
    // negative: {},
    // neutral: {},
  };

  var monthNames = data.positive.map(function (d) { return d['Month'] });
  monthNames = [''].concat(monthNames.concat(['']));

  scales.all.monthsScale = d3.scaleOrdinal()
    .domain(monthNames)
    .range(divideInterval(config.bounds.x, monthNames.length));

  scales.all.retweetScale = d3.scaleLinear()
    .domain(d3.extent(data.all, function (d) { return +d['Retweet'] }))
    .range(config.bounds.y)
    .nice(10);

  scales.all.retweetScaleGroup = d3.scaleLinear()
    .domain(d3.extent(data.all, function (d) { return +d['Retweet'] }))
    .range(config.bounds.y)
    .nice(10);

  scales.all.favScale = d3.scaleLinear()
    .domain(d3.extent(data.all, function (d) { return +d['Fav'] }))
    .range(config.bounds.z.map(function (d) { return -d; }))
    .nice(10);

  scales.all.polarityScale = d3.scaleLinear()
    .domain([-1, 1])
    .range(config.bounds.x)
    .nice();

  scales.all.tweetsToRadii = d3.scaleLinear()
    .domain(d3.extent(data.all, function (d) { return +d['Tweets'] }))
    .range(config.bounds.radius);

  scales.all.tweetsToGrid = d3.scaleLinear()
    .domain(d3.extent(data.all, function (d) { return +d['Tweets'] }))
    .range(config.bounds.x)
    .nice();

  return scales;
}

// labels to display on axes
function getLabels(data, scales) {
  var labels = {};

  var monthNames = data.positive.map(function (d) { return d['Month'] });
  monthNames = [''].concat(monthNames.concat(['']));

  labels['Month'] = monthNames;

  labels['Tweets'] = scales.all.tweetsToGrid.ticks();
  labels['Tweets'][0] = '';

  labels['Retweet'] = scales.all.retweetScale.ticks()
    .map(function (d) { return Math.round(d / 1e3 - 100) + 'k'; });
  labels['Retweet'][0] = '';

  labels['Fav'] = scales.all.favScale.ticks()
    .map(function (d) { return (d / 1e6).toFixed(1) + 'M'; });
  labels['Fav'][0] = '';

  //labels['Sentiment'] = ['Negative', 'Neutral', 'Positive'];
  //add Marian
  labels['Sentiment'] = [' ', 'Negative', 'Neutral', 'Positive', ' '];
  labels['FavGroup'] = [' ', '0.01M-1.0M', '1.01M-2.0M', '2.01M-3.0M', '3.01M-4.0M', '4.01M-5.0M'];
  labels['RetweetGroup'] = [' ', '0.1K-300K', '300.1K-600K', '600.1K-900K', '900.1K-1200K', '1200.1K-1500K'];
  labels['TweetsGroup'] = [' ', '0-60', '61-120', '121-180', '181-240', '241-300'];

  labels['Polarity'] = scales.all.polarityScale.ticks(7)
    .map(function (d) { return d.toFixed(1); });

  return labels;
}


function reverse(arr) {
  var res = [];
  for (var i = arr.length-1; i >= 0; i--) {
    res.push(arr[i]);
  }
  return res;
}


function divideInterval(interval, numberOfPoints) {
  if (interval[1] < interval[0]) return [];

  var intervalLength = interval[1] - interval[0];
  return d3.range(numberOfPoints).map(function (i) {
    return interval[0] + i * intervalLength / (numberOfPoints - 1);
  });
}


function capitalize(string) {
  var letters = string.split('');
  letters[0] = letters[0].toUpperCase();
  return letters.join('');
}

//add Marian
// return object's position based on input data
// grouped - only for bar charts
// offset - only for grouped bar charts
// removeOverlaps - only for bar charts
function getPosition(value, data, grouped = false, offset = 0, removeOverlaps = false) {
	var x = 0;
	var sectors = labels[value].length-1;
	var multiplier = config.bounds.z[1]/sectors;
	switch(value){
		case 'Month':
			x = scales.all.monthsScale(data['Month']);
			break;
		case 'Retweet':
			x = (grouped == true)?(6*multiplier*Math.round(scales.all.retweetScale(+data['Retweet'])/(6*multiplier))):scales.all.retweetScale(+data['Retweet']);
			break;
		case 'Fav':
			x = (grouped == true)?(4*multiplier*Math.round(scales.all.favScale(+data['Fav'])/(4*multiplier))):scales.all.favScale(+data['Fav']);
			break;
		case 'Polarity':
			x = scales.all.polarityScale(+data['Polarity']);
			break;
		case 'Tweets':
			x = (grouped == true)?(5*multiplier*Math.round(scales.all.tweetsToGrid(+data['Tweets'])/(5*multiplier))):scales.all.tweetsToGrid(+data['Tweets']);
			break;
		case 'Sentiment':
			var sent = {'Positive':config.bounds.y[0]/2, 'Negative':config.bounds.y[1]/2, 'Neutral':0};
			x = sent[data['Sentiment']];
			break;
	}

	var overlapsOffset = 0;
	if(removeOverlaps){
		if(data["Sentiment"] == "Positive"){
			overlapsOffset = -25;
		}else if(data["Sentiment"] == "Negative"){
			overlapsOffset = 25;
		}
	}

	return (x+offset+overlapsOffset);
}

//add Marian
// return position of the bars and height, for bar chart
function getYPosition(value, data) {
	var y = 0, height = 0;
	switch(value){
	case 'Month':
		height = (config.bounds.y[1] + scales.all.monthsScale(data['Month']));
		y = (config.bounds.y[0] + scales.all.monthsScale(data['Month']))/2;
		break;
	case 'Retweet':
		height = (config.bounds.y[1] + scales.all.retweetScale(+data['Retweet']));
		y = (config.bounds.y[0] + scales.all.retweetScale(+data['Retweet']))/2;
		break;
	case 'Fav':
		height = (config.bounds.y[1] + scales.all.favScale(+data['Fav']));
		y = (config.bounds.y[0] + scales.all.favScale(+data['Fav']))/2;
		break;
	case 'Polarity':
		height = (config.bounds.y[1] + scales.all.polarityScale(+data['Polarity']));
		height/=2;
		y = 0;
		if(data["Sentiment"] == "Positive"){
			y+=height/2+1.5;
		}else if(data["Sentiment"] == "Negative"){
			y-=height/2+1.5;
		}else{
			height/=5;
		}
		break;
	case 'Tweets':
		height = (config.bounds.y[1] + scales.all.tweetsToGrid(+data['Tweets']));
		y = (config.bounds.y[0] + scales.all.tweetsToGrid(+data['Tweets']))/2;
		break;
	case 'Sentiment':
		var sent = {'Positive':config.bounds.y[0]/2, 'Negative':config.bounds.y[1]/2, 'Neutral':0};
		height = (sent[data['Sentiment']] - config.bounds.y[0]);
		y = height/2 - config.bounds.y[1];
		break;
	}

	return [height, y];
}
