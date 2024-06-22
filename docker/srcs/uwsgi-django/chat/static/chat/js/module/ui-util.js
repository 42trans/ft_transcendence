// chat/js/ui-util.js

// メッセージ送信のイベントを制御
export function setupSendKeyEventListener(isSystemUser) {
    if (isSystemUser) { return; }

    const input = document.getElementById('message-input');
    const submitButton = document.getElementById('message-submit');

    // Enterキーで送信
    input.addEventListener('keydown', (event) => {
        if (event.keyCode === 13) {
            submitButton.click();
        }
    });
}


// dm-logのスクロール位置を調整
export function scrollToBottom() {
    const dmLog = document.getElementById('dm-log');
    dmLog.scrollTop = dmLog.scrollHeight;
}
