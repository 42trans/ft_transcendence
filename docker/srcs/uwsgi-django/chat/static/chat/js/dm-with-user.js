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

    const userInfo = JSON.parse(document.getElementById('user_info').textContent);
    const targetInfo = JSON.parse(document.getElementById('target_info').textContent);

    applyStylesToInitialLoadMessages(targetInfo);
    scrollToBottom();  // 受信時にスクロール位置を調整

    setupDmWebsocket(userInfo, targetInfo);
    setupSendKeyEventListener(targetInfo.isSystemUser);
}


export function disposeDM() {
    closeDmSocket();
}
