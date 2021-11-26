/* CIS 454 Group 6
 * Final Project
 * rooftop.js
 * contains all of our rendering code for the rooftop scene
 * utilizes the ThreeJS library for WebGL rendering
 */

// Import relevant libraries from ThreeJS

// EXTREMELY IMPORTANT!!!
// THESE IMPORT STATEMENTS WILL NOT WORK ON CODEPEN AS IS, THE CODEPEN PROJECT REQUIRES THESE BE LOADED FROM A CDN SERVICE
// The Codepen codebase must use https://cdn.skypack.dev/three as the URL for the THREE module
// And all the jsm modules must be prefixed with https://cdn.skypack.dev/three/examples/ in order to work (eg GLTFLoader is https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js)

// To whoever is grading this, the project uploaded on our group's Codepen should work out of the box as is, you shouldn't need to change anything on there
// However this version of the codebase was primarily developed on a local webserver and we have the library locally installed for convenience

import * as THREE from './build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';

window.onload = main;

// Size of the procedural background grid
const gridW = 50;
const gridH = 50;

function main()
{
    const canvas = document.querySelector("#c");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;

    // depth parameter controls if there is a depth buffer enabled for depth testing
    // By default, ThreeJS has depth testing enabled since that's typically what you want when rendering in 3D, however it can be disabled on a per material basis as you'll see later (line 155)
    const renderer = new THREE.WebGLRenderer({canvas: canvas, depth: true});

    const scene = new THREE.Scene();

    // Perspective based camera that applies perspective projections
    // This camera will apply a perspective projection with an fov of 75 degrees with near/far planes at 0.1 and 1000
    const camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
    let boxOrbit = false;
    let mixer;
    let animSpeed = 1.0;

    camera.position.z = 5;

    let cubeLoader = new THREE.CubeTextureLoader();

     scene.background = cubeLoader.load([
	 	'SkyRight.bmp',
	 	'SkyLeft.bmp',
	 	'SkyTop.bmp',
	 	'SkyBottom.bmp',
	 	'SkyFront.bmp',
	 	'SkyBack.bmp'
	]);

    // the texture for the Neo cube
    let textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load( 'Smith.png' );

    // makes the Neo cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial();
    material.color.set(0x63512D);
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = -10;
    cube.position.z = 7.25;
    cube.scale.x  = 7.5;
    cube.scale.y  = 20;
    cube.scale.z  = 15;
    scene.add( cube );

    // adds a white point and ambient light to the scene to illuminate objects
    // The ambient light adds a small amount of ambient color to all the phong materials in the scene, providing some subtle background illumination
    const color = 0xFFFFFF;
    const light = new THREE.AmbientLight(color, 0.1);
    const light2 = new THREE.PointLight(0xFFFFFF, 0.7);
    light2.position.y = 20;
    light2.position.z = 10;
    scene.add(light);
    scene.add(light2);

    // sets up the camera to have orbiting controls to manipulate the scene, orbits the world origin
    let controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    // Instantiate a loader
    // This object is used to load gltf / glb files
    const loader = new GLTFLoader();

    let playback = document.querySelector("#playback");
    //slider to adjust animation speed for neo model
    playback.oninput = () => {
        console.log(playback.value);
        animSpeed = playback.value;
    };

    let bp;

    //loads Neo model
    loader.load(
        'neo.gltf',
        function (gltf) {
            gltf.scene.position.z = 12.5;
            gltf.scene.scale.z = -1;

            controls.target = gltf.scene.position;
            //add animations from .gltf files
            mixer = new THREE.AnimationMixer(gltf.scene);
            mixer.clipAction(gltf.animations[0]).play();
            //add Neo to scene
            scene.add(gltf.scene);
        },
        function (xhr) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% of Neo loaded' );
        },
        function (error)
        {
            console.log(error);
        }
    )

    let bullets = [];
    const bulletCount = 50;
    var row = 0;
    for(var x = 0; x < bulletCount; x++)
    {
        const geometry = new THREE.CylinderGeometry(0.04, 0.06, 0.2, 8);
        const material = new THREE.MeshPhongMaterial( {color: 0x555555 , specular: 0xFFFFFF, shininess: 100} );
        const cylinder = new THREE.Mesh( geometry, material );
        scene.add(cylinder);
        cylinder.position.x = (Math.random()*6) - 3;
        cylinder.position.y = 1 + (row%5)/5;
        cylinder.position.z = (Math.random()*100)%20;
        cylinder.rotation.x = 90 * Math.PI / 180;
        row++;
        bullets.push(cylinder);
    }

    // timers and delta-time for the text streaking effect
    let timer = 0;
    let lastTime = 0;
    let dt = 1.0 / 60.0;
    
    // the render loop
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        // calculate frametime to get a delta-time in seconds
        dt = time - lastTime;
        lastTime = time;

        timer += dt;

        controls.update(dt)

        const bulletSpeed = 2.5;
        for(var x = 0; x < bulletCount; x++) {
            bullets[x].position.z += bulletSpeed * animSpeed * dt;
            bullets[x].position.z %= 17.5;
        }

        // update the effect every 0.1 seconds
        if (timer > 0.1)
        {
            timer = 0;
        }

        if (bp != undefined)
            bp.rotation.y = time * 0.4;

        if (mixer != undefined)
            mixer.update(dt * animSpeed);

        // render the scene
        renderer.render(scene, camera);
    
        // request another frame of animation
        requestAnimationFrame(render);
    }

    // beings the render loop
    requestAnimationFrame(render);

}