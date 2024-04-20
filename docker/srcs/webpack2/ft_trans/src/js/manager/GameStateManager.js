import GamePlayState from '../state/GamePlayState'
import EntryGameState from '../state/EntryGameState'
import RendererManager from './RendererManager';

/**
 * - シングルトン
 */
class GameStateManager {
	static instance = null;
	constructor(pongApps, allScenesManager) {
		if (!GameStateManager.instance) {		
			this.pongApps = pongApps;
			this.allScenesManager = allScenesManager;
			this.states = {
				entry: new EntryGameState(pongApps),
				gamePlay: new GamePlayState(pongApps)
			};
			this.currentState = this.states.entry;
			// this.currentState = this.states.gamePlay;
			this.currentState.enter();
			// StartButtonなどのUI設定
			this.setupUI();
			GameStateManager.instance = this;
		}
		return GameStateManager.instance;
	}

	static getInstance(pongApps) {
		if (!GameStateManager.instance) {
			GameStateManager.instance = new GameStateManager(pongApps);
		}
		return GameStateManager.instance;
	}

	setupUI() {
		const startButton = document.getElementById('startButton');
		startButton.addEventListener('click', () => this.changeState('gamePlay'));
		const entryButton = document.getElementById('entryButton');
		entryButton.addEventListener('click', () => this.changeState('entry'));
	}

	changeState(newState) {
		if (this.currentState) {
			console.log(`currentState.exit(): ${this.currentState}`);
			this.currentState.exit();
		}
		console.log(`changeState(): ${newState}`);
		this.currentState = this.states[newState];
		this.currentState.enter();
	}

	update() {
		if (this.currentState) {
			this.currentState.update();
		}
		this.allScenesManager.updateAllScenes();
	}

	render() {
		if (this.currentState) {
			this.currentState.render();
		}
		this.allScenesManager.renderAllScenes(RendererManager.getRnderer());
	}
}

export default GameStateManager;
