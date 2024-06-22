// chat/js/setup-dm-websocket.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
import { classifyMessageSender } from './apply-message-style.js';
import { handleReceiveMessage } from './handle-receive-message.js';
import { scrollToBottom } from './ui-util.js';


const DEBUG_LOG = false;
const TEST_RECCONNECTION = false;

const RECONNECT_DELAY_MS = 5000;
const MAX_RECONNECT_ATTEMPTS = 3;  // 接続最大再接続試行回数

let dmSocket = null;
let reconnectAttempts = 0;

// WebSocketの接続確立とメッセージの送受信ロジック
export function setupDmWebsocket(userInfo, targetInfo) {

    if (DEBUG_LOG) { console.log('setupDmWebsocket 1'); }
    if (dmSocket) {
        if (DEBUG_LOG) { console.log('setupDmWebsocket 2'); }
        closeDmSocket();
    }
    if (DEBUG_LOG) { console.log('setupDmWebsocket 3'); }

    const websocketUrl = 'wss://' + window.location.host + '/ws/dm-with/' + targetInfo.id + '/';
    dmSocket = new WebSocket(websocketUrl);

    dmSocket.onmessage = (event) => handleReceiveMessage(event, userInfo, targetInfo);
    dmSocket.onopen = () => handleOpen(dmSocket, targetInfo.nickname);
    dmSocket.onclose = (event) => handleClose(event, userInfo, targetInfo);
    dmSocket.onerror = (event) => handleError(event, userInfo, targetInfo);

    if (!targetInfo.isSystemUser) {
       document.querySelector('#message-submit').onclick = () => handleSendMessage(dmSocket);
    }

    if (TEST_RECCONNECTION) { handleClose({ wasClean: false }, userInfo, targetInfo); }
}


function handleOpen(dmTargetNickname) {
    if (DEBUG_LOG) { console.log('WebSocket connection established with', dmTargetNickname); }

    const errorMessageDom = document.querySelector('#error-message');
    errorMessageDom.textContent = '';
}


function tryReconnection(userInfo, targetInfo) {
    reconnectAttempts++;
    if (DEBUG_LOG) { console.log(`reconnectAttempts: ${reconnectAttempts}`); }

    const errorMessageDom = document.querySelector('#error-message');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        errorMessageDom.textContent = `DM connection closed. Trying to reconnect... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} times)`;
    } else {
        // 一定回数接続でなかった場合には、DM Topに戻す
        let reconnectAttempts = 0;
        errorMessageDom.textContent = 'DM connection closed. Return to DM TOP Page';
    }

    setTimeout(() => {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            setupDmWebsocket(userInfo, targetInfo)
        } else {
            // 一定回数接続でなかった場合には、DM Topに戻す
            const routePath = routeTable['dmSessions'].path
            switchPage(routePath);
        }
    }, RECONNECT_DELAY_MS);
}

function handleClose(event, userInfo, targetInfo) {
    if (DEBUG_LOG) { console.log('WebSocket closed'); }

    closeDmSocket();
    if (!event.wasClean) {
        tryReconnection(userInfo, targetInfo);
    }
}

function handleError(event, userInfo, targetInfo) {
    if (DEBUG_LOG) { console.log('WebSocket encountered an error', event); }
    closeDmSocket();
    tryReconnection(userInfo, targetInfo);
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
    if (DEBUG_LOG) { console.log('closeDmSocket 1'); }

    if (!dmSocket) {
        return;
    }

    if (DEBUG_LOG) { console.log('closeDmSocket 2'); }
    if (dmSocket.readyState === WebSocket.CONNECTING) {
        if (DEBUG_LOG) { console.log('closeDmSocket 3'); }
        dmSocket.onopen = () => {
            if (DEBUG_LOG) { console.log('closeDmSocket 4'); }
            dmSocket.close();
        };
    } else if (dmSocket.readyState === WebSocket.OPEN) {
        if (DEBUG_LOG) { console.log('closeDmSocket 5'); }
        dmSocket.close();
    }
    if (DEBUG_LOG) { console.log('closeDmSocket 6'); }
    dmSocket = null;
}
