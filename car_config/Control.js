var Control = (function () {
    function Control() {}
    Control.prototype.keyUp = function (key) {
        switch (key) {
            case 39:
                Control.moveLeft = false
                break
            case 40:
                Control.moveForward = false
                break
            case 37:
                Control.moveRight = false
                break
            case 38:
                Control.moveBackward = false
                break
        }
    };
    Control.prototype.keyDown = function (key) {
        switch (key) {
            case 39:
                Control.moveLeft = true
                break
            case 40:
                Control.moveForward = true
                break
            case 37:
                Control.moveRight = true
                break
            case 38:
                Control.moveBackward = true
                break
			case 66:
				if (Manager.actualMod == 1) {
					if (Manager.backgroundIndex == 2) {
						Manager.backgroundIndex = 0
					}
					else {
						Manager.backgroundIndex++
					}
                }
				break
			case 67:
				if (Manager.actualMod == 2) {
					if (Manager.driveCamIndex == 2) {
						Manager.driveCamIndex = 0
					}
					else {
						Manager.driveCamIndex++
					}
					Manager.amg.car.position = BABYLON.Vector3.Zero()
					Manager.amg.car.rotation = BABYLON.Vector3.Zero()
					Manager.scene.activeCamera = Manager.DRIVEModeCameras[Manager.driveCamIndex] 
                }
				break
			case 80:
				if (Manager.actualMod == 3) {
					BABYLON.Tools.CreateScreenshot(Manager.engine, Manager.scene.activeCamera, {precision: 1})
                }
				break
        }
    }
    Control.moveForward = false
    Control.moveBackward = false
    Control.moveLeft = false
    Control.moveRight = false
    return Control;
})(); 