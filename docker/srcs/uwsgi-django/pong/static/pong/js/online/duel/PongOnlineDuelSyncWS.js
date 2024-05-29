// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/PongOnlineDuelSyncWS.js
import PongOnlineDuelPaddleMover from "./PongOnlineDuelPaddleMover.js";
import PongOnlineDuelRenderer from "./PongOnlineDuelRenderer.js";
import PongOnlineDuelUtil from "./PongOnlineDuelUtil.js";

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
let DEBUG_FLOW = 1;
let DEBUG_DETAIL = 0;

/**
 * WebSocketの接続、メッセージ送受信、再接続処理
 */
class PongOnlineDuelSyncWS 
{
	constructor(clientApp, gameStateManager, socketUrl) 
	{
		
		this.clientApp			= clientApp;
		this.gameStateManager	= gameStateManager;
		this.socketUrl			= socketUrl;
		this.socket				= clientApp.socket
		this.lastInnerWidth		= null		
		this.readyToSendNext	= true;
		this.isReconnecting		= false;
		this.reconnectAttempts			= 0;
		this.maxReconnectAttempts		= 5;
		this.reconnectIntervalMilliSec	= 3000;
		this.gameFPS					= 1;

						// TODO_fr: 本番時削除
						PongOnlineDuelUtil.devTestCloseButton();
	}
	// ---------------------------------------------
	// ルーチン:受信 
	// サーバーからメッセージが届いた場合の処理
	// ---------------------------------------------
	onSocketMessage(event) 
	{
		const recvEvent = JSON.parse(event.data);
		const recvData = recvEvent.data;
		if (DEBUG_DETAIL){
			console.log("onSocketMessage()", event);}

		if (recvEvent.type === 'duel.waiting_opponent') 
		{
			if (DEBUG_FLOW){
				console.log("waiting_opponent") }
			this.gameStateManager.handleWaitingOpponent();
		} 
		else if (recvEvent.type === 'duel.both_players_entered_room') 
		{
			if (DEBUG_FLOW){ 
				console.log("duel.both_players_entered_room") }
			if (DEBUG_DETAIL){ 
				console.log("recvData.paddle:", recvData.paddle) }
			this.gameStateManager.handleBothPlayersEnteredRoom(this.socket, recvData.paddle);
		} 
		else if (recvEvent.type === 'game_state')
		{
			if (DEBUG_DETAIL){ 
				console.log("recvData", recvData) }
			this.gameStateManager.handleGameState(this.isReconnecting, recvData);
		} 
		else if (recvEvent.type === 'game_end') 
		{
			if (DEBUG_FLOW) {
				console.log("onSocketMessage: end_game_state:", recvData.end_game_state) }
			this.gameStateManager.handleGameEnd(this.clientApp.socket, recvData.end_game_state,)
		} 
		else 
		{
			console.error("Invalid data:", recvData);
		}
		this.readyToSendNext = true;
	}
	// ---------------------------------------------
	// 非ルーチンなデータ受信時のメソッド
	// ---------------------------------------------
	onSocketOpen() 
	{
		if (this.isReconnecting)
		{
			// 再接続時の処理
			console.log("WebSocket connection re-established.");
			const initData = JSON.stringify
			({
				action: "reconnect",
				...this.gameStateManager.getState() 
			});
			// console.log("Sending data to server:", JSON.stringify(dataToSend, null, 2));
			this.socket.send(initData);
			// 接続成功時に再接続試行回数をリセット
			this.reconnectAttempts = 0;
		} else {
			// 初回の接続時:
			console.log("WebSocket connection established.");
		}
	}

	onSocketClose(event) 
	{
		console.log("WebSocket connection closed:", event.reason, "Code:", event.code);
		// PongOnlineDuelUtil.attemptReconnect(this.isReconnecting);
		this.gameStateManager.resetState();
	}
	
	onSocketError(event) {
		console.error("WebSocket error:", event);
	}

}

export default PongOnlineDuelSyncWS;

