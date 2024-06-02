// static/accounts/js/unblock-user.js

function unblockUser(nickname) {
    fetch(`/accounts/api/unblock/${nickname}/`, {
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
            alert('Failed to unblock the user');
        });
}


export function setupUnBlockUserEventListener() {
    console.log("Setup block event listeners");
    const unBlockUserButton = document.querySelector('.hth-btn.unBlockUserButton');
    if (unBlockUserButton) {
        unBlockUserButton.addEventListener('click', (event) => {
            event.preventDefault();

            const nickname = unBlockUserButton.dataset.nickname;
            console.log('unblockUser clicked', nickname);
            unblockUser(nickname);
        });
    }
}
