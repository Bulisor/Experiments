

// ################ Main JS ###################

function init(plotFunction, params = {}) {
  scene = new THREE.Scene();
  var aspect = window.innerWidth / window.innerHeight;
  // set up camera
  var camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 3000);

  // set up renderer
  var renderer = new THREE.WebGLRenderer( { antialias : true } );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setClearColor(config.backgroundColor);
  document.body.appendChild(renderer.domElement);

  //set up controls
  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; 
  controls.enableKeys = false; 
  controls.panSpeed = 0;	
  camera.position.set(
    config.startPosition.x + 950,
    config.startPosition.y + 700,
    config.startPosition.z + 40
  );
  // camera.position.set(0,800,200);
  controls.update();

  // set up lights
  var light1 = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(light1);

  var light2 = new THREE.DirectionalLight(0xffffff, 0.3);
  light2.position.set(-1000, 1000, 10000);//.normalize();
  // scene.add(light2);


  var lights1 = new THREE.SpotLight( 0xffffff, 1 );
  lights1.position.set( 1500, 1000, 1500 );
  lights1.target.position.set( 0, 0, 0 );
  lights1.shadow.camera.near = 1000;
  lights1.shadow.camera.far = 5000;
  lights1.shadow.camera.fov = 40;
  lights1.castShadow = true;
  //lights1.shadowDarkness = 0.3;
  lights1.shadow.bias = 0.0001;

  scene.add(lights1);

  var lights2 = new THREE.SpotLight( 0xffffff, 1 );
  lights2.position.set( 100, -100, -500 );
  lights2.target.position.set( 0, 0, 0 );
  // lights2.shadowCameraNear = 1000;
  // lights2.shadowCameraFar = 5000;
  // lights2.shadowCameraFov = 40;
  // lights2.castShadow = true;
  // lights2.shadowDarkness = 0.3;
  // lights2.shadowBias = 0.0001;

  // scene.add(lights2);

  var lights3 = new THREE.SpotLight( 0xffffff, 1 );
  lights3.position.set( 1000, 100, 200 );
  lights3.target.position.set( 0, 0, 0 );

  // scene.add(lights3);

  var lights4 = new THREE.SpotLight( 0xffffff, 1 );
  lights4.position.set( 1000, -500, 200 );
  lights4.target.position.set( 0, 0, 0 );

  // scene.add(lights4);

  // add Marian
  if(typeof(plotFunction) === undefined){
	  alert("Coming soon");
	  return;
  }

  plotFunction(scene, params);

  requestAnimationFrame(animate);
  function animate() {
    controls.update()
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    }
}  // end of init

function getSphere(params) {
  var geometry = new THREE.SphereGeometry(params.radius, 32, 32);
  var material = new THREE.MeshPhongMaterial( { color: params.color, specular: 0x555555, shininess: 0 } );

  material.transparent = true;
  material.opacity = 0.85;
  var sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(
    params.position.x,
    params.position.y,
    params.position.z,
  );
  return sphere;
} // end of getsphere

function getBox(params) {
  var geometry = new THREE.BoxGeometry( params.size, params.size, params.size );
  var material = new THREE.MeshPhongMaterial( { color: params.color, specular: 0x555555, shininess: 0 } );

  material.transparent = true;
  material.opacity = 0.85;
  var box = new THREE.Mesh(geometry, material);
  box.position.set(
    params.position.x,
    params.position.y,
    params.position.z,
  );
  return box;
} // end of getsphere

//add Marian
function getBar(params) {
  var geometry = new THREE.BoxGeometry( params.widthDepth, params.height, params.widthDepth );
  var material = new THREE.MeshPhongMaterial( { color: params.color, specular: 0x555555, shininess: 0 } );

  material.transparent = true;
  material.opacity = 0.85;
  var bar = new THREE.Mesh(geometry, material);
  bar.position.set(
    params.position.x,
    params.position.y,
    params.position.z,
  );
  return bar;
} // end of getBar
 
