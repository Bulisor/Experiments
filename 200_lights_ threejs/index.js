var container, camera, scene, renderer, controls;
var lightsOn = true, objects = [], lightText = null;		

init();
animate();
 
function init() {
	
	if (!Detector.webgl) Detector.addGetWebGLMessage();
	
	container = document.getElementById("idddd")
	
	// scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0xdddddd );
	// camera
	camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.set( 0, 75, 0 );
	
	// lights
	scene.add( new THREE.AmbientLight( 0xaaaaaa ) );
	
	// renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );
	
	// controls 
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	console.log(controls)
	controls.maxDistance = 150;
	controls.minDistance = 30;
	//controls.enabled = false; 
	controls.panSpeed = 0;	
	controls.enableRotate = false;
	//controls.enableZoom = false;
	controls.enableKeys = true; 
	
	var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
	dragControls.addEventListener( 'dragstart', function ( event ) { 
		dragControls.isDrag = false; 
		controls.enabled = false; 
	});
	dragControls.addEventListener( 'dragend', function ( event ) { 
		controls.enabled = true; 
		if(dragControls.selected && !dragControls.isDrag) {
			dragControls.selected.children[0].intensity = (1.5 - dragControls.selected.children[0].intensity); 
		}  
		dragControls.selected = null;
	});	
	
	window.addEventListener( 'resize', onWindowResize, false );

	// assets 
	loadAssets();
	
	// add lights
	addLights();
}

function onWindowResize() {
	
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
}

function loadAssets() {
	
	var Tex = new THREE.TextureLoader().load( "image.png" );
	Tex.wrapS = Tex.wrapT = THREE.RepeatWrapping;
	
	var geometry = new THREE.PlaneBufferGeometry( 40, 40, 64, 64 );
	var material = new THREE.MeshLambertMaterial( {color: 0xffffff, map: Tex, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.rotateX( - Math.PI / 2);
	scene.add( plane );
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addLights() {
	
	var textureLoader = new THREE.TextureLoader();
	lightText = textureLoader.load( "bulb.png");
	var material = new THREE.SpriteMaterial( { map: lightText, color: 0xffffff } );
	
	for(var i = 0; i<14; i++) {
		for(var j = 0; j<15; j++) { 
			
			var x = getRandomInt(-15,15);
			var z = getRandomInt(-15,15);
			
			var sprite = new THREE.Sprite( material );
			sprite.position.set( x, 1, z ); 
			scene.add( sprite );
			
			var spotLight = new THREE.PointLight( 0xffffff, 1.5, 4, 2.0 );
			spotLight.position.set( 0, 0, 0 );
			sprite.add( spotLight );
			
			if(j==14) {
			 spotLight.color.r = 1;
			 spotLight.color.g = 0;
			 spotLight.color.b = 0;
			}
			
			objects.push(sprite);
		}
	}
}	 
 
function toggleLights() {
	lightsOn = !lightsOn;
	var intensity = lightsOn ? 1 : 0;
	for(var i=0;i<objects.length;i++){
		objects[i].children[0].intensity = intensity;
	}
}

function addSpot() {
	var material = new THREE.SpriteMaterial( { map: lightText, color: 0xffffff } );
	
	var sprite = new THREE.Sprite( material );
	sprite.position.set( -15, 1, -15 ); 
	scene.add( sprite );
	
	var spotLight = new THREE.PointLight( 0xffffff, 1.5, 4, 2.0 );
	spotLight.position.set( 0, 0, 0 );
	sprite.add( spotLight );
		
	objects.push(sprite);
}