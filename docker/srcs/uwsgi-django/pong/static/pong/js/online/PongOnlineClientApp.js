// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineClientApp.js
import PongEngineKey from "./PongEngineKey.js";
import PongOnlineSyncWS from "./PongOnlineSyncWS.js";
import PongOnlineGameStateManager from "./PongOnlineGameStateManager.js"

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
let DEBUG_FLOW		= 0;
let DEBUG_DETAIL1	= 0;
let DEBUG_DETAIL2	= 0;
let TEST_TRY1 = 0;
let TEST_TRY2 = 0;
let TEST_TRY3 = 0;
let TEST_TRY4 = 0;

/**
 * 2D-Pong Onlineのメインクラス
 * - 描画対象、通信対象の設定、描画サイズ(ズーム)を担当 
 */
class PongOnlineClientApp 
{
	constructor() 
	{
				if (DEBUG_FLOW){	console.log('PongOnlineClientApp constructor begin');	}
		this.socket = null;
		this.init();
		this.boundInit = this.init.bind(this);
 		window.addEventListener('switchPageResetState', this.boundInit);
		this.isStartButtonListenerRegistered = false;
	}
	
	init()
	{
		try {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				console.log('init(): this.socket.close()');
				this.socket.close();
				this.socket = null;

			};
			this.initWebSocket();
			this.initStartButton();
			this.initEndButton();
		} catch(error) {
			console.error('hth: init() failed: ', error);
		}
	}

	initWebSocket()
	{
		this.startGameButton = document.getElementById('hth-pong-online-start-game-btn');
		if (!this.startGameButton) {
			return;
		}
		this.socketUrl			= 'wss://localhost/ws/pong/online/';
		// 毎回新しいインスタンスを生成。SPA遷移（ renderView() ）が実行された場合、ゲームはリセットする
		this.gameStateManager	= new PongOnlineGameStateManager(this);
		this.syncWS				= new PongOnlineSyncWS(this, this.gameStateManager);
		PongEngineKey.listenForEvents();
	}
	
	// websocket接続開始のためのスタートボタン
	initStartButton() 
	{
		try {
					if (TEST_TRY1){	throw new Error('TEST_TRY1');	}

			this.startGameButton = document.getElementById('hth-pong-online-start-game-btn');
			if (!this.startGameButton) {
				return;
			}
			this.startGameButton.style.display = 'block' 
			this.registerStartButtonEventListener();
			// const startGameButtonClickHandler = () => {
			// 	console.log('this.socket', this.socket);

			// 	this.setupWebSocketConnection();
			// 	this.startGameButton.remove();  
			// };
			// this.startGameButton.addEventListener('click', startGameButtonClickHandler);
		} catch (error) {
			console.error('hth: initStartButton() failed: ', error);
		}
	}
	
	registerStartButtonEventListener() 
	{
		if (!this.isStartButtonListenerRegistered) {
			this.startGameButton.addEventListener('click', this.handleStartButtonClick.bind(this));
			this.isStartButtonListenerRegistered = true;
		}
	}
	
	unregisterStartButtonEventListener() 
	{
		if (this.isStartButtonListenerRegistered) {
			this.startGameButton.removeEventListener('click', this.handleStartButtonClick);
			this.isStartButtonListenerRegistered = false;
		}
	}
	
	handleStartButtonClick()
	{
		// console.log('this.socket', this.socket);
		this.setupWebSocketConnection();
		this.startGameButton.style.display = 'none';
	}
	
	initEndButton() {
		const endGameButton = document.getElementById('hth-pong-online-back-to-home-btn');
		if (!endGameButton) {
			return;
		}
		endGameButton.style.display = 'none';
	}

	/** Start buttonクリックでWebsocket接続開始 */
	setupWebSocketConnection()
	{
		try {
					if (TEST_TRY3){	throw new Error('TEST_TRY3');	}

			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
				this.socket = null;
			}

			if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
				this.socket	= new WebSocket(this.socketUrl);
			}
					if (TEST_TRY4){ this.socket = new WebSocket("wss://example.com");}

			this.syncWS.socket					= this.socket;
			this.gameStateManager.socket		= this.socket;

			this.socket.onmessage	= (event) => this.syncWS.onSocketMessage(event);
			this.socket.onopen		= () => this.syncWS.onSocketOpen();
			this.socket.onclose		= (event) => this.syncWS.onSocketClose(event);
			this.socket.onerror		= (event) => this.syncWS.onSocketError(event);
		} catch(error) {
			console.error('hth: setupWebSocketConnection() failed: ', error)
		}
	}

	// static main(env) {
	// 	new PongOnlineClientApp(env);
	// }

	dispose() {
		// eventlistenerの削除
		window.removeEventListener('switchPageResetState', this.boundInit);
		this.unregisterStartButtonEventListener();
		PongEngineKey.removeListeners();

		// WebSocketの切断
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.onclose = null;
			this.socket.close();
			this.socket = null;
		}
		
		// インスタンス・プロパティの破棄
		if (this.syncWS) {
			this.syncWS.dispose();
			this.syncWS = null;
		}
		if (this.gameStateManager) {
			this.gameStateManager.dispose();
			this.gameStateManager = null;
		}
		this.socketUrl = null;
		this.startGameButton = null;
		this.isStartButtonListenerRegistered = false;
	}
}

export default PongOnlineClientApp;

