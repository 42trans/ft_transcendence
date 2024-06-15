// docker/srcs/uwsgi-django/trans_pj/static/spa/js/index.js

import { routeTable } from "./routing/routeTable.js"
import { switchPage, renderView } from "./routing/renderView.js";
import { getNextPath } from "./routing/getNextPath.js"
import { isUserLoggedIn, isUserEnable2FA } from "./utility/isUser.js"
import { refreshJWT } from "./utility/refreshJWT.js"
import { setupLoginEventListener } from "/static/accounts/js/login.js"

const DEBUG_DETAIL = 0;

// ブラウザの戻る/進むボタンで発火
const setupPopStateListener = () => {
  if (DEBUG_DETAIL) { console.log('popState: path: ' + window.location.pathname); }
  window.addEventListener("popstate", async (event) => {
    const path = window.location.pathname;
    refreshJWT()
    renderView(path);
  });
};


// spa.htmlの読み込みと解析が完了した時点で発火
const setupDOMContentLoadedListener = () => {
  document.addEventListener("DOMContentLoaded", async () => {
    // console.log('DOMContentLoaded: path: ' + window.location.pathname + window.location.search);
    refreshJWT()

    // 初期ビューを表示
    const currentPath = window.location.href;
    const renderPath = await getNextPath(currentPath)  // guest, userのredirectを加味したPathを取得
    switchPage(renderPath);

    // リンククリック時の遷移を設定
    setupBodyClickListener();
  });
};


// リンクのクリックイベントで発火
const setupBodyClickListener = () => {
  document.body.addEventListener("click", async (event) => {
  // console.log('clickEvent: path: ' + window.location.pathname);

    const linkElement = event.target.closest("[data-link]");
    if (linkElement) {
      // console.log('clickEvent: taga-link');
      event.preventDefault();
      refreshJWT()

      const linkUrl = linkElement.href;
      const nextPath = await getNextPath(linkUrl)  // guest, userのredirectを加味したnextPathを取得
      switchPage(nextPath);
    }
  });
};


// ページリロード時に発火
const setupLoadListener = () => {
  window.addEventListener("load", async () => {
    // console.log('loadEvent: path: ' + window.location.pathname);
    refreshJWT()
  });
};


function initSpaEventListeners() {
  setupPopStateListener();
  setupDOMContentLoadedListener();
  setupLoadListener()
}


initSpaEventListeners();
