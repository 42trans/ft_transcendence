// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineClientApp.js
import PongEngineKey from "./PongEngineKey.js";
import PongOnlineSyncWS from "./PongOnlineSyncWS.js";
import PongOnlineGameStateManager from "./PongOnlineGameStateManager.js"

/**
 * 2D-Pong Onlineのメインクラス
 * - 描画対象、通信対象の設定、描画サイズ(ズーム)を担当 
 * 
 * ## Websocket接続テスト:
 * - brew install websocat
 * - websocat ws://localhost/ws/pong/online/
 * 
 * - 座標変換: 参考:【CanvasRenderingContext2D: setTransform() method - Web APIs | MDN】 <https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform>
 */
class PongOnlineClientApp 
{
	constructor() 
	{
		// console.log('PongOnlineClientApp constructor begin');
		this.initWebSocket();
		this.initStartButton();
		
	}
	
	initWebSocket()
	{
		this.socketUrl				= 'wss://localhost/ws/pong/online/';
		this.gameStateManager		= new PongOnlineGameStateManager();
		this.syncWS					= new PongOnlineSyncWS(this, this.gameStateManager, this.socketUrl);
		PongEngineKey.listenForEvents();
	}
	
	// websocket接続開始のためのスタートボタン
	initStartButton() 
	{
		this.createButton('Start Game', 'hth-pong-online-start-game-btn', () => {
			this.setupWebSocketConnection();
			document.getElementById('hth-pong-online-start-game-btn').remove();
		});
	}
		
	createButton(text, id, onClickHandler) 
	{
		const button		= document.createElement('button');
		button.textContent	= text;
		button.id			= id;
		button.classList.add('hth-btn');
		document.getElementById('hth-main').appendChild(button);
		button.addEventListener('click', onClickHandler);
	}

	/** Start buttonをクリックしてからWebsocket接続 */
	setupWebSocketConnection()
	{
		this.socket				= new WebSocket(this.socketUrl);
		this.syncWS.socket		= this.socket;
		// ルーチン
		this.socket.onmessage	= (event) => this.syncWS.onSocketMessage(event);
		// 初回のみ
		this.socket.onopen		= () => this.syncWS.onSocketOpen();
		// エラー時
		this.socket.onclose		= (event) => this.syncWS.onSocketClose(event);
		this.socket.onerror		= (event) => this.syncWS.onSocketError(event);
	}

	static main(env) {
		new PongOnlineClientApp(env);
	}
}

export default PongOnlineClientApp;
