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


window.sendFriendRequest = sendFriendRequest;
window.cancelFriendRequest = cancelFriendRequest;
window.acceptFriendRequest = acceptFriendRequest;
window.rejectFriendRequest = rejectFriendRequest;
window.deleteFriend = deleteFriend;
