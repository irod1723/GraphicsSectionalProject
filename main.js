import * as THREE from './build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { FBXLoader } from './jsm/loaders/FBXLoader.js'
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { FontLoader } from './jsm/loaders/FontLoader.js';
import { TextGeometry } from './jsm/geometries/TextGeometry.js';

window.onload = main;

function main()
{
    const canvas = document.querySelector("#c");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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
    scene.add(light);
    scene.add(light2);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    // Instantiate a loader
    const loader = new GLTFLoader();

    let bp;

    const fbx = new FBXLoader();
    fbx.load('./neo/keanu.fbx', function(loaded) {
        scene.add(loaded);
        loaded.scale.set(0.001, 0.001, 0.001);
        console.log(loaded);
    }, undefined, (error) => {
        console.log(error);
    });

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
        const mat = new THREE.MeshPhongMaterial({ color: 0x00FF00, specular: 0xFFFFFF, shininess: 100 });
        let mesh = new THREE.Mesh(tg, mat);
        mesh.scale.x = 0.01;
        mesh.scale.y = 0.01;
        mesh.scale.z = 0.01;
        mesh.position.x = -4;
        mesh.position.z = -1;
        mesh.position.y = 1;
        scene.add(mesh);

        for (var y = 0; y < 15; y++)
        {
            grid.push([]);
            for (var x = 0; x < 15; x++)
            {
                const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let g = new TextGeometry(chars[Math.floor(Math.random() * chars.length)], {
                    font: font,
                    size: 40,
                    height: 10,
                    bevelEnabled: false
                });
                let mat = new THREE.MeshPhongMaterial({ color: 0x227722 });
                let m = new THREE.Mesh(g, mat);
                grid[y].push(m);
                //grid[y][x] = m;
                m.position.x = x - 7.5;
                m.position.y = y - 7.5;
                m.position.z = -5;
                m.scale.x = 0.01;
                m.scale.y = 0.01;
                m.scale.z = 0.01;

                scene.add(m);
            }
        }

        alert("printing");
        console.log(grid);

    });

    let timer = 0;
    let lastTime = 0;
    let dt = 1.0 / 60.0;
    let offsets = [];
    for (let i = 0; i < 16; i++)
        offsets[i] = Math.random() * 16 - 8;
    
    function render(time) {
        time *= 0.001;  // convert time to seconds
        
        dt = time - lastTime;
        lastTime = time;

        timer += dt;

        if (timer > 0.2)
        {
            for (var i = 0; i < 15 * 15; i++)
            {
                let y = Math.floor(i / 15);
                if (grid[y] != undefined && grid[y][i%15] != undefined)
                {
                    grid[y][i%15].position.set(Math.floor(Math.random() * 14) - 7.5, Math.floor(Math.random() * 14) - 7.5, -5);
                    let newX = Math.floor(grid[y][i%15].position.x + 7.5);
                    let newY = Math.floor(grid[y][i%15].position.y + 7.5);
                    grid[y][i%15].material.color.g = Math.abs(Math.sin(time + 0.3 * (offsets[newX]) + 0.3 * (newY)));
                    //console.log("shuffle");
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