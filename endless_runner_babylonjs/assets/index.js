var progress = 0, sceneReady = false;
var isMobile = false, pause = false, music, sound;
var scene, light, camera, env, runner, obs, midler, offset = 675;
var array_env = [], array_obs = [], array_mid = [], oldDist = 0, interval;
var go_to = BABYLON.Vector3.Zero(), nivel = 1, lives, time = 0, canJump = true;
var jumpS, runS, dieS, muteSound = false, runnerState, UIScore, score = 0;

var settings = {
		1:{"mid":true,"overlay":false,"gamespeed":10,"max_obs":4},
		2:{"mid":true,"overlay":true,"gamespeed":10,"max_obs":7},
		3:{"mid":true,"overlay":true,"gamespeed":15,"max_obs":7},
		4:{"mid":true,"overlay":true,"gamespeed":15,"max_obs":9},
		5:{"mid":true,"overlay":true,"gamespeed":20,"max_obs":9},
	};  

var fpsLabel = document.getElementById("fpsLabel");
var canvas = document.getElementById("canvas"); 
var messageDiv = document.getElementById("message");
var attempts = document.getElementById("attempts");

var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
   
var createScene = function (){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	if (!webgl_detect())  
	{   
		document.getElementById("webGLwarning").style.display = "block";
		return;
	}
	
	if (BABYLON.Engine.isSupported())  
	{ 
		BABYLON.SceneLoader.ShowLoadingScreen = false; 
		BABYLON.Database.IDBStorageEnabled  = false;    
		    
		engine.disablePerformanceMonitorInBackground = true; 
		
		scene = new BABYLON.Scene(engine);  
		scene.clearColor = new BABYLON.Color4(1, 1, 1, 1); 
		scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);	    
		 
		//Adding a light 
		light = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.shadowEnabled = false;
		 
		//Adding an FreeCamera
		camera = new BABYLON.FreeCamera("camera1", BABYLON.Vector3.Zero(), scene);
		scene.activeCamera = camera;
		
		importAssets(); 
		
		music = new BABYLON.Sound("kinematicMusic", "./assets/Nintendo.mp3", scene, null, { loop: true });
		jumpS = new BABYLON.Sound("jump", "./assets/jump.mp3", scene, null, { loop: false, autoplay: false });
		runS = new BABYLON.Sound("run", "./assets/run.mp3", scene, null, { loop: true, autoplay: false });
		dieS = new BABYLON.Sound("run", "./assets/crash.mp3", scene, null, { loop: false, autoplay: false });
		music.setVolume(0.3);        
		 
		addGui();
	
		scene.registerBeforeRender(function() {  
			if(!engine.disablePerformanceMonitorInBackground){
				
				var delta = engine.getDeltaTime();  
				var deltap= delta * 30 /1000;

				runner.position.z -= settings[nivel].gamespeed * deltap;
				oldDist += settings[nivel].gamespeed * deltap;
				
				createEnv();
				createObs();
				dispose(); 
				 
				if(keys.up && runner.position.y<0){
					keys.up = !keys.up;
					if(canJump){ 
						runnerState = 2;
						scene.beginAnimation(runner.skeleton, 23, 53, false, 1, onEnd); //- run
						if(!muteSound){
							runS.stop();
							jumpS.play();
						}
					}
					canJump = false;
				}  
				if(keys.left){  
					keys.left = !keys.left;
					if(parseInt(Math.round(runner.position.x * 100) / 100) == 220) return; 
					
					if(parseInt(Math.round(runner.position.x * 100) / 100) == -110)
						//runner.position.addInPlace(new BABYLON.Vector3(220,0,0));
						go_to = runner.position.add(new BABYLON.Vector3(220,0,0));
					else
						//runner.position.addInPlace(new BABYLON.Vector3(110,0,0));
						go_to = runner.position.add(new BABYLON.Vector3(110,0,0));
				}
				if(keys.right){  
					keys.right = !keys.right;
					if(parseInt(Math.round(runner.position.x * 100) / 100) == -220) return; 
					if(parseInt(Math.round(runner.position.x * 100) / 100) == 110)
						go_to = runner.position.subtract(new BABYLON.Vector3(220,0,0)); 
						//runner.position.subtractInPlace(new BABYLON.Vector3(220,0,0));
					else
						go_to = runner.position.subtract(new BABYLON.Vector3(110,0,0));
						//runner.position.subtractInPlace(new BABYLON.Vector3(110,0,0));
				}
						
				go_to.z = runner.position.z;
				
				if(parseInt(Math.round(runner.position.x * 100) / 100) < -220)
					go_to.x = -220;
				if(parseInt(Math.round(runner.position.x * 100) / 100)  > 220)
					go_to.x = 220;
				
				runner.position = BABYLON.Vector3.Lerp(runner.position, go_to, scene.getAnimationRatio() * 0.5 );
			
				for(var i=0;i<array_obs.length;i++){
					if(runner.obs.intersectsMesh(array_obs[i])){
						
						runner.obs.position.z = 6;
						setTimeout(function(){runner.obs.position.z = 1}, 2000);
						 
						if(lives == 0){
							engine.disablePerformanceMonitorInBackground = true;
							runner.position.y = 3;
							runnerState = 3;
							clearInterval(interval);
							scene.beginAnimation(runner.skeleton, 55, 163, false, 1, onEnd2);
							if(!muteSound){
								runS.stop();
								jumpS.stop();
								dieS.play();
							}
						}else{
							lives--;
						}		
					}
				}
				
				if(time!=0 && nivel!=5){
					if(Date.now()-time>30000){
						nivel+=1;
						time = Date.now();
					}
				}
				UIScore._children[0].text = "Score: "+ score;
			} 
		}); 

		scene.executeWhenReady(function () { 
			document.getElementById("loading").style.display = "none"; 
			message("Press anywhere to START");
			sceneReady = true;
		}); 
		
		engine.runRenderLoop(function() { 
			if(scene){
				if(sceneReady) { 
					scene.render(); 
					fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
					attempts.innerHTML = lives;
				}else{
					loading(progress);
				} 
			} 
		});
	};   
}  

