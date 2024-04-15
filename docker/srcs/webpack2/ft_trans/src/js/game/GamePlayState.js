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
	}

	render() {
	}

	exit() {
		console.log("Exiting GamePlay state");
	}
}

export default GameplayState;
