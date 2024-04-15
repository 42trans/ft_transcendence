import * as THREE from "three";
import { MagmaFlare } from "./js/effect/MagmaFlare";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './css/3d.css';


document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('threejs-canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
		alpha: true, 
    });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // カメラの動きを滑らかにする
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;


    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // リサイズハンドラーのセットアップ
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize, false);

    if (!container.querySelector('canvas')) {
        container.appendChild(renderer.domElement);
    }

    // カメラの位置設定
    camera.position.z = 5;
    controls.target.set(0, 0, 0);

    // MagmaFlare の追加
    const magmaFlare = new MagmaFlare();
    scene.add(magmaFlare);

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);
        magmaFlare.update();
        renderer.render(scene, camera);
    }
    animate();
});
