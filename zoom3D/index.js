
var scene, light, camera, cameraView;
var ready = false, isMobile = false;
var viewH = viewW = 0.3;


var fpsLabel = document.getElementById("fpsLabel");
var canvas = document.getElementById("canvas"); 
var engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
		
_init();  
   
function _init(){
	if (typeof(window.orientation) != "undefined") isMobile = true;
	
	if (!webgl_detect())  
	{   
		document.getElementById("webGLwarning").style.display = "block";
		return;
	}
	
	document.getElementById("loadingScene").style.display = "block";
	
	if (BABYLON.Engine.isSupported())
	{    
		BABYLON.SceneLoader.ShowLoadingScreen = false;
		BABYLON.Database.IDBStorageEnabled  = false;
		
		scene = new BABYLON.Scene(engine);  
		scene.clearColor = new BABYLON.Color4(1, 1, 1, 0); 
					
		light = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), scene);
		light.diffuse = new BABYLON.Color3(0.5, 0.5, 0.5);
		light.specular = new BABYLON.Color3(0, 0, 0); 
		light.groundColor = new BABYLON.Color3(1, 1, 1);

		camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI/2, Math.PI/2, 350, BABYLON.Vector3.Zero(), scene);
		camera.lowerRadiusLimit = camera.upperRadiusLimit = 350;
		camera.attachControl(canvas, true);
		
		
		camera.layerMask = 1;		
       
		cameraView = new BABYLON.ArcRotateCamera("ArcRotateCamera", -Math.PI/2, Math.PI/2, 100, BABYLON.Vector3.Zero(), scene);
		cameraView.attachControl(canvas,false);
		cameraView.viewport=new BABYLON.Viewport(0,0,viewW,viewH);
		cameraView.lowerRadiusLimit = cameraView.upperRadiusLimit = 100;
		cameraView.layerMask = 2;
		cameraView.fov = 0.2;
		
		scene.activeCameras.push(camera);
		scene.activeCameras.push(cameraView);
		 
		importMesh();   
		
		scene.cameraToUseForPointers = camera;
		
		engine.runRenderLoop(function () {
			fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";
			if(scene.isReady()) {
				if(!ready){
					document.getElementById("loadingScene").style.display = "none"; 
					ready = !ready; 
				}
				scene.render();
			}
			cameraView.position = camera.position;
		});
		
		scene.constantlyUpdateMeshUnderPointer = true;
		scene.onPointerObservable.add(function (evt) {
			var x = evt.event.clientX / window.innerWidth - viewW/2;
			var y = 1-evt.event.clientY / window.innerHeight  - viewH/2;
			cameraView.viewport.x = x;
			cameraView.viewport.y = y; 
			
			if (evt.pickInfo.pickedPoint!=null) {
				cameraView.setTarget(evt.pickInfo.pickedPoint);
			}else{
				scene.activeCamera = camera;
			}
		}, BABYLON.PointerEventTypes.POINTERMOVE);	
			
	}
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

window.addEventListener("resize", function() { engine.resize();});
window.addEventListener( "contextmenu", function(e) {e.preventDefault();}, false);  

function importMesh()
{ 
	BABYLON.SceneLoader.ImportMesh("", "./Binary/", "moto.binary.babylon", scene, function (m) {
			
		scene.executeWhenReady(function () {
			var car = scene.meshes[0];
			car.scaling = new BABYLON.Vector3(0.045, 0.045, 0.045);   
	
			setTimeout(function(){ document.getElementById("loadingScene").style.display = "none"; noRender = false;}, 2000);    
		}); 
	});  
}
