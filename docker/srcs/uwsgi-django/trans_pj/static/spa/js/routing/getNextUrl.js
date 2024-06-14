// docker/srcs/uwsgi-django/trans_pj/static/spa/js/index.js

import { routeTable } from "./routeTable.js"
import { isUserLoggedIn, isUserEnable2FA } from "../utility/isUser.js"
import { setupLoginEventListener } from "/static/accounts/js/login.js"


const DEBUG = 0;

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
export async function getNextUrl(url) {
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
