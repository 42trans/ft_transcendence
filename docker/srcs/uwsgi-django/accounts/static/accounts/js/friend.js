// static/accounts/js/friend.js

function sendFriendRequest(userId) {
    fetch(`/accounts/api/friend/send-request/${userId}/`, {
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


function cancelFriendRequest(userId) {
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


function acceptFriendRequest(userId) {
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


function rejectFriendRequest(userId) {
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
}


function deleteFriend(userId) {
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
}