/// Show progress 
var loading = function(progress){
	var div = document.getElementById("loading");
	div.innerHTML = "Loading: "+progress+"%";
}

var onEnd = function(){
	canJump = true;
	runnerState = 1;
	scene.beginAnimation(runner.skeleton, 0, 21, true, 1); 	
	if(!muteSound){
		jumpS.stop();
		runS.play(); 
	}
}

var onEnd2 = function(){
	message("You lost. Press anywhere to TRY AGAIN");
	engine.disablePerformanceMonitorInBackground = true;
}

function addGui(){
	var GUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	UIScore = new BABYLON.GUI.Rectangle();
	UIScore.width = '20%';
	UIScore.height = '30px';    
	UIScore.top = '5px';     
	UIScore.thickness = 2; 
	UIScore.color = 'white'; 
	UIScore.background = 'transparent';
	UIScore.cornerRadius = 10;
	UIScore.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	UIScore.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	GUI.addControl(UIScore);
	
	var text = new BABYLON.GUI.TextBlock();
	text.text = "Score: 0";
	text.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER; 
	text.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	text.fontSize = "18px"; 
	text.color = "maroon";
	UIScore.addControl(text); 
}

/// Import scene assets
function importAssets(){
	
	BABYLON.SceneLoader.ImportMesh("", "./assets/", "env2.babylon", scene, function (m) {
		
		obs = m[0];
		obs.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
		midler = m[1];
		midler.position.y = 25;
		midler.scaling = new BABYLON.Vector3(0.9, 0.9, 0.9);
		env = m[2];
		for(var i=0;i<m.length;i++){ m[i].isVisible = false; }
	 
	}, function (evt) {
		progress = parseInt(((evt.loaded * 100 / evt.total)/2).toFixed());
    });
	 
	BABYLON.SceneLoader.ImportMesh("",  "./assets/", "runner3.babylon", scene, function (m,p,s) {	
		
		runner = m[0]; 
		runner.showBoundingBox = true;
		camera.parent = runner; 
		camera.position = new BABYLON.Vector3(0, -44, 30);
		camera.setTarget(new BABYLON.Vector3(0,15,0));
				
		var box = BABYLON.Mesh.CreateBox("box", 1.0, scene);
		box.attachToBone(s[0].bones[4], runner);
		box.scaling = new BABYLON.Vector3(4,4,3); 
		box.isVisible = false;
		box.position.z = 1; 
		runner.obs = box;   
		
	}, function (evt) { 
		progress = 50 + parseInt(((evt.loaded * 100 / evt.total)/2).toFixed()); 
    }); 	
} 

function init_game(){

	lives = 3;
	nivel = 1;
	time = Date.now();
	runnerState = 1;
	if(music) music.play();
	interval = setInterval(function(){score+= 3; },4000);
	for(var i=0;i<7;i++){make_env();}
	make_obs();
		
	runner.position = BABYLON.Vector3.Zero();
	runner.position.addInPlace(new BABYLON.Vector3(110,-25,100));
	go_to = runner.position; 
	
	scene.beginAnimation(runner.skeleton, 0, 21, true, 1); //- run
	if(!muteSound) runS.play();
	 
	engine.disablePerformanceMonitorInBackground = false; 
	
}

function clear_scene(){
	if(array_env.length>0){
		for(var i=0;i<array_env.length;i++){
			array_env[i]._children[1].dispose();
			array_env[i]._children[0].dispose();
			array_env[i].dispose()
		}
		array_env = [];
	}
	
	if(array_mid.length>0){
		for(var i=0;i<array_mid.length;i++){
			array_mid[i].dispose();
		}
		array_mid = [];
	}
	
	if(array_obs.length>0){
		for(var i=0;i<array_obs.length;i++){
			array_obs[i].dispose();
		}
		array_obs = [];
	}
}

function createEnv(){
	if((oldDist-offset)>0) {
		oldDist = 0; 
		make_env();
	}
}

