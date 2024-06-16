// chat/js/apple-message-stype.js
export { applyStylesToInitialLoadMessages, classifyMessageSender };

// WebSocketで受信したメッセージのクラス[dm-to / dm-from]を分類
function classifyMessageSender(messageElement, senderId, userId, targetId) {
    if (senderId === targetId) {
        messageElement.classList.add('dm-to');  // 他のユーザーからのメッセージ
    } else if (senderId === userId) {
        messageElement.classList.add('dm-from');  // 自分が送信したメッセージ
    }
}

// DBから取得したメッセージのクラス[dm-to / dm-from]を分類
function applyStylesToInitialLoadMessages(userInfo, targetInfo) {
    const messageElements = document.querySelectorAll('#dm-log li');

    messageElements.forEach(function(messageElement) {
        let senderId = messageElement.getAttribute('data-sender-id');
        classifyMessageSender(messageElement, senderId, userInfo.id, targetInfo.id);
    });
}
