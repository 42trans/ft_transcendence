// chat/js/handle-message.js

import {classifyMessageSender} from "./apply-message-style.js";
import {scrollToBottom} from "./ui-util.js";

const DEBUG_LOG = 0;

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


function classifyMessage(messageElement, isSystemMessage, senderId, targetId) {
    // todo: isSystemMessageは未使用, system message実装で使う可能性あり
    if (isSystemMessage) {
        messageElement.classList.add('system-message');
    } else {
        classifyMessageSender(messageElement, senderId, targetId);
    }
}


export function handleReceiveMessage(event, userInfo, targetInfo) {
    const data = JSON.parse(event.data);
    const message_data = JSON.parse(data.data);

    if (DEBUG_LOG) { console.log('Received WebSocket data        :', data); }
    if (DEBUG_LOG) { console.log('Received WebSocket message_data:', message_data); }

    const senderInfo = getSenderInfo(message_data.sender_id, userInfo, targetInfo);

    // ---------------------------------------------
    // message_data.timestamp を ローカライズ
    // - サーバー側（Python）では、タイムスタンプを文字列形式（UTC）でクライアントに送信
    // - クライアント側（JavaScript）では、受信したUTCタイムスタンプ文字列をDateオブジェクトに変換
    // - toLocaleStringメソッドを使用して、Dateオブジェクトをクライアントのローカルタイムゾーンに基づいてフォーマット
    // ---------------------------------------------
    // 受信したタイムスタンプ文字列（message_data.timestamp）を、Dateコンストラクタで解析可能な形式（ISO 8601形式）に変換
    const timestamp = message_data.timestamp;
    const msgAt = new Date(timestamp.replace(' ', 'T') + 'Z');
    // toLocaleStringメソッドを使用してローカライズされた日時文字列を取得
    const formattedMsgAt = msgAt.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    let messageElement = createMessageElement(
        senderInfo.nickname,
        message_data.message,
        formattedMsgAt,
        senderInfo.avatar_url
    );
    
    // UTCで出力する場合の処理（既存）
    // let messageElement = createMessageElement(
    //     senderInfo.nickname,
    //     message_data.message,
    //     message_data.timestamp,
    //     senderInfo.avatar_url
    // );
    
    // ---------------------------------------------

    const isSystemMessage = message_data.is_system_message;

    // メッセージに適切なクラスを適用
    classifyMessage(messageElement, isSystemMessage, message_data.sender_id, targetInfo.id);

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
