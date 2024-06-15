// chat/js/setup-dm-websocket.js

import { classifyMessageSender } from './apply-message-style.js';
import { handleReceiveMessage } from './handle-receive-message.js';
import { scrollToBottom } from './ui-util.js';

export { setupDmWebsocket };


let dmSocket = null;

// WebSocketの接続確立とメッセージの送受信ロジック
function setupDmWebsocket(dmTargetNickname) {
    if (dmSocket) {
        closeDmSocket();
    }

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
    const errorMessageDom = document.querySelector('#error-message');

    // console.log('message: ' + message)
    // 空文字列、空白のみのメッセージの送信はしない
    if (message.trim() === '') {
        errorMessageDom.textContent = 'Message can not be empty';
        return;
    }
    // メッセージの長さが128文字を超える場合は送信せず、エラーメッセージを表示（Message modelsでMax128に制限）
    if (128 < message.length) {

        const over = message.length - 128;
        const overCharaMessage = `${over === 1 ? `${over} character over` :  `${over} characters over`}`
        errorMessageDom.textContent = `Message must be less than 128 characters, ${overCharaMessage}`;
        return;
    }

    dmSocket.send(JSON.stringify({
        'message': message
    }));

    messageInputDom.value = '';
    errorMessageDom.textContent = '';
    scrollToBottom();  // dm-logのスクロール位置を調整
}


export function closeDmSocket() {
    if (dmSocket) {
        if (dmSocket.readyState === WebSocket.CONNECTING) {
            dmSocket.onopen = () => {
                dmSocket.close();
            };
        } else if (dmSocket.readyState === WebSocket.OPEN) {
            dmSocket.close();
        }
        dmSocket = null;
    }
}
