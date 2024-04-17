import PongApp from '../PongApp'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
// import GameStateManager from './states/GameStateManager';
import BaseGameState from './BaseGameState'
import SceneUnit from '../SceneUnit';
import PongEngine from '../pongEngine/PongEngine';

class GameplayState extends BaseGameState {
	constructor (PongApp){
		super(PongApp);
	}
	enter() {
		console.log("Entering GamePlay state");
		this.PongApp.allScenesManager.backgroundSceneUnit.refreshScene(new BackgroundSceneConfig());
		this.PongApp.allScenesManager.gameSceneUnit.refreshScene(new GameSceneConfig());
		// this.pongEngine = new PongEngine();
		// this.pongEngine(this.PongApp.renderer, this.PongApp.animationMixersManager, this.gameSceneUnit.scene);
	}

	update() {
	}

	render() {
	}

	exit() {
		console.log("Exiting GamePlay state");
		this.PongApp.allScenesManager.backgroundSceneUnit.clearScene();
		this.PongApp.allScenesManager.gameSceneUnit.clearScene();

	}
}

export default GameplayState;
