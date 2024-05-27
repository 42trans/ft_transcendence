// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelGameStateManager.js
/**
 * Gameに必要なデータ(paddle,ballなどのオブジェクト、試合のスコアや状態など)を格納
 * - gameStae: serverと同じデータ構造
 */
class PongOnlineDuelGameStateManager 
{
	constructor() {
		this.isGameLoopStarted = false;
		this.gameState = {
			game_settings: {},
			objects: {},
			state: {},
			is_running: false
		};
		// this.user_Id = null;
		this.paddleOwnership = null;
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
	
	// setUserId(userId) {
	// 	this.userId = userId;
	// }

	// getUserId() {
	// 	return this.userId;
	// }
	
	getState() {
		return this.gameState;
	}

	getIsGameLoopStarted(){
		return this.isGameLoopStarted;
	}
}

export default PongOnlineDuelGameStateManager;