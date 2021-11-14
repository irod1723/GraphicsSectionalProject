/* CIS 454 Group 6
 * Sectional project 2
 * main.js
 * contains all of our rendering code
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
import { FBXLoader } from './jsm/loaders/FBXLoader.js'
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { FontLoader } from './jsm/loaders/FontLoader.js';
import { TextGeometry } from './jsm/geometries/TextGeometry.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';

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
		'neo.png',
		'neo.png',
		'neo.png',
		'Smith.png',
		'neo.png',
		'neo.png'
	]);

    // the texture for the Neo cube
    let textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load( 'neo.png' );

    // makes the Neo cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = -1;
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

    loader.load(
        // resource URL
        'cube.gltf',
        // called when the resource is loaded
        function ( gltf ) {
            let newCube = gltf.scene.getObjectByName("Cube");

            var vertShader = `
            varying vec2 vUv;
            void main()
            {
                vUv = uv;
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_Position = projectionMatrix * mvPosition;
            }
            `;
            var fragShader = `
            uniform sampler2D tOne;
            uniform sampler2D tSec;
            
            varying vec2 vUv;
            
            void main(void)
            {
                vec3 c;
                vec4 Ca = texture2D(tOne, vUv);
                vec4 Cb = texture2D(tSec, vUv);
                c = Ca.rgb * Ca.a + Cb.rgb * Cb.a;  // blending equation
                gl_FragColor= vec4(c, 1.0);
            }`;
            
            var uniforms = {    // custom uniforms (your textures)
                tOne: { type: "t", value: textureLoader.load( 'neoBox.png' ) },
                tSec: { type: "t", value: textureLoader.load( 'smithBox.png' ) }
            };
            
            var boxMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: vertShader,
                fragmentShader: fragShader
            });

            newCube.scale.y = -1;
            newCube.material = boxMaterial;
            scene.add(newCube);
        },
        // called while loading is progressing
        function ( xhr ) {
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        },
        // called when loading has errors
        function ( error ) {
            console.log( 'An error happened' );
        }
    );

    // this hook up the buttons that toggle the camera controls
    document.querySelector("#fps").addEventListener("click", (event) => {
        // sets a first person camera control
        controls.dispose();
        controls = null;
        controls = new FirstPersonControls(camera, canvas);
        controls.lookSpeed = 0.1;
        controls.movementSpeed = 3.0;
    });

    document.querySelector("#orbit").addEventListener("click", (event) => {
        // sets an orbiting camera control
        controls.dispose();
        controls = new OrbitControls(camera, canvas);
        controls.target.set(0, 0, 0);
        controls.update();
    });

    document.querySelector("#box").addEventListener("click", (event) => {
        boxOrbit = !boxOrbit;
    });

    let playback = document.querySelector("#playback");
    playback.oninput = () => {
        console.log(playback.value);
        animSpeed = playback.value;
    };


    let bp;
    let curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( -10, 0, 2 ),
        new THREE.Vector3( -5, 15, 1 ),
        new THREE.Vector3( 20, 15, -1 ),
        new THREE.Vector3( 10, 0, -3 )
    );
    let curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 10, 0, -3 ),
        new THREE.Vector3( 5, 15, -5 ),
        new THREE.Vector3( 20, 5, 4 ),
        new THREE.Vector3( 4, 3, 3 )
    );
    let curve3 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 4, 3, 3 ),
        new THREE.Vector3( -5, 5, 2 ),
        new THREE.Vector3( -15, 10, 1),
        new THREE.Vector3( 0, 10, 0 )
    );

    let curve = new THREE.CurvePath();
    curve.add(curve1);
    curve.add(curve2);
    curve.add(curve3);

    const points = curve.getPoints( 50 );

    loader.load(
        'neo.gltf',
        function (gltf) {
            gltf.scene.position.y += 1.5;
            mixer = new THREE.AnimationMixer(gltf.scene);
            mixer.clipAction(gltf.animations[0]).play();
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

    // Load a glTF resource
    // Loads our gltf scene file (the hand and pill) and adds it into the scene
    loader.load(
        // resource URL
        'scene.gltf',
        // called when the resource is loaded
        function ( gltf ) {

            scene.add( gltf.scene );
            gltf.scene.scale.set(20, 20, 20);
            gltf.scene.rotation.set(0.3, -Math.PI - 0.4, 0);
            gltf.scene.position.set(2, 0, 0);

            // mirror the one hand we loaded and make its pill blue

            let s2 = gltf.scene.clone(true);
            s2.scale.x = -20;
            s2.position.x = -2;
            s2.rotation.y -= 0.8;

            let pill = s2.getObjectByName("Cylinder");

            // here, we are making the clone of the red pill into a blue one, and we do this by updating the material (into a phong material with blue diffuse). 
            pill.material = new THREE.MeshPhongMaterial({ color: 0x0000FF });
            scene.add(s2);
            pill.position.y += 0.01;

            bp = pill;
            
            const curveGeometry = new THREE.BufferGeometry().setFromPoints( points );
            
            const curveMat = new THREE.LineBasicMaterial( { color : 0x00FF00 } );
            
            // Create the final object to add to the scene
            const curveObject = new THREE.Line( curveGeometry, curveMat );

            scene.add(curveObject);
        },
        // called while loading is progressing
        function ( xhr ) {

            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

        },
        // called when loading has errors
        function ( error ) {

            console.log( 'An error happened' );

        }
    );

    // the array for the background grid
    let grid = [];

    // used to load the font
    const fl = new FontLoader();
    fl.load('Matrix_Regular.json', (font) => {
        // generate a text mesh that says THE MATRIX
        const tg = new TextGeometry('THE MATRIX', {
            font: font,
            size: 80,
            height: 50,
            curveSegments: 10,
            bevelEnabled: true
        });

        // The material used for THE MATRIX logo. This is a MeshPhongMaterial provided by ThreeJS. MeshPhongMaterial objects implement the Blinn-Phong lighting model.
        // Here, we assign the logo to have a white diffuse color, a very bright green specular highlight, and a high shininess constant
        // Since ThreeJS provides its own shaders and implements the Blinn-Phong model internally, our codebase at no point ever interfaces with the halfway vector or shaders in general, however the model internally uses it to approximate speculars 
        const mat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0xAAFFAA, shininess: 100 });
        let mesh = new THREE.Mesh(tg, mat);

        // hooks up the button to toggle depth testing 
        // This toggles the depth testing for the material of THE MATRIX logo. Disabling depth testing causes objects behind it to render in front of it and breaks the illusion of depth. 
        // Internally, ThreeJS is using a depth / z buffer to do this depth testing, however we never need to interact with it directly, only request it be enabled or disabled
        document.querySelector("#depth").addEventListener("click", (event) => {
            mat.depthTest = !mat.depthTest;
        });

        // some sizing stuff, it was WAAAY too big

        mesh.scale.x = 0.01;
        mesh.scale.y = 0.01;
        mesh.scale.z = 0.01;
        mesh.position.x = -4;
        mesh.position.z = -1;
        mesh.position.y = 1;
        scene.add(mesh);
        
        // adds a green pointlight behind the logo

        let glow = new THREE.PointLight(0x00FF00, 0.9);
        glow.position.z = -2;
        scene.add(glow);



        // generate the procedural grid of characters randomly

        for (var y = 0; y < gridH; y++)
        {
            grid.push([]);
            for (var x = 0; x < gridW; x++)
            {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let g = new TextGeometry(chars[Math.floor(Math.random() * chars.length)], {
                    font: font,
                    size: 40,
                    height: 10,
                    bevelEnabled: false
                });
                let mat = new THREE.MeshBasicMaterial({ color: 0x227722 });
                let m = new THREE.Mesh(g, mat);
                grid[y].push(m);

                m.position.x = x - gridW / 2;
                m.position.y = y - gridH / 2;
                m.position.z = -5;
                m.scale.x = 0.01;
                m.scale.y = 0.01;
                m.scale.z = 0.01;

                scene.add(m);
            }
        }


    });

    // timers and delta-time for the text streaking effect
    let timer = 0;
    let lastTime = 0;
    let dt = 1.0 / 60.0;

    // variables to control the randomness in text streaking effect
    let offsets = [];
    let variation = 10.0
    for (let i = 0; i < gridW; i++)
        offsets[i] = Math.random() * variation;
    
    // the render loop
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        // calculate frametime to get a delta-time in seconds
        dt = time - lastTime;
        lastTime = time;

        timer += dt;

        controls.update(dt)

        // update the effect every 0.1 seconds
        if (timer > 0.1)
        {
            for (var i = 0; i < gridH * gridW; i++)
            {
                let y = Math.floor(i / gridW);
                if (grid[y] != undefined && grid[y][i%gridW] != undefined)
                {
                    // this effect is achieved by teleporting each character to a new location onto the grid
                    // once a character is moved somewhere randomly on the grid, its color is set using a mathematical function which gives it the appearance of the colored streaks
                    // intensity = max(1 - (input % 5) ^ 4 , 0)
                    // this is a sawtooth like curve with a gap to simulate the black spacing between streaks
                    // these constants could be changed to effect things like the length of streaks or the frequency they appear

                    let letter = grid[y][i%gridW];
                    letter.position.set(Math.floor(Math.random() * (gridW-1)) - gridW/2, Math.floor(Math.random() * (gridH - 1)) - gridH / 2, -5);
                    let newX = Math.floor(letter.position.x + gridW/2);
                    let newY = Math.floor(letter.position.y + gridH/2);

                    // input into the intensity function
                    let input = time + 0.1 * newY + offsets[newX];

                    // funky math to get the streaking color as described above
                    let intensity = Math.max(1 - Math.pow(input %= 5, 4), 0);
                    letter.material.color.g = intensity;
                    letter.material.color.r = 0.3 * Math.pow(intensity, 2);
                    letter.material.color.b = 0.25 * letter.material.color.r;
                }
            }
            timer = 0;
        }

        // rotate objects in the scene
        cube.rotation.y = time;

        const pathTime = 20.0;
        let newPos = curve.getPoint((time % pathTime) / pathTime);
        cube.position.x = newPos.x;
        cube.position.y = newPos.y;
        cube.position.z = newPos.z;

        if (controls.target != undefined)
        {
            if (boxOrbit)
                controls.target = cube.position;
            else
                controls.target.set(0,0,0);
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