// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelGameStateManager.js
import PongOnlineDuelUtil from "./PongOnlineDuelUtil.js";


// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
let DEBUG_FLOW = 1;
let DEBUG_DETAIL = 0;
/**
 * Gameに必要なデータ(paddle,ballなどのオブジェクト、試合のスコアや状態など)を格納
 * - gameStae: serverと同じデータ構造
 */
class PongOnlineDuelGameStateManager 
{
	constructor(clientApp) {
		this.clientApp			= clientApp;
		this.isGameLoopStarted	= false;
		this.gameState	= {
			game_settings: {},
			objects: {},
			state: {},
			is_running: false
		};
		this.paddleOwnership	= null;
		this.finalGameState		= null;
		this.gameLoopStarted	= null;
		
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
		this.gameLoopStarted	= null;	
	}
	// ------------------------------
	// WaitingOpponent
	// ------------------------------
	handleWaitingOpponent(){
		this.showWaitingMessage();
	}

	showWaitingMessage() 
	{
		const waitingMessage = document.createElement('div');
		waitingMessage.id = 'hth-pong-duel-waiting-message';
		waitingMessage.classList.add('.hth-transparent-black-bg-color',  'slideup-text');
		waitingMessage.textContent = 'Incoming hotshot! Better get your game face on...';
		document.getElementById('hth-main').appendChild(waitingMessage);
	}
	// ------------------------------
	// both_players_entered_room
	// ------------------------------
	handleBothPlayersEnteredRoom(socket, paddleName)
	{
		PongOnlineDuelUtil.removeMessage();
		this.setPaddleOwnership(paddleName);
		this.initStartButton(socket);
	}
	
	setPaddleOwnership(paddleName) {
		this.paddleOwnership = paddleName;
	}
	
	// ゲーム開始OKを意味するスタートボタン
	initStartButton(socket) 
	{
		PongOnlineDuelUtil.createButton('Start Game', 'hth-pong-online-start-game-btn', () => {
			const startMsg = JSON.stringify({ action: "start" });
			socket.send(startMsg);
			document.getElementById('hth-pong-online-start-game-btn').remove();
		});
	}
	// ------------------------------
	// game_state
	// ------------------------------
	handleGameState(isReconnecting, recvData){
		try {
			// 再接続の場合:
			if (isReconnecting) 
			{
				if (DEBUG_FLOW){ console.log("再接続: onSocketMessage()"); }
				// クライアント（.js, ブラウザ）のデータで上書きするのでここでは更新しない
				isReconnecting = false;
			} else {
				// ルーチン: 受信データで更新
				this.updateState(recvData);
			}
			// --------------------------------------
			// 初回の場合: ループ開始前　
			// --------------------------------------
			if (!this.gameLoopStarted) 
			{
				// 受信データからフィールドのサイズを取得してCanvasを初期化
				this.initCanvas(recvData.field);
				// gameStateに関するjsonを受信してから、loopを起動
				this.clientApp.gameLoop.startGameLoop(this.gameFPS);
			}
			// --------------------------------------
		} catch (error) {
			console.error("onSocketMessage() failed", error);
		}
	}


	/**
	 *  ゲームの描画領域（キャンバス）を初期化、サイズ調整、変更時処理登録 
	 * */
	initCanvas()
	{
		// ---------------------------------------------
		// ゲームの描画領域（キャンバス）を初期化
		// ---------------------------------------------
		if (DEBUG_FLOW)
			console.log("開始: initCanvas()");
		this.canvasId	= "pong-online-duel-canvas-container"
		this.canvas 	= document.getElementById(this.canvasId);
		if (!this.canvas.getContext) {
			return;
		}
		this.ctx		= this.canvas.getContext("2d");
		this.field		= this.gameState.game_settings.field;
		// ---------------------------------------------
		// ウィンドウサイズにあわせた描画サイズを決定
		// ---------------------------------------------
		// canvas決定直後に初回の描画
		PongOnlineDuelUtil.resizeForAllDevices(
			this.ctx, 
			this.gameState, 
			this.canvas, 
			this
		);
		// ---------------------------------------------
		// ウィンドウサイズ変更のたびに呼び出す処理の登録
		// ---------------------------------------------
		this.lastInnerWidth = window.innerWidth;
		window.addEventListener('resize', () => {
			// 実際にサイズが変更されていたら。アスペクト比一定なので片方だけ変更を見る
			if (window.innerWidth !== this.lastInnerWidth) {
				PongOnlineDuelUtil.resizeForAllDevices(
					this.ctx, 
					this.this.gameState, 
					this.canvas,
					this
			)}
			this.lastInnerWidth = window.innerWidth;
		});
	}
	// ------------------------------
	// game_end
	// ------------------------------
	handleGameEnd(socket, endGameState)
	{
		this.updateState(endGameState);
		this.finalGameState = { ...this.gameState };
		if (DEBUG_DETAIL)
			console.log("onSocketMessage: finalGameState:", this.finalGameState)
		// ゲーム状態を初期化
		// this.resetState();
		socket.close();
		if (DEBUG_FLOW){
			console.log("socket.close done", socket.close)
		}
	}
	// ------------------------------
	
	updateState(newGameState) {
		this.gameState = { ...this.gameState, ...newGameState };
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