function createObs(){
	if(oldDist%300 == 0) {
		make_obs(); 
	} 
}

function make_obs(){
	
	for(var i=0;i<getRandomInt(3,settings[nivel].max_obs);i++ ){
		var ob = obs.createInstance("ms1", scene);
		ob.position.x = getRandomInt(-2,2)*110;
		if(ob.position.x == 0) {
			ob.dispose();
			continue;
		}
		if(settings[nivel].overlay)
			ob.position.y = (getRandomInt(0,2)==0)?75:0;
		ob.position.z = array_env[array_env.length-1].position.z + getRandomInt(-300,300);
		array_obs.push(ob);
	}
	
	if(settings[nivel].mid){
		var ok = getRandomInt(0,5);
		if(ok==0){
			var ob2 = midler.createInstance("ms2", scene);
			ob2.position.z = array_env[array_env.length-1].position.z;
			
			array_mid.push(ob2);
		}
	}
}

function make_env(){
	var group = new BABYLON.Mesh("group", scene);
	var ms1 = env.createInstance("ms1", scene);
	ms1.position.x = -41;
	ms1.parent = group;
	var ms2 = env.createInstance("ms1", scene);
	ms2.position.x = 41;
	ms2.rotation.y = Math.PI;
	ms2.parent = group;
	
	var newpos = (array_env.length == 0)?BABYLON.Vector3.Zero():array_env[array_env.length-1].position.clone();
	group.position = (array_env.length == 0)?newpos:newpos.addInPlace(new BABYLON.Vector3(0,0,-680));
	  
	array_env.push(group);

}

function dispose(){
	if(array_env.length>0  && array_env[0].position.z>(runner.position.z+offset)){
		array_env[0]._children[1].dispose();
		array_env[0]._children[0].dispose();
		array_env[0].dispose();
		array_env.shift();
	}
	
	if(array_mid.length>0 && array_mid[0].position.z>(runner.position.z+offset)){
		array_mid[0].dispose();
		array_mid.shift();
	}
	
	if(array_obs.length>0 && array_obs[0].position.z>(runner.position.z+offset)){
		array_obs[0].dispose();
		array_obs.shift();
	}
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function message(text){
	messageDiv.childNodes[0].innerHTML = text;
	messageDiv.style.display = "block";
}

//WEBGL DETECT
function webgl_detect() {
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

//key down functions
window.addEventListener("keydown", handleKeyDown, false);

var keys = {left:false, right:false, up:false};
function handleKeyDown(evt){   
    if (evt.keyCode==37){ keys.left = true; }
    if (evt.keyCode==38){ keys.up = true; }
    if (evt.keyCode==39){ keys.right = true; }   
}

// swipe function
let touchstartX = 0, touchstartY = 0, touchendX = 0, touchendY = 0;

canvas.addEventListener('touchstart', function(event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
}, false);
canvas.addEventListener('touchend', function(event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
}, false); 

function handleGesture() {
    if (touchendX <= touchstartX && (touchstartX-touchendX>10)) { keys.left = true; return; }
    if (touchendX >= touchstartX && (touchendX-touchstartX>10)) { keys.right = true; return; }
    if (touchendY <= touchstartY && (touchstartY-touchendY>5)) { keys.up = true; return; }
}

window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);

//lost focus on page
// register to the W3C Page Visibility API
var hidden=null;
var visibilityChange=null;
if (typeof document.mozHidden !== "undefined") {
  hidden="mozHidden";
  visibilityChange="mozvisibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden="msHidden";
  visibilityChange="msvisibilitychange";
} else if (typeof document.webkitHidden!=="undefined") {
  hidden="webkitHidden";
  visibilityChange="webkitvisibilitychange";
} else if (typeof document.hidden !=="hidden") { 
  hidden="hidden";
  visibilityChange="visibilitychange";
}
if (hidden!=null && visibilityChange!=null) {
	document.addEventListener(visibilityChange, function(event) {
		if(!pause)
			engine.disablePerformanceMonitorInBackground = document[hidden];
	});
}

messageDiv.onclick = function () { 
	if(pause) {
		pause = engine.disablePerformanceMonitorInBackground = false;
	} 
	else
	{ 
		clear_scene(); init_game(); 
	}
	messageDiv.style.display = "none";	
}

document.getElementById("pause").onclick = function () { 
	message("The game is paused.");
	pause = engine.disablePerformanceMonitorInBackground = true;	
}

document.getElementById("music").onclick = function () { 
	if(music){
		if(music.isPlaying){
			music.stop();
		}else{
			music.play();
		}
	}	
}

document.getElementById("sound").onclick = function () { 
	muteSound = !muteSound;
	if(muteSound){
		switch (runnerState){
			case 1:
				runS.stop();
				break;
			case 2:
				jumpS.stop();
				break;
			case 3:
				dieS.stop();
				break;
		}
	}else{
		switch (runnerState){
			case 1:
				runS.play();
				break;
			case 2:
				jumpS.play();
				break;
			case 3:
				dieS.play();
				break;
		}
	}	
}

createScene();