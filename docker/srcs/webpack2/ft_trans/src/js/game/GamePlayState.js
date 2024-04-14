import Pong from '../Pong'
import BaseGameState from './BaseGameState'

class GameplayState extends BaseGameState {
	constructor (Pong){
		super(Pong);
	}
	enter() {
		// メインメニュー特有の初期化
		console.log("Entering GamePlay state");
	}

	update() {
		if (!this.Pong || !this.Pong.backgroundManager || !this.Pong.gameManager) {
			console.error("One of the required properties is undefined.");
			return;
		}
		// this.Pong.renderer.clear();
		// this.Pong.backgroundManager.animMxr.update();
		// this.Pong.gameManager.animMxr.update();
	}

	render() {
		// this.Pong.renderer.render(this.Pong.backgroundManager.scene, this.Pong.backgroundManager.camera);
		// this.Pong.renderer.clearDepth();
		// this.Pong.renderer.render(this.Pong.gameManager.scene, this.Pong.gameManager.camera);
	}

	exit() {
		console.log("Exiting GamePlay state");
	}
}

export default GameplayState;
