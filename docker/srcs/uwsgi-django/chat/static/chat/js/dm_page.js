// chat/static/chat/js/dm_page.js

document.addEventListener("DOMContentLoaded", function() {
    const dmListDiv = document.getElementById('dm-list');
    const dmDetailDiv = document.getElementById('dm-detail');
    const userNickname = document.getElementById('user_nickname').textContent;

    // DMリストをロード
    function loadDMList(){
        const csrftoken = getCookie('csrftoken');

        fetch('/dm/api/list/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({})
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    document.getElementById('message-area').textContent = data.error;
                } else {
                    console.log('debug 1');

                    dmListDiv.innerHTML = '';
                    console.log('debug 2');
                    data.forEach(session => {
                        console.log('debug 3');
                        const sessionDiv = document.createElement('div');
                        console.log('debug 4');
                        sessionDiv.textContent = `DM with ${session.nickname}`;
                        console.log('debug 5');
                        sessionDiv.addEventListener('click', () => loadDM(session.nickname));
                        console.log('debug 6');
                        dmListDiv.appendChild(sessionDiv);
                        console.log('debug 7');
                    });
                }
            }).catch(error => console.error('Error loading DM list:', error));
    }


    // DM詳細をロード
    function loadDM(nickname) {
        fetch(`/dm/api/${nickname}/`).then(response => response.json()).then(data => {
            dmDetailDiv.innerHTML = `<h1>DM with ${nickname}</h1>
            <textarea id="chat-log" cols="100" rows="20" readonly>${data.messages.map(msg => `${msg.sender}: ${msg.message}`).join('\n')}</textarea>
            <input id="chat-message-input" type="text" size="100"><br>
            <input id="chat-message-submit" type="button" value="Send">`;

            setupWebSocket(nickname);
        });
    }

    // WebSocketの設定
    function setupWebSocket(nickname) {
        const websocketUrl = `wss://${window.location.host}/ws/dm/${nickname}/`;
        const dmSocket = new WebSocket(websocketUrl);

        dmSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            const chatLog = document.getElementById('chat-log');
            chatLog.value += `${data.sender}: ${data.message}\n`;
        };

        document.getElementById('chat-message-submit').onclick = function() {
            const message = document.getElementById('chat-message-input').value;
            dmSocket.send(JSON.stringify({ 'message': message }));
            document.getElementById('chat-message-input').value = '';
        };
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    loadDMList();  // 初期リストロード
});
