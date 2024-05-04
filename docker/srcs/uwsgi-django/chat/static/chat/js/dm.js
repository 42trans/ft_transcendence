// chat/js/dm.js
import { applyStylesToInitialLoadMessages } from './module/apply-message-style.js';
import { setupWebSocket } from './module/setup-websocket.js';
import { setupDOMEventListeners, scrollToBottom } from './module/ui-util.js';


function initDM() {
    const dmTo = JSON.parse(document.getElementById('nickname').textContent);

    applyStylesToInitialLoadMessages(dmTo);
    scrollToBottom();  // 受信時にスクロール位置を調整

    setupWebSocket(dmTo);
    setupDOMEventListeners();
}


// ページが完全に読み込まれた後にDM画面を初期化し、初期スクロール位置を設定
document.addEventListener('DOMContentLoaded', initDM);
