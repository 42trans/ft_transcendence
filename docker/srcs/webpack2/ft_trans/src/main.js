import * as THREE from "three";
import { MagmaFlare } from "./js/effect/MagmaFlare";

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('threejs-canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // カメラの位置設定
    camera.position.z = 5;

    // ライトの追加
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    // MagmaFlare の追加
    const magmaFlare = new MagmaFlare();
    scene.add(magmaFlare);

    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);

        // MagmaFlare の更新
        magmaFlare.update();

        // シーンのレンダリング
        renderer.render(scene, camera);
    }

    // アニメーション開始
    animate();
});
