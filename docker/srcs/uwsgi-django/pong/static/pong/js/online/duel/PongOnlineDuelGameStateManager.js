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
		this.gameLoopStarted	= null;
		this.ctx				= null; 
		this.canvas				= null;

		this.finalGameState		= null;
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
				if (DEBUG_FLOW){ console.log("再接続: handleGameState()"); }
				// クライアント（.js, ブラウザ）のデータで上書きするのでここでは更新しない
				isReconnecting = false;
			} else {
				// ルーチン: 受信データで常に更新。初回の場合も。
				this.updateState(recvData);
			}
			// --------------------------------------
			// 初回の場合: ループ開始前　
			// --------------------------------------
			if (!this.gameLoopStarted) 
			{
				// TODO_ft:else ifにする
				this.updateState(recvData);
				// 受信データからフィールドのサイズを取得してCanvasを初期化
				this.field = recvData.field
				this.initCanvas(recvData);
				// gameStateに関するjsonを受信してから、loopを起動
				this.clientApp.gameLoop.startGameLoop(this.gameFPS);
			}
			// --------------------------------------
		} catch (error) {
			console.error("handleGameState() failed", error);
		}
	}

	/**
	 *  ゲームの描画領域（キャンバス）を初期化、サイズ調整、変更時処理登録 
	 * */
	initCanvas(gameState)
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
		if (!this.ctx) {
			console.error("Failed to get 2D context.");
			return;
		}
		// ---------------------------------------------
		// ウィンドウサイズにあわせた描画サイズを決定
		// ---------------------------------------------
		// canvas決定直後に初回の描画用に一度設定する
		PongOnlineDuelUtil.resizeForAllDevices
		(
			this.ctx, 
			this.canvas, 
			gameState, 
			this
		);
		// ---------------------------------------------
		// 以降のウィンドウサイズ変更のたびに呼び出す処理の登録
		// ---------------------------------------------
		// resize イベントリスナーは一度だけ登録
		this.lastInnerWidth = window.innerWidth;
		this.lastInnerHeight = window.innerHeight;
		this.resizeListener = () => 
		{
			// 幅と高さの実際の数値でも変更をチェック（スクロールバーの表示による変更に対応するため）
			if (
				window.innerWidth !== this.lastInnerWidth || 
				window.innerHeight !== this.lastInnerHeight 
			) {
				PongOnlineDuelUtil.resizeForAllDevices
				(
					this.ctx, 
					this.canvas, 
					gameState, 
					this
				);
			}
			this.lastInnerWidth = window.innerWidth;
			this.lastInnerHeight = window.innerHeight;
		};
		window.addEventListener('resize', this.resizeListener);
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
		if (DEBUG_FLOW){
			console.log("socket.close done", socket.close)
		}
	}
	
	// ------------------------------
	// getter , setter
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