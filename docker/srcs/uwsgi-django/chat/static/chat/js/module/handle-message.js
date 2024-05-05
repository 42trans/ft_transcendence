// chat/js/handle-message.js

import {classifyMessageSender} from "./apply-message-style.js";
import {scrollToBottom} from "./ui-util.js";

export { handleMessage };


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
    if (isSystemMessage) {
        messageElement.classList.add('system-message');
    } else {
        classifyMessageSender(messageElement, senderName, dmTargetNickname);
    }
}


function handleMessage(event, dmTargetNickname) {
    const data = JSON.parse(event.data);

    const senderName = data.sender;
    const timestamp = data.timestamp;
    const isSystemMessage = data.is_system_message;

    let messageElement = createMessageElement(senderName, data.message, timestamp);
    classifyMessage(messageElement, isSystemMessage, senderName, dmTargetNickname);

    document.querySelector('#dm-log').appendChild(messageElement);
    scrollToBottom();  // dm-logのスクロール位置を調整
}
