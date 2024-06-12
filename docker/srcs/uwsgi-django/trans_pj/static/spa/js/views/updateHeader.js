import { setupLogoutEventListener } from "/static/accounts/js/logout.js"

// headerを取得し差し替え
export function updateHeader() {
    fetch('/spa/header/')
        .then(response => response.text())
        .then(headerHtml => {
            document.querySelector('header').innerHTML = headerHtml;

            // logout buttonのイベントリスナーを設定
            setupLogoutEventListener();
        });
}