//add Marian
function getSurface_new(sentiment, params) {

	if(!params.vertexColor)
	{
		var material = new THREE.MeshPhongMaterial( { color: 0x333333, specular: 0x333333, shininess: 5, side: THREE.DoubleSide } );
	}else{
		var material = new THREE.MeshPhongMaterial( { vertexColors: THREE.VertexColors, specular: 0x333333, shininess: 5, side: THREE.DoubleSide } );
	}

	var geometry = new THREE.ParametricBufferGeometry( THREE.ParametricGeometries.plane( config.axisWidth, config.axisWidth ), config.axisWidth/10, config.axisWidth/10 );

	var indices = [];
	var vertices = [];
	var normals = [];
	var colors = [];
	var size = config.axisWidth;
	var segments = config.axisWidth/50;
	var halfSize = size / 2;
	var segmentSize = size / segments;

	var detArr = detYVal2(size, params.data, params.Yposition);
	var offsetSentiment = {"negative":0,"neutral":3,"positive":5}

	// generate vertices, normals and color data for a simple grid geometry
	for ( var i = 0; i <= segments; i ++ ) {
		var y = ( i * segmentSize ) - halfSize;
		for ( var j = 0; j <= segments; j ++ ) {
			var x = ( j * segmentSize ) - halfSize;
			vertices.push( x, detArr[x+''+y] + offsetSentiment[sentiment], y ); 
			normals.push( 0, 0, 1 );
			var r = ( x / size ) + 0.5;
			var g = ( y / size ) + 0.5;
			var color = new THREE.Color( config.sentimentColors[sentiment] );
			colors.push(color.r, color.g, color.b);
		}
	}

	// generate indices (data for element array buffer)
	for ( var i = 0; i < segments; i ++ ) {
		for ( var j = 0; j < segments; j ++ ) {
			var a = i * ( segments + 1 ) + ( j + 1 );
			var b = i * ( segments + 1 ) + j;
			var c = ( i + 1 ) * ( segments + 1 ) + j;
			var d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );
			// generate two faces (triangles) per iteration
			indices.push( a, b, d ); // face one
			indices.push( b, c, d ); // face two
		}
	}

	geometry.setIndex( indices );
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	var object = new THREE.Mesh( geometry, material );
	
	return object;
}

function detYVal2(size, data, Yposition) {

	var segments = config.axisWidth/50;
	var halfSize = size / 2;
	var segmentSize = size / segments;
	
	var vect = [];
	var dist = [], coords = [];
	for(let val in Object.keys(data)){
		console.log(val)
		/*
		dist[k] = [], coords[k] = {};
		for ( var i = 0; i <= segments; i ++ ) {
			var y = ( i * segmentSize ) - halfSize;
			for ( var j = 0; j <= segments; j ++ ) {
				var x = ( j * segmentSize ) - halfSize;
				var distance = new THREE.Vector3(data[k][0], 0, data[k][2]).distanceTo(new THREE.Vector3(x, 0, y));
				coords[k][x+''+y] = parseFloat(distance);
				dist[k].push(parseFloat(distance));
			}
		}
		*/
	}

	var returnArray = {};
	for ( var k = 0; k < dist.length; k ++ ) {
		var minDist = Math.min.apply(Math,dist[k]);
		for ( var i = 0; i <= segments; i ++ ) {
			var y = ( i * segmentSize ) - halfSize;
			for ( var j = 0; j <= segments; j ++ ) {
				var x = ( j * segmentSize ) - halfSize;

				if(parseFloat(coords[k][x+''+y]) == minDist){
					returnArray[x+''+y] = data[k][1];
					if(Yposition != "Polarity"){
						returnArray[x+''+y]+=config.bounds.y[1];
					}
				}else{
					if(!returnArray[x+''+y])
						returnArray[x+''+y] = 0;
				}
			}
		}
	}

	return returnArray;
}

