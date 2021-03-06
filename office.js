/* CIS 454 Group 6
 * Final Project
 * office.js
 * contains all of our rendering code for the office scene
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
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';

window.onload = main;

function main()
{
    //creates a canvas to match the html page
    const canvas = document.querySelector("#c");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;

    // depth parameter controls if there is a depth buffer enabled for depth testing
    // By default, ThreeJS has depth testing enabled since that's typically what you want when rendering in 3D, however it can be disabled on a per material basis as you'll see later (line 155)
    const renderer = new THREE.WebGLRenderer({canvas: canvas, depth: true});
    renderer.physicallyCorrectLights = true;

    let scene = new THREE.Scene();
    
    // Perspective based camera that applies perspective projections
    // This camera will apply a perspective projection with an fov of 75 degrees with near/far planes at 0.1 and 1000
    const camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
    //place camera in Neo's chair
    camera.position.set(0, 3.5, -3);

    // sets up the camera to have orbiting controls to manipulate the scene, orbits the world origin
    let controls = new FirstPersonControls(camera, canvas);
    controls.lookSpeed = 0.1;
    controls.movementSpeed = 3.0;
    //controls.update();

    // the texture for the Neo cube
    let textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load( 'neo.png' );

    // makes the Neo cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshPhongMaterial({ map: texture, specular: 0xFFFFFF, shininess: 50 });
    material.color.set(0x63512D);
    const cube = new THREE.Mesh( geometry, material );


    // sets up the camera to have orbiting controls to manipulate the scene, orbits the world origin

    // Instantiate a loader
    // This object is used to load gltf / glb files
    const loader = new GLTFLoader();

    //delta-time for renderer frame-time stuff
    let lastTime = 0;
    let dt = 1.0 / 60.0;
    
    // the render loop
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        // calculate frametime to get a delta-time in seconds
        dt = time - lastTime;
        lastTime = time;

        controls.update(dt);

        cube.rotation.y += dt * 0.4;

        // render the scene
        renderer.render(scene, camera);
    
        // request another frame of animation
        requestAnimationFrame(render);
    }

        //loads scene
        loader.load(
            'Office.gltf',
            function (gltf) {
                //add animations from .gltf files
                scene.add(gltf.scene);
                scene.add( cube );
                //place Neo cube on desk
                cube.position.set(-3.8, 2.1, 4.3);
                cube.scale.set(0.3, 0.3, 0.3);

                console.log(scene);
                
                requestAnimationFrame(render);

                // Add shadows to all objects, including lights
                scene.traverse(function (obj) {
                    obj.castShadow = true
                    obj.receiveShadow = true
                    console.log('setting shadow to', obj)
                });
            },
            function (xhr) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% of Neo loaded' );
            },
            function (error)
            {
                console.log(error);
            }
        );

}