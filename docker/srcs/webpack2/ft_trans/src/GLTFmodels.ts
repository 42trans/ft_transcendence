// GLTFModel.ts
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class GLTFModel {
    private _scene: THREE.Scene;
    private _mixer?: THREE.AnimationMixer;
    private _model?: THREE.Object3D;
    private _clock: THREE.Clock;

    constructor(scene: THREE.Scene) {
        this._scene = scene;
        this._clock = new THREE.Clock();
    }

    loadModel(path: string): void {
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            this._model = gltf.scene;
            this._model.position.set(-10, 8, -1);
            this._model.scale.set(1, 1, 1);
            this._mixer = new THREE.AnimationMixer(this._model);
            if (gltf.animations && gltf.animations.length) {
                const action = this._mixer.clipAction(gltf.animations[0]);
                action.play();
            }
            this._scene.add(this._model);
        }, undefined, (error) => {
            console.error('An error happened while loading the model:', error);
        });
    }

    update(): void {
        if (this._mixer) {
            const delta = this._clock.getDelta();
            this._mixer.update(delta);
        }

        // Model rotation
        if (this._model) {
            this._model.rotation.y += 0.01;
        }
    }
}
