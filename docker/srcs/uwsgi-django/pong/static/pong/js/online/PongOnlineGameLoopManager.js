// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineGameLoopManager.js
import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
import { pongOnlineHandleCatchError } from "./PongOnlineIndex.js"


const DEBUG_FLOW 		= 0;
const DEBUG_DETAIL		= 0;
const TEST_TRY1 		= 0;
const TEST_TRY2 		= 0;
const TEST_TRY3 		= 0;
/**
 * 参考:【window.cancelAnimationFrame() - Web API | MDN】 <https://developer.mozilla.org/ja/docs/Web/API/Window/cancelAnimationFrame>
 */
class PongOnlineGameLoopManager 
{
	constructor(clientApp, gameStateManager) 
	{		
		this.renderer			= gameStateManager.renderer
		this.clientApp 			= clientApp
		this.gameStateManager	= gameStateManager

		this.animationFrameId	= null; 
		this.isEndGameButtonListenerRegistered = false;
		this.handleEndGameButtonClick = this.handleEndGameButtonClick.bind(this);
	}


	startGameLoop(gameFPS) 
	{
					if (DEBUG_FLOW){	console.log("startGameLoop(): begin")	}
		// すでにゲームループが起動していれば、先に停止
		if (this.gameStateManager.isGameLoopStarted) {
			this.stopGameLoop();
		}
		this.gameStateManager.isGameLoopStarted = true;
		// 目標フレーム時間（ミリ秒）
		this.desiredFrameTimeMs = 1000 / gameFPS;
		this.lastFrameTimeMs	= performance.now(); 
					if (DEBUG_FLOW){	console.log("gameLoop(): begin")	}
		// 一度テーブルを描画してボールサーブまで待機
		this.renderer.render(this.gameStateManager.ctx, this.gameStateManager.gameState.game_settings.field, this.gameStateManager.gameState);
		// プログレスバーを表示
		this.showProgressBar();
		// 2000ms = 2秒待機してボールサーブ（ループ開始）
		this.startGameLoopAfterDelay(2000);
	}

	/**
	 * 参考:【プログレス · Bootstrap v5.3】 <https://getbootstrap.jp/docs/5.3/components/progress/>
	 */
	showProgressBar() 
	{
		let progressBar = document.querySelector('.progress-bar');
		let width = 0;
		const progress = setInterval(() => {
			if (width >= 100) {
				clearInterval(progress);
				setTimeout(() => {
					progressBar.parentElement.style.display = 'none';
				}, 1000);
			} else {
				width += 10;
				progressBar.style.width = width + '%';
				progressBar.setAttribute('aria-valuenow', width);
			}
		}, 130);
	}
	

	isGameLoopReady() 
	{
		if ( 
			this.gameStateManager &&
			this.gameStateManager.gameState &&
			this.gameStateManager.gameState.game_settings &&
			this.field &&
			this.ctx &&
			this.canvas &&
			this.renderer
		){
			return true;
		} else {
			console.warn('hth: isGameLoopReady() is false: null or undefined');
			return false;
		}
	}
	
	startGameLoopAfterDelay(delay) 
	{
		setTimeout(() => 
		{
			const gameLoop = () => 
			{
				try {
					const gameState = this.gameStateManager && this.gameStateManager.gameState;
					this.field = gameState && gameState.game_settings && gameState.game_settings.field;
					this.ctx = this.gameStateManager && this.gameStateManager.ctx;
					this.canvas = this.gameStateManager && this.gameStateManager.canvas;
					
					// ループ終了条件
					if (!this.isGameLoopReady() ||
						!this.gameStateManager.isGameLoopStarted) 
					{
						return;
					}
					
					const currentTime = performance.now();
					const elapsed = currentTime - this.lastFrameTimeMs;
					// 目標フレーム時間よりも経過時間が短い場合は、次のフレームを待つ
					if (elapsed >= this.desiredFrameTimeMs) 
					{
						if (this.isGameLoopReady() && gameState.is_running) 
						{
							// 全ての行でnullチェック
							// 理由：ゲーム中に、 戻る>進む で、最後のloopが処理中にdispose()が実行されてnullになるため
							if (this.isGameLoopReady()) {
								PongOnlinePaddleMover.handlePaddleMovement(this.field, gameState);
							}
							if (this.isGameLoopReady()) {
								this.gameStateManager.sendClientState(gameState);
							}
							if (this.isGameLoopReady()) {
								this.renderer.render(this.ctx, this.field, gameState);
							}

							// 描画した時点の時刻を登録
							this.lastFrameTimeMs = currentTime;
						} else {
							// 終了時
										if (DEBUG_DETAIL) {	console.log("gameLoop(): gameState", gameState);	}
							if (this.isGameLoopReady()) {
								this.stopGameLoop(gameState);
							}
						}
					}
					// 次のフレームを要求
					this.animationFrameId = requestAnimationFrame(gameLoop);

							if (TEST_TRY1){	throw new Error('TEST_TRY1');	}
				} catch(error) {
					console.error("hth: startGameLoopAfterDelay(): gameLoop() failed:", error);
					pongOnlineHandleCatchError(error);
				}
			}
			// 最初のフレームを要求
			this.animationFrameId = requestAnimationFrame(gameLoop);
		}, delay);
	}


