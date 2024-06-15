// chat/js/setup-dm-websocket.js

import { classifyMessageSender } from './apply-message-style.js';
import { handleReceiveMessage } from './handle-receive-message.js';
import { scrollToBottom } from './ui-util.js';

export { setupDmWebsocket };


let dmSocket = null;

// WebSocketの接続確立とメッセージの送受信ロジック
function setupDmWebsocket(dmTargetNickname) {
    const websocketUrl = 'wss://' + window.location.host + '/ws/dm-with/' + dmTargetNickname + '/';
    dmSocket = new WebSocket(websocketUrl);

    dmSocket.onmessage = (event) => handleReceiveMessage(event, dmTargetNickname);
    dmSocket.onopen = () => handleOpen(dmSocket, dmTargetNickname);
    dmSocket.onclose = handleClose;
    dmSocket.onerror = handleError;

    document.querySelector('#message-submit').onclick = () => handleSendMessage(dmSocket);
}


function handleOpen(dmTargetNickname) {
    console.log('WebSocket connection established with', dmTargetNickname);
}


function handleClose(event) {
    console.log('Chat socket closed:', event);
}

function handleError(event) {
    console.error('WebSocket error observed:', event);
}


function handleSendMessage(dmSocket) {
    const messageInputDom = document.querySelector('#message-input');
    const message = messageInputDom.value;

    // console.log('message: ' + message)
    // 空文字列、空白のみのメッセージの送信はしない
    if (message.trim() === '') {
        // console.log(' smessage is empty')
        return;
    }

    dmSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
    scrollToBottom();  // dm-logのスクロール位置を調整
}


export function closeDmSocket() {
    if (dmSocket && dmSocket.readyState === WebSocket.OPEN) {
        dmSocket.close();
        dmSocket = null;
    }
}
