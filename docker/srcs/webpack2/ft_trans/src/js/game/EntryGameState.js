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

		
		this.Pong.backgroundSceneManager.refreshScene();
		this.Pong.gameSceneManager.refreshScene();
		// this.Pong.effectsSceneManager.refreshScene();
		const magmaFlare = new MagmaFlare();
		magmaFlare.name = "MagmaFlare";
		this.Pong.effectsSceneManager.scene.add(magmaFlare);
	}

	update() {

	}

	render() {
	}

	exit() {
		console.log("Exiting Entry state");
	}
}

export default EntryGameState;
