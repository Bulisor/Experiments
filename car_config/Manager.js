const Manager = {
	scene: null,
	engine: null,
	canvas: null,
	isMobile: false,
	progress: 0,
	fpsLabelDiv: null,
	contentDiv: null,
	loaderDiv: null,
	loadingDiv: null,
	vrDiv: null,
	FREEModeCamera: null,
	DRIVEModeCameras: [],
	CINEMATICModeCamera: null,
	DeviceOrientCamera: null,
	mod: {
	  FREE: 1, 
	  DRIVE: 2,
	  KINEMATIC: 3
	},
	actualMod: 0,
	driveCamIndex: 0,
	backgroundIndex: 0,
	sounds: [],
	backgrounds: [],
	amg: null,
	enableEffect: false,
	init(params) {
		if (typeof(window.orientation) != 'undefined') {
			this.isMobile = true
		}
		
		this.actualMod = this.mod.FREE
		
		this.loadingDiv = params[0]
		this.canvas = params[1]
		this.fpsLabelDiv = params[2]
		this.contentDiv = params[3]
		this.loaderDiv = params[4]
		this.vrDiv = params[5]
		
		BABYLON.SceneLoader.ShowLoadingScreen = false 
		BABYLON.Database.IDBStorageEnabled  = false    
		
		this.engine = new BABYLON.Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true })
		this.scene = new BABYLON.Scene(this.engine)  
		this.scene.clearColor = new BABYLON.Color4(1, 1, 1, 1)
		this.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0)
		this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP
		this.scene.fogDensity = 0.01
		
		this.setting_lights()
		this.setting_sounds()
		this.setting_cameras()
		this.setting_backgrounds()
		this.importMesh()
		
		const _this = this
		this.scene.registerBeforeRender(function () {  
			if (_this.actualMod == _this.mod.DRIVE) {
				_this.amg.updateCar(.05)
			}
			 
			if (_this.enableEffect){
				if (_this.scene.fogDensity>0) {   
					_this.scene.fogDensity-=0.0002
				}
				else {   
					_this.scene.fogDensity = 0
					_this.enableEffect = !_this.enableEffect 
				} 
			}
		})
		this.engine.runRenderLoop(function() { 
			if (_this.scene) {
				if (_this.sceneReady) { 
					_this.scene.render() 
					_this.fpsLabelDiv.innerHTML = _this.engine.getFps().toFixed() + ' fps'
				}
				else {
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
	
	resize () {
		this.engine.resize()
	},
	
	switchFullscreen () {
		this.engine.switchFullscreen(false)
	},
	
	switchDOCamera () {
		if (this.scene.activeCamera == this.FREEModeCamera) {
			this.FREEModeCamera.detachControl(this.canvas)
			this.scene.activeCamera = this.DeviceOrientCamera
		}
		else { 
			this.DeviceOrientCamera.attachControl(this.canvas, true)
			this.scene.activeCamera = this.FREEModeCamera
		}
	},
	
	toggleSounds () {
		let volume = 0
		for (let i = 0; i < this.sounds.length; i++) {
			let sVolume = this.sounds[i].getVolume()
			if (sVolume == 0) {
				volume = 0.3
			}
			this.sounds[i].setVolume(volume);
		}
	},
	
	setting_mode (newMod) {
		this.amg.car.position = BABYLON.Vector3.Zero()
		this.amg.car.rotation = BABYLON.Vector3.Zero() 
		
		this.driveCamIndex = 0
		this.enableEffect = true
		this.scene.fogDensity = 0.01
		this.scene.stopAnimation(this.CINEMATICModeCamera)
		this.sounds[this.sounds.length - 1].stop()
	
		this.actualMod = newMod
		switch (newMod) {   
			case 1:
				this.FREEModeCamera.alpha = 0
				this.FREEModeCamera.beta = 0
				this.FREEModeCamera.radius = 0
				this.FREEModeCamera.setPosition(new BABYLON.Vector3(-175, 50, -205))
			   
				this.scene.activeCamera = this.FREEModeCamera
				this.scene.activeCamera.attachControl(this.canvas, false)
				break
			case 2: 
				this.amg.carOrientation = 0
				this.amg.wheelOrientation = 0
				this.DRIVEModeCameras[this.driveCamIndex].position = new BABYLON.Vector3(-175, 50, -205)
				this.DRIVEModeCameras[this.driveCamIndex].rotation = BABYLON.Vector3.Zero()
				 
				this.scene.activeCamera.detachControl(this.canvas)
				this.scene.activeCamera = this.DRIVEModeCameras[this.driveCamIndex]
				break  
			case 3:
				this.CINEMATICModeCamera.position = new BABYLON.Vector3(-175, 50, -205)
				this.CINEMATICModeCamera.rotation = BABYLON.Vector3.Zero()
				this.CINEMATICModeCamera.lockedTarget = this.amg.car
					 
				this.scene.activeCamera.detachControl(this.canvas) 
				this.scene.activeCamera = this.CINEMATICModeCamera
					
				this.scene.beginAnimation(this.CINEMATICModeCamera, 0, 700, false, 0.5)
				break
		}  
	},
	
	importMesh () { 
		const _this = this
		BABYLON.SceneLoader.ImportMesh('', './car/', 'amg_pbr3.babylon', _this.scene, function (m,p,s) {
			m[0].scaling = new BABYLON.Vector3(45, 45, 45)   
			
			const wheels = [m[3], m[5], m[2], m[4]]
			var hdr = new BABYLON.HDRCubeTexture('./res/txt.hdr', _this.scene, 1024)
			_this.scene.environmentTexture = hdr
			_this.scene.imageProcessingConfiguration.contrast = 1.5
			_this.scene.imageProcessingConfiguration.exposure = 2
			_this.scene.imageProcessingConfiguration.toneMappingEnabled = true
				
			_this.amg = new Car(_this.scene, m[0], wheels)
			
			_this.DRIVEModeCameras[0].lockedTarget = _this.amg.car  
			_this.DRIVEModeCameras[1].lockedTarget = _this.amg.car  
			_this.DRIVEModeCameras[2].parent = _this.amg.car
			
			_this.enableEffect = true
		}, function (evt) {
			_this.progress = (evt.loaded * 100 / evt.total).toFixed()
		})
	},

	// ADD LIGHTS AND FUNCTIONALITY
	setting_lights () {
		const light = new BABYLON.DirectionalLight('Dir0', new BABYLON.Vector3(0, -1, 0), this.scene)
		light.diffuse = new BABYLON.Color3(1, 1, 1)
		light.specular = new BABYLON.Color3(1, 1, 1)   

		const ambientLight = new BABYLON.HemisphericLight('Hemi0', new BABYLON.Vector3(0, 1, 0), this.scene)
		ambientLight.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5)
		ambientLight.specular = new BABYLON.Color3(0, 0, 0) 
		ambientLight.groundColor = new BABYLON.Color3(1, 1, 1)
	},

	// ADD CAMERAS AND FUNCTIONALITY
	setting_cameras () {	 
		this.FREEModeCamera = new BABYLON.ArcRotateCamera('ArcRotateCamera', 0, 0, 0, new BABYLON.Vector3(0,10,0), this.scene)
		this.FREEModeCamera.setPosition(new BABYLON.Vector3(-175, 50, -205))
		this.FREEModeCamera.upperBetaLimit = Math.PI/2 
		this.FREEModeCamera.lowerBetaLimit = -Math.PI/18 
		this.FREEModeCamera.lowerRadiusLimit = 140  
		this.FREEModeCamera.upperRadiusLimit = 400
		this.FREEModeCamera.panningSensibility = 0	

		this.scene.activeCamera = this.FREEModeCamera   
		this.scene.activeCamera.attachControl(this.canvas, false)  
		
		var cam1 =  new BABYLON.FreeCamera('Cam_amg',new BABYLON.Vector3(-175, 50, -205), this.scene)
		cam1.rotation = BABYLON.Vector3.Zero() 
			
		var cam2 = new BABYLON.FollowCamera('FollowCam', new BABYLON.Vector3(0, 50, -50), this.scene)
		cam2.radius = 220     
		cam2.heightOffset = 70     
		cam2.cameraAcceleration = 0.05  
		
		var cam3 =  new BABYLON.FreeCamera('Cam_amg',new BABYLON.Vector3(20, 18, 15), this.scene)
		cam3.rotation = new BABYLON.Vector3(0.15, Math.PI, 0)     
		cam3.minZ = 0

		this.DRIVEModeCameras.push(cam1, cam2, cam3)    

		this.CINEMATICModeCamera = new BABYLON.FreeCamera('CINEMATICModeCamera',new BABYLON.Vector3(-175, 50, -205), this.scene)
		this.CINEMATICModeCamera.rotation = BABYLON.Vector3.Zero()  
		this.setKinematicAnimation()
		
		if (this.isMobile) {
			this.DeviceOrientCamera = new BABYLON.DeviceOrientationCamera("DevOr_camera", new BABYLON.Vector3(0, 16, 20), this.scene)
			this.DeviceOrientCamera.attachControl(this.canvas, false)
			this.DeviceOrientCamera.keysUp = this.DeviceOrientCamera.keysDown = this.DeviceOrientCamera.keysLeft = this.DeviceOrientCamera.keysRight = []
		}
		else {
			this.DeviceOrientCamera = new BABYLON.ArcRotateCamera("ArcRotateCamera", Math.PI/2, Math.PI/2, 1, new BABYLON.Vector3(0, 16, 20), this.scene);
			this.DeviceOrientCamera.attachControl(this.canvas,false)
			this.DeviceOrientCamera.lowerRadiusLimit = this.DeviceOrientCamera.upperRadiusLimit = 1
			this.DeviceOrientCamera.panningSensibility = 0;	
		}
		
		var VRHelper = this.scene.createDefaultVRExperience({rayLength:1000, useCustomVRButton: true, customVRButton: this.vrDiv, createDeviceOrientationCamera: false, trackPosition: true })
		VRHelper.enableInteractions()
		VRHelper.enableTeleportation({ floorMeshes: "BackgroundPlane" })
		VRHelper.onNewMeshSelected.add(function (mesh) {
			console.log('TODO: ',mesh)
		})
		VRHelper.onEnteringVR.add(function () {
			VRHelper.displayGaze = true
		})
		VRHelper.onExitingVR.add(function () {
			VRHelper.displayGaze = false
		})
	},
	
	setting_sounds () {
		const carStart = new BABYLON.Sound("carStart", "./res/CarStart.mp3", this.scene)
		const carHorn = new BABYLON.Sound("carHorn", "./res/CarHorn.mp3", this.scene)
		carStart.setVolume(0.3)
		carHorn.setVolume(0.3);    
		const kinematicMusic = new BABYLON.Sound("kinematicMusic", "./res/Nintendo.mp3", this.scene, null, { loop: true })
		kinematicMusic.setVolume(0.3)   
		this.sounds.push(carStart, carHorn, kinematicMusic)
	},  
	
	setting_backgrounds () {
		// "BackgroundPlane" - pt vr
		// this.backgrounds.push(carStart, carHorn, kinematicMusic)
		// backgroundIndex
		
		 var sky = new BABYLON.Mesh.CreateSphere("sp", 256, 1600, this.scene);
		 sky.position.y = 100;
		 sky.scaling.x = 2
		 sky.scaling.z = 2
		 
		 console.log(sky)
		const _this = this
		BABYLONX.ShaderBuilder.InitializeEngine();
        var SB = BABYLONX.ShaderBuilder;
        var SBP = BABYLONX.Shader.Print;
		var ik = 0
        var reflectPart = function(ref,nrm,scale,brk,x,y,z,bias){
                ik++;
          return 'vec3 new_nrm'+ik+' = '+nrm+';\
                vec3 vr'+ik+' = normalize( refract(  normalize(camera -pos*3.141592*length(camera- pos)*'+SBP(scale)
                +')  ,  new_nrm'+ik+', '+SBP(brk)+') ); \
                float y'+ik+'= .5+  - atan( '+SBP(z)+'*vr'+ik+'.z,    '+SBP(x)+'*vr'+ik+'.x ) / (2.*3.141592);\
                float p'+ik+'= 0.5  - atan( '+SBP(y)+'*vr'+ik+'.y, length( vr'+ik+'.xz ) ) / ( 3.141592);\
                result = texture(  '+ref+', vec2( y'+ik+', p'+ik+') ,'+SBP(bias)+' );\
                ';
        };
		// http://www.babylonjs-playground.com/#JUVAGS#6
		// http://www.babylonjs-playground.com/#VE6GP#4
        sky.material = new SB()
        .Solid()
        .Map({path:'./res/env4.jpg'})
        .InLine( reflectPart('txtRef_0','nrm',0.02,-0.94,1.,1.,1.,0.0))
            .VertexShader('\
            \
            nrm = normalize(pos);\
             float pr = min(1.,max(0.,(-pos.y/830.) ));\
            float pr2 = min(1.,max(0.,(-pos.y/530.-0.5) ));\
            float pr3 = min(1.,max(0.,(-pos.y/1330. ) ));\
             \
            result = vec4(pos+vec3(0.,pr*420.,0.)+vec3(0.,pr2*210.,0.) +vec3(0.,pr3*70.,0.) ,1.);')
        .Back()
        .Front('discard;')
        .BuildMaterial(this.scene);
	},
	
	setKinematicAnimation () {
		var animationCam = new BABYLON.Animation("Cinematique_Part01", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
		var a = [];
		a.push({ 
			frame : 0,
			value : new BABYLON.Vector3(-175, 50, -205) 
		}),
		a.push({
			frame : 60,
			value : new BABYLON.Vector3(-50, 15, -150) 
		}), 
		a.push({
			frame : 120, 
			value : new BABYLON.Vector3(-155, 80, 205)
		}),
		a.push({ 
			frame : 180,
			value : new BABYLON.Vector3(0, 400, 500) 
		}),
		a.push({
			frame : 240, 
			value : new BABYLON.Vector3(50, 15, 20)      
		}),  
		a.push({
			frame : 300,   
			value : new BABYLON.Vector3(-20, 10, 25)      
		}),  
		a.push({    
			frame : 360,  
			value : new BABYLON.Vector3(400, 50, 0) 
		}),
		a.push({
			frame : 420,
			value : new BABYLON.Vector3(0, 200, -205)
		}), 
		a.push({
			frame : 560, 
			value : new BABYLON.Vector3(0, 500, -500)       
		}),   
		a.push({ 
			frame : 700,  
			value : new BABYLON.Vector3(-175, 50, -205) 
		}),
		animationCam.setKeys(a)
		
		var qe = new BABYLON.QuadraticEase
		qe.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
		animationCam.setEasingFunction(qe)

		this.CINEMATICModeCamera.animations.push(animationCam)
	} 
}
