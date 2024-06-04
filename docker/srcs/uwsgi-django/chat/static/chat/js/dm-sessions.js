// dm_sessions.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";


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
        if (e.key === "Enter") {
            submitButton.click();
        }
    };

    // ボタンクリックでDM画面へのリダイレクト
    submitButton.onclick = function() {
        const dmTargetNickname = input.value;
        const messageArea = document.getElementById('message-area');

        if (!dmTargetNickname) {
            messageArea.textContent = "Nickname cannot be empty";
            return;
        }

        fetch(`/chat/api/validate-dm-target/${dmTargetNickname}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error);
                    });
                }
                window.location.pathname = routeTable['dmWithUserBase'].path + dmTargetNickname + '/';
            })
            .catch(error => {
                messageArea.textContent = error.message;
            });
    }
}


// DMSessionへのリンク一覧を作成
function createDMSessionLinks(data) {
    const list = document.getElementById('dm-sessions');
    list.innerHTML = '';

    data.forEach(dmSession => {
        const item = document.createElement('li');
        const link = document.createElement('a');

        // リンクの設定
        link.href = `${routeTable['dmSessions'].path}${dmSession.target_nickname}/`;

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
