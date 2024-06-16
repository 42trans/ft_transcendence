// chat/js/handle-message.js

import {classifyMessageSender} from "./apply-message-style.js";
import {scrollToBottom} from "./ui-util.js";

export { handleReceiveMessage };


export function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createMessageElement(senderName, message, timestamp, avatarUrl) {
    let messageElement = document.createElement('li');
    let avatarAndSenderContainer = document.createElement('div');
    let messageContent = document.createElement('div');
    let timestampContent = document.createElement('span');
    let avatarElement = document.createElement('img');
    let senderElement = document.createElement('span');

    avatarAndSenderContainer.className = 'avatar-and-sender';
    messageContent.className = 'message-content';
    timestampContent.className = 'timestamp';

    // アバター設定
    avatarElement.src = avatarUrl;
    avatarElement.className = 'avatar';

    // 送信者名設定
    senderElement.textContent = senderName;
    senderElement.className = 'sender-name';

    // メッセージテキスト設定
    let messageTextElement = document.createElement('span');
    // messageTextElement.textContent = message;
    messageTextElement.innerHTML = escapeHtml(message);

    // アバターと送信者名のコンテナに追加
    avatarAndSenderContainer.appendChild(avatarElement);
    avatarAndSenderContainer.appendChild(senderElement);

    // メッセージコンテンツにテキスト追加
    messageContent.appendChild(messageTextElement);

    // タイムスタンプをメッセージコンテンツに追加
    timestampContent.textContent = timestamp;
    messageContent.appendChild(timestampContent);

    // メッセージエレメントに全てを追加
    messageElement.appendChild(avatarAndSenderContainer);
    messageElement.appendChild(messageContent);

    return messageElement;
}


function classifyMessage(messageElement, isSystemMessage, senderId, userId, targetId) {
    // todo: isSystemMessageは未使用, system message実装で使う可能性あり
    if (isSystemMessage) {
        messageElement.classList.add('system-message');
    } else {
        classifyMessageSender(messageElement, senderId, userId, targetId);
    }
}


function handleReceiveMessage(event, userInfo, targetInfo) {
    const data = JSON.parse(event.data);
    const message_data = JSON.parse(data.data);

    console.log('Received WebSocket data:', data);
    console.log('Received WebSocket message_data:', message_data);

    const senderInfo = getSenderInfo(message_data.sender_id, userInfo, targetInfo);

    let messageElement = createMessageElement(
        senderInfo.nickname,
        message_data.message,
        message_data.timestamp,
        senderInfo.avatar_url
    );
    const isSystemMessage = message_data.is_system_message;

    // メッセージに適切なクラスを適用
    classifyMessage(messageElement, isSystemMessage, message_data.sender_id, userInfo.id, targetInfo.id);

    document.querySelector('#dm-log').appendChild(messageElement);

    scrollToBottom();  // dm-logのスクロール位置を調整
}


function getSenderInfo(senderId, userInfo, targetInfo) {
    if (senderId === userInfo.id) {
        return userInfo;
    } else {
        return targetInfo;
    }
}
