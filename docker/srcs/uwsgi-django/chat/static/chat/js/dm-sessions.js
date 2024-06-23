// dm_sessions.js

import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"
import { escapeHtml } from "./module/handle-receive-message.js"

// ... (tournamentInvite 関数)

export function fetchDMList() {
    fetch('/chat/api/dm-sessions/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
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
        const dmTargetNickname = escapeHtml(input.value);
        const messageArea = document.getElementById('message-area');

        if (!dmTargetNickname) {
            messageArea.textContent = "Nickname cannot be empty";
            return;
        }

        fetch(`/chat/api/validate-dm-target/${dmTargetNickname}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok || data.error) {
                        throw new Error(data.error);
                    } else {
                        // 検証が成功した場合にdiWithUserに遷移
                        const targetId = data.target_id;
                        // console.log("target_id: " + targetId)
                        const routePath = routeTable['dmWithUserBase'].path + targetId + '/'
                        switchPage(routePath);
                    }
                });
            })
            .catch(error => {
                if (error.message.includes('<!doctype')) {
                    // <script></script>入力された場合。APIにたどり着く前にエラー判定されている
                    messageArea.textContent = "The specified user does not exist";
                } else {
                    messageArea.textContent = error.message;
                }
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
        link.href = `${routeTable['dmSessions'].path}${dmSession.target_id}/`;
        link.setAttribute('data-link', '');

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


// -------------------------------------
// setupInviteButton
// -------------------------------------
let tournamentInviteSocket = null; 
export function tournamentInvite() {
    const tournamentInviteButton = document.querySelector('#tournament-invite');
    const nicknameInput = document.querySelector('#nickname-input');
    const userInfo = JSON.parse(document.querySelector('#user_info').textContent); 

    tournamentInviteButton.onclick = function() {
        const dmTargetNickname = escapeHtml(nicknameInput.value);
        const messageArea = document.querySelector('#message-area');

        if (!dmTargetNickname) {
            messageArea.textContent = "Nickname cannot be empty";
            return;
        }

        fetch(`/chat/api/validate-dm-target/${dmTargetNickname}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                return response.json().then(data => {
                    if (!response.ok || data.error) {
                        throw new Error(data.error);
                    } else {
                        const targetId = data.target_id;

                        // 既存のトーナメント招待用 WebSocket 接続があれば閉じる
                        if (tournamentInviteSocket) {
                            tournamentInviteSocket.close();
                        }

                        // トーナメント招待用の WebSocket 接続を確立して招待メッセージを送信
                        const targetInfo = { id: targetId, nickname: dmTargetNickname };
                        setupTournamentInviteWebsocket(userInfo, targetInfo);
                    }
                });
            })
            .catch(error => {
                if (error.message.includes('<!doctype')) {
                    messageArea.textContent = "The specified user does not exist";
                } else {
                    messageArea.textContent = error.message;
                }
                // console.error('tournamentInvite(): error', error);
            });
    };
}

function setupTournamentInviteWebsocket(userInfo, targetInfo) {
    const websocketUrl = 'wss://' + window.location.host + '/ws/dm-with/' + targetInfo.id + '/';
    tournamentInviteSocket = new WebSocket(websocketUrl);

    tournamentInviteSocket.onopen = () => {
        handleSendMessage(tournamentInviteSocket, "こんにちは。今から、私がいる場所付近で、私のデバイスを交代で使用して8人でゲームのトーナメントをしましょう");
        const messageArea = document.querySelector('#message-area');
        messageArea.textContent = `私のデバイスを交代で使用するトーナメントに${targetInfo.nickname}を誘いました`;
        tournamentInviteSocket.close(); // 送信後、WebSocket 接続を閉じる
    };

    tournamentInviteSocket.onclose = () => {
        tournamentInviteSocket = null; // 接続が閉じたら null に戻す
    };

    tournamentInviteSocket.onerror = (event) => {
        console.error('WebSocket error (tournament invite):', event);
        tournamentInviteSocket = null; // エラーが発生したら null に戻す
    };
}

function handleSendMessage(socket, message) {
    socket.send(JSON.stringify({
        'message': message
    }));
}
