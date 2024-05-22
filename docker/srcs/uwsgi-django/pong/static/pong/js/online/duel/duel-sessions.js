// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/duel-sessions.js
// TODO_ft:load後に起動させる
function startDuelwithUser() {
    const input = document.querySelector('#nickname-input');
    const submitButton = document.querySelector('#nickname-submit');

    // インプットフィールドにフォーカスを当てる
    input.focus();

    // 日本語ニックネームで漢字変換時の確定キーのenterも認識してsubmitしてしまうバグ
    // Enterキーで送信
    // input.onkeyup = function(e) {
    //     if (e.keyCode === 13) {  // enter, return
    //         submitButton.click();
    //     }
    // };

    
    // sessionを作るAPI
    // 作られたら2名にDM
    // ボタンクリックでDM画面へのリダイレクト
    submitButton.onclick = function() {
        const duelTargetNickname = input.value;
        window.location.pathname = '/pong/online/duel/duel-with/' + duelTargetNickname + '/';
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // DM Listの取得
    fetchDMList();

    startDuelwithUser();
});


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
        .then(data => createDMSessionLinks(data))
        .catch(error => console.error('There has been a problem with your fetch operation:', error));
}


// DMSessionへのリンク一覧を作成
function createDMSessionLinks(data) {
    const list = document.getElementById('duel-sessions');
    list.innerHTML = '';

    data.forEach(dmSession => {
        const item = document.createElement('li');
        const link = document.createElement('a');

        // リンクの設定
        link.href = `/pong/online/duel/duel-with/${dmSession.target_nickname}/`;
        // link.href = `/chat/dm-with/${dmSession.target_nickname}/`;

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
