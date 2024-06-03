// static/accounts/js/block-user.js

function blockUser(nickname) {
    fetch(`/accounts/api/block/${nickname}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert(data.message);       // 結果をポップアップで表示
            window.location.reload();  // ページをリロード
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to block the user.');
        });
}


export function setupBlockUserEventListener() {
    console.log("Setup block event listeners");
    const blockUserButton = document.querySelector('.hth-btn.blockUserButton');
    if (blockUserButton) {
        blockUserButton.addEventListener('click', (event) => {
            event.preventDefault();

            const nickname = blockUserButton.dataset.nickname;
            console.log('blockUserButton clicked', nickname);
            blockUser(nickname);
        });
    }
}
