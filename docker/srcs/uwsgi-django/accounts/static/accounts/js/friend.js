// static/accounts/js/friend.js

export function sendFriendRequest(userId) {
    console.log("sendFriendRequest 1");
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
            const event = new CustomEvent('FriendRequestSent', { detail: data });
            document.dispatchEvent(event);
            window.location.reload();  // ページをリロード
            return data;
        });
    }).catch(error => {
        console.error('Error:', error);
        const errorEvent = new CustomEvent('FriendRequestError', { detail: error });
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
    fetch(`/accounts/api/friend/accept-request/${userId}/`, {
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

// window.sendFriendRequest = sendFriendRequest;
// window.cancelFriendRequest = cancelFriendRequest;
// window.acceptFriendRequest = acceptFriendRequest;
// window.rejectFriendRequest = rejectFriendRequest;
// window.deleteFriend = deleteFriend;
