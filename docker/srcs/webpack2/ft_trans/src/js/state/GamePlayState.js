import PongApp from '../PongApp'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
// import GameStateManager from './states/GameStateManager';
import BaseGameState from './BaseGameState'
import SceneUnit from '../SceneUnit';
import PongEngine from '../pongEngine/PongEngine';
import MagmaFlare from '../effect/MagmaFlare'
import AllScenesManager from '../manager/AllScenesManager';


class GameplayState extends BaseGameState {
	constructor (PongApp){
		super(PongApp);
		this.ScenesMgr = AllScenesManager.getInstance();
	}
	enter() {
		console.log("Entering GamePlay state");
		this.ScenesMgr.backgroundScene.refreshScene(new BackgroundSceneConfig());
		this.ScenesMgr.gameScene.refreshScene(new GameSceneConfig());

		this.pongEngine = new PongEngine(
			this.ScenesMgr.gameScene.scene
		);

		// const magmaFlare = new MagmaFlare();
		// magmaFlare.name = "MagmaFlare";
		// this.PongApp.allScenesManager.effectsScene.scene.add(magmaFlare);
	
	}

	update() {
	}

	render() {
	}

	exit() {
		console.log("Exiting GamePlay state");
		this.PongApp.allScenesManager.backgroundScene.clearScene();
		this.PongApp.allScenesManager.gameScene.clearScene();
		// this.PongApp.allScenesManager.effectsScene.clearScene();


	}
}

export default GameplayState;
