document.addEventListener('DOMContentLoaded', function() {
    fetchPartners();
});

function fetchPartners() {
    fetch('/dm/api/list/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => updateDOM(data))
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

function updateDOM(data) {
    const list = document.querySelector('#dm-list ul');
    list.innerHTML = ''; // リストをクリア

    data.forEach(user => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = `javascript:void(0);`; // リンクの無効化
        link.textContent = `${user.nickname} (Session ID: ${user.session_id})`;
        link.addEventListener('click', () => loadDM(user.nickname));
        item.appendChild(link);
        list.appendChild(item);
    });
}

function loadDM(nickname) {
    const chatLog = document.getElementById('chat-log');
    const messageInput = document.getElementById('chat-message-input');
    const sendButton = document.getElementById('chat-message-submit');

    // WebSocket接続の初期化
    const websocketUrl = `wss://${window.location.host}/ws/chat/dm/${nickname}/`;
    const dmSocket = new WebSocket(websocketUrl);

    dmSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        chatLog.value += `${data.sender}: ${data.message}\n`;
    };

    sendButton.onclick = function() {
        const message = messageInput.value;
        dmSocket.send(JSON.stringify({'message': message}));
        messageInput.value = '';
    };

    dmSocket.onopen = function() {
        console.log('WebSocket connection established with', nickname);
    };

    dmSocket.onerror = function(event) {
        console.error('WebSocket error observed:', event);
    };

    dmSocket.onclose = function() {
        console.error('Chat socket closed unexpectedly');
    };
}
