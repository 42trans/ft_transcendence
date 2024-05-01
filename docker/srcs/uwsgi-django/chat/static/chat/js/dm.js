// chat/dm.js
function classifyMessageSender(messageContent, senderName, dmTo) {
    if (senderName === dmTo) {
        messageContent.classList.add('dm-to');  // 他のユーザーからのメッセージ
    } else {
        messageContent.classList.add('dm-from');  // 自分が送信したメッセージ
    }
}


function applyStylesToInitialLoadMessages(dmTo) {
    const messageElements = document.querySelectorAll('#dm-log li');

    messageElements.forEach(function(messageElement) {
        let senderName = messageElement.textContent.split(':')[0].trim();
        classifyMessageSender(messageElement, senderName, dmTo)
    });
}


function initDM() {
    const dmTo = JSON.parse(document.getElementById('nickname').textContent);
    const websocketUrl = 'wss://' + window.location.host + '/ws/dm/' + dmTo + '/';
    const dmSocket = new WebSocket(websocketUrl);

    applyStylesToInitialLoadMessages(dmTo);
    scrollToBottom();  // 受信時にスクロール位置を調整

    dmSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        const senderName = data.sender;
        const timestamp = data.timestamp;

        let messageElement = document.createElement('li');
        let messageContent = document.createElement('div'); // メッセージコンテンツ
        let timestampContent = document.createElement('span'); // timestamp
        classifyMessageSender(messageElement, senderName, dmTo)

        messageContent.className = 'message-content';
        messageContent.textContent = senderName + ": " + data.message;
        messageElement.appendChild(messageContent);

        timestampContent.className = 'timestamp';
        timestampContent.textContent = timestamp;
        timestampContent.style.textAlign = 'right'; // 追加: タイムスタンプのスタイルを明示的に設定
        messageElement.appendChild(timestampContent);

        document.querySelector('#dm-log').appendChild(messageElement);
        scrollToBottom();  // 受信時にスクロール位置を調整
    };

    document.querySelector('#message-input').onkeyup = function(e) {
        if (e.keyCode === 13) {  // enter, return
            document.querySelector('#message-submit').click();
        }
    };

    document.querySelector('#message-submit').onclick = function() {
        const messageInputDom = document.querySelector('#message-input');
        const message = messageInputDom.value;

        dmSocket.send(JSON.stringify({
            'message': message
        }));
        messageInputDom.value = '';
        scrollToBottom();  // 受信時にスクロール位置を調整
    };

    dmSocket.onopen = function() {
        console.log('WebSocket connection established with', dmTo);
    };

    dmSocket.onerror = function(event) {
        console.error('WebSocket error observed:', event);
    };

    dmSocket.onclose = function(event) {
        console.error('Chat socket closed unexpectedly:', event);
    };
}


function scrollToBottom() {
    const dmLog = document.getElementById('dm-log');
    dmLog.scrollTop = dmLog.scrollHeight;
}


// ページが完全に読み込まれた後にDM画面を初期化し、初期スクロール位置を設定
document.addEventListener('DOMContentLoaded', initDM);
