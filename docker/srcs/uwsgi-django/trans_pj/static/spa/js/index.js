// docker/srcs/uwsgi-django/trans_pj/static/spa/js/index.js

import { routeTable } from "./routing/routeTable.js"
import { switchPage, renderView } from "./routing/renderView.js";
import { getNextPath } from "./routing/getNextPath.js"
import { isUserLoggedIn, isUserEnable2FA } from "./utility/isUser.js"
import { refreshJWT } from "./utility/refreshJWT.js"
import { setOnlineStatus } from "/static/accounts/js/online-status.js";
import { setupLoginEventListener } from "/static/accounts/js/login.js"


// function isRenderByThreeJsPage(path) {
//   return (window.location.pathname === routeTable['game3d'].path)
// }

// three-jsのレンダリングを停止
// const stopGamePageAnimation = () => {
//   if (isRenderByThreeJsPage(window.location.pathname)
//       && window.controlThreeAnimation
//       && typeof window.controlThreeAnimation.stopAnimation === "function") {
//     window.controlThreeAnimation.stopAnimation();
//   }
// };

// ブラウザの戻る/進むボタンで発火
const setupPopStateListener = () => {
  // console.log('popState: path: ' + window.location.pathname);

  window.addEventListener("popstate", (event) => {
    const path = window.location.pathname;
    refreshJWT()
    // stopGamePageAnimation()
    renderView(path);
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


// spa.htmlの読み込みと解析が完了した時点で発火
const setupDOMContentLoadedListener = () => {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log('DOMContentLoaded: path: ' + window.location.pathname + window.location.search);
    // stopGamePageAnimation()
    refreshJWT()

    // 初期ビューを表示
    // const currentPath = window.location.pathname;
    const currentPath = window.location.href;
    const renderPath = await getNextPath(currentPath)  // guest, userのredirectを加味したPathを取得
    switchPage(renderPath);

    // リンククリック時の遷移を設定
    setupBodyClickListener();
    setOnlineStatus();  // WebSocket接続を再確立

    // three-jsのEndGameボタン押下でSPA遷移するためのイベント
    // document.addEventListener('endGame', function() {
    //   console.log('endGame event');
    //   switchPage(routeTable['tournament'].path);
    // });
  });
};


// リンクのクリックイベントで発火
const setupBodyClickListener = () => {
  document.body.addEventListener("click", async (event) => {
  console.log('clickEvent: path: ' + window.location.pathname);
  // stopGamePageAnimation()

    const linkElement = event.target.closest("[data-link]");
    if (linkElement) {
      // console.log('clickEvent: taga-link');
      event.preventDefault();
      refreshJWT()

      const linkUrl = linkElement.href;
      const nextPath = await getNextPath(linkUrl)  // guest, userのredirectを加味したnextPathを取得
      switchPage(nextPath);
    }

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
    refreshJWT()

    // stopGamePageAnimation()
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


function initSpaEventListeners() {
  setupPopStateListener();
  setupDOMContentLoadedListener();
  setupLoadListener()
}


initSpaEventListeners();
