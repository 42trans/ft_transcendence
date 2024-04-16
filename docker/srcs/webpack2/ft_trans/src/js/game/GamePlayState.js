import Pong from '../Pong'
import BaseGameState from './BaseGameState'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import GameSceneConfig from '../config/GameSceneConfig';
// import GameStateManager from './states/GameStateManager';
import SceneUnit from '../SceneUnit';

class GameplayState extends BaseGameState {
	constructor (Pong){
		super(Pong);
	}
	enter() {
		console.log("Entering GamePlay state");
		// this.Pong.backgroundSceneUnit.refreshScene(new BackgroundSceneConfig());
		this.Pong.gameSceneUnit.refreshScene(new GameSceneConfig());
		// this.pongEngine = new PongEngine();
		// this.pongEngine(this.Pong.renderer, this.Pong.animationMixersManager, this.gameSceneUnit.scene);
	}

	update() {
	}

	render() {
	}

	exit() {
		console.log("Exiting GamePlay state");
		// this.Pong.backgroundSceneUnit.clearScene();
		this.Pong.gameSceneUnit.clearScene();

	}
}

export default GameplayState;
