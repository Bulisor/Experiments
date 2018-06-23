var progress = 0, sceneReady = false
var isMobile = false, enableEffect = false, startCredits = false
var scene, light, ambientLight, postProcess, UI, FREEModeCamera, KINEMATICModeCamera

var DRIVEModeCameras = [], driveCamIndex = 0, picker, colorButons = [], sounds = [], decal  
var car, wheels = [], doors = [], buttonColor = 1, textADT, creditsText  
var categ = ['door_lf_pivot', 'door_rf_pivot', 'boot', 'bonnet', 'decal'], mobile_buttons, UIMob, decalTextures = []
var openLdoor = false, openRdoor = false, openHood = false, openBags = false, actualDecal = 0 

var mod = {
  FREE: 1, 
  DRIVE: 2,
  KINEMATIC: 3,
} 

var actualMod = mod.FREE 

var fpsLabel = document.getElementById('fpsLabel')
var canvas = document.getElementById('canvas') 
var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true })

var AMG, control = new Control
   
var Sfullscreen = false, Ssound = false, Smenu = false, Sinfo = false, Sabout = false

_init()
    
function _init() { 
	if (!BABYLON.Engine.isSupported())
	{   
		document.getElementById('error').style.display = 'block'
		$('#error>.follow').animate({bottom: '0px'}, 'slow')
		return
	}else{
		document.getElementById('error').style.display = 'block'
		$('#error>.follow').animate({bottom: '0px'}, 'slow', ()=>{create_scene()})
	} 
}  

function menu(){
	//true change color when is close
	arrows('.footer_click', '.bottom_banner')
	arrows('.header_click', '.top_banner')
	
	showDivInfo('about', Sabout)
	showDivInfo('info', Sinfo) 

	$('#vr').click(function(){
		//todo
		if(actualMod == mod.FREE)
		{
			console.log('only free - TODO')
		}
	})
	
	$('#fullscreen').click(function(){
		engine.switchFullscreen(true)
	})
	
	$('#sound').click(function(){
		
	}) 
	
	$('#menu').click(function(){
		
	}) 
}

function showDivInfo(str, param){
	$('#'+str).click(function(){
		param = !param
		if(param) 
			$('.'+str).animate({bottom: '0px'}, 'slow').show()
		else
			$('.'+str).animate({bottom: -$('.'+str)[0].offsetHeight+'px'}, 'slow',()=>{$('.'+str).hide()})
	})
	$('.'+str).click(function(){param = !param$('.'+str).animate({bottom: -$('.'+str)[0].offsetHeight+'px'}, 'slow',()=>{$('.'+str).hide()})})
}

function arrows(str1, str2, changeColor = false){
	$(str1).click(function(){ 
		if($(str1+' i').hasClass('fa-chevron-circle-right')){
		$(str2).animate({right: -screen.width+'px'}, 'slow', ()=>{
				$(str1+' i').addClass('fa-chevron-circle-left')
				$(str1+' i').removeClass('fa-chevron-circle-right')
				$(str2).hide()
				if(changeColor) $(str1).css('color','black') 				
			})
		}else{
			$(str2).animate({right: '0px'}, 'slow', ()=>{
				$(str1+' i').addClass('fa-chevron-circle-right')
				$(str1+' i').removeClass('fa-chevron-circle-left')
				if(changeColor) $(str1).css('color','white')
			}).show()	
		}
	})
}

function create_scene(){
	if (typeof(window.orientation) != 'undefined') isMobile = true
	
	BABYLON.SceneLoader.ShowLoadingScreen = false 
	BABYLON.Database.IDBStorageEnabled  = false    
		
	scene = new BABYLON.Scene(engine)  
	scene.clearColor = new BABYLON.Color4(1, 1, 1, 0) 
	
	setting_lights()   
	setting_cameras() 
	importMesh2()
	menu()

	engine.runRenderLoop(function() { 
		if(scene){
			if(sceneReady) { 
				scene.render() 
				fpsLabel.innerHTML = engine.getFps().toFixed() + ' fps'
			}else{
				loading(progress) 
				var remaining = scene.getWaitingItemsCount()
				// if (remaining === 0) { 
					// sceneReady = true
					// document.getElementById('loader').style.display = 'none' 
					// document.getElementById('content').style.display = 'block'
				// }    
			} 
		} 
	})
}  

/// Show progress 
var loading = function(progress){
	var div = document.getElementById('loading')
	div.innerHTML = 'Loading assets: '+progress+'%'
} 
  
function importMesh2(){ 
	
	BABYLON.SceneLoader.ImportMesh('', '/_assets/demos/car_config/', 'amg_pbr3.babylon', scene, function (m,p,s) {
		 
		//console.log(m) 
		
		car = m[0]
		car.scaling = new BABYLON.Vector3(45,45,45)   
		
		console.log(scene.materials)
		//console.log(scene.meshes)
		
		for(var i=0; i<scene.materials.length; i++){
			console.log(i, scene.materials[i].name)
		}
		
		wheels.push(m[3], m[5], m[2], m[4])
		
		var hdr = new BABYLON.HDRCubeTexture('/_assets/demos/car_config/res/txt.hdr', scene, 1024)
		scene.environmentTexture = hdr
		scene.imageProcessingConfiguration.contrast = 1.5
		scene.imageProcessingConfiguration.exposure = 2
		scene.imageProcessingConfiguration.toneMappingEnabled = true
			
		amg = new Car(car)   
		
	}, function (evt) {
		progress = (evt.loaded * 100 / evt.total).toFixed()
    })
}  

