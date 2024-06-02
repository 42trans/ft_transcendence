// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineGameStateManager.js
import PongOnlineGameLoopManager from "./PongOnlineGameLoopManager.js";
import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
import PongOnlineRenderer from "./PongOnlineRenderer.js";

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
let DEBUG_FLOW = 1;
let DEBUG_DETAIL = 0;
let DEBUG_DETAIL2 = 0;

/**
 * Gameに必要なデータ(paddle,ballなどのオブジェクト、試合のスコアや状態など)を格納
 * - gameStae: serverと同じデータ構造
 */
class PongOnlineGameStateManager 
{
	constructor(clientApp) 
	{	
		this.renderer			= new PongOnlineRenderer(this)
		this.loopManager		= new PongOnlineGameLoopManager(clientApp, this)
		this.clientApp 			= clientApp

		this.ctx				= null
		this.canvas				= null
		this.field				= null

		this.isGameLoopStarted 	= false;
		this.readyToSendNext	= true;
		this.socket				= null
		this.finalGameState		= null

		this.animationFrameId	= null; 
		this.gameFPS			= 60

		this.gameState 			= {
			game_settings: {},
			objects: {},
			state: {},
			is_running: false
		};
	}

	// ------------------------------
	// game start
	// ------------------------------
	handleGameStart()
	{
		this.initCanvas();
		window.addEventListener('resize', () => this.renderer.resizeForAllDevices());
		this.loopManager.startGameLoop(this.gameFPS);
	}


	initCanvas()
	{
		const canvasId	= "pong-online-canvas-container"
		this.canvas 	= document.getElementById(canvasId);
		if (!this.canvas.getContext) {
			return;
		}
		this.ctx		= this.canvas.getContext("2d");
		this.field		= this.gameState.game_settings.field;

				if (DEBUG_DETAIL){
					console.log('this.field: ', this.field);	}

		this.renderer.initRenderer();
		this.renderer.resizeForAllDevices();
	}
	// ------------------------------
	// ルーチン:送信　※gameLoop() から呼ばれる
	// ------------------------------
	sendClientState(gameState) 
	{
				if (DEBUG_DETAIL){
					console.log("sendClientState(): gameState", gameState)
					console.log("sendClientState(): socket", this.socket)
					console.log("sendClientState: readyToSendNext", this.readyToSendNext)
				}

		if (this.socket.readyState === WebSocket.OPEN &&
			this.readyToSendNext === true) 
		{
			// 更新時:
			const dataToSend = JSON.stringify
			({
				action: "update", 
				...gameState
			});
				this.socket.send(dataToSend);
			this.readyToSendNext = false;
		} else {
			// 遅延もあるのでエラー出力ではない
			console.log("sendClientState() failed:");

					if (DEBUG_DETAIL2)
					{
						console.log("WebSocket.OPEN: ", WebSocket.OPEN);
						console.log("readyToSendNext: ", this.readyToSendNext);
					}
		}
	}
	// ------------------------------
	// game_end
	// ------------------------------
	handleGameEnd(socket, endGameState)
	{
		this.updateState(endGameState);
		
				if (DEBUG_DETAIL){
					console.log("onSocketMessage: finalGameState:", this.finalGameState)
					console.log("onSocketMessage: gameState:", this.gameState)
				}
				if (DEBUG_FLOW){
					console.log('handleGameEnd(): done');
				}
	}
	// ------------------------------
	// getter , setter
	// ------------------------------
	updateState(newGameState) {
		this.gameState = { ...this.gameState, ...newGameState };
	}

	getState() {
		return this.gameState;
	}

}

export default PongOnlineGameStateManager;