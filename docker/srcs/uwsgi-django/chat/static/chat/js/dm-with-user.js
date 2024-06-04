// chat/js/dm-with-user.js
import { applyStylesToInitialLoadMessages } from './module/apply-message-style.js';
import { setupDmWebsocket } from './module/setup-dm-websocket.js';
import { setupSendKeyEventListener, scrollToBottom } from './module/ui-util.js';


function isDMwithBlockingUser() {
    const dmLog = document.getElementById('dm-log');
    return dmLog
}

export function initDM() {
    if (!isDMwithBlockingUser()) {
        return
    }

    const dmTargetNickname = JSON.parse(
        document.getElementById('target_nickname').textContent
    );

    applyStylesToInitialLoadMessages(dmTargetNickname);
    scrollToBottom();  // 受信時にスクロール位置を調整

    setupDmWebsocket(dmTargetNickname);
    setupSendKeyEventListener();
}


// ページが完全に読み込まれた後にDM画面を初期化し、初期スクロール位置を設定
// document.addEventListener('DOMContentLoaded', initDM);
