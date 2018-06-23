let Manager = {
	scene: null,
	engine: null,
	canvas: null,
	isMobile: false,
	fpsLabelDiv: null,
	contentDiv: null,
	loaderDiv: null,
	loadingDiv: null,
	FREEModeCamera: null,
	DRIVEModeCameras: [],
	KINEMATICModeCamera: null,
	init(params) {
		if (typeof(window.orientation) != 'undefined') {
			this.isMobile = true
		}
		
		this.loadingDiv = params[0]
		this.canvas = params[1]
		this.fpsLabelDiv = params[2]
		this.contentDiv = params[3]
		this.loaderDiv = params[4]
		
		BABYLON.SceneLoader.ShowLoadingScreen = false 
		BABYLON.Database.IDBStorageEnabled  = false    
		
		this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true })
		this.scene = new BABYLON.Scene(this.engine)  
		this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 0) 
		
		this.setting_lights()   
		this.setting_cameras() 
		this.importMesh()
		
		const _this = this
		this.engine.runRenderLoop(function() { 
			if(_this.scene){
				if(_this.sceneReady) { 
					_this.scene.render() 
					_this.fpsLabelDiv.innerHTML = _this.engine.getFps().toFixed() + ' fps'
				}else{
					_this.loadingDiv.innerHTML = 'Loading assets: ' + _this.progress + '%'
					var remaining = _this.scene.getWaitingItemsCount()
					if (remaining === 0) { 
						_this.sceneReady = true
						_this.loaderDiv.style.display = 'none' 
						_this.contentDiv.style.display = 'block'
					}    
				} 
			} 
		})
	},
	
	importMesh(){ 
		const _this = this
		BABYLON.SceneLoader.ImportMesh('', './', 'amg_pbr3.babylon', _this.scene, function (m,p,s) {
				 
			console.log(m) 
			return
			/*
			_this.car = m[0]
			_this.car.scaling = new BABYLON.Vector3(45,45,45)   
			
			// console.log(scene.materials)
			//console.log(scene.meshes)
			
			for(var i=0; i<scene.materials.length; i++){
				// console.log(i, scene.materials[i].name)
			}
			
			wheels.push(m[3], m[5], m[2], m[4])
			
			var hdr = new BABYLON.HDRCubeTexture('/_assets/demos/car_config/res/txt.hdr', scene, 1024)
			scene.environmentTexture = hdr
			scene.imageProcessingConfiguration.contrast = 1.5
			scene.imageProcessingConfiguration.exposure = 2
			scene.imageProcessingConfiguration.toneMappingEnabled = true
				
			amg = new Car(car)   
			*/
		}, function (evt) {
			_this.progress = (evt.loaded * 100 / evt.total).toFixed()
		})
	},

	removeDuplicates(){
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
	}, 

	// ADD LIGHTS AND FUNCTIONALITY
	setting_lights(){
		
		const light = new BABYLON.DirectionalLight('Dir0', new BABYLON.Vector3(0, -1, 0), this.scene)
		light.diffuse = new BABYLON.Color3(1, 1, 1)
		light.specular = new BABYLON.Color3(1, 1, 1)   

		const ambientLight = new BABYLON.HemisphericLight('Hemi0', new BABYLON.Vector3(0, 1, 0), this.scene)
		ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5)
		ambientLight.specular = new BABYLON.Color3(0, 0, 0) 
		ambientLight.groundColor = new BABYLON.Color3(1, 1, 1)
	},

	// ADD CAMERAS AND FUNCTIONALITY
	setting_cameras() {
		 
		this.FREEModeCamera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0, 0, new BABYLON.Vector3(0,10,0), this.scene)
		this.FREEModeCamera.setPosition(new BABYLON.Vector3(-175, 50, -205))
		this.FREEModeCamera.upperBetaLimit = Math.PI/2 
		this.FREEModeCamera.lowerBetaLimit = -Math.PI/18 
		this.FREEModeCamera.lowerRadiusLimit = 140  
		this.FREEModeCamera.upperRadiusLimit = 400
		this.FREEModeCamera.panningSensibility = 0	

		this.scene.activeCamera = this.FREEModeCamera   
		this.scene.activeCamera.attachControl(this.canvas, false)  
		
		//fix strange wite lines - antialiasing
		var postProcess = new BABYLON.FxaaPostProcess('fxaa', 1.0, this.scene.activeCamera)
		 
		var cam1 =  new BABYLON.FreeCamera('Cam_amg',new BABYLON.Vector3(-175, 50, -205), this.scene)
		cam1.rotation = BABYLON.Vector3.Zero() 
			
		var cam2 = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(0, 50, -50), this.scene)
		cam2.radius = 220     
		cam2.heightOffset = 70     
		cam2.cameraAcceleration = 0.05  
		
		var cam3 =  new BABYLON.FreeCamera('Cam_amg',new BABYLON.Vector3(0.43, 0.45, 0.4), this.scene)
		cam3.rotation = new BABYLON.Vector3(0.15, Math.PI, 0)     
		cam3.minZ = 0
			
		this.DRIVEModeCameras.push(cam1, cam2, cam3)    
		
		this.KINEMATICModeCamera = new BABYLON.FreeCamera('KINEMATICModeCamera',new BABYLON.Vector3(-175, 50, -205), this.scene)
		this.KINEMATICModeCamera.rotation = BABYLON.Vector3.Zero()  
		
			
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
}
