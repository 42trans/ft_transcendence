import Pong from '../Pong'
import BaseGameState from './BaseGameState'
import { MagmaFlare } from '../effect/MagmaFlare'
import * as THREE from 'three';

class EntryGameState extends BaseGameState {
	constructor (Pong){
		super(Pong);
	}

	enter() {
		// メインメニュー特有の初期化
		console.log("Entering Entry state");
		this.Pong.renderer.clear();


		this.Pong.effectsSceneManager.refreshScene();
		// this.Pong.renderer.clearDepth();
		// this.Pong.gameSceneManager.refreshScene();
		// this.Pong.renderer.clearDepth();
		// this.Pong.backgroundSceneManager.refreshScene();
	}

	update() {
		if (!this.Pong || !this.Pong.effectsSceneManager) {
			console.error("One of the required properties is undefined.");
			return;
		}
		this.Pong.renderer.clear();

		this.Pong.effectsSceneManager.update();
		
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
