var Plots = {

	//plot + category + type
	plot_Color_Scatterplot : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  drawLegend({
		sentimentLegend: true, // show sentiment legend
		tweetsDomain: [0,0]
	  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		data[sentiment].forEach(function (d) {

		  var sphere = getSphere({
			radius: config.dafaultRadius,
			color: config.sentimentColors[sentiment],
			position: new THREE.Vector3(
			  getPosition(params.x, d),
			  getPosition(params.y, d),
			  getPosition(params.z, d)
			)
		  });
		  scene.add(sphere);
		});
	  });
	},

	plot_Position_Scatterplot : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

	  if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  drawLegend();

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		data[sentiment].forEach(function (d) {

		  var sphere = getSphere({
			radius: config.dafaultRadius,
			color: "#333",
			position: new THREE.Vector3(
			  getPosition(params.x, d),
			  getPosition(params.y, d),
			  getPosition(params.z, d)
			)
		  });
		  scene.add(sphere);
		});
	  });
	},

	plot_Shape_Scatterplot : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

	  if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  if(params.shape)
		  drawLegend({
			sentimentLegend: true,
			shapeLegend: true,
			tweetsDomain: d3.extent(data.all, function (d) { return +d['Fav'] })
		  });
      else
		  drawLegend({
			shapeLegend: true,
			diffColor: true,
			tweetsDomain: [0,0]
		  });


	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		data[sentiment].forEach(function (d) {

		  if(params.data == "Hillary"){
			  var shape = getSphere({
				radius: config.dafaultRadius,
				color: (params.shape == false)?"#f00":config.sentimentColors[sentiment],
				position: new THREE.Vector3(
				  getPosition(params.x, d),
				  getPosition(params.y, d),
				  getPosition(params.z, d)
				)
			  });
		  }else{
			  var shape = getBox({
				size: config.defaultWidthDepth,
				color: (params.shape == false)?"#00f":config.sentimentColors[sentiment],
				position: new THREE.Vector3(
				  getPosition(params.x, d),
				  getPosition(params.y, d),
				  getPosition(params.z, d)
				)
			  });
		  }

		  scene.add(shape);
		});
	  });
	},

	plot_Size_Scatterplot : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

	  if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  if(params.sizeType == "Sentiment")
		  drawLegend({
			ordinalSizeLegend: true,
			tweetsDomain: [1,3]
		  });
	  else
		  drawLegend({
			sizeLegend: true,
			sentimentLegend: true,
			tweetsDomain: d3.extent(data.all, function (d) { return +d['Tweets'] })
		  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		data[sentiment].forEach(function (d) {

		  var radius = 0;
		  var color = 0;
		  switch(params.sizeType){
			  case "Sentiment":
				radius = config.sentimentSize[sentiment]*1.5;
				color = "#333";
				break;
			  case "No_of_Tweets_Color":
			    radius = scales.all.tweetsToRadii(+d['Tweets']);
				color = config.sentimentColors[sentiment];
			    break;

			  case "No_of_Tweets_NoColor":
			    radius = scales.all.tweetsToRadii(+d['Tweets'])*1.5
				color = "#333";
			   break;
		  }

		  var sphere = getSphere({
			radius: radius,
			color: color,
			position: new THREE.Vector3(
			  getPosition(params.x, d),
			  getPosition(params.y, d),
			  getPosition(params.z, d)
			)
		  });
		  scene.add(sphere);
		});
	  });
	},

	plot_Color_Bar_Chart : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: (params.grouped)?labels[params.z+"Group"]:labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true,
				repeatYZ: false,
				grouped: params.grouped
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: false,
				grouped: params.grouped
			});

	  drawLegend({
		sentimentLegend: true,
		tweetsDomain: [0,0]
	  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		data[sentiment].forEach(function (d) {

		  var infos = getYPosition(params.y, d);
		  var bar = getBar({
			height: infos[0],
			widthDepth: (params.remOverlaps == true)?config.defaultWidthDepth/2.3:config.defaultWidthDepth,
			color: config.sentimentColors[sentiment],
			position: new THREE.Vector3(
				getPosition(params.x, d, false, params.grouped?-40:0, params.remOverlaps),
				infos[1],
				getPosition(params.z, d, params.grouped),
			)
		  });

		  scene.add(bar);
		});
	  });
	},

	plot_Position_Bar_Chart : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: (params.grouped)?labels[params.z+"Group"]:labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true,
				repeatYZ: false,
				grouped: params.grouped
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: false,
				grouped: params.grouped
			});

	  drawLegend();

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		data[sentiment].forEach(function (d) {

			var infos = getYPosition(params.y, d);
			var bar = getBar({
				height: infos[0],
				widthDepth: (params.remOverlaps == true)?config.defaultWidthDepth/2.3:config.defaultWidthDepth,
				color: "#333",
				position: new THREE.Vector3(
					getPosition(params.x, d, false, params.grouped?-40:0, params.remOverlaps),
					infos[1],
					getPosition(params.z, d, params.grouped),
				)
			});

			scene.add(bar);
		});
	  });
	},

	plot_Size_Bar_Chart : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: (params.grouped)?labels[params.z+"Group"]:labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true,
				repeatYZ: false,
				grouped: params.grouped
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: false,
				grouped: params.grouped
			});

	  if(params.sizeType == "Sentiment")
		  drawLegend({
			ordinalSizeLegend: true,
			tweetsDomain: [1,3]
		  });
	  else
		  drawLegend({
			sizeLegend: true,
			sentimentLegend: true,
			tweetsDomain: d3.extent(data.all, function (d) { return +d['Tweets'] })
		  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		data[sentiment].forEach(function (d) {

		  var widthDepth = 0;
		  var color = 0;
		  switch(params.sizeType){
			  case "Sentiment":
				widthDepth = config.sentimentSize[sentiment];
				color = "#333";
				break;
			  case "No_of_Tweets_Color":
			    widthDepth = scales.all.tweetsToRadii(+d['Tweets']);
				color = config.sentimentColors[sentiment];
			    break;

			  case "No_of_Tweets_NoColor":
			    widthDepth = scales.all.tweetsToRadii(+d['Tweets']);
				color = "#333";
			   break;
		  }

		  var infos = getYPosition(params.y, d);
		  var bar = getBar({
			height: infos[0],
			widthDepth: widthDepth,
			color: color,
			position: new THREE.Vector3(
				getPosition(params.x, d, false, params.grouped?-40:0, params.remOverlaps),
				infos[1],
				getPosition(params.z, d, params.grouped),
			)
		  });

		  scene.add(bar);
		});
	  });
	},

	plot_Color_Surface_Area : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  drawLegend({
		sentimentLegend: true, // show sentiment legend
		tweetsDomain: [0,0]
	  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		var dataArray = [];
		var i=0;
		data[sentiment].forEach(function (d) {
			i++;
			//console.log(d)
			dataArray.push([
				getPosition(params.x, d),
				0,
				getPosition(params.z, d)
			]);
		});
		
		var mesh = getSurface(sentiment, {
		  vertexColor : true,
		  data : dataArray,
		  Yposition : params.y
		});
		
		mesh.position.y = (params.y == "Polarity")?0:(config.bounds.y[0]+2);
		scene.add(mesh);
	  }); 
	},
	
	plot_Position_Surface_Area : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  drawLegend({
		sentimentLegend: true, // show sentiment legend
		tweetsDomain: [0,0]
	  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		var dataArray = [];
		data[sentiment].forEach(function (d) {
			dataArray.push([
				getPosition(params.x, d),
				getPosition(params.y, d),
				getPosition(params.z, d)
			]);
		});
		var mesh = getSurface(sentiment, {
		  vertexColor : false,
		  data : dataArray,
		  Yposition : params.y
		});
		
		mesh.position.y = (params.y == "Polarity")?0:(config.bounds.y[0]+2);
		scene.add(mesh);
	  }); 
	},
	
	plot_Color_Area_Chart : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  drawLegend({
		sentimentLegend: true, // show sentiment legend
		tweetsDomain: [0,0]
	  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		var dataArray = [];
		data[sentiment].forEach(function (d) {
			dataArray.push([
				getPosition(params.x, d),
				getPosition(params.y, d),
				getPosition(params.z, d),
			]);
		});
		var mesh = getSurface(sentiment, {
		  vertexColor : true,
		  data : dataArray,
		  Yposition : params.y
		});
		
		mesh.position.y = (params.y == "Polarity")?0:(config.bounds.y[0]+2);
		scene.add(mesh);
	  }); 
	},
	
	plot_Position_Area_Chart : function (scene, params = {}) {
	  var axisTitles = {
		x: params.x,
		y: params.y,
		z: params.z,
	  };
	  var axisLabels = {
		x: labels[params.x],
		y: labels[params.y],
		z: labels[params.z],
	  };

		if(params.y == "Polarity")
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: true, // negative values on y axis
				repeatYZ: true  // use the same texture on each axis
			});
		else
			drawGrid(axisLabels, axisTitles, scene, {
				negativeValues: false,
				repeatYZ: true
			});

	  drawLegend({
		sentimentLegend: true, // show sentiment legend
		tweetsDomain: [0,0]
	  });

	  ['positive', 'negative', 'neutral'].forEach(function (sentiment) {
		var dataArray = [];
		data[sentiment].forEach(function (d) {
			dataArray.push([
				getPosition(params.x, d),
				getPosition(params.y, d),
				getPosition(params.z, d)
			]);
		});
		var mesh = getSurface(sentiment, {
		  vertexColor : false,
		  data : dataArray,
		  Yposition : params.y
		});
		
		mesh.position.y = (params.y == "Polarity")?0:(config.bounds.y[0]+2);
		scene.add(mesh);
	  }); 
	}
};