	stopGameLoop(gameState) 
	{
				if (DEBUG_FLOW) {	console.log("stopGameLoop(): begin");	}

		try {
			// 最終スコアの描画: 終了フラグ受信後に、最後に一度だけ描画する（静止画像）
			this.renderer.render(this.ctx, this.field, gameState);
						if (TEST_TRY2){	throw new Error('TEST_TRY2');	}
		} catch(error) {
			console.error("hth: stopGameLoop():  renderer.render() failed:", error);
			pongOnlineHandleCatchError(error);
		}

		try {
			// ゲーム終了時に Back to Home ボタンリンクを表示する
			this.updateEndGameBtn();
			// ws接続をcloseする
			// このタイミングは、loopの最後であり、サーバーからのis_running=false受け取り直後でもある
			this.clientApp.socket.close();
						if (DEBUG_FLOW) {	console.log("stopGameLoop(): socket.close");	}
						if (TEST_TRY3){	throw new Error('TEST_TRY3');	}
		} catch(error) {
			console.error("hth: stopGameLoop(): updateEndGameBtn() failed:", error);
			pongOnlineHandleCatchError(error);
		}

		// アニメーションを指定してキャンセル
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		// loopを止めるフラグ
		this.gameStateManager.isGameLoopStarted = false;
					if (DEBUG_FLOW) {	console.log("stopGameLoop(): end");	}
	}
	

	registerEndGameButtonListener()
	{
		const endGameButton = document.getElementById('hth-pong-online-back-to-home-btn');
		if (endGameButton && !this.isEndGameButtonListenerRegistered) {
			endGameButton.addEventListener('click', this.handleEndGameButtonClick);
			this.isEndGameButtonListenerRegistered = true;
						if (DEBUG_FLOW) {	console.log('registerEndGameButtonListener: done');	}
		}
	}

	unregisterEndGameButtonListener()
	{
		const endGameButton = document.getElementById('hth-pong-online-back-to-home-btn');
		if (endGameButton && this.isEndGameButtonListenerRegistered) {
			endGameButton.removeEventListener('click', this.handleEndGameButtonClick);
			this.isEndGameButtonListenerRegistered = false;
						if (DEBUG_FLOW) {	console.log('unregisterEndGameButtonListener: done');	}
		}
	}

	handleEndGameButtonClick()
	{
		const redirectTo = routeTable['top'].path;
		switchPage(redirectTo);
	}

	
	// ゲーム終了時に Back to Home ボタンリンクを表示する	
	updateEndGameBtn() 
	{
		try {
			const endGameButton = document.getElementById('hth-pong-online-back-to-home-btn');
			if (endGameButton) {
				endGameButton.style.display = 'block';
				this.registerEndGameButtonListener();
			} else {
				console.error('hth: End Game button not found');
			}
		} catch (error){
			console.error('hth: updateEndGameBtn() failed: ', error);
			pongOnlineHandleCatchError(error);
		}
	}

	dispose() {
		// アニメーションループの停止
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}
		// イベントリスナー削除:終了時ボタン
		this.unregisterEndGameButtonListener();
		
		this.renderer = null;
		this.clientApp = null;
		this.gameStateManager = null;
		this.field = null;
		this.ctx = null;
		this.canvas = null;
	}
}

export default PongOnlineGameLoopManager;
