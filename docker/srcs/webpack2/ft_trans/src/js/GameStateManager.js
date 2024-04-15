import MainMenuState from './game/MainMenuState'
import GamePlayState from './game/GamePlayState'
import EntryGameState from './game/EntryGameState'

/**
 * - シングルトン
 */
class GameStateManager {
	static instance = null;
	constructor(pong) {
		if (!GameStateManager.instance) {		
			this.pong = pong;
			this.states = {
				mainMenu: new MainMenuState(pong),
				entry: new EntryGameState(pong),
				gameplay: new GamePlayState(pong)
			};
			this.currentState = this.states.entry;
			// this.currentState = this.states.gameplay;
			this.currentState.enter();
			// StartButtonなどのUI設定
			this.setupUI();
			GameStateManager.instance = this;
		}
		return GameStateManager.instance;
	}

	static getInstance(pong) {
		if (!GameStateManager.instance) {
			GameStateManager.instance = new GameStateManager(pong);
		}
		return GameStateManager.instance;
	}

	setupUI() {
		const startButton = document.getElementById('startButton');
		startButton.addEventListener('click', () => this.changeState('gameplay'));
	}

	changeState(newState) {
		if (this.currentState) {
			this.currentState.exit();
		}
		this.currentState = this.states[newState];
		this.currentState.enter();
	}

	update() {
		if (this.currentState) {
			this.currentState.update();
		}
		this.pong.AllScenesManager.updateAllScenes();
	}

	render() {
		if (this.currentState) {
			this.currentState.render();
		}
		this.pong.AllScenesManager.renderAllScenes(this.pong.renderer);
	}
}

export default GameStateManager;
