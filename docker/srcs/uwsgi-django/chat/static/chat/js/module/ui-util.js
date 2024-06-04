// chat/js/ui-util.js

export { setupSendKeyEventListener, scrollToBottom };


// メッセージ送信のイベントを制御
function setupSendKeyEventListener() {
    const input = document.getElementById('message-input');
    const submitButton = document.getElementById('message-submit');

    // Enterキーで送信
    input.addEventListener('keydown', (event) => {
        if (event.keyCode === 13) {
            // console.log("sendKeyEventListener send")
            submitButton.click();
        }
    });
}


// dm-logのスクロール位置を調整
function scrollToBottom() {
    const dmLog = document.getElementById('dm-log');
    dmLog.scrollTop = dmLog.scrollHeight;
}
