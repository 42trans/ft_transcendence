import MainMenuState from './game/MainMenuState'
import GamePlayState from './game/GamePlayState'
import EntryGameState from './game/EntryGameState'

class GameStateManager {
	constructor(pong) {
		this.pong = pong;
		this.states = {
			mainMenu: new MainMenuState(pong),
			entry: new EntryGameState(pong),
			gameplay: new GamePlayState(pong)
		};
		// this.currentState = this.states.mainMenu;
		this.currentState = this.states.entry;
		this.currentState.enter();

		// UIの設定
		this.setupUI();
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
