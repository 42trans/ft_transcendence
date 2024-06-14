// online-status.js

import { deleteFriend, createActionButton } from "./friend.js"
import { routeTable } from "/static/spa/js/routing/routeTable.js";


let onlineStatusDebug = 0;
let onlineStatusSocket = null;


export function connectOnlineStatusWebSocket(userId) {
    if (onlineStatusDebug) { console.log('Connecting WebSocket: userId: ' + userId); }

    if (onlineStatusSocket && onlineStatusSocket.readyState === WebSocket.OPEN) {
        if (onlineStatusDebug) { console.log('WebSocket already connected'); }
        return;
    }

    const websocketUrl = 'wss://' + window.location.host + '/ws/online/';
    if (onlineStatusDebug) { console.log(`connectOnlineStatusWebSocket websocketUrl:${websocketUrl}`); }

    onlineStatusSocket = new WebSocket(websocketUrl);
    onlineStatusSocket.onmessage = handleMessage;
    onlineStatusSocket.onopen = () => handleOpen(onlineStatusSocket, userId);
    onlineStatusSocket.onclose = () => disconnectOnlineStatusWebSocket(userId);
    onlineStatusSocket.onerror = handleError;

    // alert('connectOnlineStatusWebSocket completed')
}


export function disconnectOnlineStatusWebSocket(userId) {
    if (onlineStatusDebug) { console.log('Disconnecting WebSocket: userId: ' + userId); }
    if (onlineStatusSocket) {
        if (onlineStatusDebug) { console.log(' onlineStatusSocket exist -> disconnect'); }
        sendStatusUpdate(onlineStatusSocket, false, userId);
        onlineStatusSocket.close();
        onlineStatusSocket = null;
    }
}


function handleMessage(event) {
    updateFriendStatus(event);
}


async function handleOpen(onlineStatusSocket, userId) {
    if (onlineStatusDebug) { console.log('WebSocket connection established'); }
    onlineStatusSocket.userId = userId;
    await sendStatusUpdate(onlineStatusSocket, true, userId);
}


async function sendStatusUpdate(onlineStatusSocket, status, userId) {
    if (onlineStatusSocket.readyState === WebSocket.OPEN) {
        onlineStatusSocket.send(JSON.stringify({ 'status': status, 'user_id': userId }));
    } else if (onlineStatusSocket.readyState === WebSocket.CONNECTING) {
        await waitForWebSocketOpen(onlineStatusSocket);
        onlineStatusSocket.send(JSON.stringify({ 'status': status, 'user_id': userId }));
    } else {
        console.error('WebSocket is not open. readyState: ' + onlineStatusSocket.readyState);
    }
}


function waitForWebSocketOpen(onlineStatusSocket) {
    return new Promise((resolve) => {
        onlineStatusSocket.addEventListener('open', function onOpen() {
            onlineStatusSocket.removeEventListener('open', onOpen);
            resolve();
        });
    });
}


function handleError(event) {
    console.error('WebSocket error observed:', event);
}


function updateFriendStatus(event) {
    const data = JSON.parse(event.data);
    const userId = data.user_id;
    const status = data.status;

    if (onlineStatusDebug) { console.log(`Received status update: userId=${userId}, status=${status}`); }

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
    link.href = `${routeTable['userInfoBase'].path}${friend.nickname}/`;
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
