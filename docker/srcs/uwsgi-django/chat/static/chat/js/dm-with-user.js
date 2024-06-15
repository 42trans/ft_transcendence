// chat/js/dm-with-user.js
import { applyStylesToInitialLoadMessages } from './module/apply-message-style.js';
import { setupDmWebsocket, closeDmSocket } from './module/setup-dm-websocket.js';
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


export function disposeDM() {
    closeDmSocket();
}
