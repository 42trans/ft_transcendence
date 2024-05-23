// online-status.js

import { deleteFriend, createActionButton } from "./friend.js"


let socket = null;


export function connectOnlineStatusWebSocket(userId) {
    console.log('Connecting WebSocket: userId: ' + userId);

    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
    }

    const websocketUrl = 'wss://' + window.location.host + '/ws/online/';
    console.log(`connectOnlineStatusWebSocket websocketUrl:${websocketUrl}`);

    socket = new WebSocket(websocketUrl);
    socket.onmessage = handleMessage;
    socket.onopen = () => handleOpen(socket, userId);
    socket.onclose = () => handleClose(socket, userId);
    socket.onerror = handleError;
}


export function disconnectOnlineStatusWebSocket(userId) {
    console.log('Disconnecting WebSocket: userId: ' + userId);
    if (socket) {
        console.log(' socket exist -> disconnect');
        sendStatusUpdate(socket, false, userId);
        socket.close();
        socket = null;
    }
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
        socket.close();
        socket = null;
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
// <link-to-user-info> <SP> <online-status> <SP> <Delete-button>
function updateOrCreateFriendListItem(friend) {
    let listItem = document.getElementById('friend-item-' + friend.id);
    if (!listItem) {
        listItem = document.createElement('li');
        listItem.id = 'friend-item-' + friend.id;
    } else {
        listItem.innerHTML = ''; // 既存の内容をクリア
    }

    // <link-to-user-info>
    const link = document.createElement('a');
    link.href = `/user-info/${friend.nickname}/`;
    link.className = 'nav__link';
    link.setAttribute('data-link', '');
    link.textContent = friend.nickname;
    listItem.appendChild(link);

    // <SP>
    listItem.appendChild(document.createTextNode(' '));

    // <online-status>
    const statusSpan = document.createElement('span');
    statusSpan.id = `friend-status-${friend.id}`;
    statusSpan.className = `status ${friend.status ? 'online' : 'offline'}`;
    statusSpan.textContent = friend.status ? 'Online' : 'Offline';
    listItem.appendChild(statusSpan);

    // <SP>
    listItem.appendChild(document.createTextNode(' '));

    // <Delete-button>
    const deleteButton = createActionButton("Delete", () => deleteFriend(friend.id));
    listItem.appendChild(deleteButton);

    return listItem;
}


export function setOnlineStatus() {
    console.log('setOnlineStatus');

    const userIdElement = document.getElementById('user-id');
    if (!userIdElement) {
        console.log('User ID not found');
        return;
    }

    const userId = userIdElement.value;

    function onPageLoad() {
        if (userId) {
            connectOnlineStatusWebSocket(userId);
            alert('connectOnlineStatusWebSocket completed')
        }
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        onPageLoad();
    } else {
        window.addEventListener('load', onPageLoad);
    }

    window.addEventListener('popstate', function(event) {
        onPageLoad();
    });
}
