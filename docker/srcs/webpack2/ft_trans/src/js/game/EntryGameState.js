import Pong from '../Pong'
import BaseGameState from './BaseGameState'
import { MagmaFlare } from '../effect/MagmaFlare'
import * as THREE from 'three';

class EntryGameState extends BaseGameState {
	constructor (Pong){
		super(Pong);
		// this._magmaFlare = new MagmaFlare();
	}

	enter() {
		// メインメニュー特有の初期化
		console.log("Entering Entry state");
		this.Pong.renderer.clear();

		
		// カメラの位置と向きをログで確認
	// console.log("Camera Position:", this.Pong.effectsSceneManager.camera.position);
	// console.log("Camera LookAt:", this.Pong.effectsSceneManager.camera.lookAt);

		// this._magmaFlare.position.y = 1;
		// this.Pong.effectsSceneManager.scene.add(this._magmaFlare);
		
		// console.log("All objects in the scene:");
		// this.Pong.gameSceneManager.scene.traverse((obj) => {
		// 	console.log(obj);
		// });


		this.Pong.effectsSceneManager.refreshScene();
	}

	update() {
		if (!this.Pong || !this.Pong.effectsSceneManager) {
			console.error("One of the required properties is undefined.");
			return;
		}
		this.Pong.renderer.clear();

		// this._magmaFlare.update();
		
		this.Pong.effectsSceneManager.animMxr.update();
	}

	render() {
		this.Pong.renderer.clearDepth();
		this.Pong.renderer.render(this.Pong.effectsSceneManager.scene, this.Pong.effectsSceneManager.camera);
	}

	exit() {
		console.log("Exiting Entry state");
	}
}

export default EntryGameState;
