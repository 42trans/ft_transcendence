import { Routes } from "./routes.js";
import { getUrl } from "../utility/url.js";
import { isLogined } from "../utility/user.js";

const ROOT_INDEX = 0;
const LOGIN_PATH = '/login/';


export const navigateTo = (url) => {
  console.log("history pushState:" + url);
  history.pushState(null, null, url);
  router();
};


const getSelectedRoute = (currentPath, routes, isLogined) => {
  // routes配列から、現在のパスネームにマッチするルートを見つける
  const matchedRoute = routes.find((route) => route.path === currentPath);

  if (matchedRoute) {
    // マッチするルートが見つかった場合は、そのルートを選択
    return matchedRoute;
  } else if (isLogined) {
    // マッチするルートが見つからず、ログインしている場合は、デフォルトのルートを選択
    return routes[ROOT_INDEX];
  } else {
    // マッチするルートが見つからず、ログインしていない場合は、ログインページのルートを選択
    return routes.find((route) => route.path === LOGIN_PATH);
  }
};


export const router = async () => {
  const currentPath = location.pathname;

  // 選択されたルートを取得
  const selectedRoute = getSelectedRoute(currentPath, Routes, isLogined());

  // 選択されたルートに対応するビューを描画
  const view = new selectedRoute.view();
  const html = await view.getHtml();
  document.querySelector("#app").innerHTML = html;

  // ビューに関連するスクリプトを実行
  try {
    view.executeScript();
  } catch (error) {
    console.error(`Error executing view script: ${error}`);
  }
};
