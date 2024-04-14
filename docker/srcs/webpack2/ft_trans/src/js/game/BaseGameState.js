import Pong from '../Pong'

export class BaseGameState {
	constructor(Pong) {
		this.Pong = Pong;
	}
	enter() {
		throw new Error("Enter method must be implemented");
	}

	update() {
		throw new Error("Update method must be implemented");
	}

	render() {
		throw new Error("Render method must be implemented");
	}

	exit() {
		throw new Error("Exit method must be implemented");
	}
}

// export default BaseGameState;

export class MainMenuState extends BaseGameState {
	constructor (Pong){
		super(Pong);
	}
	enter() {
		// メインメニュー特有の初期化
		console.log("Entering main menu state");
	}

	update() {
		if (!this.Pong || !this.Pong.backgroundManager || !this.Pong.gameManager) {
			console.error("One of the required properties is undefined.");
			return;
		}
		this.Pong.renderer.clear();
		this.Pong.backgroundManager.animMgr.update();
		this.Pong.gameManager.animMgr.update();
	}

	render() {
		this.Pong.renderer.render(this.Pong.backgroundManager.scene, this.Pong.backgroundManager.camera);
		this.Pong.renderer.clearDepth();
		this.Pong.renderer.render(this.Pong.gameManager.scene, this.Pong.gameManager.camera);
	}

	exit() {
		console.log("Exiting main menu state");
	}
}


