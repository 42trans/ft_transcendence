// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/module/duel-setup-websocket.js
export { setupWebSocketDuel };
// function handleReceiveMessage(event, dmTargetNickname) {
//     const data = JSON.parse(event.data);
//     const message_data = JSON.parse(data.data);
//     console.log('Received WebSocket data:', data);
//     console.log('Received WebSocket message_data:', message_data);

//     let messageElement = createMessageElement(
//         message_data.sender,
//         message_data.message,
//         message_data.timestamp,
//         message_data.avatar_url
//     );
//     const isSystemMessage = message_data.is_system_message;

//     // メッセージに適切なクラスを適用
//     classifyMessage(messageElement, isSystemMessage, message_data.sender, dmTargetNickname);

//     document.querySelector('#dm-log').appendChild(messageElement);

//     scrollToBottom();  // dm-logのスクロール位置を調整
// }


// // WebSocketの接続確立とメッセージの送受信ロジック
function setupWebSocketDuel(duelTargetNickname) {
    const websocketProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const websocketUrl = websocketProtocol + '//' + window.location.host + '/ws/pong/online/duel/duel-with/' + duelTargetNickname + '/';
    // const duelSocket = new WebSocket(websocketUrl);
    
    // const websocketUrl = 'wss://' + window.location.host + '/ws/pong/online/duel/duel-with/' + duelTargetNickname + '/';
    console.log("1");
    const duelSocket = new WebSocket(websocketUrl);
    console.log("2");
    
    // duelSocket.onmessage = (event) => handleReceiveMessage(event, duelTargetNickname);
    duelSocket.onopen = () => handleOpen(duelSocket, duelTargetNickname);
    console.log("3");
    duelSocket.onclose = handleClose;
    duelSocket.onerror = handleError;

    document.querySelector('#request-duel-btn').onclick = () => handleSendMessage(duelSocket);
}

function handleOpen(duelTargetNickname) {
    console.log("4");
    console.log('WebSocket connection established with', duelTargetNickname);
}


function handleClose(event) {
    console.log("5");
    console.error('Chat socket closed unexpectedly:', event);
}

function handleError(event) {
    console.log("6");
    console.error('WebSocket error observed:', event);
}


function handleSendMessage(duelSocket) {
    // const messageInputDom = document.querySelector('#message-input');
    // const message = messageInputDom.value;

    duelSocket.send(JSON.stringify({
        // add
        action: 'start_duel',
        // 'message': message
    }));
    // messageInputDom.value = '';
    // scrollToBottom();  // dm-logのスクロール位置を調整
}
