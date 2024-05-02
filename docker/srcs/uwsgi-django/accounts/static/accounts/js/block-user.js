// static/accounts/js/block-user.js

function blockUser(nickname) {
    fetch(`/accounts/api/block/${nickname}/`, {
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
