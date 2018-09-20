var progress = 0, sceneReady = false, isMobile = false;
var scene, music, postProcess, UI, camera, camerado;

const fpsLabel = document.getElementById('fpsLabel')
const canvas = document.getElementById('canvas')
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })
 
var Sfullscreen = false, Ssound = true, Smenu = false, Sinfo = false, Sabout = false; Svr = false; Sdo = false;

_init();
    
function _init(){ 
	if (!BABYLON.Engine.isSupported())  
	{   
		document.getElementById("error").style.display = "block";
		$("#error>.follow").animate({bottom: '0px'}, "slow");
		return;
	}else{
		document.getElementById("loader").style.display = "block";
		$("#loader>.follow").animate({bottom: '0px'}, "slow", ()=>{create_scene();});
	} 
}  

function menu(){
	//true change color when is close
	arrows(".footer_click", ".bottom_banner");
	arrows(".header_click", ".top_banner");
	
	showDivInfo("about", Sabout);
	showDivInfo("info", Sinfo); 

	$("#fullscreen").click(function(){
		engine.switchFullscreen(true);
	});
	
	$("#sound").click(function(){
		Ssound = !Ssound
		if (Ssound === true) {
			music.play()
		}
		else {
			music.pause()
		}
	}); 
	
	$("#tablet").click(function(){
		Sdo = !Sdo;
		if(camerado){
			if(Sdo){
				camera.detachControl(canvas);
				scene.activeCamera = camerado;  
			}else{ 
				camera.attachControl(canvas, true);
				scene.activeCamera = camera; 
			}
		}
	});
	
	$("#menu").click(function(){
		
	}); 
	
	if(!isMobile){
		$("#tablet").css("color","#7a7a7a").css("cursor","auto");
	}
}

function showDivInfo(str, param){
	$("#"+str).click(function(){
		param = !param;
		if(param) 
			$("."+str).animate({bottom: '0px'}, "slow").show();
		else
			$("."+str).animate({bottom: -$("."+str)[0].offsetHeight+'px'}, "slow",()=>{$("."+str).hide();});
	});
	$("."+str).click(function(){param = !param;$("."+str).animate({bottom: -$("."+str)[0].offsetHeight+'px'}, "slow",()=>{$("."+str).hide();});});
}

function arrows(str1, str2, changeColor = false){
	$(str1).click(function(){ 
		if($(str1+" i").hasClass("fa-chevron-circle-right")){
		$(str2).animate({right: -screen.width+"px"}, "slow", ()=>{
				$(str1+" i").addClass("fa-chevron-circle-left");
				$(str1+" i").removeClass("fa-chevron-circle-right");
				$(str2).hide();
				if(changeColor) $(str1).css("color","black"); 				
			});
		}else{
			$(str2).animate({right: '0px'}, "slow", ()=>{
				$(str1+" i").addClass("fa-chevron-circle-right");
				$(str1+" i").removeClass("fa-chevron-circle-left");
				if(changeColor) $(str1).css("color","white");
			}).show();	
		}
	});
}

function create_scene(){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	BABYLON.SceneLoader.ShowLoadingScreen = false; 
	BABYLON.Database.IDBStorageEnabled  = false;    
		
	scene = new BABYLON.Scene(engine)
    engine.setHardwareScalingLevel(0.5)
  
    const options = new BABYLON.SceneOptimizerOptions(50, 2000)
    options.addOptimization(new BABYLON.HardwareScalingOptimization(0, 1))
  
    const optimizer = new BABYLON.SceneOptimizer(scene, options)
    optimizer.start()

	var VRHelper = scene.createDefaultVRExperience({rayLength:1000, useCustomVRButton: true, customVRButton: document.getElementById("vr")});
    VRHelper.enableInteractions();
 
	VRHelper.onExitingVR.add(function(){
		VRHelper._deviceOrientationCamera = (Sdo == true && camerado) ? camerado : camera;
	});
	
    importAssets()
	menu()

    engine.runRenderLoop(function () {
		if(scene){
			if(sceneReady) { 
				scene.render(); 
				fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
			}else{
				loading(progress); 
				var remaining = scene.getWaitingItemsCount();
				if (remaining === 0) { 
					sceneReady = true;
					document.getElementById("loader").style.display = "none"; 
					document.getElementById("content").style.display = "block";
				}    
			} 
		} 
    })
}  

/// Show progress 
var loading = function(progress){
	var div = document.getElementById("loading");
	div.innerHTML = "Loading assets: "+progress+"%";
} 
  
function importAssets () { 
	BABYLON.SceneLoader.ImportMesh('', './girl2/', 'girl.gltf', scene, function (m, p, s) {
	sceneSettings()
	music = new BABYLON.Sound('music', './INNA-Nirvana.mp3', scene, function () {music.play()}, { loop: true });
	music.setVolume(0.8);
  }, 
  function (evt) {
    progress = (evt.loaded * 100 / evt.total).toFixed()
  })
}  

function sceneSettings () {
  scene.createDefaultCameraOrLight(true, true, true)

  camera = scene.activeCamera
  scene.lights[0].intensity = 3
  scene.activeCamera.upperBetaLimit = 1.5
  scene.activeCamera.lowerRadiusLimit = 60
  scene.activeCamera.upperRadiusLimit = 200
  scene.activeCamera.wheelPrecision = 10
  scene.activeCamera.alpha = 2.5 
  scene.activeCamera.beta = 1.5

  if(isMobile){
	camerado = new BABYLON.DeviceOrientationCamera("DevOr_camera", new BABYLON.Vector3(-120, 45, 150), scene);
	camerado.attachControl(canvas, false); 
	camerado.keysUp = camerado.keysDown = camerado.keysLeft = camerado.keysRight = [];
  }

  var pipeline = new BABYLON.DefaultRenderingPipeline("pipeline", false, scene, scene.cameras)
  // console.log(pipeline)
  if(pipeline.isSupported){
	pipeline.fxaaEnabled = true;
	if(pipeline.fxaaEnabled){
		pipeline.fxaa.samples = 32; //1 by default
		pipeline.fxaa.adaptScaleToCurrentViewport = false; //false by default
	}
    //MSAA
	pipeline.samples = 0; //1 by default
  }
  
  const helper = scene.createDefaultEnvironment({
	skyboxColor: new BABYLON.Color3(1, 1, 1),
    groundColor: new BABYLON.Color3(1, 1, 1)
  })
}

// EVENT-URI
window.addEventListener('resize', function () { engine.resize() })
window.addEventListener( 'contextmenu', function (e) { e.preventDefault() }, false)