function getSurface(sentiment, params) {

	if(!params.vertexColor)
	{
		var material = new THREE.MeshPhongMaterial( { color: 0x333333, specular: 0x333333, shininess: 5, side: THREE.DoubleSide } );
	}else{
		var material = new THREE.MeshPhongMaterial( { vertexColors: THREE.VertexColors, specular: 0x333333, shininess: 5, side: THREE.DoubleSide } );
	}

	var geometry = new THREE.ParametricBufferGeometry( THREE.ParametricGeometries.plane( config.axisWidth, config.axisWidth ), config.axisWidth/10, config.axisWidth/10 );

	var indices = [];
	var vertices = [];
	var normals = [];
	var colors = [];
	var size = config.axisWidth;
	var segments = config.axisWidth/50;
	var halfSize = size / 2;
	var segmentSize = size / segments;

	var detArr = detYVal(size, params.data, params.Yposition);
	var offsetSentiment = {"negative":0,"neutral":3,"positive":5}

	// generate vertices, normals and color data for a simple grid geometry
	for ( var i = 0; i <= segments; i ++ ) {
		var y = ( i * segmentSize ) - halfSize;
		for ( var j = 0; j <= segments; j ++ ) {
			var x = ( j * segmentSize ) - halfSize;
			vertices.push( x, detArr[x+''+y] + offsetSentiment[sentiment], y ); 
			normals.push( 0, 0, 1 );
			var r = ( x / size ) + 0.5;
			var g = ( y / size ) + 0.5;
			var color = new THREE.Color( config.sentimentColors[sentiment] );
			colors.push(color.r, color.g, color.b);
		}
	}

	// generate indices (data for element array buffer)
	for ( var i = 0; i < segments; i ++ ) {
		for ( var j = 0; j < segments; j ++ ) {
			var a = i * ( segments + 1 ) + ( j + 1 );
			var b = i * ( segments + 1 ) + j;
			var c = ( i + 1 ) * ( segments + 1 ) + j;
			var d = ( i + 1 ) * ( segments + 1 ) + ( j + 1 );
			// generate two faces (triangles) per iteration
			indices.push( a, b, d ); // face one
			indices.push( b, c, d ); // face two
		}
	}

	geometry.setIndex( indices );
	geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
	geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

	var object = new THREE.Mesh( geometry, material );
	
	return object;
}

function detYVal(size, data, Yposition) {

	var segments = config.axisWidth/50;
	var halfSize = size / 2;
	var segmentSize = size / segments;

	var dist = [], coords = [];
	for(var k=0;k<data.length;k++){
		dist[k] = [], coords[k] = {};
		for ( var i = 0; i <= segments; i ++ ) {
			var y = ( i * segmentSize ) - halfSize;
			for ( var j = 0; j <= segments; j ++ ) {
				var x = ( j * segmentSize ) - halfSize;
				var distance = new THREE.Vector3(data[k][0], 0, data[k][2]).distanceTo(new THREE.Vector3(x, 0, y));
				coords[k][x+''+y] = parseFloat(distance);
				dist[k].push(parseFloat(distance));
			}
		}
	}

	var returnArray = {};
	var val = 0;
	for ( var k = 0; k < dist.length; k ++ ) {
		var minDist = Math.min.apply(Math,dist[k]);
		for ( var i = 0; i <= segments; i ++ ) {
			var y = ( i * segmentSize ) - halfSize;
			for ( var j = 0; j <= segments; j ++ ) {
				var x = ( j * segmentSize ) - halfSize;

				if(parseFloat(coords[k][x+''+y]) == minDist){
					val = data[k][1];
					returnArray[x+''+y] = data[k][1];
					if(Yposition != "Polarity"){
						returnArray[x+''+y]+=config.bounds.y[1];
					}
				}else{
					if(!returnArray[x+''+y])
						returnArray[x+''+y] = val;
				}
			}
		}
	}

	return returnArray;
}
