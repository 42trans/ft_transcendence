// chat/js/handle-message.js

import {classifyMessageSender} from "./apply-message-style.js";
import {scrollToBottom} from "./ui-util.js";

export { handleReceiveMessage };


function escapeHtml(unsafe) {
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


function classifyMessage(messageElement, isSystemMessage, senderName, dmTargetNickname) {
    // todo: isSystemMessageは未使用, system message実装で使う可能性あり
    if (isSystemMessage) {
        messageElement.classList.add('system-message');
    } else {
        classifyMessageSender(messageElement, senderName, dmTargetNickname);
    }
}


function handleReceiveMessage(event, dmTargetNickname) {
    const data = JSON.parse(event.data);
    const message_data = JSON.parse(data.data);
    console.log('Received WebSocket data:', data);
    console.log('Received WebSocket message_data:', message_data);

    let messageElement = createMessageElement(
        message_data.sender,
        message_data.message,
        message_data.timestamp,
        message_data.avatar_url
    );
    const isSystemMessage = message_data.is_system_message;

    // メッセージに適切なクラスを適用
    classifyMessage(messageElement, isSystemMessage, message_data.sender, dmTargetNickname);

    document.querySelector('#dm-log').appendChild(messageElement);

    scrollToBottom();  // dm-logのスクロール位置を調整
}
