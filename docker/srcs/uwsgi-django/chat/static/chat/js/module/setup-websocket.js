// chat/js/setup-websocket.js

import { classifyMessageSender } from './apply-message-style.js';
import { handleMessage } from './handle-message.js';
import { scrollToBottom } from './ui-util.js';

export { setupWebSocket };


// WebSocketの接続確立とメッセージの送受信ロジック
function setupWebSocket(dmTo) {
    const websocketUrl = 'wss://' + window.location.host + '/ws/dm-with/' + dmTo + '/';
    const dmSocket = new WebSocket(websocketUrl);

    dmSocket.onmessage = (event) => handleMessage(event, dmTo);
    dmSocket.onopen = () => handleOpen(dmSocket, dmTo);
    dmSocket.onclose = handleClose;
    dmSocket.onerror = handleError;

    document.querySelector('#message-submit').onclick = () => handleSendMessage(dmSocket);
}

function handleOpen(dmTo) {
    console.log('WebSocket connection established with', dmTo);
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
