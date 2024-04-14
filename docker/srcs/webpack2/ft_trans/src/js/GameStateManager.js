import MainMenuState from './game/MainMenuState'
import GamePlayState from './game/GamePlayState'

class GameStateManager {
	constructor(pong) {
		this.pong = pong;
		this.states = {
			mainMenu: new MainMenuState(pong),
			gameplay: new GamePlayState(pong)
		};
		this.currentState = this.states.mainMenu;
		this.currentState.enter();
	}

	changeState(newState) {
		this.currentState.exit();
		this.currentState = this.states[newState];
		this.currentState.enter();
	}

	update() {
		this.currentState.update();
	}

	render() {
		this.currentState.render();
	}
}

export default GameStateManager;
