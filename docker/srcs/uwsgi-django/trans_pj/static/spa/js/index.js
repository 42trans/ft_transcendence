// index.js

import { routeTable } from "./routing/routeTable.js"
import { switchPage, renderView } from "./routing/renderView.js";
import { setOnlineStatus } from "/static/accounts/js/online-status.js";


function isRenderByThreeJsPage(path) {
  return (window.location.pathname === routeTable['game3d'].path)
}

// three-jsのレンダリングを停止
const stopGamePageAnimation = () => {
  if (isRenderByThreeJsPage(window.location.pathname)
      && window.controlThreeAnimation
      && typeof window.controlThreeAnimation.stopAnimation === "function") {
    window.controlThreeAnimation.stopAnimation();
  }
};

// ブラウザの戻る/進むボタンで発火
const setupPopStateListener = () => {
  console.log('popState: path: ' + window.location.pathname);

  window.addEventListener("popstate", (event) => {
    const path = window.location.pathname;
    stopGamePageAnimation()
    renderView(path);
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


// spa.htmlの読み込みと解析が完了した時点で発火
const setupDOMContentLoadedListener = () => {
  document.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded: path: ' + window.location.pathname);
    stopGamePageAnimation()

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
  console.log('clickEvent: path: ' + window.location.pathname);
  stopGamePageAnimation()


    const linkElement = event.target.closest("[data-link]");
    // 条件にドロップダウンメニューを追加
    if (linkElement && linkElement.closest('.dropdown-menu')) {
    // if (linkElement) {

      console.log('clickEvent: taga-link');
      event.preventDefault();
      const url = linkElement.href;
      switchPage(url);
    
    } else if (!linkElement) {
      return;
    }

// 元のコード
    // const linkElement = event.target.closest("[data-link]");
    // if (linkElement) {
    //   console.log('clickEvent: taga-link');
    //   event.preventDefault();
    //   const url = linkElement.href;
    //   switchPage(url);
    // }

    // if (event.target.matches("[data-link]")) {
    //   console.log('clickEvent: taga-link');
    //   stopGamePageAnimation()
    //   event.preventDefault();
    //   const url = event.target.href;
    //   switchPage(url);
    // }
    // setOnlineStatus();  // WebSocket接続を再確立
  });
};


// ページリロード時に発火
const setupLoadListener = () => {
  window.addEventListener("load", () => {
    console.log('loadEvent: path: ' + window.location.pathname);

    stopGamePageAnimation()
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


function initSpaEventListeners() {
  setupPopStateListener();
  setupDOMContentLoadedListener();
  setupLoadListener()
}


initSpaEventListeners();
