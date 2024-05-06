// chat/js/setup-websocket.js

import { classifyMessageSender } from './apply-message-style.js';
import { handleReceiveMessage } from './handle-receive-message.js';
import { scrollToBottom } from './ui-util.js';

export { setupWebSocket };


// WebSocketの接続確立とメッセージの送受信ロジック
function setupWebSocket(dmTargetNickname) {
    const websocketUrl = 'wss://' + window.location.host + '/ws/dm-with/' + dmTargetNickname + '/';
    const dmSocket = new WebSocket(websocketUrl);

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
    console.error('Chat socket closed unexpectedly:', event);
}

function handleError(event) {
    console.error('WebSocket error observed:', event);
}


function handleSendMessage(dmSocket) {
    const messageInputDom = document.querySelector('#message-input');
    const message = messageInputDom.value;

    dmSocket.send(JSON.stringify({
        'message': message
    }));
    messageInputDom.value = '';
    scrollToBottom();  // dm-logのスクロール位置を調整
}
