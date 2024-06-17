// docker/srcs/uwsgi-django/pong/static/pong/js/online/PongOnlineSyncWS.js
import PongOnlinePaddleMover from "./PongOnlinePaddleMover.js";
import PongOnlineRenderer from "./PongOnlineRenderer.js";
import { pongOnlineHandleCatchError } from "./PongOnlineIndex.js";

// console.log: 出力=true、本番時はfalseに設定。0,1でも動く
const DEBUG_FLOW		= 0;
const DEBUG_DETAIL		= 0;
const TEST_ERROR_CASE1	= 0;
const TEST_ERROR_CASE2	= 0;

/**
 * Websocketのイベントで動くメソッドを担当
 * 
 * ## クライアント側の処理の流れ
 * - Startボタンをクリック: websocket接続処理開始
 * - 最初のonopen: 「受信した合図(action: "initialize")」を送信
 * - 初回のonmessage: main loop 開始
 * - loop内で送信, 送信後に「送信準備可能フラグ」を折る
 * - 次回のonmessage: サーバーから受信した後、「送信準備可能フラグ」を立てる
 * - ※フラグの目的: クライアントからの送信に制限をかける
 */
class PongOnlineSyncWS 
{
	constructor(clientApp, gameStateManager) 
	{
		this.clientApp			= clientApp;
		this.gameStateManager	= gameStateManager;
		this.socket				= null;

		// 再接続用のフラグ・変数
		// this.isReconnecting			= false;
		this.reconnectAttempts		= 0;
		this.maxReconnectAttempts	= 5;
		// 単位: ミリ秒
		this.reconnectInterval		= 3000;

						// TODO_fr: 本番時削除
						// dev用 websocket接続を閉じるためのボタン
						// this.devTestCloseButton();
	}


	// ------------------------------
	// ルーチン:受信
	// サーバーからメッセージが届いた場合の処理
	// ------------------------------	
	onSocketMessage(event) 
	{
		try 
		{
			let recvEventData = JSON.parse(event.data);
					
					if (DEBUG_DETAIL){	
						console.log("onSocketMessage()", event);	}
					if (TEST_ERROR_CASE1){
						recvEventData = {}	}
		
		
			if (!recvEventData){
				return
			} else if (recvEventData.event_type === 'game_end') {

						if (DEBUG_FLOW) {
							console.log("onSocketMessage: game_end") }
						if (DEBUG_FLOW) {
							console.log("onSocketMessage: recvEventData:", recvEventData) }

				this.gameStateManager.handleGameEnd(this.clientApp.socket, recvEventData.end_game_state,)
			} else if (recvEventData.objects && recvEventData.state){
				// ---------------------------------
				// 再接続かどうか
				// ---------------------------------
				// if (!this.isReconnecting) {
							if (TEST_ERROR_CASE2){
								recvEventData = {}	}
					// ルーチン: 受信データで更新
					this.gameStateManager.updateState(recvEventData);
				// } else {
				// 	// 再接続の場合の処理
				// 			if (DEBUG_FLOW){	
				// 				console.log("onSocketMessage(): reconnect")	}
				// 	// クライアント（.js, ブラウザ）のデータで上書きするのでここでは更新しない
				// 	this.isReconnecting = false;
				// }
				// ---------------------------------
				// ループが開始していない場合　
				// ---------------------------------
				if (!this.gameStateManager.isGameLoopStarted) 
				{
							if (DEBUG_DETAIL){	
								console.log("初回: gameState()", this.gameStateManager.gameState)	}

					this.gameStateManager.handleGameStart()
				}
			} else {
				console.error("hth: onSocketMessage()): Invalid data:", recvEventData);
				pongOnlineHandleCatchError(error);
			}
			// サーバーに送信する制約を解除するための受信済みを表すフラグ
			this.gameStateManager.readyToSendNext = true;
		} catch (error) {
			console.error("hth: onSocketMessage() failed", error);
			pongOnlineHandleCatchError(error);
		}
	}
	// ------------------------------
	// onOOpen
	// ------------------------------
	onSocketOpen() 
	{
		try { 
			if (DEBUG_FLOW){	
				console.log("WebSocket connection established.");	}
			
			// if (!this.isReconnecting)
			// {
				// 初回接続時の処理　{ action: "initialize" }を送信
				const initData = JSON.stringify({ action: "initialize" });
				this.socket.send(initData);
			// } else {
			// 	// 再接続時の処理
			// 			if (DEBUG_FLOW){	
			// 				console.log("WebSocket connection re-established.");	}
			// 	const initData = JSON.stringify
			// 	({
			// 		action: "reconnect",
			// 		...this.gameStateManager.getState() 
			// 	});
			// 			if (DEBUG_DETAIL){	
			// 				console.log("Sending data to server:", JSON.stringify(dataToSend, null, 2)); }

			// 	this.socket.send(initData);
			// 	// 接続成功時に再接続試行回数をリセット
			// 	this.reconnectAttempts = 0;
			// }
		} catch (error) {
			console.error("hth: onSocketOpen() failed", error);
			pongOnlineHandleCatchError(error);
		}
	}

	// ------------------------------
	// onClose
	// ------------------------------
	onSocketClose(event) 
	{
		try {
			// console.log("onSocketClose(): Code:", event.code);
			// this.attemptReconnect();
			// this.clientApp.socket.close();
		} catch (error) {
			console.error("hth: onSocketClose() failed", error);
			pongOnlineHandleCatchError(error);
		}
	}
	
	/** close時: 自動再接続 */
	// attemptReconnect() 
	// {
	// 	// 再接続処理中を表すフラグを立てる
	// 	this.isReconnecting = true;
	// 	// コンストラクタで指定した回数試みる
	// 	if (this.reconnectAttempts < this.maxReconnectAttempts) 
	// 	{
	// 		setTimeout(() => 
	// 		{
	// 			this.clientApp.setupWebSocketConnection();
	// 			this.reconnectAttempts++;
	// 		}, this.reconnectInterval);
	// 	} else {
	// 		console.error("Reconnect failed.");
	// 		// 最大試行回数に達したらリセット
	// 		this.reconnectAttempts = 0;
	// 		this.isReconnecting = false;
	// 	}
	// }
	// ------------------------------
	// onError
	// ------------------------------
	onSocketError(event) {
		console.error("hth: WebSocket error:", event);
		pongOnlineHandleCatchError("hth: WebSocket error");
	}
	
	/** dev用 再接続チェック用 */
	// devTestCloseButton()
	// {
	// 	this.createButton('Test Close WebSocket', 'hth-pong-online-close-ws-btn', () => {
	// 		this.socket.close();
	// 	});
	// }

	dispose() {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.close();
			this.socket = null;
		}
		this.clientApp = null;
		this.gameStateManager = null;
	}
}

export default PongOnlineSyncWS;

