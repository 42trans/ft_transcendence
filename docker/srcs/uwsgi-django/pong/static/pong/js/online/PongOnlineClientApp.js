// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineClientApp.js
import PongEngineKey from "./PongEngineKey.js";
import PongOnlineSyncWS from "./PongOnlineSyncWS.js";
import PongOnlineGameStateManager from "./PongOnlineGameStateManager.js"

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
let DEBUG_FLOW = 0;
let DEBUG_DETAIL = 0;
let TEST_TRY1 = 0;
let TEST_TRY2 = 0;
let TEST_TRY3 = 0;
let TEST_TRY4 = 0;

/**
 * 2D-Pong Onlineのメインクラス
 * - 描画対象、通信対象の設定、描画サイズ(ズーム)を担当 
 * 
 * ## Websocket接続テスト:
 * - brew install websocat
 * - websocat wss://localhost/ws/pong/online/
 */
class PongOnlineClientApp 
{
	constructor() 
	{
				if (DEBUG_FLOW){	console.log('PongOnlineClientApp constructor begin');	}

		this.initWebSocket();
		this.initStartButton();
	}
	
	initWebSocket()
	{
		this.socketUrl			= 'wss://localhost/ws/pong/online/';
		this.gameStateManager	= new PongOnlineGameStateManager(this);
		this.syncWS				= new PongOnlineSyncWS(this, this.gameStateManager);
		PongEngineKey.listenForEvents();
	}
	
	// websocket接続開始のためのスタートボタン
	initStartButton() 
	{
		try {
					if (TEST_TRY1){	throw new Error('TEST_TRY1');	}

			this.createButton('Start Game', 'hth-pong-online-start-game-btn', () => {
				this.setupWebSocketConnection();
				document.getElementById('hth-pong-online-start-game-btn').remove();
			});
		} catch (error) {
			console.error('hth: initStartButton() failed: ', error);
		}
	}
		
	createButton(text, id, onClickHandler) 
	{
		try {
					if (TEST_TRY2){	throw new Error('TEST_TRY2');	}

			const button		= document.createElement('button');
			button.textContent	= text;
			button.id			= id;
			button.classList.add('hth-btn');
			document.getElementById('hth-main').appendChild(button);
			button.addEventListener('click', onClickHandler);
		} catch (error) {
			console.error('hth:: createButton() failed: ', error);
		}
	}

	/** Start buttonクリックでWebsocket接続開始 */
	setupWebSocketConnection()
	{
		try {
					if (TEST_TRY3){	throw new Error('TEST_TRY3');	}

			this.socket	= new WebSocket(this.socketUrl);

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

	static main(env) {
		new PongOnlineClientApp(env);
	}
}

export default PongOnlineClientApp;
