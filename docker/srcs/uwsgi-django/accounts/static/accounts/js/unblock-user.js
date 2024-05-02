// static/accounts/js/unblock-user.js

function unblockUser(nickname) {
    fetch(`/accounts/api/unblock/${nickname}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
        .then(response => response.json())
        .then(data => alert(data.message))  // 結果をポップアップで表示
        .catch(error => console.error('Error:', error));
}
