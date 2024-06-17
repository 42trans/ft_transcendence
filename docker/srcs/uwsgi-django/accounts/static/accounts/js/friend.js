// static/accounts/js/friend.js

import { createFriendsList } from "./online-status.js";
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"


export function sendFriendRequest(userId) {
    // console.log(`sendFriendRequest for user ${userId}`);
    fetch(`/accounts/api/friend/send-request/${userId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return response.json().then(data => {
            if (!response.ok) {
                throw new Error(data.error);
            }
            const event = new CustomEvent('sendFriendRequest success:', { detail: data });
            document.dispatchEvent(event);
            switchPage(window.location.pathname);
            return data;
        });
    }).catch(error => {
        console.error('hth: Error:', error);
        const errorEvent = new CustomEvent('sendFriendRequest error:', { detail: error });
        document.dispatchEvent(errorEvent);
    });
}


export function cancelFriendRequest(userId) {
    fetch(`/accounts/api/friend/cancel-request/${userId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
            switchPage(window.location.pathname);
        })
        .catch(error => {
            console.error('hth: Error:', error);
            alert(error.message);
        });
}


export function acceptFriendRequest(userId) {
    // console.log(`acceptFriendRequest for user ${userId}`);
    fetch(`/accounts/api/friend/accept-request/${userId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
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
            switchPage(window.location.pathname);
        })
        .catch(error => {
            console.error('hth: Error:', error);
            alert(error.message);
        });
}


export function rejectFriendRequest(userId) {
    if (confirm('Are you sure you want to reject this request ?')) {
        fetch(`/accounts/api/friend/reject-request/${userId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
                switchPage(window.location.pathname);
            })
            .catch(error => {
                console.error('hth: Error:', error);
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
                'Content-Type': 'application/json'
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
                switchPage(window.location.pathname);
            })
            .catch(error => {
                console.error('hth: Error:', error);
                alert(error.message);
            });

    } else {
        alert('Friend deletion has been canceled');
    }
}


export function setupDeleteFriendEventListener() {
    // console.log("Setup friend event listeners");
    document.querySelectorAll('.deleteFriendButton').forEach(button => {
        button.addEventListener('click', () => {
            // console.log('deleteFriendButton clicked', button.dataset.userid);
            deleteFriend(button.dataset.userid);
        });
    });
}


export function setupFriendRequestListEventListeners() {
    // console.log("Setup friend event listeners");

    document.querySelectorAll('.sendFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            // console.log('sendFriendRequestButton clicked', button.dataset.userid);
            sendFriendRequest(button.dataset.userid);
        });
    });
    document.querySelectorAll('.cancelFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            // console.log('cancelFriendRequestButton clicked', button.dataset.userid);
            cancelFriendRequest(button.dataset.userid);
        });
    });
    document.querySelectorAll('.acceptFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            // console.log('acceptFriendRequestButton clicked', button.dataset.userid);
            acceptFriendRequest(button.dataset.userid);
        });
    });
    document.querySelectorAll('.rejectFriendRequestButton').forEach(button => {
        button.addEventListener('click', () => {
            // console.log('rejectFriendRequestButton clicked', button.dataset.userid);
            rejectFriendRequest(button.dataset.userid);
        });
    });
}


// Friend List
export function fetchFriendList() {
    fetch('/accounts/api/friend/list/', {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            createFriendsList(data);
            setupDeleteFriendEventListener()
        })
        .catch(error => console.error('hth: Error:', error));
}


function createFriendRequestList(data) {
    const requestsContainer = document.getElementById("requests-container");
    requestsContainer.innerHTML = '';

    // 送信したフレンドリクエスト
    const sentRequestsDiv = document.createElement('div');
    sentRequestsDiv.innerHTML = "<h3>Sent Friend Requests</h3>";

    const sentRequestsUl = document.createElement('ul');
    data.sent_requests.forEach(req => {
        const li = document.createElement('li');
        li.appendChild(createRequestLink(req.nickname, req.friend_id, true));
        sentRequestsUl.appendChild(li);
    });

    sentRequestsDiv.appendChild(sentRequestsUl);
    requestsContainer.appendChild(sentRequestsDiv);

    requestsContainer.appendChild(document.createElement('hr'));

    // 受信したフレンドリクエスト
    const receivedRequestsDiv = document.createElement('div');
    receivedRequestsDiv.innerHTML = "<h3>Received Friend Requests</h3>";

    const receivedRequestsUl = document.createElement('ul');
    data.received_requests.forEach(req => {
        const li = document.createElement('li');
        li.appendChild(createRequestLink(req.nickname, req.friend_id, false));
        receivedRequestsUl.appendChild(li);
    });

    receivedRequestsDiv.appendChild(receivedRequestsUl);
    requestsContainer.appendChild(receivedRequestsDiv);
}


function createRequestLink(nickname, friend_id, isSent) {
    const link = document.createElement('a');
    link.href = `${routeTable['userInfoBase'].path}${nickname}/`;
    link.className = 'nav__link';
    link.setAttribute('data-link', '');
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


export function createActionButton(text, action) {
    const actionLink = document.createElement('a');
    actionLink.textContent = text;
    actionLink.href = "#";
    actionLink.className = text.toLowerCase() + 'Button';
    actionLink.onclick = function(event) {
        event.preventDefault();
        action();
    };
    return actionLink;
}


// Sent/Received Friend Request List
export function fetchFriendRequestList() {
    // フレンド申請リストの一覧
    fetch("/accounts/api/friend/requests/", {
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            createFriendRequestList(data);
            setupFriendRequestListEventListeners()
        })
        .catch(error => console.error("hth: Error:", error));
}
