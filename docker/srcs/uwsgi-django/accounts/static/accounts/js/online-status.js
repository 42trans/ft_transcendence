// online-status.js

function setUpOnlineStatusWebSocket(userId) {
    const websocketUrl = 'wss://' + window.location.host + '/ws/online/';

    console.log(`setUpOnlineStatusWebSocket websocketUrl:${websocketUrl}`);

    const socket = new WebSocket(websocketUrl);

    socket.onmessage = handleMessage;
    socket.onopen = () => handleOpen(socket, userId);
    socket.onclose = () => handleClose(socket, userId);
    socket.onerror = handleError;

    // ページ離脱時にオフラインステータスを送信
    window.addEventListener('beforeunload', function() {
        sendStatusUpdate(socket, false, userId);
    });
}


function handleMessage(event) {
    updateFriendStatus(event);
}


function handleOpen(socket, userId) {
    console.log('WebSocket connection established');
    socket.userId = userId;  // ソケットにユーザーIDを保存
    sendStatusUpdate(socket, true, userId);  // 接続時にオンラインステータスとユーザーIDを送信
}


function handleClose(socket, userId) {
    console.log('Websocket closed');
    if (socket.readyState === WebSocket.OPEN) {
        sendStatusUpdate(socket, false, userId);  // 切断時にオフラインステータスとユーザーIDを送信
    }
}


function handleError(event) {
    console.error('WebSocket error observed:', event);
}


function sendStatusUpdate(socket, status, userId) {
    socket.send(JSON.stringify({ 'status': status, 'user_id': userId }));
}


function updateFriendStatus(event) {
    const data = JSON.parse(event.data);
    const userId = data.user_id;
    const status = data.status;

    console.log(`Received status update: userId=${userId}, status=${status}`);

    // 変更があったフレンドのみ更新
    var statusElement = document.getElementById('friend-status-' + userId);
    if (statusElement) {
        statusElement.textContent = status ? 'Online' : 'Offline';
        statusElement.className = 'status ' + (status ? 'online' : 'offline');
    }
}


export function createFriendsList(friendsData) {
    const friendsContainer = document.getElementById("friends-container");
    let friendsList = document.getElementById("friends-list");

    // 既存のリストがなければ作成
    if (!friendsList) {
        friendsList = document.createElement('div');
        friendsContainer.innerHTML = ''; // コンテナをクリア
        const h3 = document.createElement('h3');
        h3.textContent = "Friends";
        friendsList.appendChild(h3);
        const ul = document.createElement('ul');
        ul.id = "friends-ul"; // ulにIDを付与
        friendsList.appendChild(ul);
        friendsContainer.appendChild(friendsList);
    }

    const ul = document.getElementById("friends-ul");
    ul.innerHTML = ''; // リスト内の既存の項目をクリア

    friendsData.friends.forEach(friend => {
        const li = updateOrCreateFriendListItem(friend);
        ul.appendChild(li);
    });
}

// 変更があった部分のみを更新する
function updateOrCreateFriendListItem(friend) {
    let listItem = document.getElementById('friend-item-' + friend.id);
    if (!listItem) {
        listItem = document.createElement('li');
        listItem.id = 'friend-item-' + friend.id;
    }

    listItem.innerHTML = `
        <a href="/user-info/${friend.nickname}/" class="nav__link" data-link>${friend.nickname}</a>
        <span id="friend-status-${friend.id}" class="status ${friend.status ? 'online' : 'offline'}">
            ${friend.status ? 'Online' : 'Offline'}
        </span>
        <a href="#" onclick="deleteFriend(${friend.id}); return false;">Delete</a>
    `;
    return listItem;
}
