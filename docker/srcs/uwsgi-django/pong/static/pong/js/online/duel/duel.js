// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/duel.js
// import { applyStylesToInitialLoadMessages } from './module/apply-message-style.js';
import { setupWebSocketDuel } from './module/duel-setup-websocket.js';
import { setupDOMEventListeners } from './module/ui-util.js';
// import { setupDOMEventListeners, scrollToBottom } from './module/ui-util.js';
import PongOnlineClientApp from '../PongOnlineClientApp.js';
/**
 * Reference:【Tutorial — Channels 4.1.0 documentation】 https://channels.readthedocs.io/en/latest/tutorial/index.html
 * 
 */
function initDuel() {
	const dmTargetNickname = JSON.parse(
		document.getElementById('target_nickname').textContent
	);

	// applyStylesToInitialLoadMessages(dmTargetNickname);
	// scrollToBottom();  // 受信時にスクロール位置を調整
	console.log("開始: initDuel()");
	// setupWebSocketDuel(dmTargetNickname);
	// const app = new PongOnlineClientApp();
	// setupDOMEventListeners();
}


// ページが完全に読み込まれた後にDuel画面を初期化し、初期スクロール位置を設定
document.addEventListener('DOMContentLoaded', initDuel);
