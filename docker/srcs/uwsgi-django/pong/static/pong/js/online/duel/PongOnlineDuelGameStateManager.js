// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelGameStateManager.js
/**
 * Gameに必要なデータ(paddle,ballなどのオブジェクト、試合のスコアや状態など)を格納
 * - gameStae: serverと同じデータ構造
 */
class PongOnlineDuelGameStateManager 
{
	constructor() {
		this.isGameLoopStarted	= false;
		this.gameState	= {
			game_settings: {},
			objects: {},
			state: {},
			is_running: false
		};
		this.paddleOwnership	= null;
		this.finalGameState		= null;
	}

	resetState() {
		// constructorと同じ
		this.isGameLoopStarted	= false;
		this.gameState = {
			game_settings: {},
			objects: {},
			state: {},
			is_running: false
		};
		this.paddleOwnership	= null; 
	}
	

	updateState(newGameState) {
		this.gameState = { ...this.gameState, ...newGameState };
	}
	
	setPaddleOwnership(paddleInfo) {
		this.paddleOwnership = paddleInfo;
	}
	
	getPaddleOwnership() {
		return this.paddleOwnership;
	}
	
	getState() {
		return this.gameState;
	}

	getFinalState() {
		return this.finalGameState;
	}

	getIsGameLoopStarted(){
		return this.isGameLoopStarted;
	}
}

export default PongOnlineDuelGameStateManager;