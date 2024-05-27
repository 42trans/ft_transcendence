// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelClientApp.js
import PongEngineKey from "../PongEngineKey.js";
import PongOnlineDuelSyncWS from "./PongOnlineDuelSyncWS.js";
import PongOnlineGameStateManager from "../PongOnlineGameStateManager.js"

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
class PongOnlineDuelClientApp 
{
	constructor(room_name) 
	{
		console.log('PongOnlineDuelClientApp constructor begin');
		this.initWebSocket(room_name);
		this.setupWebSocketConnection();
	}
	
	initWebSocket(room_name)
	{
		this.socketUrl = 'wss://' + window.location.host + '/ws/pong/online/duel/' + room_name + '/';
		this.gameStateManager		= new PongOnlineGameStateManager();
		this.syncWS					= new PongOnlineDuelSyncWS(this, this.gameStateManager, this.socketUrl);
		PongEngineKey.listenForEvents();
	}

	setupWebSocketConnection()
	{
		this.socket				= new WebSocket(this.socketUrl);
		this.syncWS.socket		= this.socket;
		// ルーチン　2名が揃った合図をもらってスタートボタンを表示する
		this.socket.onmessage	= (event) => this.syncWS.onSocketMessage(event);
		// 初回のみ
		this.socket.onopen		= () => this.syncWS.onSocketOpen();
		// エラー時
		this.socket.onclose		= (event) => this.syncWS.onSocketClose(event);
		this.socket.onerror		= (event) => this.syncWS.onSocketError(event);
	}

	static main(duelTargetNickname) {
		new PongOnlineDuelClientApp(duelTargetNickname);
	}
}

export default PongOnlineDuelClientApp;
