import AnimationManager from '../AnimationManager'

export class BaseGameState {
	constructor(renderManager) {
		this.renderManager = renderManager;
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
	constructor (renderManager){
		super(renderManager);
	}
	enter() {
		// メインメニュー特有の初期化
		console.log("Entering main menu state");
	}

	update() {
		this.renderManager.renderer.clear();
		this.renderManager.backgroundAnimMgr.update();
		this.renderManager.gameAnimMgr.update();
	}

	render() {
		this.renderManager.renderer.render(this.renderManager.backgroundScene, this.renderManager.backgroundCamera);
		this.renderManager.renderer.clearDepth();
		this.renderManager.renderer.render(this.renderManager.gameScene, this.renderManager.gameCamera);
	}

	exit() {
		console.log("Exiting main menu state");
	}
}


