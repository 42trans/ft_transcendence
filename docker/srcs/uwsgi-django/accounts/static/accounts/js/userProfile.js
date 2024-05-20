// userProfile.js

import { createFriendsList } from "./online-status.js"
import { cancelFriendRequest, rejectFriendRequest, acceptFriendRequest } from "./friend.js"

export function fetchUserProfile() {
	fetch("/accounts/api/user/profile/", {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`
		}
	})
		.then(response => response.json())
		.then(data => {
			const userInfo = document.getElementById("user-info");
			userInfo.innerHTML = `
                <li>Email: ${data.email}</li>
                <li>Nickname: ${data.nickname}</li>
                ${data.has_usable_password ? '<li>Password: ******</li>' : ''}
                <li><a href="/edit-profile/">Edit Profile</a></li>
                <hr>
                <li>Avatar: <img src="${data.avatar_url}" alt="User Avatar" class="avatar">
                <a href="/change-avatar/">Edit Avatar</a></li>
                <hr>
                ${data.enable_2fa ?
				`<li>2FA: ✅Enabled</li><li><a href="/accounts/verify/disable_2fa/">Disable 2FA</a></li>` :
				`<li>2FA: Disabled</li><li><a href="/accounts/verify/enable_2fa/">Enable 2FA</a></li>`}
                <hr>
                <li><a href="/dm/" class="nav__link" data-link>DM List</a></li> 
                `;
				// SPA DM pageへの遷移なのでchat/dm-sessions/ではなく/dm/を指定

			// setUpOnlineStatusWebSocket(data.id);  // OnlieStatusWebSocketに接続
		})
		.catch(error => console.error("Error:", error));
}


export function fetchFriendList() {
	fetch('/accounts/api/friend/list/', {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`
		}
	})
		.then(response => response.json())
		.then(data => {
			createFriendsList(data);
		})
		.catch(error => console.error('Error:', error));
}


export function fetchFriendRequestList() {
	// フレンド申請リストの一覧
	fetch("/accounts/api/friend/requests/", {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${localStorage.getItem('access_token')}`
		}
	})
		.then(response => response.json())
		.then(data => {
			const requestsContainer = document.getElementById("requests-container");
			requestsContainer.innerHTML = '';

			// 送信したフレンドリクエスト
			const sentRequestsDiv = document.createElement('div');
			sentRequestsDiv.innerHTML = "<h4>Sent Friend Requests</h4>";

			const sentRequestsUl = document.createElement('ul');
			data.sent_requests.forEach(req => {
				const li = document.createElement('li');
				li.appendChild(createRequestLink(req.nickname, req.friend_id, true));
				sentRequestsUl.appendChild(li);
			});

			sentRequestsDiv.appendChild(sentRequestsUl);
			requestsContainer.appendChild(sentRequestsDiv);


			// 受信したフレンドリクエスト
			const receivedRequestsDiv = document.createElement('div');
			receivedRequestsDiv.innerHTML = "<h4>Received Friend Requests</h4>";

			const receivedRequestsUl = document.createElement('ul');
			data.received_requests.forEach(req => {
				const li = document.createElement('li');
				li.appendChild(createRequestLink(req.nickname, req.friend_id, false));
				receivedRequestsUl.appendChild(li);
			});

			receivedRequestsDiv.appendChild(receivedRequestsUl);
			requestsContainer.appendChild(receivedRequestsDiv);
		})
		.catch(error => console.error("Error:", error));
}


function createRequestLink(nickname, friend_id, isSent) {
	const link = document.createElement('a');
	link.href = `/accounts/info/${nickname}/`;
	link.textContent = nickname;

	const textNode = document.createTextNode(isSent ? 'Request sent to ' : 'Request from ');

	const fragment = document.createDocumentFragment();
	fragment.appendChild(textNode);
	fragment.appendChild(link);
	fragment.appendChild(document.createTextNode(' '));

	if (isSent) {
		const cancelButton = createActionButton("Cancel", () => cancelFriendRequest(friend_id));
		fragment.appendChild(cancelButton);
	} else {
		const acceptButton = createActionButton("Accept", () => acceptFriendRequest(friend_id));
		const rejectButton = createActionButton("Reject", () => rejectFriendRequest(friend_id));
		fragment.appendChild(acceptButton);
		fragment.appendChild(document.createTextNode(' '));
		fragment.appendChild(rejectButton);
	}

	return fragment;
}


function createActionButton(text, action) {
	const actionLink = document.createElement('a');
	actionLink.textContent = text;
	actionLink.href = "#";
	actionLink.onclick = function(event) {
		event.preventDefault();
		action();
	};
	return actionLink;
}
