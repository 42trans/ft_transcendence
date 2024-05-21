// index.js

import { switchPage, renderView } from "./routing/renderView.js";

const setupPopStateListener = () => {
  window.addEventListener("popstate", renderView);
};


const setupDOMContentLoadedListener = () => {
  document.addEventListener("DOMContentLoaded", () => {
    // 初期ビューを表示
    let currentPath = window.location.pathname;
    switchPage(currentPath);

    // ページリロード時の遷移を設定
    setupLoadEventListener(currentPath);

    // リンククリック時の遷移を設定
    setupBodyClickListener();
  });
};


const setupLoadEventListener = (currentPath) => {
  window.addEventListener("load", () => {
    currentPath = window.location.pathname;
    switchPage(currentPath);
  });
};


const setupBodyClickListener = () => {
  document.body.addEventListener("click", (event) => {
    if (event.target.matches("[data-link]")) {
      event.preventDefault();
      const url = event.target.href;
      switchPage(url);
    }
  });
};


setupPopStateListener();
setupDOMContentLoadedListener();
