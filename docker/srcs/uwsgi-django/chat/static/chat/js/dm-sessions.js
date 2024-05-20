// dm_sessions.js

export function fetchDMList() {
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
        .then(data => createDMSessionLinks(data))
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}


export function startDMwithUser() {
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
        const dmTargetNickname = input.value;
        window.location.pathname = '/dm-with/' + dmTargetNickname + '/';
    };
}


// DMSessionへのリンク一覧を作成
function createDMSessionLinks(data) {
    const list = document.getElementById('dm-sessions');
    list.innerHTML = '';

    data.forEach(dmSession => {
        const item = document.createElement('li');
        const link = document.createElement('a');

        // リンクの設定
        link.href = `/dm-with/${dmSession.target_nickname}/`;

        // システムメッセージの場合は表示を変更
        if (dmSession.is_system_message) {
            link.textContent = `System Message to ${dmSession.target_nickname}`;
        } else {
            link.textContent = `${dmSession.target_nickname}`;
        }

        // リストアイテムにリンクを追加
        item.appendChild(link);
        list.appendChild(item);
    });
}
