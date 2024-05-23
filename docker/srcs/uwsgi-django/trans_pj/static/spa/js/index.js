// index.js

import { switchPage, renderView } from "./routing/renderView.js";
import { setOnlineStatus } from "/static/accounts/js/online-status.js";


// ブラウザの戻る/進むボタンで発火
const setupPopStateListener = () => {
  console.log('pop state listener: path: ' + window.location.pathname);

  window.addEventListener("popstate", (event) => {
    const path = window.location.pathname;
    renderView(path);
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


// spa.htmlの読み込みと解析が完了した時点で発火
const setupDOMContentLoadedListener = () => {
  document.addEventListener("DOMContentLoaded", () => {
    // 初期ビューを表示
    let currentPath = window.location.pathname;
    switchPage(currentPath);

    // リンククリック時の遷移を設定
    setupBodyClickListener();

    setOnlineStatus();  // WebSocket接続を再確立
  });
};


// リンクのクリックイベントで発火
const setupBodyClickListener = () => {
  document.body.addEventListener("click", (event) => {
    if (event.target.matches("[data-link]")) {
      event.preventDefault();
      const url = event.target.href;
      switchPage(url);
      setOnlineStatus();  // WebSocket接続を再確立
    }
  });
};


// ページリロード時に発火
const setupLoadListener = () => {
  window.addEventListener("load", () => {
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


setupPopStateListener();
setupDOMContentLoadedListener();
setupLoadListener()
