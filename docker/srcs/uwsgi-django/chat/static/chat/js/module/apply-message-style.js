// chat/js/apple-message-stype.js
export { applyStylesToInitialLoadMessages, classifyMessageSender };

const DEBUG_LOG = 0;

// WebSocketで受信したメッセージのクラス[dm-to / dm-from]を分類
function classifyMessageSender(messageElement, senderId, targetId) {
    if (senderId === targetId) {
        if (DEBUG_LOG) { console.log('     [target]'); }
        messageElement.classList.add('dm-to');  // 他のユーザーからのメッセージ
    } else {
        if (DEBUG_LOG) { console.log('     [user]'); }
        messageElement.classList.add('dm-from');  // 自分が送信したメッセージ
    }
}

// DBから取得したメッセージのクラス[dm-to / dm-from]を分類
function applyStylesToInitialLoadMessages(targetInfo) {
    if (DEBUG_LOG) { console.log('[applyStylesToInitialLoadMessages]'); }
    if (DEBUG_LOG) { console.log('  target_id: ' + targetInfo.id); }

    const messageElements = document.querySelectorAll('#dm-log li');
    messageElements.forEach(function(messageElement) {
        let senderId = parseInt(messageElement.getAttribute('data-sender-id'));
        if (DEBUG_LOG) { console.log('     message        : ' + messageElement.textContent); }
        if (DEBUG_LOG) { console.log('     data-sender-id: ' + senderId); }
        classifyMessageSender(messageElement, senderId, targetInfo.id);
    });
}
