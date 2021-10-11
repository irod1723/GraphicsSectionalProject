import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';;

window.onload = main;

function main()
{
    const canvas = document.querySelector("#c");

    const renderer = new THREE.WebGLRenderer({canvas});

    const scene = new THREE.Scene();

    // Perspective based camera that applies perspective projections
    const camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.1, 1000 );
    camera.position.z = 5;

    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    
    function render(time) {
        time *= 0.001;  // convert time to seconds
    
        cube.rotation.x = time;
        cube.rotation.y = time;
    
        renderer.render(scene, camera);
    
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

}