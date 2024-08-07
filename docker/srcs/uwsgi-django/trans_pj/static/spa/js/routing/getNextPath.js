// docker/srcs/uwsgi-django/trans_pj/static/spa/js/index.js

import { routeTable } from "./routeTable.js"
import { isUserLoggedIn, isUserEnable2FA } from "../utility/isUser.js"
import { getMatchedRoute } from "./getMatchedRoute.js"


const DEBUG = 0;

// Guestのリダイレクトを制御
//  top, home, game2d, signup, loginはそのまま表示
//  それ以外はloginに遷移
function getGuestRedirectPath(url) {
  const urlObject = new URL(url);
  const pathName = urlObject.pathname;
  let nextPath;

  if (pathName === routeTable['top'].path
      || pathName === routeTable['home'].path
      || pathName === routeTable['game2d'].path
      || pathName === routeTable['signup'].path
      || pathName === routeTable['login'].path
      || pathName === routeTable['veryfy2fa'].path
      || pathName === routeTable['oAuthLogin'].path) {
    // nextPath = url;
    nextPath = pathName;  // queryStringなどを排除しpathNameに整形
    if (DEBUG) { console.log('guest access to  : ' + nextPath); }
  } else {
    // loginを表示 & LoginEventListenerを設定
    nextPath = routeTable['login'].path;
    if (DEBUG) { console.log('guest redirect to: ' + nextPath); }
  }
  return nextPath;
}


// Userのリダイレクトを制御
//  login関係（signup, login, verify2fa, enable2fa) はtopに遷移
//  それ以外はそのまま表示
function getUserRedirectPath(url, isEnable2FA) {
  const urlObject = new URL(url);
  const pathName = urlObject.pathname;
  let nextPath;

  if (pathName === routeTable['signup'].path
      || pathName === routeTable['login'].path
      || pathName === routeTable['veryfy2fa'].path
      || (pathName === routeTable['enable2fa'].path && isEnable2FA
      || pathName === routeTable['oAuthLogin'].path)) {
    // topを表示
    nextPath = routeTable['top'].path;
    if (DEBUG) { console.log('user redirect to: ' + nextPath); }
  } else {
    // nextPath = url;
    nextPath = pathName;  // queryStringなどを排除しpathNameに整形
    if (DEBUG) { console.log('user access to  : ' + nextPath); }
  }
  return nextPath
}


// TOPを表示するURLであるか判定する
// TOP or Invalid URLの場合はTOPを表示
//  invalidの判定にgetSelectedRoute()を使用。renderView側にまとめた方が良さそう...
const isRenderTopPageUrl = async (url) => {
  const urlObject = new URL(url);
  const pathName = urlObject.pathname;
  const ret =  await getMatchedRoute(pathName) === routeTable['top'];
  if (DEBUG) { console.log(' isRenderTopPageUrl -> ' + ret); }
  return ret
}


// login userであれば/auth/への遷移を/app/に切り返る
export async function getNextPath(url) {
  if (DEBUG) { console.log('getNextPath: ' + url); }

  const isTopUrl = await isRenderTopPageUrl(url);
  if (isTopUrl) {
    if (DEBUG) { console.log(' invalid or top -> top'); }
    return routeTable['top'].path;
  }

  const isLoggedIn = await isUserLoggedIn();
  if (!isLoggedIn) {
    return getGuestRedirectPath(url);
  }
  // 2FA有効user && enable2faへの遷移 は/app/に切り替える
  const isEnable2FA = await isUserEnable2FA();

  let nextPath = getUserRedirectPath(url, isEnable2FA);

  // console.log(`DEBUG getLoggedInUserRedirectUrl`)
  // console.log(` url      :${url}`)
  // console.log(` pathName :${pathName}`)
  // console.log(` nextPath  :${nextPath}`)
  // alert(`[check console log]getLoggedInUserRedirectUrl`)
  return nextPath;
}
