import { setupLogoutEventListener } from "/static/accounts/js/logout.js"
import { isUserLoggedIn } from "../utility/isUser.js"

const DEBUG = 1;

// headerを取得し差し替え
export function updateHeader() {
    if (DEBUG) { console.log("updateHeader"); }

    fetch('/spa/header/')
        .then(response => response.text())
        .then(headerHtml => {
            document.querySelector('header').innerHTML = headerHtml;

            // logout buttonのイベントリスナーを設定
            if (isUserLoggedIn()) {
                setupLogoutEventListener();
            }
        });
}
