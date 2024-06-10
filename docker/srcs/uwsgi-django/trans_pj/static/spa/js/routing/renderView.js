import { routeTable } from "./routeTable.js";
import { getUrl } from "../utility/url.js";
import { isLogined } from "../utility/user.js";


const getPathAndQueryString = (targetPath) => {
  const targetUrl = new URL(targetPath, window.location.origin);
  const targetPathName = targetUrl.pathname;
  let targetQueryString = targetUrl.search;

  // query stringのnextの要素がpathNameと一致している場合、query stringを空文字列に置き換える
  const params = new URLSearchParams(targetQueryString);
  const nextParam = params.get('next');
  if (nextParam === targetPathName) {
    targetQueryString = '';
  }
  return { targetPathName, targetQueryString };
};


export const switchPage = (targePath) => {
  // const currentUrl = new URL(window.location.href);
  const { targetPathName, targetQueryString } = getPathAndQueryString(targePath);

  // console.log('path:', targetPathName);
  // console.log('queryString:', targetQueryString);

  // query string込みでURLをpush
  history.pushState(null, null, targetPathName + targetQueryString);

  // DEBUG console log
  // console.log(`switchPage`)
  // console.log(` currentUrl        :${currentUrl}`)
  // console.log(` targetPathName    :${targetPathName}`)
  // console.log(` targetQueryString :${targetQueryString}`)
  // console.log(` currentPath       :${window.location.pathname}`)
  // alert(`[debug] switchPage consolelog確認用`)

  renderView(targetPathName).then(() => {
    // resetState イベントを発行
    window.dispatchEvent(new CustomEvent('switchPageResetState'));
  });
};


const getSelectedRoute = (currentPath, routeTable, isLogined) => {
  let params = {};  // URLパラメータを格納するオブジェクト

  // パスパラメータを含む可能性があるルートを評価
  const matchedRoute = Object.values(routeTable).find(route => {
    const routeParts = route.path.split('/').filter(part => part);
    const currentPathParts = currentPath.split('/').filter(part => part);

    if (routeParts.length !== currentPathParts.length) {
      return false;
    }

    // パスの各部分を比較
    return routeParts.every((part, index) => {
      if (part.startsWith(':')) {
        // パラメータのキーを抽出（例: :nickname -> nickname）
        const paramName = part.slice(1);
        params[paramName] = currentPathParts[index];  // パラメータを格納
        return true;
      }
      return part === currentPathParts[index];
    });
  });

  if (matchedRoute) {
    matchedRoute.params = params;
    matchedRoute.queryParams = new URLSearchParams(window.location.search);
    return matchedRoute;
  } else if (isLogined) {
    return routeTable['home'];
  } else {
    return routeTable['login']
  }
};


function getView(path) {
  // 選択されたルートを取得
  const selectedRoute = getSelectedRoute(path, routeTable, isLogined());
  // console.log("renderView: selectedRoute.path: " + selectedRoute.path)

  // 選択されたルートに対応するビューをインスタンス化して、paramsを渡す
  const url_params = selectedRoute.params;
  // console.log("renderView: params: " + JSON.stringify(url_params));
  const view = new selectedRoute.view(url_params);
  return view
}


export const renderView = async (path) => {
  // console.log("    renderView 1: path: " + path)
  const view = getView(path)

  // HTMLの描画 <div id="app">
  const htmlSrc = await view.getHtml();
  document.querySelector("#spa").innerHTML = htmlSrc;
  // console.log("    renderView 2")

  // スクリプトの読み込みと実行
  await view.executeScript();
  // console.log("    renderView 3")
};
