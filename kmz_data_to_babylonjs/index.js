
var progress = 0, sceneReady = false, scene, area = [], GUI, marker = null, map;
var KINEMATICModeCamera, ArcRotateCamera, beginAnimation = false;
var posTarget = new BABYLON.Vector3(-75, 50, -105); 
var fpsLabel = document.getElementById("fpsLabel");
var canvas = document.getElementById("canvas"); 
var engine = new BABYLON.Engine(canvas, true);

var coords = [29.504324, -98.553890];
	
/// Main function
var createScene = function () {
	
	if (!webGLDetect() || !BABYLON.Engine.isSupported())  
	{   
		document.getElementById("webGLwarning").style.display = "block";
		return;
	}
		
	BABYLON.SceneLoader.ShowLoadingScreen = false; 
	BABYLON.Database.IDBStorageEnabled  = false;
	 
	scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color4(1, 1, 1, 1); 
	
	KINEMATICModeCamera = new BABYLON.FreeCamera("KINEMATICModeCamera", BABYLON.Vector3.Zero(), scene);
	scene.activeCamera = KINEMATICModeCamera;  
	 
	ArcRotateCamera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 0, BABYLON.Vector3.Zero(), scene);
	ArcRotateCamera.setTarget(new BABYLON.Vector3(8,-2,0));
	ArcRotateCamera.upperBetaLimit = 1.2; 
	ArcRotateCamera.lowerRadiusLimit = 40;  
	ArcRotateCamera.upperRadiusLimit = 250;  
	ArcRotateCamera.panningSensibility = 75;
	ArcRotateCamera.panningInertia = 0.25; 
	ArcRotateCamera.wheelPrecision = 10;
	
	var light = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0, 1, 0), scene);
 
	GUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");
	
	map = new BABYLON.TransformNode("root");
	
	BABYLON.SceneLoader.ImportMesh("", "", "magic.babylon", scene, function (m,p,s) {

		m[0].scaling = new BABYLON.Vector3(0.5,0.5,0.48);
		m[0].rotationQuaternion = new BABYLON.Quaternion(-0.006,0,0.03,-1);
		area.push(m[0].getBoundingInfo().maximum.scaleInPlace(0.5), m[0].getBoundingInfo().minimum.scaleInPlace(0.5));
		KINEMATICModeCamera.position = new BABYLON.Vector3(150, 120, 20); 
		KINEMATICModeCamera.rotation = BABYLON.Vector3.Zero();	
		KINEMATICModeCamera.lockedTarget = new BABYLON.Vector3(8,-2,0); 
	 	   
		setKinematicAnimation();  
		addSceneLabels(); 
		createMarker2(new BABYLON.Vector3(8,-2,0));//-1.2 
		initializeTiles();
				
	}, function (evt) {
		console.log(progress)
		progress = (evt.loaded * 100 / evt.total).toFixed();
    });

	scene.registerBeforeRender(function () {
		if(scene.activeCamera == ArcRotateCamera){
			ArcRotateCamera.alpha -= 0.0005;
		}
		 
		//Calculate panning speed based on camera radius & beta values
        setPanningAxis();

        //Check camera position for new tile generation
        newTileGenCheck();
	}); 
	
	engine.runRenderLoop(function () {
		if(scene){
			if(sceneReady) { 
				if(!beginAnimation)	{
					beginAnimation = !beginAnimation;
					scene.beginAnimation(KINEMATICModeCamera, 0, 120, false, 0.5);
				} 
				scene.render(); 
				fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
			}else{
				loading(progress);
				var remaining = scene.getWaitingItemsCount();
				if (remaining === 0) { sceneReady = true; }    
			} 
		} 
	});
};

/// Show progress 
var loading = function(progress){
	var div = document.getElementById("loading");
	div.innerHTML = "Loading: "+progress+"%";
}

