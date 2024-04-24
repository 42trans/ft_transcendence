// dm_list.js
document.addEventListener('DOMContentLoaded', function() {
    fetchPartners();
});

function fetchPartners() {
    fetch('/dm/api/list/', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => updateDOM(data))
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

function updateDOM(other_user) {
    const list = document.getElementById('dm-list');
    list.innerHTML = ''; // リストをクリア

    other_user.forEach(other => {
        const item = document.createElement('li');

        // リンク要素を作成
        const link = document.createElement('a');
        link.href = `/chat/dm/${other.nickname}/`; // リンクの設定
        link.textContent = `${other.nickname} (DMSession.id: ${other.session_id})`;

        // リストアイテムにリンクを追加
        item.appendChild(link);
        list.appendChild(item);
    });
}
