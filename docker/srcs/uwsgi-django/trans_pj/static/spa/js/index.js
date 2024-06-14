// docker/srcs/uwsgi-django/trans_pj/static/spa/js/index.js

import { routeTable } from "./routing/routeTable.js"
import { switchPage, renderView } from "./routing/renderView.js";
import { isUserLoggedIn, isUserEnable2FA } from "./utility/isUser.js"
import { refreshJWT } from "./utility/refreshJWT.js"
import { setOnlineStatus } from "/static/accounts/js/online-status.js";
import { setupLoginEventListener } from "/static/accounts/js/login.js"


const DEBUG = 1;

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
    // setupLoginEventListener()  // loginリダイレクト時にlogin buttonを設定
    renderView(path);
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


// spa.htmlの読み込みと解析が完了した時点で発火
const setupDOMContentLoadedListener = () => {
  document.addEventListener("DOMContentLoaded", () => {
    console.log('DOMContentLoaded: path: ' + window.location.pathname + window.location.search);
    // stopGamePageAnimation()
    refreshJWT()

    // 初期ビューを表示
    const pathName = window.location.pathname;
    const queryString =  window.location.search;
    const currentPath = pathName + queryString;
    switchPage(currentPath);

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


function getGuestRedirectUrl(url) {
  const urlObject = new URL(url);
  const pathName = urlObject.pathname;
  let nextUrl;

  if (pathName === routeTable['top'].path
      || pathName === routeTable['home'].path
      || pathName === routeTable['game2d'].path
      || pathName === routeTable['signup'].path
      || pathName === routeTable['login'].path) {
    nextUrl = url;
    if (DEBUG) { console.log('guest access to  : ' + nextUrl); }
  } else {
    // loginを表示 & LoginEventListenerを設定
    nextUrl = new URL(routeTable['login'].path, window.location.origin);
    setupLoginEventListener();
    if (DEBUG) { console.log('guest redirect to: ' + nextUrl); }
  }
  return nextUrl;
}


function getLoggedInUserRedirectUrl(url, isEnable2FA) {
  const urlObject = new URL(url);
  const pathName = urlObject.pathname;
  let nextUrl;

  if (pathName === routeTable['signup'].path
      || pathName === routeTable['login'].path
      || pathName === routeTable['veryfy2fa'].path
      || (pathName === routeTable['enable2fa'].path && isEnable2FA)) {
    // topを表示
    nextUrl = new URL(routeTable['top'].path, window.location.origin);
    if (DEBUG) { console.log('user redirect to: ' + nextUrl); }
  } else {
    nextUrl = url;
    if (DEBUG) { console.log('user access to  : ' + nextUrl); }
  }
  return nextUrl
}


// login userであれば/auth/への遷移を/app/に切り返る
async function getNextUrl(url) {
  const isLoggedIn = await isUserLoggedIn();
  if (!isLoggedIn) {
    return getGuestRedirectUrl(url);
  }
  // 2FA有効user && enable2faへの遷移 は/app/に切り替える
  const isEnable2FA = await isUserEnable2FA();

  let nextUrl = getLoggedInUserRedirectUrl(url, isEnable2FA);

  // console.log(`DEBUG getLoggedInUserRedirectUrl`)
  // console.log(` url      :${url}`)
  // console.log(` pathName :${pathName}`)
  // console.log(` nextUrl  :${nextUrl}`)
  // alert(`[check console log]getLoggedInUserRedirectUrl`)
  return nextUrl;
}


// リンクのクリックイベントで発火
const setupBodyClickListener = () => {
  document.body.addEventListener("click", async (event) => {
  console.log('clickEvent: path: ' + window.location.pathname);
  // stopGamePageAnimation()
  refreshJWT()
  // setupLoginEventListener()  // loginリダイレクト時にlogin buttonを設定

    const linkElement = event.target.closest("[data-link]");
    if (linkElement) {
      // console.log('clickEvent: taga-link');
      event.preventDefault();

      const linkUrl = linkElement.href;
      const url = await getNextUrl(linkUrl)
      switchPage(url);
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
    // setupLoginEventListener()  // loginリダイレクト時にlogin buttonを設定
    setOnlineStatus();  // WebSocket接続を再確立
  });
};


function initSpaEventListeners() {
  setupPopStateListener();
  setupDOMContentLoadedListener();
  setupLoadListener()
}


initSpaEventListeners();
