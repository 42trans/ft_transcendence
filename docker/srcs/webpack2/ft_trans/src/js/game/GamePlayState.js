import Pong from '../Pong'
import BaseGameState from './BaseGameState'
import BackgroundSceneConfig from '../config/BackgroundSceneConfig';
import SceneUnit from '../SceneUnit';

class GameplayState extends BaseGameState {
	constructor (Pong){
		super(Pong);
	}
	enter() {
		// メインメニュー特有の初期化
		console.log("Entering GamePlay state");
		this.Pong.backgroundSceneUnit.refreshScene();
	}

	update() {
	}

	render() {
	}

	exit() {
		console.log("Exiting GamePlay state");
	}
}

export default GameplayState;
