import PongApp from '../PongApp'
import BaseGameState from './BaseGameState'
import MagmaFlare from '../effect/MagmaFlare'
// import * as THREE from 'three';

class EntryGameState extends BaseGameState {
	constructor (PongApp){
		super(PongApp);
	}

	enter() {
		// メインメニュー特有の初期化
		console.log("Entering Entry state");

		const magmaFlare = new MagmaFlare();
		magmaFlare.name = "MagmaFlare";
		this.PongApp.allScenesManager.effectsSceneUnit.scene.add(magmaFlare);
	}

	update() {

	}

	render() {
	}

	exit() {
		console.log("Exiting Entry state");
		this.PongApp.allScenesManager.effectsSceneUnit.clearScene();
	}
}

export default EntryGameState;
