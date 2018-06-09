

// ########### Grid JS ###############

// This was written by Lee Stemkoski
// https://stemkoski.github.io/Three.js/Sprite-Text-Labels.html
function makeTextSprite(message, parameters) {
  // to generate text using sprite material

  if (parameters === undefined) parameters = {};

  var fontface = parameters["fontface"] || "Helvetica";
  var fontsize = parameters["fontsize"] || 40;
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  context.font = "Bold " + fontsize + "px " + fontface;

  // text color
  context.fillStyle = "rgba(250, 250, 250, 1.0)";
  context.fillText(message, 0, fontsize);

  // canvas contents will be used for a texture
  var texture = new THREE.Texture(canvas)
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial({ map: texture });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(150, 100, 1.0);

  return sprite;
}  // end of makeTextSprite

function labelAxis(width, data, direction, grouped = false) {
  // uses makeTextSprite to create axis label
  var separator = 2 * width / (data.length -1),
    p = {
      x: 0,
      y: 0,
      z: 0
    },
    dobj = new THREE.Object3D();

  for (var i = 0; i < data.length; i++) {
    var label = makeTextSprite(data[i], { grouped: grouped });

    label.position.set(p.x, p.y, p.z);

    dobj.add(label);
    if (direction == "y") {
      p[direction] += separator;
    } else {
      p[direction] -= separator;
    }

  }
  return dobj;
}   // end of labelAxis

function createAxisPlanes(opts){
	var config = opts || {
		width: 10,
		height: 10,
		dimensions: [5,5,5],
		material : 0,
		repeatYZ : false,
		castShadow : false,
		receiveShadow : true
	}

	if(!config.repeatYZ)
	{
		var gridTex = new THREE.TextureLoader().load("grid_pattern1.jpg");
		gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
		gridTex.repeat.set( config.dimensions[0]/2, config.dimensions[0]/2 );

		var materialYZ = new THREE.MeshPhongMaterial({
			color : 0x777777,
			shininess : 5,
			specular : 0x333333,
			side: THREE.DoubleSide,
			map:gridTex
		});
	}else{
		var gridTex2 = new THREE.TextureLoader().load("grid_pattern2.jpg");
		gridTex2.wrapS = gridTex2.wrapT = THREE.RepeatWrapping;
		gridTex2.repeat.set( config.dimensions[1], config.dimensions[0] );

		var materialY = new THREE.MeshPhongMaterial({
			color : 0x777777,
			shininess : 5,
			specular : 0x333333,
			side: THREE.DoubleSide,
			map:gridTex2
		});

		var gridTex2 = new THREE.TextureLoader().load("grid_pattern2.jpg");
		gridTex2.wrapS = gridTex2.wrapT = THREE.RepeatWrapping;
		gridTex2.repeat.set( config.dimensions[2], config.dimensions[0] );

		var materialZ = new THREE.MeshPhongMaterial({
			color : 0x777777,
			shininess : 5,
			specular : 0x333333,
			side: THREE.DoubleSide,
			map:gridTex2
		});
	}

	var gridTex2 = new THREE.TextureLoader().load("grid_pattern2.jpg");
	gridTex2.wrapS = gridTex2.wrapT = THREE.RepeatWrapping;
	gridTex2.repeat.set( config.dimensions[1], config.dimensions[2] );

	var materialX = new THREE.MeshPhongMaterial({
		color : 0x777777,
		shininess : 5,
		specular : 0x333333,
		side: THREE.DoubleSide,
		map:gridTex2
	});

	var geometry = new THREE.PlaneGeometry( config.width, config.height );

	if(!config.repeatYZ)
	{
		var ground = new THREE.Mesh( geometry,
			(config.material==0) ? materialX : materialYZ );
	}else{
		switch(config.material){
			case 0:
				var ground = new THREE.Mesh( geometry, materialX );
				break;
			case 1:
				var ground = new THREE.Mesh( geometry, materialY );
				break;
			case 2:
				var ground = new THREE.Mesh( geometry, materialZ );
				break;
		}

	}

	ground.castShadow = config.castShadow;
	ground.receiveShadow = config.receiveShadow;

	return ground;
}

