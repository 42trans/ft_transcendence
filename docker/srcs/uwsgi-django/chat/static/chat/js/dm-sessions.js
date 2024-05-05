// dm_sessions.js

function fetchDMList() {
    fetch('/chat/api/dm-sessions/', {
        method: 'GET',
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
        .then(data => updateDOM(data))
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}


function startDMwithUser() {
    const input = document.querySelector('#nickname-input');
    const submitButton = document.querySelector('#nickname-submit');

    // インプットフィールドにフォーカスを当てる
    input.focus();

    // Enterキーで送信
    input.onkeyup = function(e) {
        if (e.keyCode === 13) {  // enter, return
            submitButton.click();
        }
    };

    // ボタンクリックでDM画面へのリダイレクト
    submitButton.onclick = function() {
        const receiver_nickname = input.value;
        window.location.pathname = '/chat/dm-with/' + receiver_nickname + '/';
    };
}


function updateDOM(other_user) {
    const list = document.getElementById('dm-sessions');
    list.innerHTML = ''; // リストをクリア

    other_user.forEach(dm_user => {
        const item = document.createElement('li');

        // リンク要素を作成
        const link = document.createElement('a');
        link.href = `/chat/dm-with/${dm_user.nickname}/`; // リンクの設定

        // システムメッセージの場合は表示を変更
        if (dm_user.is_system_message) {
            link.textContent = `System Message to ${dm_user.nickname}`;
        } else {
            link.textContent = `${dm_user.nickname}`;
        }

        // リストアイテムにリンクを追加
        item.appendChild(link);
        list.appendChild(item);
    });
}


document.addEventListener('DOMContentLoaded', function() {
    // DM Listの取得
    fetchDMList();

    // 入力したuserとのDMを開始
    startDMwithUser();
});