function importMesh(){  

	BABYLON.SceneLoader.ImportMesh('', '/_assets/demos/car_config/', 'amg_pbr2.babylon', scene, function (m,p,s) {
		   
		car = m[0]
		car.scaling = new BABYLON.Vector3(45,45,45)   
		
		//console.log(scene.materials)
		//console.log(scene.meshes)
		
		wheels.push(m[3], m[5], m[2], m[4])
		doors.push(m[15], m[16], m[21], m[22])
		set_animation([m[15], m[16], m[21], m[22]])
		
		var hdr = new BABYLON.HDRCubeTexture('/_assets/demos/car_config/res/txt.hdr', scene, 1024)
		scene.environmentTexture = hdr
		//scene.imageProcessingConfiguration.contrast = 1.5
		//scene.imageProcessingConfiguration.exposure = 2
		//scene.imageProcessingConfiguration.toneMappingEnabled = true
			 
		amg = new Car(car)
		   
		enableEffect = true
			
	}, function (evt) {
		progress = (evt.loaded * 100 / evt.total).toFixed()
    })
}  

function removeDuplicates()
{
	var mat = []
	var mats = []
	for(var i=0;i<scene.materials.length;i++){
		if(mat[scene.materials[i].name] !== undefined)
			mats.push(scene.materials[i])
		else
			mat[scene.materials[i].name] = 0	
	}
	
	var k = mats.length-1
	while(k>=0)
	{
		mats[k].dispose()
		k--
	}
	mats = []
	delete mat
	
	var txt = []
	var txts = []
	for(var i=0;i<scene.textures.length;i++){
		if(txt[scene.textures[i].name] !== undefined)
			txts.push(scene.textures[i])
		else
			txt[scene.textures[i].name] = 0	
	}
	
	var k = txts.length-1
	while(k>=0)
	{
		txts[k].dispose()
		k--
	}
	txts = []
	delete txt
}   

// ADD LIGHTS AND FUNCTIONALITY
function setting_lights(){
	
	light = new BABYLON.DirectionalLight('Dir0', new BABYLON.Vector3(0, -1, 0), scene)
	light.diffuse = new BABYLON.Color3(1, 1, 1)
	light.specular = new BABYLON.Color3(1, 1, 1)   

	ambientLight = new BABYLON.HemisphericLight('Hemi0', new BABYLON.Vector3(0, 1, 0), scene)
	ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5)
	ambientLight.specular = new BABYLON.Color3(0, 0, 0) 
	ambientLight.groundColor = new BABYLON.Color3(1, 1, 1)
}

// ADD CAMERAS AND FUNCTIONALITY
function setting_cameras(){
	 
	FREEModeCamera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0, 0, new BABYLON.Vector3(0,10,0), scene)
	FREEModeCamera.setPosition(new BABYLON.Vector3(-175, 50, -205))
	FREEModeCamera.upperBetaLimit = Math.PI/2 
	FREEModeCamera.lowerBetaLimit = -Math.PI/18 
	FREEModeCamera.lowerRadiusLimit = 140  
	FREEModeCamera.upperRadiusLimit = 400
	FREEModeCamera.panningSensibility = 0	

	scene.activeCamera = FREEModeCamera   
	scene.activeCamera.attachControl(canvas, false)  
	
	//fix strange wite lines - antialiasing
	var postProcess = new BABYLON.FxaaPostProcess('fxaa', 1.0, scene.activeCamera)
	 
	var cam1 =  new BABYLON.FreeCamera('Cam_amg',new BABYLON.Vector3(-175, 50, -205),scene)
	cam1.rotation = BABYLON.Vector3.Zero() 
		
	var cam2 = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(0, 50, -50), scene)
	cam2.radius = 220     
	cam2.heightOffset = 70     
	cam2.cameraAcceleration = 0.05  
	
	var cam3 =  new BABYLON.FreeCamera('Cam_amg',new BABYLON.Vector3(0.43, 0.45, 0.4),scene)
	cam3.rotation = new BABYLON.Vector3(0.15, Math.PI, 0)     
	cam3.minZ = 0
	    
	DRIVEModeCameras.push(cam1, cam2, cam3)    
	
	KINEMATICModeCamera = new BABYLON.FreeCamera('KINEMATICModeCamera',new BABYLON.Vector3(-175, 50, -205),scene)
	KINEMATICModeCamera.rotation = BABYLON.Vector3.Zero()  
	
		
	//todo
	/*
	var VRHelper = scene.createDefaultVRExperience({rayLength:1000, useCustomVRButton: true, customVRButton: document.getElementById('vr')})
	VRHelper.enableInteractions()

	VRHelper.onNewMeshSelected.add(function(mesh) {
		if(mesh.index != null){
			index = mesh.index
			setCamAnimation()
		}
	})

	VRHelper.onExitingVR.add(function(){
		VRHelper._deviceOrientationCamera = FREEModeCamera
	})
	*/	
} 

// EVENT-URI
window.addEventListener('resize', function() { engine.resize()})
window.addEventListener( 'contextmenu', function(e) {e.preventDefault()}, false)
