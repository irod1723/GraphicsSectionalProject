import * as THREE from './build/three.module.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';

window.onload = main;

function main()
{
    const canvas = document.querySelector("#c");

    const renderer = new THREE.WebGLRenderer({canvas});

    const scene = new THREE.Scene();

    // Perspective based camera that applies perspective projections
    const camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
    //const camera = new THREE.OrthographicCamera(0, canvas.width, 0, canvas.height, 0.1, 1000);
    camera.position.z = 5;

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    const color = 0xFFFFFF;
    const light = new THREE.AmbientLight(color, 1);
    scene.add(light);

    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 0, 0);
    controls.update();

    // Instantiate a loader
    const loader = new GLTFLoader();

    // Load a glTF resource
    loader.load(
        // resource URL
        'scene.glb',
        // called when the resource is loaded
        function ( gltf ) {

            scene.add( gltf.scene );

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



    
    function render(time) {
        time *= 0.001;  // convert time to seconds
    
        //cube.rotation.x = time;
        //cube.rotation.y = time;
    
        renderer.render(scene, camera);
    
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}