/// Detect webGL 
var webGLDetect = function() {
    if (!!window.WebGLRenderingContext) 
	{
        var names = ["webgl2", "experimental-webgl2", "webgl", "experimental-webgl", "moz-webgl", "webkit-3d"];
        var context = null;

        for(var i=0;i<names.length;i++) 
		{
			context = canvas.getContext(names[i]);
			if (context && typeof context.getParameter == "function") 
				// WebGL is enabled
				return true;   
        } 
 
        // WebGL is supported, but disabled
        return false;
    } 

    // WebGL not supported
    return false;
} 

/// Intro camera animation
var setKinematicAnimation = function(){
	var animationCam = new BABYLON.Animation("Cinematique_Part01", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
	var a = [];
	a.push({
		frame : 0,  
		value : new BABYLON.Vector3(150, 120, 20)      
	}),  
	a.push({
		frame : 60, 
		value : new BABYLON.Vector3(120, 70, -120)      
	}),  
	a.push({ 
		frame : 120, 
		value : posTarget   
	})
	animationCam.setKeys(a);
	
	var qe = new BABYLON.QuadraticEase;
	qe.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
	animationCam.setEasingFunction(qe);  
	 
	var switchCam = new BABYLON.AnimationEvent(120, function () {
					ArcRotateCamera.setPosition(posTarget);
					scene.activeCamera = ArcRotateCamera;
					scene.activeCamera.attachControl(canvas, true); 
			}, false);        
	animationCam.addEvent(switchCam)
	
	KINEMATICModeCamera.animations.push(animationCam);
} 

/// Form coords
var goToPoint = function(){
	var lng = document.getElementById("long").value;
	var lat = document.getElementById("lat").value;
	var alt = document.getElementById("alt").value;
	
	if(!formValidation([lng, lat, alt])) return;
	
	var origin = new BABYLON.Vector3(-98.553890, 281.364682, 29.504324);
	var point = BABYLON.Vector3.Zero();
	
	if(lat>origin.z) // z plus 
		point.z = area[0].z * ((lat-origin.z)*820);
	else // z minus
		point.z = area[1].z * ((origin.z-lat)*820);
	
	if(lng>origin.x) // x plus
		point.x = area[0].x * ((lng-origin.x)*1000);
	else // x minus
		point.x = area[1].x * ((origin.x-lng)*1000);
		
	point.y = 100;
	
	//check mesh intersection
	var rayPick = new BABYLON.Ray(point, new BABYLON.Vector3(0, -1, 0));
	var meshFound = scene.pickWithRay(rayPick, function (m) {return true;});
		
	if (meshFound != null && meshFound.pickedPoint != null) {
		point.y = meshFound.pickedPoint.y;
	}
			  
	animateCameraZoomToTarget(ArcRotateCamera.getTarget(), point, ArcRotateCamera.radius, 100);
	createMarker2(point);
	coords[0] = lat;
	coords[1] = lng;
}

/// Validation form
var formValidation = function(values) {
	
	var error = document.getElementById("error");
	var east = -98.55289381, west = -98.55488717, north = 29.50552462, 
	south = 29.50312421, minA = 267.0363448, maxA = 295.69301926;
	
	if((values[0] == "" || isNaN(parseFloat(values[0]))) || 
	   (values[1] == "" || isNaN(parseFloat(values[1]))) || 
	   (values[2] == "" || isNaN(parseFloat(values[2])))){
		error.innerHTML = "Insert valid numbers";
		setTimeout(function(){error.innerHTML = "";}, 3000);
		return false;
	}
	
	if((values[0]>east || values[0]<west) || 
	   (values[1]>north || values[1]<south) || 
	   (values[2]>maxA || values[2]<minA)){
		error.innerHTML = "Coords outside the area";
		setTimeout(function(){error.innerHTML = "";}, 3000);
		return false;
	}
	
    return true;
}

/// Camera animation to target
var animateCameraZoomToTarget = function(fromTarget, toTarget, fromRadius, toRadius){
	var newToTarget = new BABYLON.Vector3(toTarget.x, toTarget.y, toTarget.z);
	var endFrame = 50;
	var animCamTarget = new BABYLON.Animation("animCam", "target", 60, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var keysTarget = [];
    keysTarget.push({ frame: 0, value: fromTarget });
    keysTarget.push({ frame: endFrame, value: newToTarget });

    var animCamRadius = new BABYLON.Animation("animCam", "radius", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    var keysRadius = [];
    keysRadius.push({ frame: 0, value: fromRadius });
    keysRadius.push({ frame: endFrame, value: toRadius });
	animCamTarget.setKeys(keysTarget);
    animCamRadius.setKeys(keysRadius);
	
    ArcRotateCamera.animations.push(animCamTarget);
    ArcRotateCamera.animations.push(animCamRadius);
	
    scene.beginAnimation(ArcRotateCamera, 0, endFrame, false);
}

/// Add scene labels - obsolete
var addSceneLabels = function(){
	var labels = ["e","n","w","s"];
	var lposition = [new BABYLON.Vector3(area[0].x, area[0].y+3, 0), 
					 new BABYLON.Vector3(0, area[0].y, area[0].z),
					 new BABYLON.Vector3(area[1].x, area[1].y+6, 0),
					 new BABYLON.Vector3(0, 3, area[1].z)];

	for(var i=0;i<labels.length;i++) { createLabel(labels[i], lposition[i]); } 
}

/// Create scene labels NESW
var createLabel = function(text, pos) {
	const planeTexture = new BABYLON.Texture(text+".png", scene);
	
	var material = new BABYLON.StandardMaterial("outputplane", scene);
	material.emissiveTexture = planeTexture;
	material.opacityTexture = planeTexture;
	material.backFaceCulling = false;
	material.disableLighting = true;
	material.freeze();
	
	var outputplane = BABYLON.Mesh.CreatePlane("outputplane", 10, scene, false);
	outputplane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
	outputplane.material = material;
	outputplane.renderingGroupId = 2;
	outputplane.position = pos;
}

var createMarker2 = function(position){
	if(!marker){  
		BABYLON.SceneLoader.ImportMesh("", "", "marker2.babylon", scene, function (m,p,s) {
			marker = m[0]; 
			marker.scaling = new BABYLON.Vector3(0.1,0.03,0.03);
			marker.material = new BABYLON.StandardMaterial("mat", scene);
			marker.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
			marker.position = position;  
		});   
	}else{ 
		marker.position = position; 
	}
}
 
/// Events
window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);  

createScene();

/// leaflet functions
var rows = 8;
var cols = 8;
var mapTiles = [[],[],[],[],[],[],[],[]];
var tileSize = 64;  

var xOffset = -1 * (tileSize*3 + tileSize/2);
var zOffset = -1 * (tileSize*3 + tileSize/2);

var tileGenerateBuffer = 20;

// ****Use vars instead of hard code****
var mapMaxX = 50;
var mapMinX = -50;
var mapMaxZ = 50;
var mapMinZ = -50;

var zoom = 18; 
var xTileBase = 59303;
var yTileBase = 108573;

//For open street maps URLs
var xTileRight = xTileBase + (cols - 1);
var xTileLeft = xTileBase;
var yTileBottom = yTileBase;
var yTileTop = yTileBase - (rows -1);


function initializeTiles(){

	for(j=0; j<rows; j++){
		for(i=0; i<cols; i++){
			//Create Tile
			mapTiles[j][i] = new BABYLON.Mesh.CreatePlane("tile" + j + "," + i, tileSize, scene);
			mapTiles[j][i].position = new BABYLON.Vector3(i*tileSize + xOffset,0,j*tileSize + zOffset);
			mapTiles[j][i].rotation.x = Math.PI/2;

			//Create tile material
			var newMat = new BABYLON.StandardMaterial("material" + j + "," + i, scene);
			newMat.diffuseTexture = new BABYLON.Texture(
				"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + zoom + "/" + (yTileBase - j) + "/" + (xTileBase + i) + ".png",
				scene 
			);
			newMat.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
			newMat.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
			newMat.specularColor = new BABYLON.Color4(0, 0, 0, 0);
			newMat.backFaceCulling = false;
			
			//Assign
			mapTiles[j][i].material = newMat;  
			mapTiles[j][i].setParent(map);
		}
	}
	map.position = new BABYLON.Vector3(-13,-3.5,-8);
}

function extendPosZ() {
	//Remove bottom most row
	for(x=0; x<cols; x++){
		mapTiles[0][x].setParent(null);
		mapTiles[0][x].dispose();
	}

	//Remove row from array
	mapTiles.splice(0,1);
	
	//Add row to top
	mapTiles.push([]);
	
	var topRowZ = mapTiles[6][0].position.z;
	var topRowX = mapTiles[6][0].position.x;

	//Create new tiles for row
   for(x=0; x<cols; x++){
		mapTiles[7][x] = new BABYLON.Mesh.CreatePlane("tile" + 7 + "," + x, tileSize, scene);
		mapTiles[7][x].position = new BABYLON.Vector3(topRowX + x*tileSize,0,topRowZ + tileSize).addInPlace(map.position);
		mapTiles[7][x].rotation.x = Math.PI/2;
		
		//Create tile material
		var newMat = new BABYLON.StandardMaterial("material" + 7 + "," + x, scene);
		newMat.diffuseTexture = new BABYLON.Texture(
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + zoom + "/" + (yTileTop-1) + "/" + (xTileLeft + x) + ".png",
			scene
		);
		newMat.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.specularColor = new BABYLON.Color4(0, 0, 0, 0);
		newMat.backFaceCulling = false;

		mapTiles[7][x].material = newMat;
		mapTiles[7][x].setParent(map);
   }

   //Increment tile vars
   yTileTop--;
   yTileBottom--;
}

function extendNegZ() {
	//Remove top most row
	for(x=0; x<cols; x++){
		mapTiles[7][x].setParent(null);
		mapTiles[7][x].dispose();
	}

	//Remove row from array
	mapTiles.splice(7,1);

	//Add row to bottom
	mapTiles.unshift([]);

	var bottomRowZ = mapTiles[1][0].position.z;
	var bottomRowX = mapTiles[1][0].position.x;

	//Create new tiles for row
   for(x=0; x<cols; x++){
		mapTiles[0][x] = new BABYLON.Mesh.CreatePlane("tile" + 0 + "," + x, tileSize, scene);
		mapTiles[0][x].position = new BABYLON.Vector3(bottomRowX + x*tileSize,0,bottomRowZ - tileSize).addInPlace(map.position);
		mapTiles[0][x].rotation.x = Math.PI/2;
		
		//Create tile material
		var newMat = new BABYLON.StandardMaterial("material" + 0 + "," + x, scene);
		newMat.diffuseTexture = new BABYLON.Texture(
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + zoom + "/" + (yTileBottom + 1) + "/" + (xTileLeft + x) + ".png",
			scene
		);
		newMat.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.specularColor = new BABYLON.Color4(0, 0, 0, 0);
		newMat.backFaceCulling = false;

		mapTiles[0][x].material = newMat;
		mapTiles[0][x].setParent(map);
   }

   //Increment tile vars
   yTileTop++;
   yTileBottom++;
}

function extendNegX() {
	//Remove right most column
	for(x=0; x<rows; x++){
		mapTiles[x][7].setParent(null);
		mapTiles[x][7].dispose();
		mapTiles[x].splice(7,1);
	}

	
	var leftColZ = mapTiles[0][0].position.z;
	var leftColX = mapTiles[0][0].position.x;


	//Create new left most column
	for(x=0; x<rows; x++){
		mapTiles[x].unshift(new BABYLON.Mesh.CreatePlane("tile" + x + "," + 0, tileSize, scene));
		mapTiles[x][0].position = new BABYLON.Vector3(leftColX - tileSize,0,leftColZ + tileSize*x).addInPlace(map.position);
		mapTiles[x][0].rotation.x = Math.PI/2;

		//Create tile material
		var newMat = new BABYLON.StandardMaterial("material" + x + "," + 0, scene);
		newMat.diffuseTexture = new BABYLON.Texture(
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + zoom + "/" + (yTileBottom - x) + "/" + (xTileLeft - 1) + ".png",
			scene
		);
		newMat.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.specularColor = new BABYLON.Color4(0, 0, 0, 0);
		newMat.backFaceCulling = false;

		mapTiles[x][0].material = newMat;
		mapTiles[x][0].setParent(map);
	}

	//Increment tile vars
   xTileLeft--;
   xTileRight--;
}

function extendPosX() {
	//Remove left most column
	for(x=0; x<rows; x++){
		mapTiles[x][0].setParent(null);
		mapTiles[x][0].dispose();
		mapTiles[x].splice(0,1);
	}

	
	rightColZ = mapTiles[0][6].position.z;
	rightColX = mapTiles[0][6].position.x;

	var greenishMat = new BABYLON.StandardMaterial("greenishMat", scene);
	greenishMat.diffuseColor = new BABYLON.Color3(0.6, 1, 0.6);
	greenishMat.specularColor = new BABYLON.Color3(0,0,0);

	//Create new left most column
	for(x=0; x<rows; x++){
		mapTiles[x][7] = new BABYLON.Mesh.CreatePlane("tile" + x + "," + 7, tileSize, scene);
		mapTiles[x][7].position = new BABYLON.Vector3(rightColX + tileSize,0,rightColZ + tileSize*x).addInPlace(map.position);
		mapTiles[x][7].rotation.x = Math.PI/2;

		//Create tile material
		var newMat = new BABYLON.StandardMaterial("material" + x + "," + 7, scene);
		newMat.diffuseTexture = new BABYLON.Texture(
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/" + zoom + "/" + (yTileBottom - x) + "/" + (xTileRight + 1) + ".png",
			scene
		);
		newMat.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
		newMat.specularColor = new BABYLON.Color4(0, 0, 0, 0);
		newMat.backFaceCulling = false;

		mapTiles[x][7].material = newMat;
		mapTiles[x][7].setParent(map);
	}

	//Increment tile vars
	xTileLeft++;
	xTileRight++;
}

function setPanningAxis() {
	var zoomBonusSpeed = 1; 

	if(ArcRotateCamera.radius>50){
		zoomBonusSpeed = 2;
	} 

	if(ArcRotateCamera.beta == 0.01){
		ArcRotateCamera.panningAxis = new BABYLON.Vector3(1.75 + zoomBonusSpeed, 0, 100 + zoomBonusSpeed*50);
	}else if(ArcRotateCamera.beta<0.10){
		ArcRotateCamera.panningAxis = new BABYLON.Vector3(1.75 + zoomBonusSpeed, 0, 25 + zoomBonusSpeed*13);
	}else if(ArcRotateCamera.beta<0.20){
		ArcRotateCamera.panningAxis = new BABYLON.Vector3(1.75 + zoomBonusSpeed, 0, 10 + zoomBonusSpeed*5);
	}else if(ArcRotateCamera.beta<0.30){
		ArcRotateCamera.panningAxis = new BABYLON.Vector3(1.75 + zoomBonusSpeed, 0, 4 + zoomBonusSpeed*2);
	}else{
		ArcRotateCamera.panningAxis = new BABYLON.Vector3(1.75 + zoomBonusSpeed, 0, 1.75 + zoomBonusSpeed);
	}
}

function newTileGenCheck() {
   
	//Pan right
	if(mapMaxX - ArcRotateCamera.target.x < tileGenerateBuffer){
		extendPosX();
		mapMaxX += tileSize;
		mapMinX += tileSize;
	}

	//Pan left
	if(mapMinX - ArcRotateCamera.target.x > -tileGenerateBuffer){
		extendNegX();
		mapMaxX -= tileSize;
		mapMinX -= tileSize;
	}

	//Pan up
	if(mapMaxZ - ArcRotateCamera.target.z < tileGenerateBuffer){
		extendPosZ();
		mapMaxZ += tileSize;
		mapMinZ += tileSize;
	}

	//Pan down
	if(mapMinZ - ArcRotateCamera.target.z > -tileGenerateBuffer){
		extendNegZ();
		mapMaxZ -= tileSize;
		mapMinZ -= tileSize;
	}

}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
