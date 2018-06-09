// once everything is loaded, we run our Three.js stuff.
$(function () {

    var stats = initStats();

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xFFFFFF, 80, 260);

    // create a camera, which defines where we're looking at.
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // position and point the camera to the object
    camera.position.x = 30;
    camera.position.y = 15;
    camera.position.z = -35;

    // create a render and set the size
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xEEEEEE, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    // ground textures
    var sandTexture = THREE.ImageUtils.loadTexture("assets/textures/ground/sand.jpg");
    // repeat texture
    sandTexture.wrapS = THREE.RepeatWrapping;
    sandTexture.wrapT = THREE.RepeatWrapping;
    sandTexture.repeat.set(5, 5);

    var grassTexture = THREE.ImageUtils.loadTexture("assets/textures/ground/grass.jpg");
    grassTexture.wrapS = THREE.RepeatWrapping;
    grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(5, 5);

    var asphaltTexture = THREE.ImageUtils.loadTexture("assets/textures/ground/asphalt.jpg");
    asphaltTexture.wrapS = THREE.RepeatWrapping;
    asphaltTexture.wrapT = THREE.RepeatWrapping;
    asphaltTexture.repeat.set(8, 8);

    var chessTexture = THREE.ImageUtils.loadTexture("assets/textures/ground/chess.jpeg");
    chessTexture.wrapS = THREE.RepeatWrapping;
    chessTexture.wrapT = THREE.RepeatWrapping;
    chessTexture.repeat.set(5, 5);

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(500, 500, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({map: sandTexture});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;

    // add the plane to the scene
    scene.add(plane);

    // create the sky material
    var skyTexture = createCubeMap("day_sky");
    var shader = THREE.ShaderLib[ "cube" ];
    shader.uniforms[ "tCube" ].value = skyTexture;
    var skyMaterial = new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide
    });

    // load the sky texture
    function createCubeMap(name) {
        var path = "assets/textures/" + name + "/";
        var format = '.jpg';
        var urls = [
            path + 'posx' + format, path + 'negx' + format,
            path + 'posy' + format, path + 'negy' + format,
            path + 'posz' + format, path + 'negz' + format
        ];

        var textureCube = THREE.ImageUtils.loadTextureCube(urls);
        return textureCube;
    }

    // create the sky
    var skybox = new THREE.Mesh(new THREE.CubeGeometry(500, 500, 500), skyMaterial);

    // add the sky to the scene
    scene.add(skybox);

    //controls
    var orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    // zoom settings
    orbitControls.zoomSpeed = 1.0;
    orbitControls.minDistance = 10;
    orbitControls.maxDistance = 50;
    // rotation limit
    orbitControls.maxPolarAngle = 0.49 * Math.PI;
    // deactivate pan
    orbitControls.userPanSpeed = 0;
    orbitControls.userPan = false;

    var clock = new THREE.Clock();

    // create a group to contain the entire car
    var carGroup = new THREE.Object3D();
    scene.add(carGroup);
    // create a group to contain the car wheels
    var carWheelsGroup = new THREE.Object3D();
    carWheelsGroup.rotation.y = -0.5 * Math.PI;
    carGroup.add(carWheelsGroup);
    // create a group to contain the car body
    var carBodyGroup = new THREE.Object3D();
    carBodyGroup.rotation.y = -0.5 * Math.PI;
    carGroup.add(carBodyGroup);
    // create a group to contain the animatable car roof
    var carRoofGroup = new THREE.Object3D();
    carRoofGroup.rotation.y = -0.5 * Math.PI;
    carGroup.add(carRoofGroup);
    // create a group to contain the car lights
    var carLightsGroup = new THREE.Object3D();
    carLightsGroup.rotation.y = -0.5 * Math.PI;
    carGroup.add(carLightsGroup);

    // remember the vehicle on scene
    var onScene = carGroup;

    // general materials, used for both vehicle
    var wheels_texture = THREE.ImageUtils.loadTexture("assets/textures/wheel.jpg");
    var wheels_material = new THREE.MeshLambertMaterial({map: wheels_texture, color: 0x1F1F1F});
    var lights_material = new THREE.MeshBasicMaterial({color: 0xffffff, transparent: true});

    // general geometry, used for both vehicle
    var front_lights_geometry = new THREE.SphereGeometry(1, 8, 8);
    var body_geometry = new THREE.CubeGeometry(1, 1, 1);
    var wheels_geometry = new THREE.CylinderGeometry(1, 1, 1, 16);

    // car materials  
    var car_texture = THREE.ImageUtils.loadTexture("assets/textures/car.png");
    var car_body_material = new THREE.MeshPhongMaterial({color: 0x610000, map: car_texture, specular: 0x505050, shininess: 50});
    var car_fenders_material = new THREE.MeshPhongMaterial({color: 0x39190f, specular: 0x505050, shininess: 50});
    var car_number_material = new THREE.MeshLambertMaterial({color: 0x3AF0B9});
    var car_windshield_material = new THREE.MeshPhongMaterial({color: 0xadadad, transparent: true, opacity: 0.5, specular: 0x505050});

    // car specific geometry
    var car_windshield_geometry = new THREE.CylinderGeometry(0.8, 0.8, 2.5, 3);
    var car_roof_geometry = new THREE.CubeGeometry(1.5, 0.74, 2.6);
    var car_body_geometry = new THREE.CubeGeometry(4, 0.9, 3);

    // create the car number
    var car_number = new THREE.Mesh(body_geometry, car_number_material);
    car_number.position.y = 1.2;
    car_number.scale.set(4.02, 0.3, 1.2);
    car_number.castShadow = true;
    // add the car number to the body group
    carBodyGroup.add(car_number);

    // create the car bottom piece
    var car_body_piece = new THREE.Mesh(body_geometry, car_fenders_material);
    car_body_piece.position.y = 0.9;
    car_body_piece.scale.set(4.05, 0.3, 3.02);
    car_body_piece.castShadow = true;
    // add the car bottom piece to the body group
    carBodyGroup.add(car_body_piece);

    // create the car body
    var car_body = new THREE.Mesh(car_body_geometry, car_body_material);
    car_body.position.y = 1.2;
    car_body.position.x = 0;
    car_body.castShadow = true;
    // add the car body to the body group
    carBodyGroup.add(car_body);

    // create the car roof
    var car_roof_piece = new THREE.Mesh(car_roof_geometry, car_body_material);
    car_roof_piece.position.y = 2.0;
    car_roof_piece.castShadow = true;
    // add the car roof to the animatable roof group
    carRoofGroup.add(car_roof_piece);

    // create the car back roof
    var car_backroof_piece = new THREE.Mesh(car_windshield_geometry, car_body_material);
    car_backroof_piece.position.set(1.05, 1.68, 0);
    car_backroof_piece.scale.x = 0.5;
    car_backroof_piece.castShadow = true;
    car_backroof_piece.rotation.z = 0.5 * Math.PI;
    car_backroof_piece.rotation.y = 0.5 * Math.PI;
    // add the car back roof to the animatable roof group
    carRoofGroup.add(car_backroof_piece);

    // create the car windshield
    var car_windshield = new THREE.Mesh(car_windshield_geometry, car_windshield_material);
    car_windshield.position.set(-1.05, 1.67, 0);
    car_windshield.castShadow = true;
    car_windshield.rotation.z = -0.5 * Math.PI;
    car_windshield.rotation.y = -0.5 * Math.PI;
    // add the car windshield to the body group
    carBodyGroup.add(car_windshield);

    //create car front lights
    var car_light_1 = new THREE.Mesh(front_lights_geometry, lights_material);
    car_light_1.position.set(-1.9, 1.3, 1.1);
    car_light_1.scale.set(0.3, 0.3, 0.3);
    // add the light to the light group
    carLightsGroup.add(car_light_1);

    //create car front lights
    var car_light_2 = new THREE.Mesh(front_lights_geometry, lights_material);
    car_light_2.position.set(-1.9, 1.3, -1.1);
    car_light_2.scale.set(0.3, 0.3, 0.3);
    // add the light to the light group
    carLightsGroup.add(car_light_2);

    //create car back lights
    var car_light_3 = new THREE.Mesh(body_geometry, lights_material);
    car_light_3.position.set(2, 1.3, 1.1);
    car_light_3.scale.set(0.3, 0.3, 0.3);
    // add the light to the light group
    carLightsGroup.add(car_light_3);

    //create car back lights
    var car_light_4 = new THREE.Mesh(body_geometry, lights_material);
    car_light_4.position.set(2, 1.3, -1.1);
    car_light_4.scale.set(0.3, 0.3, 0.3);
    // add the light to the light group
    carLightsGroup.add(car_light_4);

    // create the car fenders
    var car_fenders = [];
    for (var i = 0; i < 4; ++i) {
        car_fenders[i] = new THREE.Mesh(body_geometry, car_fenders_material);
        car_fenders[i].castShadow = true;
        car_fenders[i].scale.set(1.5, 0.5, 0.8);
        car_fenders[i].position.y = 1.1;
        if (i % 2 === 0) { // i = 0, 2
            car_fenders[i].position.x = i - 1;
            car_fenders[i].position.z -= 1.5;
        } else { // i = 1, 3
            car_fenders[i].position.x = i - 2;
            car_fenders[i].position.z += 1.5;
        }
        // add the car fenders to the body group
        carBodyGroup.add(car_fenders[i]);
    }

    // create the car wheels
    var car_wheels = [];
    for (var i = 0; i < 4; ++i) {
        car_wheels[i] = new THREE.Mesh(wheels_geometry, wheels_material);
        car_wheels[i].castShadow = true;
        car_wheels[i].scale.set(0.6, 0.6, 0.6);
        car_wheels[i].rotation.x = 0.5 * Math.PI;
        car_wheels[i].position.y = 0.6;
        if (i % 2 === 0) { // i = 0, 2
            car_wheels[i].position.x = i - 1;
            car_wheels[i].position.z -= 1.8;
        } else { // i = 1, 3
            car_wheels[i].position.x = i - 2;
            car_wheels[i].position.z += 1.8;
        }
        // add the car wheels to the wheel group
        carWheelsGroup.add(car_wheels[i]);
    }

    // create a group to contain the entire tank
    var tankGroup = new THREE.Object3D();
    scene.add(tankGroup);
    // create a group to contain the tank wheels
    var wheelsGroup = new THREE.Object3D();
    wheelsGroup.rotation.y = -0.5 * Math.PI;
    tankGroup.add(wheelsGroup);
    // create a group to contain the tank body
    var bodyGroup = new THREE.Object3D();
    bodyGroup.rotation.y = -0.5 * Math.PI;
    tankGroup.add(bodyGroup);
    // create a group to contain the animatable tank turret
    var turretGroup = new THREE.Object3D();
    turretGroup.rotation.y = -0.5 * Math.PI;
    tankGroup.add(turretGroup);
    // create a group to contain the tank lights
    var lightsGroup = new THREE.Object3D();
    lightsGroup.rotation.y = -0.5 * Math.PI;
    tankGroup.add(lightsGroup);

    //tank specific material
    var camo_texture = THREE.ImageUtils.loadTexture("assets/textures/camo.jpg");
    var tank_body_material = new THREE.MeshLambertMaterial({color: 0x73A353, map: camo_texture});

    //tank geometries
    var tank_body_geometry = new THREE.CubeGeometry(7, 1, 4);
    var tank_gun_geometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 16);
    var tank_turret_geometry = new THREE.CubeGeometry(3, 1, 2);

    //create tank body
    var tank_body = new THREE.Mesh(tank_body_geometry, tank_body_material);
    tank_body.position.y = 1.5;
    tank_body.castShadow = true;
    bodyGroup.add(tank_body);

    //create tank gun
    var tank_gun = new THREE.Mesh(tank_gun_geometry, tank_body_material);
    tank_gun.position.set(-1, 2.5, 0);
    tank_gun.rotation.z = 0.5 * Math.PI;
    tank_gun.castShadow = true;
    turretGroup.add(tank_gun);

    //create tank turret
    var tank_turret = new THREE.Mesh(tank_turret_geometry, tank_body_material);
    tank_turret.position.set(1.3, 2.5, 0);
    tank_turret.castShadow = true;
    turretGroup.add(tank_turret);

    //create tank lights
    var tank_light_1 = new THREE.Mesh(front_lights_geometry, lights_material);
    tank_light_1.position.set(-3.3, 1.5, 1);
    tank_light_1.scale.set(0.5, 0.5, 0.5);
    // add the light to the light group
    lightsGroup.add(tank_light_1);

    //create tank lights
    var tank_light_2 = new THREE.Mesh(front_lights_geometry, lights_material);
    tank_light_2.position.set(-3.3, 1.5, -1);
    tank_light_2.scale.set(0.5, 0.5, 0.5);
    // add the light to the light group
    lightsGroup.add(tank_light_2);

    //create tank lights
    var tank_light_3 = new THREE.Mesh(body_geometry, lights_material);
    tank_light_3.position.set(3.5, 1.5, 1.2);
    tank_light_3.scale.set(0.5, 0.5, 0.5);
    // add the light to the light group
    lightsGroup.add(tank_light_3);

    //create tank lights
    var tank_light_4 = new THREE.Mesh(body_geometry, lights_material);
    tank_light_4.position.set(3.5, 1.5, -1.3);
    tank_light_4.scale.set(0.5, 0.5, 0.5);
    // add the light to the light group
    lightsGroup.add(tank_light_4);

    // create the wheels
    var tank_wheels = [];
    for (var i = 0; i < 6; ++i) {
        tank_wheels[i] = new THREE.Mesh(wheels_geometry, wheels_material);
        tank_wheels[i].castShadow = true;
        tank_wheels[i].scale.set(0.8, 0.8, 0.8);
        tank_wheels[i].rotation.x = 0.5 * Math.PI;
        tank_wheels[i].position.y = 0.8;
        if (i % 2 === 0) { // i = 0, 2, 4
            tank_wheels[i].position.x = i - 2;
            tank_wheels[i].position.z -= 2.3;
        } else { // i = 1, 3, 5
            tank_wheels[i].position.x = i - 3;
            tank_wheels[i].position.z += 2.3;
        }
        // add the tank wheels to the wheel group
        wheelsGroup.add(tank_wheels[i]);
    }

    // make first groups to contain the entire cloud
    var cloudsGroup = create_clouds();
    cloudsGroup.position.set(20, 18, 5);
    cloudsGroup.scale.x = 2;
    cloudsGroup.scale.z = 1.5;
    scene.add(cloudsGroup);

    // make second groups to contain the entire cloud
    var cloudsGroup2 = create_clouds();
    cloudsGroup2.position.set(20, 19, 5);
    cloudsGroup2.scale.x = 2;
    cloudsGroup2.scale.z = 2;
    scene.add(cloudsGroup2);

    function create_clouds() {
        // create a group to contain the entire cloud
        var cloudsGroup = new THREE.Object3D();

        // cloud material
        var cloud_texture = THREE.ImageUtils.loadTexture("assets/textures/cloud.jpg");
        var cloud_material = new THREE.MeshLambertMaterial({map: cloud_texture});

        //clouds are compounds from spheres
        var cloud_geometry = new THREE.SphereGeometry(1, 16, 16);

        var cloud_piece_1 = new THREE.Mesh(cloud_geometry, cloud_material);
        cloud_piece_1.scale.x = 2;
        cloud_piece_1.rotation.y = 0.25 * Math.PI;
        cloud_piece_1.castShadow = true;
        //clouds default are invisible
        cloud_piece_1.visible = 0;
        cloudsGroup.add(cloud_piece_1);

        var cloud_piece_2 = new THREE.Mesh(cloud_geometry, cloud_material);
        cloud_piece_2.position.set(1, 0, 0);
        cloud_piece_1.scale.x = 1.5;
        cloud_piece_1.scale.y = 1.3;
        cloud_piece_2.rotation.y = 2;
        cloud_piece_2.castShadow = true;
        //clouds default are invisible
        cloud_piece_2.visible = 0;
        cloudsGroup.add(cloud_piece_2);

        var cloud_piece_3 = new THREE.Mesh(cloud_geometry, cloud_material);
        cloud_piece_3.position.x = 1;
        cloud_piece_3.scale.x = 1.8;
        cloud_piece_3.rotation.y = 0.25 * Math.PI;
        cloud_piece_3.castShadow = true;
        //clouds default are invisible
        cloud_piece_3.visible = 0;
        cloudsGroup.add(cloud_piece_3);

        var cloud_piece_4 = new THREE.Mesh(cloud_geometry, cloud_material);
        cloud_piece_4.position.z = 2;
        cloud_piece_4.rotation.x = 1;
        cloud_piece_4.scale.x = 1.4;
        cloud_piece_4.castShadow = true;
        //clouds default are invisible
        cloud_piece_4.visible = 0;
        cloudsGroup.add(cloud_piece_4);

        var cloud_piece_5 = new THREE.Mesh(cloud_geometry, cloud_material);
        cloud_piece_5.position.z = 1;
        cloud_piece_5.scale.x = 2;
        cloud_piece_5.scale.z = 2;
        cloud_piece_5.rotation.y = 0.25 * Math.PI;
        cloud_piece_5.castShadow = true;
        //clouds default are invisible
        cloud_piece_5.visible = 0;
        cloudsGroup.add(cloud_piece_5);

        return cloudsGroup;
    }

    // make first groups to contain the entire bird
    var birdGroup = create_birds();
    birdGroup.position.set(10, 15, 15);
    scene.add(birdGroup);

    // make second groups to contain the entire bird
    var birdGroup2 = create_birds();
    birdGroup2.position.set(10, 15, 15);
    scene.add(birdGroup2);

    function create_birds() {
        // create a group to contain the entire bird
        var birdGroup = new THREE.Object3D();

        //bird materials
        var bird_material = new THREE.MeshPhongMaterial({color: 0x57544F});
        var bird_eye_material = new THREE.MeshLambertMaterial({color: 0x000000});
        var bird_beak_material = new THREE.MeshLambertMaterial({color: 0xF3BA3E});

        //bird geometries
        var bird_body_geometry = new THREE.SphereGeometry(0.4, 16, 16);
        var bird_wing_geometry = new THREE.CubeGeometry(1, 0.1, 1);
        var bird_eye_geometry = new THREE.SphereGeometry(0.05, 16, 16);
        var bird_beak_geometry = new THREE.CylinderGeometry(0.01, 0.2, 0.5, 16);

        //create bird body
        var bird_body = new THREE.Mesh(bird_body_geometry, bird_material);
        bird_body.scale.set(1.3, 1, 2);
        bird_body.castShadow = true;
        birdGroup.add(bird_body);

        //create bird left wings
        var bird_wing_1 = new THREE.Mesh(bird_wing_geometry, bird_material);
        bird_wing_1.position.x = 0.8;
        bird_wing_1.castShadow = true;
        birdGroup.add(bird_wing_1);

        //create bird right wings
        var bird_wing_2 = new THREE.Mesh(bird_wing_geometry, bird_material);
        bird_wing_2.position.x = -0.8;
        bird_wing_2.castShadow = true;
        birdGroup.add(bird_wing_2);

        //create bird left eye
        var bird_eye_1 = new THREE.Mesh(bird_eye_geometry, bird_eye_material);
        bird_eye_1.position.set(0.23, 0.1, 0.7);
        bird_eye_1.castShadow = true;
        birdGroup.add(bird_eye_1);

        //create bird right eye
        var bird_eye_2 = new THREE.Mesh(bird_eye_geometry, bird_eye_material);
        bird_eye_2.position.set(-0.23, 0.1, 0.7);
        bird_eye_2.castShadow = true;
        birdGroup.add(bird_eye_2);

        //create beak bird
        var bird_beak = new THREE.Mesh(bird_beak_geometry, bird_beak_material);
        bird_beak.position.z = 1;
        bird_beak.rotation.x = 0.5 * Math.PI;
        bird_beak.castShadow = true;
        birdGroup.add(bird_beak);

        return birdGroup;
    }

    // create a group to contain the entire flag
    var flagGroup = new THREE.Object3D();
    scene.add(flagGroup);

    //flag plane textures
    var england_texture = THREE.ImageUtils.loadTexture("assets/textures/flags/England.png");
    var ireland_texture = THREE.ImageUtils.loadTexture("assets/textures/flags/Ireland.png");
    var scotland_texture = THREE.ImageUtils.loadTexture("assets/textures/flags/Scotland.png");
    var wales_texture = THREE.ImageUtils.loadTexture("assets/textures/flags/Wales.png");

    //flag materials
    var pillar_material = new THREE.MeshPhongMaterial({color: 0x0B0752});
    var flagplane_material = new THREE.MeshPhongMaterial({map: england_texture, side: THREE.DoubleSide, transparent: true, shininess: 5});

    // flag geometries
    var flag_piece_1_geometry = new THREE.CubeGeometry(1, 1, 1);
    var flag_piece_2_geometry = new THREE.CylinderGeometry(0.2, 0.2, 14, 16);
    var flag_piece_3_geometry = new THREE.SphereGeometry(0.4, 16, 16);
    var flag_piece_4_geometry = new THREE.CylinderGeometry(0.1, 0.1, 5, 16);
    var flag_piece_5_geometry = new THREE.CylinderGeometry(0.15, 0, 0.5, 16);
    var flag_plane_geometry = new THREE.PlaneGeometry(7.5, 6.5, 1, 1);

    //create pillar
    var flag_piece_1 = new THREE.Mesh(flag_piece_1_geometry, pillar_material);
    flag_piece_1.position.set(20, 0, 5);
    flag_piece_1.rotation.y = 0.25 * Math.PI;
    flag_piece_1.castShadow = true;
    flagGroup.add(flag_piece_1);

    //create pillar
    var flag_piece_2 = new THREE.Mesh(flag_piece_2_geometry, pillar_material);
    flag_piece_2.position.set(20, 6, 5);
    flag_piece_2.castShadow = true;
    flagGroup.add(flag_piece_2);

    //create pillar
    var flag_piece_3 = new THREE.Mesh(flag_piece_3_geometry, pillar_material);
    flag_piece_3.position.set(20, 13, 5);
    flag_piece_3.castShadow = true;
    flagGroup.add(flag_piece_3);

    //create pillar
    var flag_piece_4 = new THREE.Mesh(flag_piece_4_geometry, pillar_material);
    flag_piece_4.position.set(22.5, 12, 5);
    flag_piece_4.rotation.z = 0.5 * Math.PI;
    flag_piece_4.castShadow = true;
    flagGroup.add(flag_piece_4);

    //create pillar
    var flag_piece_5 = new THREE.Mesh(flag_piece_5_geometry, pillar_material);
    flag_piece_5.position.set(25, 12, 5);
    flag_piece_5.rotation.z = 0.5 * Math.PI;
    flag_piece_5.castShadow = true;
    flagGroup.add(flag_piece_5);

    //add flag
    var flag_plane = new THREE.Mesh(flag_plane_geometry, flagplane_material);
    flag_plane.position.set(22.64, 8.64, 5);
    flag_plane.rotation.z = 0.5 * Math.PI;
    flag_plane.castShadow = true;
    flagGroup.add(flag_plane);

    // create a group to contain the entire lighting pole
    var lightingGroup = new THREE.Object3D();
    scene.add(lightingGroup);

    //lighting pole materials
    var pole_material = new THREE.MeshLambertMaterial({color: 0x361073});
    var lightbulb_material = new THREE.MeshBasicMaterial({color: 0xF2FF61});

    //lighting pole geometries 
    var lighting_piece_1_geometry = new THREE.CubeGeometry(1, 1, 1);
    var lighting_piece_2_geometry = new THREE.CylinderGeometry(0.7, 0, 1.5, 4);

    //create pole
    var lighting_piece_1 = new THREE.Mesh(lighting_piece_1_geometry, pole_material);
    lighting_piece_1.position.set(-30, 0, 5);
    lighting_piece_1.rotation.y = 0.25 * Math.PI;
    lighting_piece_1.castShadow = true;
    lightingGroup.add(lighting_piece_1);

    //create pole
    var lighting_piece_2 = new THREE.Mesh(lighting_piece_1_geometry, pole_material);
    lighting_piece_2.position.set(-30, 6, 5);
    lighting_piece_2.scale.set(0.5, 0.5, 12);
    lighting_piece_2.rotation.x = 0.5 * Math.PI;
    lighting_piece_2.castShadow = true;
    lightingGroup.add(lighting_piece_2);

    //create pole
    var lighting_piece_3 = new THREE.Mesh(lighting_piece_2_geometry, pole_material);
    lighting_piece_3.position.set(-30, 12, 5);
    lighting_piece_3.castShadow = true;
    lightingGroup.add(lighting_piece_3);

    //create pole
    var lighting_piece_4 = new THREE.Mesh(lighting_piece_2_geometry, pole_material);
    lighting_piece_4.position.set(-30, 15.38, 5);
    lighting_piece_4.rotation.x = Math.PI;
    lighting_piece_4.castShadow = true;
    lightingGroup.add(lighting_piece_4);

    //add lightbulb
    var lightbulb = new THREE.Mesh(lighting_piece_1_geometry, lightbulb_material);
    lightbulb.position.set(-30, 13.7, 5);
    lightbulb.scale.y = 2;
    lightbulb.rotation.y = 0.25 * Math.PI;
    lightbulb.castShadow = true;
    lightingGroup.add(lightbulb);

    //light to lightbulb
    var spotLightbulb = new THREE.SpotLight("#ccffcc");
    spotLightbulb.position = lightbulb.position;
    spotLightbulb.intensity = 3;
    spotLightbulb.castShadow = true;
    spotLightbulb.shadowCameraNear = 2;
    spotLightbulb.shadowCameraFar = 400;
    spotLightbulb.shadowMapHeight = 1024;
    spotLightbulb.shadowMapWidth = 1024;
    spotLightbulb.target = onScene;
    lightingGroup.add(spotLightbulb);

    //add lights
    //first directional light, shadow disabled
    var directionalLight1 = new THREE.DirectionalLight(0xffffff);
    directionalLight1.position.set(350, 500, -350);
    scene.add(directionalLight1);

    //second directional light, shadow disabled
    var directionalLight2 = new THREE.DirectionalLight(0xffffff);
    directionalLight2.position.set(-350, 500, 350);
    scene.add(directionalLight2);

    //add two moveing spotlights
    //first spotlight, shadow enabled
    var spotLight1 = new THREE.SpotLight("#ccffcc");
    spotLight1.position = new THREE.Vector3(10, 30, 0);
    spotLight1.castShadow = true;
    spotLight1.shadowCameraNear = 2;
    spotLight1.shadowCameraFar = 400;
    spotLight1.shadowMapHeight = 1024;
    spotLight1.shadowMapWidth = 1024;
    spotLight1.target = onScene;
    spotLight1.distance = 100;
    scene.add(spotLight1);

    // add a small sphere simulating the light
    var sphereLight = new THREE.SphereGeometry(0.4);
    var sphereLightMaterial = new THREE.MeshBasicMaterial({color: 0xE6FF42});
    var sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
    sphereLightMesh.position = spotLight1.position;
    scene.add(sphereLightMesh);

    //second spotlight, shadow enabled
    var spotLight2 = new THREE.SpotLight("#ccffcc");
    spotLight2.position = new THREE.Vector3(10, 30, 0);
    spotLight2.castShadow = true;
    spotLight2.shadowCameraNear = 2;
    spotLight2.shadowCameraFar = 400;
    spotLight2.shadowMapHeight = 1024;
    spotLight2.shadowMapWidth = 1024;
    spotLight2.target = onScene;
    spotLight2.distance = 100;
    scene.add(spotLight2);

    // add a small sphere simulating the light
    var sphereLight2 = new THREE.SphereGeometry(0.4);
    var sphereLightMaterial2 = new THREE.MeshBasicMaterial({color: 0xE6FF42});
    var sphereLightMesh2 = new THREE.Mesh(sphereLight2, sphereLightMaterial2);
    sphereLightMesh2.position = spotLight2.position;
    scene.add(sphereLightMesh2);

    // add the output of the renderer to the html element
    $("#WebGL-output").append(renderer.domElement);

    // setup the control gui
    var controls = new function () {
        //default ground texture
        this.groundTexture = "Sand";
        //default vehicle on scene
        this.Vehicle = "Car";
        //change ground texture
        this.changeTextureGround = function (e) {
            switch (e) {
                case "Sand":
                    plane.material.map = sandTexture;
                    break;
                case "Grass":
                    plane.material.map = grassTexture;
                    break;
                case "Asphalt":
                    plane.material.map = asphaltTexture;
                    break;
                case "Chess":
                    plane.material.map = chessTexture;
                    break;
            }
        };
        //default flagplane texture
        this.flagTexture = "England";
        //change flagplane texture
        this.changeTextureFlag = function (e) {
            switch (e) {
                case "England":
                    flag_plane.material.map = england_texture;
                    break;
                case "Ireland":
                    flag_plane.material.map = ireland_texture;
                    break;
                case "Scotland":
                    flag_plane.material.map = scotland_texture;
                    break;
                case "Wales":
                    flag_plane.material.map = wales_texture;
                    break;
            }
        };
        //default time
        this.Period = "Day";
        //change period
        this.changePeriod = function (e) {
            switch (e) {
                case "Day":
                    //load day sky txture
                    skyTexture = createCubeMap("day_sky");
                    shader.uniforms[ "tCube" ].value = skyTexture;
                    skyMaterial = new THREE.ShaderMaterial({
                        fragmentShader: shader.fragmentShader,
                        vertexShader: shader.vertexShader,
                        uniforms: shader.uniforms,
                        depthWrite: false,
                        side: THREE.BackSide
                    });
                    skybox.material = skyMaterial;
                    //maximum light intensity
                    directionalLight1.intensity = 1;
                    directionalLight2.intensity = 1;
                    //fog enabled
                    scene.fog.near = 80;
                    scene.fog.far = 260;
                    break;
                case "Evening":
                    //load evening sky txture
                    skyTexture = createCubeMap("evening_sky");
                    shader.uniforms[ "tCube" ].value = skyTexture;
                    skyMaterial = new THREE.ShaderMaterial({
                        fragmentShader: shader.fragmentShader,
                        vertexShader: shader.vertexShader,
                        uniforms: shader.uniforms,
                        depthWrite: false,
                        side: THREE.BackSide
                    });
                    skybox.material = skyMaterial;
                    //half light intensity
                    directionalLight1.intensity = 0.5;
                    directionalLight2.intensity = 0.5;
                    //fog disabled
                    scene.fog.near = 0.1;
                    scene.fog.far = 5000;
                    break;
                case "Night":
                    //load evening bight txture
                    skyTexture = createCubeMap("night_sky");
                    shader.uniforms[ "tCube" ].value = skyTexture;
                    skyMaterial = new THREE.ShaderMaterial({
                        fragmentShader: shader.fragmentShader,
                        vertexShader: shader.vertexShader,
                        uniforms: shader.uniforms,
                        depthWrite: false,
                        side: THREE.BackSide
                    });
                    skybox.material = skyMaterial;
                    //no light intensity
                    directionalLight1.intensity = 0;
                    directionalLight2.intensity = 0;
                    //fog disabled
                    scene.fog.near = 0.1;
                    scene.fog.far = 5000;
                    break;
            }
        };
        this.BodyColor = "#ffffff";
        //change vehivle color
        this.changeVehicleColor = function (e) {
            if (isCar) {
                //change color only of two materials, because all the car pieces have the same materials
                car_body.material.color.setHex(e.replace("#", "0x"));
                car_body_piece.material.color.setHex(e.replace("#", "0x"));
            } else {
                //change color of one material, because all the tank pieces have the same material
                tank_body.material.color.setHex(e.replace("#", "0x"));
            }
        };
        // turn on/off vehicle lights
        this.toggleVehicleLights = function (e) {
            if (Destroyed) {
                e = false;
            }
            if (e) {
                var color = 0xffffff;
            } else {
                var color = 0x525252;
            }
            if (isCar) {
                //turn on/off car lights
                car_light_1.material.color.setHex(color);
                car_light_2.material.color.setHex(color);
                car_light_3.material.color.setHex(color);
                car_light_4.material.color.setHex(color);
            } else {
                //turn on/off tank lights
                tank_light_1.material.color.setHex(color);
                tank_light_2.material.color.setHex(color);
                tank_light_3.material.color.setHex(color);
                tank_light_4.material.color.setHex(color);
            }
        };
        // disable/enable clouds
        this.toogleClouds = function (e) {
            // toggle all objects from clouds groups visibility
            for (var i = 0; i < cloudsGroup.children.length; ++i) {
                cloudsGroup.children[i].visible = e;
            }
            for (var i = 0; i < cloudsGroup2.children.length; ++i) {
                cloudsGroup2.children[i].visible = e;
            }
            // toggle clouds groups visibility too
            cloudsGroup.visible = e;
            cloudsGroup2.visible = e;

        };
        //turret animation, default disabled
        this.TurretRotation = false;
        //default turret animation speed
        this.TurretSpeed = 0.01;
        //car roof animation, default disabled
        this.CarCabrio = false;
        //default car roof animation speed
        this.CarCabrioSpeed = 0.01;
        //camera follow vehicle, default false
        this.Follow = false;
        //vehicle light on/off, default on
        this.VehicleLights = true;
        //spotlights animation on/off, default on
        this.SpotLightsAnimation = true;
        //default spotlights animation speed
        this.SpotLightsSpeed = 0.01;
        //birds animation on/off, default on
        this.BirdsAnimation = true;
        //default birds animation speed
        this.BirdsSpeed = 0.01;
        //enable/disable clouds, default disabled
        this.Clouds = false;
        //clouds animation on/off, default on
        this.CloudsAnimation = true;
        //default clouds animation speed
        this.CloudsSpeed = 0.01;
        //enable/disable flag, default enable
        this.FlagVisibility = true;
        //enable/disable pole, default enable
        this.PoleVisibility = true;
        //destroy everything, default false
        this.Destroy = false;
    };

    var gui = new dat.GUI();

    //scene features
    var sceneFolder = gui.addFolder("Scene");
    sceneFolder.add(controls, "Vehicle", ['Car', 'Tank']);
    sceneFolder.add(controls, "groundTexture", ['Sand', 'Grass', 'Asphalt', 'Chess']).onChange(controls.changeTextureGround);
    sceneFolder.add(controls, "Period", ['Day', 'Evening', 'Night']).onChange(controls.changePeriod);
    sceneFolder.add(controls, "flagTexture", ['England', 'Ireland', 'Scotland', 'Wales']).onChange(controls.changeTextureFlag);
    sceneFolder.add(controls, 'SpotLightsAnimation');
    sceneFolder.add(controls, 'SpotLightsSpeed', 0.01, 0.1).listen();
    sceneFolder.add(controls, 'BirdsAnimation');
    sceneFolder.add(controls, 'BirdsSpeed', 0.01, 0.1).listen();
    sceneFolder.add(controls, 'Clouds').onChange(controls.toogleClouds).listen();
    sceneFolder.add(controls, 'CloudsAnimation');
    sceneFolder.add(controls, 'CloudsSpeed', 0.01, 0.1).listen();
    sceneFolder.add(controls, 'FlagVisibility').listen();
    sceneFolder.add(controls, 'PoleVisibility').listen();
    sceneFolder.add(controls, 'Destroy').listen();

    //tank features
    var tankFolder = gui.addFolder("Tank");
    tankFolder.add(controls, 'TurretRotation').listen();
    tankFolder.add(controls, 'TurretSpeed', 0.01, 0.1);

    //car features
    var carFolder = gui.addFolder("Car");
    carFolder.add(controls, 'CarCabrio').listen();
    carFolder.add(controls, 'CarCabrioSpeed', 0.01, 0.1);

    //both vehicle features 
    var VehicleFolder = gui.addFolder("Vehicle");
    VehicleFolder.add(controls, 'Follow');
    VehicleFolder.add(controls, 'VehicleLights').onChange(controls.toggleVehicleLights).listen();
    VehicleFolder.addColor(controls, 'BodyColor').onChange(controls.changeVehicleColor);

    //camera look at object, default it is the car
    orbitControls.center = onScene.position;

    //turret angle rotation
    var angle = 5;
    //car angle animation
    var c_angle = 0;
    //wing angle rotation
    var w_angle = 0;
    //spotlights moveing angle
    var lightAngle = 0;
    //clouds moveing angle
    var cloudAngle = 0;
    //birds moveing angle
    var birdAngle = 0;
    //vehicle is destroyed
    var Destroyed = false;
    //choosed car
    var isCar = false;
    //choosed tank
    var isTank = false;
    //spotLightbulb on/off
    var spotLightbulb_on = true;
    //shadow on/off
    var shadow_on = true;

    //call the render function
    render();

    function render() {
        stats.update();

        //switch vehicle option
        if (controls.Vehicle === "Car") {
            if (isCar === false) {
                //show all car pieces 
                car_body_piece.visible = 1;
                car_number.visible = 1;
                car_body.visible = 1;
                car_roof_piece.visible = 1;
                car_backroof_piece.visible = 1;
                car_windshield.visible = 1;
                car_light_1.visible = 1;
                car_light_2.visible = 1;
                car_light_3.visible = 1;
                car_light_4.visible = 1;
                for (var i = 0; i < 4; ++i) {
                    car_wheels[i].visible = 1;
                    car_fenders[i].visible = 1;
                }
                //hide all tank pieces
                tank_body.visible = 0;
                tank_gun.visible = 0;
                tank_turret.visible = 0;
                tank_light_1.visible = 0;
                tank_light_2.visible = 0;
                tank_light_3.visible = 0;
                tank_light_4.visible = 0;
                for (var i = 0; i < 6; ++i) {
                    tank_wheels[i].visible = 0;
                }
                //disable destroy
                controls.Destroy = false;
                //choosed vehicle is the car
                onScene = carGroup;
                //keep the same position as the tank
                onScene.position = tankGroup.position;
                onScene.rotation.y = tankGroup.rotation.y;
                //change the vehicle on scene 
                isCar = true;
                isTank = false;
            }
            //turn off vehicle destoyed lights
            if (Destroyed) {
                controls.VehicleLights = false;
            }
        } else {
            if (isTank === false) {
                //show all tank pieces
                tank_body.visible = 1;
                tank_gun.visible = 1;
                tank_turret.visible = 1;
                tank_light_1.visible = 1;
                tank_light_2.visible = 1;
                tank_light_3.visible = 1;
                tank_light_4.visible = 1;
                for (var i = 0; i < 6; ++i) {
                    tank_wheels[i].visible = 1;
                }
                //hide all car pieces 
                car_body_piece.visible = 0;
                car_number.visible = 0;
                car_body.visible = 0;
                car_roof_piece.visible = 0;
                car_backroof_piece.visible = 0;
                car_windshield.visible = 0;
                car_light_1.visible = 0;
                car_light_2.visible = 0;
                car_light_3.visible = 0;
                car_light_4.visible = 0;
                for (var i = 0; i < 4; ++i) {
                    car_wheels[i].visible = 0;
                    car_fenders[i].visible = 0;
                }
                //disable destroy
                controls.Destroy = false;
                //choosed vehicle is the tank
                onScene = tankGroup;
                //keep the same position as the car
                onScene.position = carGroup.position;
                onScene.rotation.y = carGroup.rotation.y;
                //change the vehicle on scene 
                isTank = true;
                isCar = false;
            }
            //turn off vehicle destoyed lights
            if (Destroyed) {
                controls.VehicleLights = false;
            }
        }
        //turret rotation
        if (controls.TurretRotation) {
            if (isCar || Destroyed) {
                //vehicle on scene is the car, or the tank was destroyed, uncheck TurretRotation botton
                controls.TurretRotation = false;
            } else {
                //begin animation
                angle += controls.TurretSpeed;
                turretGroup.rotation.y = 0.5 * Math.cos(angle) - 0.5 * Math.PI;
            }
        }
        //cabrio animation
        if (controls.CarCabrio) {
            if (isTank || Destroyed) {
                //vehicle on scene is the tank, or the car was destroyed, uncheck CarCabrio botton
                controls.CarCabrio = false;
            } else {
                //begin animation
                c_angle += controls.CarCabrioSpeed;
                carRoofGroup.position.y = 0.35 * Math.cos(c_angle) - 0.115 * Math.PI;
            }
        }

        //toggle follow
        if (controls.Follow) {
            //camera follow the vehicle on scene position
            camera.position.x = onScene.position.x;
            camera.position.y = onScene.position.y + 15;
            camera.position.z = onScene.position.z - 35;
            //camera look at object
            orbitControls.center = onScene.position;
        }

        //toggle flag
        if (controls.FlagVisibility) {
            //show entire flag
            flag_plane.visible = 1;
            flag_piece_1.visible = 1;
            flag_piece_2.visible = 1;
            flag_piece_3.visible = 1;
            flag_piece_4.visible = 1;
            flag_piece_5.visible = 1;
        } else {
            //hide entire flag
            flag_plane.visible = 0;
            flag_piece_1.visible = 0;
            flag_piece_2.visible = 0;
            flag_piece_3.visible = 0;
            flag_piece_4.visible = 0;
            flag_piece_5.visible = 0;
        }

        //toggle pole
        if (controls.PoleVisibility) {
            //show entire pole
            lighting_piece_1.visible = 1;
            lighting_piece_2.visible = 1;
            lighting_piece_3.visible = 1;
            lighting_piece_4.visible = 1;
            lightbulb.visible = 1;
            //if shadow is enable, remove pole shadow
            if (shadow_on === false) {
                spotLightbulb.shadowDarkness = 0;
            } else {
                if (spotLightbulb_on === true) {
                    spotLightbulb.shadowDarkness = 0.5;
                    lightbulb.material.color.setHex(0xF2FF61);
                } else {
                    spotLightbulb.shadowDarkness = 0;
                    lightbulb.material.color.setHex(0xadadad);
                }
            }
        } else {
            //hide entire flag
            lightbulb.visible = 0;
            spotLightbulb.visible = 0;
            spotLightbulb.shadowDarkness = 0;
            lighting_piece_1.visible = 0;
            lighting_piece_2.visible = 0;
            lighting_piece_3.visible = 0;
            lighting_piece_4.visible = 0;
        }

        //toggle destroy
        if (controls.Destroy) {
            if (Destroyed === false) {
                //destroy flag and pole
                flag_piece_2.rotation.x = 1.3;
                flag_piece_2.position.z = 11.4;
                flag_piece_2.position.y = 2.2;
                flag_piece_3.position.y = 0.4;
                flag_piece_3.position.z = 14;
                flag_piece_4.position.z = 10;
                flag_piece_4.position.y = 0.1;
                flag_piece_5.position.z = 10;
                flag_piece_5.position.y = 0.1;
                flag_plane.position.x = 25;
                flag_plane.position.y = 0.1;
                flag_plane.rotation.z = 0.25 * Math.PI;
                flag_plane.rotation.x = 0.5 * Math.PI;

                lighting_piece_2.rotation.y = 1.3;
                lighting_piece_2.position.x = -36;
                lighting_piece_2.position.y = 2;
                lighting_piece_3.rotation.z = 1.3;
                lighting_piece_3.position.x = -41.5;
                lighting_piece_3.position.y = 3.5;
                lighting_piece_4.position.y = 0.5;
                lighting_piece_4.position.z = 7;
                lightbulb.rotation.z = 1.3;
                lightbulb.position.y = 0.3;
                lightbulb.position.z = 3;
                lightbulb.material.color.setHex(0xadadad);
                spotLightbulb.shadowDarkness = 0;
                spotLightbulb.visible = 0;
                spotLightbulb_on = false;

                //destroy vehicle
                if (isTank) {
                    if (controls.TurretRotation) {
                        controls.TurretRotation = false;
                    }

                    tank_light_1.material.color.setHex(0x525252);
                    tank_light_2.material.color.setHex(0x525252);
                    tank_light_3.material.color.setHex(0x525252);
                    tank_light_4.material.color.setHex(0x525252);

                    //destroy tank
                    tank_body.rotation.z = -0.1;
                    tank_light_1.position.y = 1.8;
                    tank_light_2.position.y = -0.2;
                    tank_light_3.position.y = 0;
                    tank_light_4.position.y = 1.3;
                    tank_gun.rotation.y = 0.2;
                    turretGroup.position.set(3, -2, -1);
                    turretGroup.rotation.set(-0.2, -0.3, 0.1);
                    tank_wheels[0].rotation.x = Math.PI;
                    tank_wheels[0].position.y = 0.4;
                    tank_wheels[0].position.x = 3;
                    tank_wheels[0].position.z = -5;
                    tank_wheels[3].rotation.x = Math.PI;
                    tank_wheels[3].position.y = 0.4;
                    tank_wheels[3].position.z = 4;
                    tank_wheels[5].rotation.x = Math.PI;
                    tank_wheels[5].position.y = 0.4;
                } else {
                    //destroy car
                    car_number.rotation.x = 0.2;
                    car_body_piece.rotation.x = -0.2;
                    car_body.rotation.x = -0.2;
                    car_light_1.position.y = 1.55;
                    car_light_2.position.set(-2.9, -0.1, 0);
                    car_light_3.position.y = 0;
                    car_light_4.position.y = 1.1;
                    car_light_4.rotation.x = -0.2;
                    car_wheels[0].rotation.x = 0;
                    car_wheels[0].position.y = 0.3;
                    carRoofGroup.position.set(4, -1.66, 0);
                    carRoofGroup.rotation.y = -0.3;
                    car_windshield.position.set(0, 0, 3);
                    car_windshield.rotation.y = 0;
                    car_light_1.material.color.setHex(0x525252);
                    car_light_2.material.color.setHex(0x525252);
                    car_light_3.material.color.setHex(0x525252);
                    car_light_4.material.color.setHex(0x525252);

                }
            }
            Destroyed = true;
        } else {
            if (Destroyed === true) {
                //repair flag and pole
                flag_piece_2.rotation.x = 0;
                flag_piece_2.position.set(20, 6, 5);
                flag_piece_3.position.set(20, 13, 5);
                flag_piece_4.position.set(22.5, 12, 5);
                flag_piece_4.rotation.z = 0.5 * Math.PI;
                flag_piece_5.position.set(25, 12, 5);
                flag_piece_5.rotation.z = 0.5 * Math.PI;
                flag_plane.position.set(22.64, 8.64, 5);
                flag_plane.rotation.z = 0.5 * Math.PI;
                flag_plane.rotation.x = 0;

                lighting_piece_2.position.set(-30, 6, 5);
                lighting_piece_2.rotation.y = 0;
                lighting_piece_3.position.set(-30, 12, 5);
                lighting_piece_3.rotation.z = 0;
                lighting_piece_4.position.set(-30, 15.38, 5);
                lightbulb.position.set(-30, 13.7, 5);
                lightbulb.rotation.z = 0;
                lightbulb.material.color.setHex(0xF2FF61);
                if (shadow_on === false) {
                    spotLightbulb.shadowDarkness = 0.5;
                }
                spotLightbulb.visible = 1;
                spotLightbulb_on = true;
                controls.VehicleLights = true;

                //repair both vehicle, on change vehicle it will be ok.
                //repair tank    
                tank_light_1.material.color.setHex(0xffffff);
                tank_light_2.material.color.setHex(0xffffff);
                tank_light_3.material.color.setHex(0xffffff);
                tank_light_4.material.color.setHex(0xffffff);
                tank_body.rotation.z = 0;
                tank_light_1.position.y = 1.5;
                tank_light_2.position.y = 1.5;
                tank_light_3.position.y = 1.5;
                tank_light_4.position.y = 1.5;
                tank_gun.rotation.y = 0;
                turretGroup.position.set(0, 0, 0);
                turretGroup.rotation.set(0, -0.5 * Math.PI, 0);
                tank_wheels[0].rotation.x = 0.5 * Math.PI;
                tank_wheels[0].position.x = -2;
                tank_wheels[0].position.z = -2.3;
                tank_wheels[0].position.y = 0.8;
                tank_wheels[3].rotation.x = 0.5 * Math.PI;
                tank_wheels[3].position.z = 2.3;
                tank_wheels[3].position.y = 0.8;
                tank_wheels[5].rotation.x = 0.5 * Math.PI;
                tank_wheels[5].position.y = 0.8;

                //repair car
                car_light_1.material.color.setHex(0xffffff);
                car_light_2.material.color.setHex(0xffffff);
                car_light_3.material.color.setHex(0xffffff);
                car_light_4.material.color.setHex(0xffffff);

                car_number.rotation.x = 0;
                car_body_piece.rotation.x = 0;
                car_body.rotation.x = 0;
                car_light_1.position.set(-1.9, 1.3, 1.1);
                car_light_2.position.set(-1.9, 1.3, -1.1);
                car_light_3.position.set(2, 1.3, 1.1);
                car_light_4.position.set(2, 1.3, -1.1);
                car_light_4.rotation.x = 0;
                car_wheels[0].rotation.x = 0.5 * Math.PI;
                car_wheels[0].position.y = 0.6;
                carRoofGroup.position.set(0, 0, 0);
                carRoofGroup.rotation.y = -0.5 * Math.PI;
                car_windshield.position.set(-1.05, 1.67, 0);
                car_windshield.rotation.y = -0.5 * Math.PI;

            }
            Destroyed = false;
        }

        //update controls
        var delta = clock.getDelta();
        orbitControls.update(delta);

        //birds animation 
        if (controls.BirdsAnimation) {
            birdAngle += controls.BirdsSpeed / 10;
            w_angle += controls.BirdsSpeed * 10;
            birdGroup.position.x = Math.sin(birdAngle) * 50;
            birdGroup.position.z = Math.cos(birdAngle) * 100;
            //animate the bird wings
            birdGroup.children[1].rotation.z = 0.5 * Math.cos(w_angle);
            birdGroup.children[2].rotation.z = -0.5 * Math.cos(w_angle);

            birdGroup2.position.z = Math.sin(birdAngle) * 50;
            birdGroup2.position.x = Math.cos(birdAngle) * 100;
            //animate the bird wings
            birdGroup2.children[1].rotation.z = 0.5 * Math.cos(w_angle);
            birdGroup2.children[2].rotation.z = -0.5 * Math.cos(w_angle);
        }

        //clouds animation 
        if (controls.CloudsAnimation) {
            cloudAngle += controls.CloudsSpeed / 10;
            cloudsGroup.position.x = Math.cos(cloudAngle) * 150;
            cloudsGroup.position.z = Math.sin(cloudAngle) * 120;

            cloudsGroup2.position.z = Math.cos(cloudAngle) * 90;
            cloudsGroup2.position.x = Math.sin(cloudAngle) * 150;
        }

        //spotlights animation
        if (controls.SpotLightsAnimation) {
            lightAngle += controls.SpotLightsSpeed;
            spotLight1.position.x = (150 * (Math.sin(lightAngle)));
            spotLight1.position.z = (30 * (Math.cos(lightAngle)));
            spotLight2.position.z = (150 * (Math.sin(lightAngle)));
            spotLight2.position.x = (30 * (Math.cos(lightAngle)));
            sphereLightMesh.position = spotLight1.position;
            sphereLightMesh2.position = spotLight2.position;
        }
        // render using requestAnimationFrame
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    var keypress = new window.keypress.Listener();
    //tank movement    
    keypress.simple_combo("w", function () {
        //a destroyed vehicle can't move
        if (Destroyed)
            return;
        //the vehicle can move only on the ground
        if (onScene.position.x <= 200 && onScene.position.x >= -200 && onScene.position.z <= 200 && onScene.position.z >= -200) {
            onScene.position.x -= Math.sin(onScene.rotation.y);
            onScene.position.z -= Math.cos(onScene.rotation.y);
        } else {
            if (onScene.position.x > 200)
                onScene.position.x = 200;
            if (onScene.position.x < -200)
                onScene.position.x = -200;
            if (onScene.position.z > 200)
                onScene.position.z = 200;
            if (onScene.position.z < -200)
                onScene.position.z = -200;
        }
    });
    keypress.simple_combo("w a", function () {
        //a destroyed vehicle can't move
        if (Destroyed)
            return;
        //the vehicle can move only on the ground
        if (onScene.position.x <= 200 && onScene.position.x >= -200 && onScene.position.z <= 200 && onScene.position.z >= -200) {
            onScene.position.x -= Math.sin(onScene.rotation.y);
            onScene.position.z -= Math.cos(onScene.rotation.y);
        } else {
            if (onScene.position.x > 200)
                onScene.position.x = 200;
            if (onScene.position.x < -200)
                onScene.position.x = -200;
            if (onScene.position.z > 200)
                onScene.position.z = 200;
            if (onScene.position.z < -200)
                onScene.position.z = -200;
        }
        onScene.rotation.y += 0.05;
    });
    keypress.simple_combo("w d", function () {
        //a destroyed vehicle can't move
        if (Destroyed)
            return;
        //the vehicle can move only on the ground
        if (onScene.position.x <= 200 && onScene.position.x >= -200 && onScene.position.z <= 200 && onScene.position.z >= -200) {
            onScene.position.x -= Math.sin(onScene.rotation.y);
            onScene.position.z -= Math.cos(onScene.rotation.y);
        } else {
            if (onScene.position.x > 200)
                onScene.position.x = 200;
            if (onScene.position.x < -200)
                onScene.position.x = -200;
            if (onScene.position.z > 200)
                onScene.position.z = 200;
            if (onScene.position.z < -200)
                onScene.position.z = -200;
        }
        onScene.rotation.y -= 0.05;
    });
    keypress.simple_combo("s", function () {
        //a destroyed vehicle can't move
        if (Destroyed)
            return;
        //the vehicle can move only on the ground
        if (onScene.position.x <= 200 && onScene.position.x >= -200 && onScene.position.z <= 200 && onScene.position.z >= -200) {
            onScene.position.x += Math.sin(onScene.rotation.y);
            onScene.position.z += Math.cos(onScene.rotation.y);
        } else {
            if (onScene.position.x > 200)
                onScene.position.x = 200;
            if (onScene.position.x < -200)
                onScene.position.x = -200;
            if (onScene.position.z > 200)
                onScene.position.z = 200;
            if (onScene.position.z < -200)
                onScene.position.z = -200;
        }
    });
    keypress.simple_combo("a", function () {
        //a destroyed vehicle can't move
        if (Destroyed)
            return;
        onScene.rotation.y += 0.05;
    });
    keypress.simple_combo("d", function () {
        //a destroyed vehicle can't move
        if (Destroyed)
            return;
        onScene.rotation.y -= 0.05;
    });
    //toggle fog
    keypress.simple_combo("f", function () {
        if (scene.fog.near === 80) {
            //fog disabled
            scene.fog.near = 0.1;
            scene.fog.far = 5000;
        } else {
            //fog enabled
            scene.fog.near = 80;
            scene.fog.far = 260;
        }
    });
    //toggle shadow
    keypress.simple_combo("r", function () {
        if (shadow_on === false) {
            //shadows are disabled on scene,... enable 
            shadow_on = true;
            //only if spotlights are visible enable their shadow
            if (sphereLightMesh.visible === 1) {
                spotLight1.shadowDarkness = 0.5;
            }
            if (sphereLightMesh2.visible === 1) {
                spotLight2.shadowDarkness = 0.5;
            }
            if (lightbulb.visible === 1) {
                spotLightbulb.shadowDarkness = 0.5;
            }
        } else {
            shadow_on = false;
            if (sphereLightMesh.visible === 1) {
                spotLight1.shadowDarkness = 0;
            }
            if (sphereLightMesh2.visible === 1) {
                spotLight2.shadowDarkness = 0;
            }
            if (lightbulb.visible === 1) {
                spotLightbulb.shadowDarkness = 0;
            }
        }
    });
    //toggle spotLights
    keypress.simple_combo("z", function () {
        if (sphereLightMesh.visible === 0) {
            sphereLightMesh.visible = 1;
            spotLight1.visible = 1;
            spotLight1.shadowDarkness = 0.5;

            sphereLightMesh2.visible = 1;
            spotLight2.visible = 1;
            spotLight2.shadowDarkness = 0.5;
        } else {
            sphereLightMesh.visible = 0;
            spotLight1.visible = 0;
            spotLight1.shadowDarkness = 0;

            sphereLightMesh2.visible = 0;
            spotLight2.visible = 0;
            spotLight2.shadowDarkness = 0;
        }
    });
    //toggle birds
    keypress.simple_combo("c", function () {
        if (birdGroup.visible === 0) {
            // make all objects from birds groups visible
            for (var i = 0; i < birdGroup.children.length; ++i) {
                birdGroup.children[i].visible = 1;
            }
            for (var i = 0; i < birdGroup2.children.length; ++i) {
                birdGroup2.children[i].visible = 1;
            }
            // make birds groups visible too
            birdGroup.visible = 1;
            birdGroup2.visible = 1;
        } else {
            // make all objects from birds groups invisible
            for (var i = 0; i < birdGroup.children.length; ++i) {
                birdGroup.children[i].visible = 0;
            }
            for (var i = 0; i < birdGroup2.children.length; ++i) {
                birdGroup2.children[i].visible = 0;
            }
            // make birds groups invisible too
            birdGroup.visible = 0;
            birdGroup2.visible = 0;
        }
    });
    //toggle clouds
    keypress.simple_combo("v", function () {
        if (cloudsGroup.visible === 0) {
            // make all objects from clouds groups visible
            for (var i = 0; i < cloudsGroup.children.length; ++i) {
                cloudsGroup.children[i].visible = 1;
            }
            for (var i = 0; i < cloudsGroup2.children.length; ++i) {
                cloudsGroup2.children[i].visible = 1;
            }
            // make clouds groups visible too
            cloudsGroup.visible = 1;
            cloudsGroup2.visible = 1;
            //check clouds botton
            controls.Clouds = true;
        } else {
            // make all objects from clouds groups visible
            for (var i = 0; i < cloudsGroup.children.length; ++i) {
                cloudsGroup.children[i].visible = 0;
            }
            for (var i = 0; i < cloudsGroup2.children.length; ++i) {
                cloudsGroup2.children[i].visible = 0;
            }
            // make clouds groups visible too
            cloudsGroup.visible = 0;
            cloudsGroup2.visible = 0;
            // uncheck clouds botton
            controls.Clouds = false;
        }
    });
    //camera view angle 
    keypress.simple_combo("1", function () {
        camera.position.set(onScene.position.x + 30, onScene.position.y + 15, onScene.position.z - 35);
    });
    keypress.simple_combo("num_1", function () {
        camera.position.set(onScene.position.x + 30, onScene.position.y + 15, onScene.position.z - 35);
    });
    keypress.simple_combo("2", function () {
        camera.position.set(onScene.position.x - 30, onScene.position.y + 15, onScene.position.z - 35);
    });
    keypress.simple_combo("num_2", function () {
        camera.position.set(onScene.position.x - 30, onScene.position.y + 15, onScene.position.z - 35);
    });
    keypress.simple_combo("3", function () {
        camera.position.set(onScene.position.x + 30, onScene.position.y + 15, onScene.position.x + 35);
    });
    keypress.simple_combo("num_3", function () {
        camera.position.set(onScene.position.x + 30, onScene.position.y + 15, onScene.position.x + 35);
    });
    keypress.simple_combo("4", function () {
        camera.position.set(onScene.position.x - 30, onScene.position.y + 15, onScene.position.z + 35);
    });
    keypress.simple_combo("num_4", function () {
        camera.position.set(onScene.position.x - 30, onScene.position.y + 15, onScene.position.z + 35);
    });
    keypress.simple_combo("5", function () {
        camera.position.set(0, onScene.position.y + 15, onScene.position.z - 35);
    });
    keypress.simple_combo("num_5", function () {
        camera.position.set(0, onScene.position.y + 15, onScene.position.z - 35);
    });
    keypress.simple_combo("6", function () {
        camera.position.set(onScene.position.x + 30, onScene.position.y + 15, 0);
    });
    keypress.simple_combo("num_6", function () {
        camera.position.set(onScene.position.x + 30, onScene.position.y + 15, 0);
    });
    //toggle lightbulb
    keypress.simple_combo("b", function () {
        if (Destroyed === false) {
            if (spotLightbulb.visible === 0) {
                spotLightbulb_on = true;
                spotLightbulb.visible = 1;
                spotLightbulb.shadowDarkness = 0.5;
                lightbulb.material.color.setHex(0xF2FF61);
            } else {
                spotLightbulb_on = false;
                spotLightbulb.visible = 0;
                spotLightbulb.shadowDarkness = 0;
                lightbulb.material.color.setHex(0xadadad);
            }
        }
    });
    //toggle flag
    keypress.simple_combo("m", function () {
        if (flag_plane.visible === 0) {
            flag_plane.visible = 1;
            flag_piece_1.visible = 1;
            flag_piece_2.visible = 1;
            flag_piece_3.visible = 1;
            flag_piece_4.visible = 1;
            flag_piece_5.visible = 1;
            controls.FlagVisibility = true;
        } else {
            flag_plane.visible = 0;
            flag_piece_1.visible = 0;
            flag_piece_2.visible = 0;
            flag_piece_3.visible = 0;
            flag_piece_4.visible = 0;
            flag_piece_5.visible = 0;
            controls.FlagVisibility = false;
        }
    });
    //toggle pole
    keypress.simple_combo("n", function () {
        if (lightbulb.visible === 0) {
            lightbulb.visible = 1;
            lighting_piece_1.visible = 1;
            lighting_piece_2.visible = 1;
            lighting_piece_3.visible = 1;
            lighting_piece_4.visible = 1;
            controls.PoleVisibility = true;
        } else {
            lightbulb.visible = 0;
            spotLightbulb.visible = 0;
            spotLightbulb.shadowDarkness = 0;
            lighting_piece_1.visible = 0;
            lighting_piece_2.visible = 0;
            lighting_piece_3.visible = 0;
            lighting_piece_4.visible = 0;
            controls.PoleVisibility = false;
        }
    });
    //spotlights speed increase
    keypress.simple_combo("shift g", function () {
        if (controls.SpotLightsSpeed < 0.1) {
            controls.SpotLightsSpeed += 0.001;
        }
    });
    //spotlights speed decrease
    keypress.simple_combo("shift h", function () {
        if (controls.SpotLightsSpeed > 0.01)
            controls.SpotLightsSpeed -= 0.001;
    });
    //bird speed increase
    keypress.simple_combo("shift j", function () {
        if (controls.BirdsSpeed < 0.1) {
            controls.BirdsSpeed += 0.001;
        }
    });
    //bird speed decrease
    keypress.simple_combo("shift k", function () {
        if (controls.BirdsSpeed > 0.01)
            controls.BirdsSpeed -= 0.001;
    });
    //clouds speed increase
    keypress.simple_combo("shift t", function () {
        if (controls.CloudsSpeed < 0.1) {
            controls.CloudsSpeed += 0.001;
        }
    });
    //clouds speed decrease
    keypress.simple_combo("shift y", function () {
        if (controls.CloudsSpeed > 0.01)
            controls.CloudsSpeed -= 0.001;
    });
    //camera lookAt vehicle
    keypress.simple_combo("7", function () {
        orbitControls.center = onScene.position;
    });
    //camera lookAt first bird
    keypress.simple_combo("8", function () {
        orbitControls.center = birdGroup.position;
    });
    //camera lookAt second bird
    keypress.simple_combo("9", function () {
        orbitControls.center = birdGroup2.position;
    });
    //camera lookAt first spotlight
    keypress.simple_combo("0", function () {
        orbitControls.center = spotLight1.position;
    });
    //camera lookAt second spotlight
    keypress.simple_combo("o", function () {
        orbitControls.center = spotLight2.position;
    });
    //camera lookAt first cloud
    keypress.simple_combo("i", function () {
        orbitControls.center = cloudsGroup.position;
    });
    //camera lookAt second cloud
    keypress.simple_combo("p", function () {
        orbitControls.center = cloudsGroup2.position;
    });
    function initStats() {

        var stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms

        // Align top-left
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';

        $("#Stats-output").append(stats.domElement);
        return stats;
    }
});