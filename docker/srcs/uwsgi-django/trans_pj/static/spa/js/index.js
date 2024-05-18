// index.js

import { navigateTo, router } from "./routing/routing.js";

const setupPopStateListener = () => {
  window.addEventListener("popstate", router);
};

const setupDOMContentLoadedListener = () => {
  document.addEventListener("DOMContentLoaded", () => {
    // 初期ビューを表示
    let currentPath = window.location.pathname;
    navigateTo(currentPath);
    router();

    // ページリロード時の遷移を設定
    setupLoadEventListener(currentPath);

    // リンククリック時の遷移を設定
    setupBodyClickListener();
  });
};


const setupLoadEventListener = (currentPath) => {
  window.addEventListener("load", () => {
    currentPath = window.location.pathname;
    navigateTo(currentPath);
    router();
  });
};


const setupBodyClickListener = () => {
  document.body.addEventListener("click", (event) => {
    if (event.target.matches("[data-link]")) {
      event.preventDefault();
      const url = event.target.href;
      navigateTo(url);
    }
  });
};


setupPopStateListener();
setupDOMContentLoadedListener();
