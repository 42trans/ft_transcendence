// chat/js/dm.js
import { applyStylesToInitialLoadMessages } from './module/apply-message-style.js';
import { setupWebSocket } from './module/setup-websocket.js';
import { setupDOMEventListeners, scrollToBottom } from './module/ui-util.js';


function initDM() {
    const dmTargetNickname = JSON.parse(
        document.getElementById('target_nickname').textContent
    );

    applyStylesToInitialLoadMessages(dmTargetNickname);
    scrollToBottom();  // 受信時にスクロール位置を調整

    setupWebSocket(dmTargetNickname);
    setupDOMEventListeners();
}


// ページが完全に読み込まれた後にDM画面を初期化し、初期スクロール位置を設定
document.addEventListener('DOMContentLoaded', initDM);
