import { routeTable } from "./routeTable.js";
import { getUrl } from "../utility/url.js";
import { setOnlineStatus } from "/static/accounts/js/setOnlineStatus.js";

const DEBUG_DETAIL = 0;

// touteTable.jsの記述について
// game3d: { path: "/app/game/game-3d/", view: Game3D }は、/app/game/game-3d/というパスに対してGame3Dという「クラス」を対応

// ページ遷移が発生した場合のメソッド
export const switchPage = (targetPath) => {
        if (DEBUG_DETAIL) { console.log('switchPage(): start');  }

  const targetUrl = new URL(targetPath, window.location.origin);
  const targetPathName = targetUrl.pathname;

  history.pushState(null, null, targetPathName );
  // currentViewにdisposeメソッドが存在するかどうかをチェック。オペランドの型がfunctionなら関数
  // if (currentView && typeof currentView.dispose === "function") {
  //         if (DEBUG_DETAIL) { console.log('switchPage(): dispose', currentView);  } 
  //   currentView.dispose();
  // }
  renderView(targetPathName).then(() => {
    window.dispatchEvent(new CustomEvent('switchPageResetState'));
    // setOnlineStatus();
  });
};

// export const switchPage = (targePath) => {
//   // const currentUrl = new URL(window.location.href);
//   const { targetPathName, targetQueryString } = getPathAndQueryString(targePath);

//   // console.log('path:', targetPathName);
//   // console.log('queryString:', targetQueryString);

//   // query string込みでURLをpush
//   history.pushState(null, null, targetPathName + targetQueryString);

//   // DEBUG console log
//   // console.log(`switchPage`)
//   // console.log(` currentUrl        :${currentUrl}`)
//   // console.log(` targetPathName    :${targetPathName}`)
//   // console.log(` targetQueryString :${targetQueryString}`)
//   // console.log(` currentPath       :${window.location.pathname}`)
//   // alert(`[debug] switchPage consolelog確認用`)

//   renderView(targetPathName).then(() => {
//     // resetState イベントを発行
//     window.dispatchEvent(new CustomEvent('switchPageResetState'));
//   });
// };


const getSelectedRoute = (currentPath, routeTable) => {
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
  } else {
    // routeTableに存在しないpathの場合、Guest, Userともにtopを表示
    // todo: URLとinnerHTMLが乖離 -> URLも/app/に切り替えるべきか？
    return routeTable['top'];
  }
};


async function getView(path) {
  // 選択されたルートを取得
  const selectedRoute = getSelectedRoute(path, routeTable);
  // console.log("renderView: selectedRoute.path: " + selectedRoute.path)

  // 選択されたルートに対応するビューをインスタンス化して、paramsを渡す
  const url_params = selectedRoute.params;
  // console.log("renderView: params: " + JSON.stringify(url_params));
  const view = new selectedRoute.view(url_params);
  return view
}

let currentView = null;
export const renderView = async (path) => {
  if (currentView && typeof currentView.dispose === "function") {
        if (DEBUG_DETAIL) { console.log('renderView(): currentView.dispose(): currentView', currentView);  } 
    currentView.dispose();
  }
  const selectedRoute = getSelectedRoute(path, routeTable);
  const view = new selectedRoute.view(selectedRoute.params);
  currentView = view;
  const htmlSrc = await view.getHtml();
        if (DEBUG_DETAIL) { console.log('renderView():htmlSrc', htmlSrc); }
  document.querySelector("#spa").innerHTML = htmlSrc;
  await view.executeScript();
        if (DEBUG_DETAIL) { console.log('renderView(): currentView', currentView); }
        if (DEBUG_DETAIL) { console.log('renderView(): selectedRoute.params', selectedRoute.params); }

  setOnlineStatus();
};

// export const renderView = async (path) => {
//   // console.log("    renderView 1: path: " + path)
//   const view = await getView(path)

//   // HTMLの描画 <div id="app">
//   const htmlSrc = await view.getHtml();
//   document.querySelector("#spa").innerHTML = htmlSrc;
//   // console.log("    renderView 2")

//   // スクリプトの読み込みと実行
//   await view.executeScript();
//   // console.log("    renderView 3")
// };
