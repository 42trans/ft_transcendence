import Pong from '../Pong'
import BaseGameState from './BaseGameState'

class MainMenuState extends BaseGameState {
	constructor (Pong){
		super(Pong);
	}
	enter() {
		// メインメニュー特有の初期化
		console.log("Entering MainMenu state");
		this.Pong.renderer.clear();
		this.Pong.gameSceneManager.refreshScene();
	}

	update() {
		if (!this.Pong || !this.Pong.gameSceneManager) {
			console.error("One of the required properties is undefined.");
			return;
		}
		this.Pong.renderer.clear();
		this.Pong.gameSceneManager.animMgr.update();
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
