// docker/srcs/uwsgi-django/pong/static/pong/js/online/duel/module/ui-util.js

export { setupDOMEventListeners };


// DOMイベントリスナーの設定
function setupDOMEventListeners() {
    document.querySelector('#request-duel-btn').onkeyup = function(e) {
        // if (e.keyCode === 13) {  // enter, return
        //     document.querySelector('#message-submit').click();
        // }
    };
}


// // dm-logのスクロール位置を調整
// function scrollToBottom() {
//     const dmLog = document.getElementById('dm-log');
//     dmLog.scrollTop = dmLog.scrollHeight;
// }
