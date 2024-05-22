// static/accounts/js/friend.js

import { createFriendsList } from "./online-status.js";


export function sendFriendRequest(userId) {
    console.log(`sendFriendRequest for user ${userId}`);
    fetch(`/accounts/api/friend/send-request/${userId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    }).then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                console.error('Error:', data.error);
                throw new Error(data.error);
            }
            const event = new CustomEvent('sendFriendRequest success:', { detail: data });
            document.dispatchEvent(event);
            window.location.reload();  // ページをリロード
            return data;
        });
    }).catch(error => {
        console.error('Error:', error);
        const errorEvent = new CustomEvent('sendFriendRequest error:', { detail: error });
        document.dispatchEvent(errorEvent);
    });
}


export function cancelFriendRequest(userId) {
    fetch(`/accounts/api/friend/cancel-request/${userId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
        .then(response => {
            return response.json().then(data => {
                if (!response.ok) {
                    throw new Error(data.error);
                }
                return data;
            });
        })
        .then(data => {
            alert(data.status);
            window.location.reload();  // ページをリロード
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
}


export function acceptFriendRequest(userId) {
    console.log(`acceptFriendRequest for user ${userId}`);
    fetch(`/accounts/api/friend/accept-request/${userId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    }).then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error);
            }
            return data;
        });
    })
        .then(data => {
            alert(data.status);
            window.location.reload();  // ページをリロード
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message);
        });
}


export function rejectFriendRequest(userId) {
    if (confirm('Are you sure you want to reject this request ?')) {
        fetch(`/accounts/api/friend/reject-request/${userId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw new Error(data.error);
                    }
                    return data;
                });
            })
            .then(data => {
                alert(data.status);
                window.location.reload();  // ページをリロード
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message);
            });
    } else {
        alert('Request rejection has been canceled');
    }
}


export function deleteFriend(userId) {
    if (confirm('Are you sure you want to delete this friend ?')) {
        fetch(`/accounts/api/friend/delete/${userId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw new Error(data.error);
                    }
                    return data;
                });
            })
            .then(data => {
                alert(data.status);
                window.location.reload();  // ページをリロード
            })
            .catch(error => {
                console.error('Error:', error);
                alert(error.message);
            });

    } else {
        alert('Friend deletion has been canceled');
    }
}


export function setupFriendEventListeners() {
    removeFriendEventListeners()
    console.log("Setup friend event listeners");

    document.querySelectorAll('.sendFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            console.log('sendFriendRequestButton clicked', button.dataset.userid);
            sendFriendRequest(button.dataset.userid);
        });
    });
    document.querySelectorAll('.cancelFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            console.log('cancelFriendRequestButton clicked', button.dataset.userid);
            cancelFriendRequest(button.dataset.userid);
        });
    });
    document.querySelectorAll('.acceptFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            console.log('acceptFriendRequestButton clicked', button.dataset.userid);
            acceptFriendRequest(button.dataset.userid);
        });
    });
    document.querySelectorAll('.rejectFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            console.log('rejectFriendRequestButton clicked', button.dataset.userid);
            rejectFriendRequest(button.dataset.userid);
        });
    });
    document.querySelectorAll('.deleteFriendButton').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('deleteFriendButton clicked', button.dataset.userid);
            deleteFriend(button.dataset.userid);
        });
    });
}


function removeFriendEventListeners() {
    console.log("Remove friend event listeners");

    document.querySelectorAll('.sendFriendRequestButton').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.cancelFriendRequestButton').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.acceptFriendRequestButton').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.rejectFriendRequestButton').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
    document.querySelectorAll('.deleteFriendButton').forEach(button => {
        button.replaceWith(button.cloneNode(true));
    });
}

// window.sendFriendRequest = sendFriendRequest;
// window.cancelFriendRequest = cancelFriendRequest;
// window.acceptFriendRequest = acceptFriendRequest;
// window.rejectFriendRequest = rejectFriendRequest;
// window.deleteFriend = deleteFriend;




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
                // const existingRequest = document.querySelector(`#sent-request-${req.friend_id}`);
                // if (!existingRequest) {  // 重複チェックを追加
                // 	const li = document.createElement('li');
                // 	li.id = `sent-request-${req.friend_id}`;
                // 	li.appendChild(createRequestLink(req.nickname, req.friend_id, true));
                // 	sentRequestsUl.appendChild(li);
                // }
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
                // const existingRequest = document.querySelector(`#received-request-${req.friend_id}`);
                // if (!existingRequest) {  // 重複チェックを追加
                // 	const li = document.createElement('li');
                // 	li.id = `received-request-${req.friend_id}`;
                // 	li.appendChild(createRequestLink(req.nickname, req.friend_id, false));
                // 	receivedRequestsUl.appendChild(li);
                // }
            });

            receivedRequestsDiv.appendChild(receivedRequestsUl);
            requestsContainer.appendChild(receivedRequestsDiv);
            // setupFriendEventListeners();  // Delete有効化のためイベントリスナーを設定する

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