// default don't have negative values on y,
// and use the same texture on each axis
function drawGrid(labels, axisTitles, scene, opts) {
	var cfg = opts || {
		negativeValues : false, // y - axis ( true for polarity )
		repeatYZ : true,		// true for scatterplot - use the same texture on all axis -
								// false for bar charts - yz different texture
		grouped : false 		// used only for grouped bar charts
	}

  var boundingGrid = new THREE.Object3D(),
    depth = config.graphDimensions.w / 2, //depth
    width = config.graphDimensions.d / 2, //width
    height = config.graphDimensions.h / 2, //height
    a = labels.y.length - 1,
    b = labels.x.length - 1,
    c = labels.z.length - 1;

	// Creating the ground-x
	var groundX = createAxisPlanes({
		width: config.graphDimensions.d,
		height: config.graphDimensions.w,
		dimensions : [a,b,c],
		material : 0,
		repeatYZ : cfg.repeatYZ,
		castShadow : false,
		receiveShadow : false
	});
	groundX.rotation.x -= Math.PI/2;
	groundX.position.y = (cfg.negativeValues == true) ? 0 : (-height);
	boundingGrid.add( groundX );

	// Creating the ground-y
	var groundY = createAxisPlanes({
		width: config.graphDimensions.d,
		height: config.graphDimensions.h,
		dimensions : [a,b,c],
		material : 1,
		repeatYZ : cfg.repeatYZ,
		castShadow : false,
		receiveShadow : false
	});
	groundY.position.z = -depth;
	boundingGrid.add( groundY );

	// craating the groynd-z
	var groundZ = createAxisPlanes({
		width: config.graphDimensions.w,
		height: config.graphDimensions.h,
		dimensions : [a,b,c],
		material : 2,
		repeatYZ : cfg.repeatYZ,
		castShadow : false,
		receiveShadow : false
	});
	groundZ.rotation.y -= Math.PI/2;
	groundZ.position.x = -width;
	boundingGrid.add( groundZ );

	scene.add(boundingGrid);

	var xTitle = makeTextSprite(axisTitles.x, { fontsize: 50});
	xTitle.position.x = width / 2 - 150;
	xTitle.position.y = (cfg.negativeValues == true) ? (-30) : (-height - 30);
	xTitle.position.z = depth + 140;
	scene.add(xTitle);

	var yTitle = makeTextSprite(axisTitles.y, { fontsize: 50});
	yTitle.position.set(-width + 50, height - 280, depth + 150);
	scene.add(yTitle);

	var zTitle = makeTextSprite(axisTitles.z, { fontsize: 50});
	zTitle.position.x = width + 150;
	zTitle.position.y = (cfg.negativeValues == true) ? (-30) : (-height - 30);
	zTitle.position.z = 0;
	scene.add(zTitle);

	//xaxisss
	var labelsW = labelAxis(width, reverse(labels.x), "x");
	labelsW.position.x = (cfg.grouped == true)?(width+30):(width + 50);
	labelsW.position.y = (cfg.negativeValues == true) ? (-30) : (-height - 30);
	labelsW.position.z = depth + 20;
	scene.add(labelsW);

	//yaxisss
	var labelsH = labelAxis(height, labels.y, "y");
	labelsH.position.set(-width + 10, - height - 30, depth + 30);
	scene.add(labelsH);

	//zaxisss
	var labelsD = labelAxis(depth, labels.z, "z", cfg.grouped);
	labelsD.position.x = width + 90;
	labelsD.position.y = (cfg.negativeValues == true) ? (-30) : (-height - 30);
	labelsD.position.z = (cfg.grouped == true)?(depth+50):(depth - 10);
	scene.add(labelsD);
};  // end of DrawGrid
