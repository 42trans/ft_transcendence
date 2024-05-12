// chat/js/ui-util.js

export { setupDOMEventListeners, scrollToBottom };


// DOMイベントリスナーの設定
function setupDOMEventListeners() {
    document.querySelector('#message-input').onkeyup = function(e) {
        if (e.keyCode === 13) {  // enter, return
            document.querySelector('#message-submit').click();
        }
    };
}


// dm-logのスクロール位置を調整
function scrollToBottom() {
    const dmLog = document.getElementById('dm-log');
    dmLog.scrollTop = dmLog.scrollHeight;
}
