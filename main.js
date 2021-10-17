import * as THREE from './build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js'
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { FontLoader } from './jsm/loaders/FontLoader.js';
import { TextGeometry } from './jsm/geometries/TextGeometry.js';
import { FirstPersonControls } from './jsm/controls/FirstPersonControls.js';

window.onload = main;

const gridW = 50;
const gridH = 50;

function main()
{
    const canvas = document.querySelector("#c");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;

    const renderer = new THREE.WebGLRenderer({canvas});

    const scene = new THREE.Scene();

    // Perspective based camera that applies perspective projections
    const camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
    //const camera = new THREE.OrthographicCamera(0, canvas.width, 0, canvas.height, 0.1, 1000);
    camera.position.z = 5;

    const texture = new THREE.TextureLoader().load( 'neo.jpg' );

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.y = -1;
    scene.add( cube );

    const color = 0xFFFFFF;
    const light = new THREE.AmbientLight(color, 0.1);
    const light2 = new THREE.PointLight(0xFFFFFF, 0.7);
    light2.position.y = 20;
    light2.position.z = 10;
    //scene.add(light);
    scene.add(light2);

    let controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    // Instantiate a loader
    const loader = new GLTFLoader();

    document.querySelector("#fps").addEventListener("click", (event) => {
        controls.dispose();
        controls = null;
        controls = new FirstPersonControls(camera, canvas);
        controls.lookSpeed = 0.1;
        controls.movementSpeed = 3.0;
    });

    document.querySelector("#orbit").addEventListener("click", (event) => {
        controls.dispose();
        controls = new OrbitControls(camera, canvas);
        controls.target.set(0, 0, 0);
        controls.update();
    });

    let bp;

    // Load a glTF resource
    loader.load(
        // resource URL
        'scene.glb',
        // called when the resource is loaded
        function ( gltf ) {

            scene.add( gltf.scene );
            gltf.scene.scale.set(20, 20, 20);
            gltf.scene.rotation.set(0.3, -Math.PI - 0.4, 0);
            gltf.scene.position.set(2, 0, 0);

            let s2 = gltf.scene.clone(true);
            s2.scale.x = -20;
            s2.position.x = -2;
            s2.rotation.y -= 0.8;

            let pill = s2.getObjectByName("Cylinder");
            pill.material = new THREE.MeshPhongMaterial({ color: 0x0000FF });
            scene.add(s2);
            console.log(s2);
            pill.position.y += 0.01;

            bp = pill;

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

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

    let grid = [];

    const fl = new FontLoader();
    fl.load('Matrix_Regular.json', (font) => {
        const tg = new TextGeometry('THE MATRIX', {
            font: font,
            size: 80,
            height: 50,
            curveSegments: 10,
            bevelEnabled: true
        });
        const mat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular: 0xAAFFAA, shininess: 100 });
        let mesh = new THREE.Mesh(tg, mat);
        mesh.scale.x = 0.01;
        mesh.scale.y = 0.01;
        mesh.scale.z = 0.01;
        mesh.position.x = -4;
        mesh.position.z = -1;
        mesh.position.y = 1;
        scene.add(mesh);
        
        let glow = new THREE.PointLight(0x00FF00, 0.9);
        glow.position.z = -2;
        scene.add(glow);

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
                //grid[y][x] = m;
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

    let timer = 0;
    let lastTime = 0;
    let dt = 1.0 / 60.0;
    let offsets = [];
    let variation = 10.0
    for (let i = 0; i < gridW; i++)
        offsets[i] = Math.random() * variation;
    
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        dt = time - lastTime;
        lastTime = time;

        timer += dt;

        controls.update(dt)

        if (timer > 0.1)
        {
            for (var i = 0; i < gridH * gridW; i++)
            {
                let y = Math.floor(i / gridW);
                if (grid[y] != undefined && grid[y][i%gridW] != undefined)
                {
                    let letter = grid[y][i%gridW];
                    letter.position.set(Math.floor(Math.random() * (gridW-1)) - gridW/2, Math.floor(Math.random() * (gridH - 1)) - gridH / 2, -5);
                    let newX = Math.floor(letter.position.x + gridW/2);
                    let newY = Math.floor(letter.position.y + gridH/2);
                    let input = time + 0.1 * newY + offsets[newX];
                    let intensity = Math.max(1 - Math.pow(input %= 5, 4), 0);
                    letter.material.color.g = intensity;
                    letter.material.color.r = 0.3 * Math.pow(intensity, 2);
                    letter.material.color.b = 0.25 * letter.material.color.r;
                }
            }
            timer = 0;
        }

        //cube.rotation.x = time;
        cube.rotation.y = time;
        if (bp != undefined)
            bp.rotation.y = time * 0.4;
        renderer.render(scene, camera);
    
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}