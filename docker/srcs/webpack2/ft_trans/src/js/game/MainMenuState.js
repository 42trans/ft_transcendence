import Pong from '../Pong'
import BaseGameState from './BaseGameState'
import { MagmaFlare } from '../effect/MagmaFlare'
import * as THREE from 'three'

class MainMenuState extends BaseGameState {
	constructor (Pong){
		super(Pong);
	}
	enter() {
		// メインメニュー特有の初期化
		console.log("Entering MainMenu state");
		this.Pong.renderer.clear();

		// console.log("Camera Position:", this.Pong.gameSceneManager.camera.position);
		// console.log("Camera LookAt:", this.Pong.gameSceneManager.camera.lookAt);

		this.Pong.gameSceneManager.refreshScene();
	}

	update() {
		if (!this.Pong || !this.Pong.gameSceneManager) {
			console.error("One of the required properties is undefined.");
			return;
		}
		this.Pong.renderer.clear();
		this.Pong.gameSceneManager.animMxr.update();
	}

	render() {
		this.Pong.renderer.clearDepth();
		this.Pong.renderer.render(this.Pong.gameSceneManager.scene, this.Pong.gameSceneManager.camera);
	}

	exit() {
		console.log("Exiting MainMenu state");
	}
}

export default MainMenuState;
