// chat/js/apple-message-stype.js
export { applyStylesToInitialLoadMessages, classifyMessageSender };

// WebSocketで受信したメッセージのクラス[dm-to / dm-from]を分類
function classifyMessageSender(messageElement, senderName, dmTargetNickname) {
    if (senderName === dmTargetNickname) {
        messageElement.classList.add('dm-to');  // 他のユーザーからのメッセージ
    } else {
        messageElement.classList.add('dm-from');  // 自分が送信したメッセージ
    }
}


// DBから取得したメッセージのクラス[dm-to / dm-from]を分類
function applyStylesToInitialLoadMessages(dmTargetNickname) {
    const messageElements = document.querySelectorAll('#dm-log li');

    messageElements.forEach(function(messageElement) {
        let senderName = messageElement.getAttribute('data-sender-name');
        classifyMessageSender(messageElement, senderName, dmTargetNickname);
    });
}
