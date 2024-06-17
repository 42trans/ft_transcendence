// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineGameStateManager.js
import PongOnlineGameLoopManager from "./PongOnlineGameLoopManager.js";
import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
import PongOnlineRenderer from "./PongOnlineRenderer.js";
import { pongOnlineHandleCatchError } from "./PongOnlineIndex.js"

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
const DEBUG_FLOW 		= 0;
const DEBUG_DETAIL 		= 0;
const DEBUG_DETAIL2 	= 0;
const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;
const TEST_TRY4 		= 0;

/**
 * Gameに必要なデータ(paddle,ballなどのオブジェクト、試合のスコアや状態など)を格納
 * - gameStae: serverと同じデータ構造
 */
class PongOnlineGameStateManager 
{
	constructor(clientApp) 
	{	
		try {
			this.renderer			= new PongOnlineRenderer(this)
			this.loopManager		= new PongOnlineGameLoopManager(clientApp, this)
			this.clientApp 			= clientApp

						if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
		} catch (error) {
			console.error("hth: PongOnlineGameStateManager.constructor() failed:", error);
			pongOnlineHandleCatchError(error);
		}

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

		this.isResizeListenerRegistered = false;
		this.handleResize = this.handleResize.bind(this);
	}

	// ------------------------------
	// game start
	// ------------------------------
	registerResizeListener()
	{
		if (!this.isResizeListenerRegistered) {
			window.addEventListener('resize', this.handleResize);
			this.isResizeListenerRegistered = true;
						if (DEBUG_FLOW) {	console.log('registerResizeListener: done');	}
		}
	}

	unregisterResizeListener()
	{
		if (this.isResizeListenerRegistered) {
			window.removeEventListener('resize', this.handleResize);
			this.isResizeListenerRegistered = false;
						if (DEBUG_FLOW) {	console.log('unregisterResizeListener: done');	}
		}
	}
	
	handleResize()
	{
		try {
						if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
			if (this.renderer){
				this.renderer.resizeForAllDevices();
			}
		} catch(resizeError) {
			console.error("hth: Error during resize:", resizeError);
			pongOnlineHandleCatchError(error);
		}
	}

	handleGameStart()
	{
		try {
					if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
			this.initCanvas();
			this.registerResizeListener();
			this.loopManager.startGameLoop(this.gameFPS);
		} catch(error) {
			console.error("hth: handleGameStart() failed: ", error);
			pongOnlineHandleCatchError(error);
		}
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
				if (DEBUG_DETAIL){	console.log('this.field: ', this.field);	}
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
			try {
				// 更新時:
				const dataToSend = JSON.stringify
				({
					action: "update", 
					...gameState
				});
					this.socket.send(dataToSend);
				this.readyToSendNext = false;

						if (TEST_TRY4){	throw new Error('TEST_TRY4');	}

			} catch(error) {
				console.error("hth: sendClientState() failed: ", error);
				pongOnlineHandleCatchError(error);
			}
		} else {
			// 通信の遅延もあるのでエラーではない。大量に出力されて負荷が高いのでコメントアウト
			// console.log("sendClientState() failed: WebSocket not ready or previous message pending.");

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
				if (DEBUG_FLOW){	console.log('handleGameEnd(): done');	}
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

	dispose() {
		// window.removeEventListener('resize', this.resizeHandler);
		// イベントリスナー削除: window resize
		this.unregisterResizeListener();
		
		if (this.renderer) {
			this.renderer.dispose();
			this.renderer = null;
		}
		if (this.loopManager) {
			this.loopManager.dispose();
			this.loopManager = null;
		}
	
		this.clientApp = null;
		this.ctx = null;
		this.canvas = null;
		this.field = null;
		this.socket = null;
		this.finalGameState = null;
		this.gameState = {
			game_settings: {},
			objects: {},
			state: {},
			is_running: false
		};
	}
}

export default PongOnlineGameStateManager;