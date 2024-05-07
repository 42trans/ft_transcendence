// chat/js/handle-message.js

import {classifyMessageSender} from "./apply-message-style.js";
import {scrollToBottom} from "./ui-util.js";

export { handleReceiveMessage };


function createMessageElement(senderName, message, timestamp) {
    let messageElement = document.createElement('li');
    let messageContent = document.createElement('div');
    let timestampContent = document.createElement('span');

    messageContent.className = 'message-content';

    // [ sender ] \n message に整形 -> todo: senderはicon化
    let senderElement = document.createElement('span');
    senderElement.textContent = `[ ${senderName} ]`;

    let messageTextElement = document.createElement('span');
    messageTextElement.textContent = message;

    messageContent.appendChild(senderElement);
    messageContent.appendChild(messageTextElement);
    messageElement.appendChild(messageContent);

    timestampContent.className = 'timestamp';
    timestampContent.textContent = timestamp;
    timestampContent.style.textAlign = 'right';
    messageElement.appendChild(timestampContent);

    return messageElement;
}


function classifyMessage(messageElement, isSystemMessage, senderName, dmTargetNickname) {
    // todo: isSystemMessageは未使用
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

    const senderName = message_data.sender;
    const message = message_data.message;
    const timestamp = message_data.timestamp;
    const isSystemMessage = message_data.is_system_message;

    let messageElement = createMessageElement(senderName, message, timestamp);
    classifyMessage(messageElement, isSystemMessage, senderName, dmTargetNickname);

    document.querySelector('#dm-log').appendChild(messageElement);
    scrollToBottom();  // dm-logのスクロール位置を調整
}
