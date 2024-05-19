// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineGameStateManager.js

/**
 * Gameに必要なデータ(paddle,ballなどのオブジェクト、試合のスコアや状態など)を格納
 * 
 * - gameStae: serverと同じデータ構造
 * 
 */
class PongOnlineGameStateManager 
{
	constructor() {
		this.isGameLoopStarted = false;
		this.gameState = {
			game_settings: {},
			objects: {},
			state: {},
			is_running: false
		};
	}

	updateState(newGameState) {
		this.gameState = { ...this.gameState, ...newGameState };
	}

	getState() {
		return this.gameState;
	}

	getIsGameLoopStarted(){
		return this.isGameLoopStarted;
	}
}

export default PongOnlineGameStateManager;