// index.js

import { Routes } from "./routing/routes.js";
import { DataType } from "./const/type.js";
import sendPost from "./utility/post.js";
import { navigateTo, router } from "./routing/routing.js";
import { changingLanguage } from "./utility/lang.js";
import { getUrl } from "./utility/url.js";

window.addEventListener("popstate", router);

const getDisplayedURI = (pathname) => {
  const splits = pathname.split("/").filter((uri) => uri !== "");
  let path = splits.find(
    (str) => Routes.findIndex((path) => path.path.replace("/", "") === str) >= 0
  );
  path = path === undefined ? "" : path;
  return getUrl(path);
};

document.addEventListener("DOMContentLoaded", () => {
  console.log(`index.js eventListener: 1`)
  let currentPath = window.location.pathname;
  console.log(`index.js eventListener: 2: currentPath: ${currentPath}`);
  navigateTo(currentPath);  // URLに基づいて適切なルートをセットアップ
  router();  // コンテンツをロードして表示

  // リロード時の処理を追加
  window.addEventListener("load", () => {
    console.log(`index.js load: ${currentPath}`);
    currentPath = window.location.pathname;
    navigateTo(currentPath);
    router();
  });

  document.body.addEventListener("click", (event) => {
    // ページ切替
    // if (event.target.matches("[data-link]")) {
    //   event.preventDefault();
    //   currentPath = event.target.href;
    //   navigateTo(currentPath);
    // }
    // if (event.target.matches("[data-link]")) {
    //   event.preventDefault();
    //   let url = event.target.href;
    //   // i18n prefixを削除
    //   url = url.replace(/^\/[a-z]{2}\//, "/");
    //   currentPath = url;
    //   navigateTo(url);
    // }
    if (event.target.matches("[data-link]")) {
      event.preventDefault();
      let url = event.target.href;
      const urlObject = new URL(url, window.location.origin);
      // i18n prefixを削除
      const cleanedPath = urlObject.pathname.replace(/^\/[a-z]{2}\//, "/");
      const cleanedUrl = `${window.location.origin}${cleanedPath}${urlObject.search}${urlObject.hash}`;
      currentPath = cleanedUrl;
      console.log(`click: url: ${url}`);
      console.log(`click: url: cleanedPath: ${cleanedPath}`);
      console.log(`click: url: cleanedUrl: ${cleanedUrl}`);

      navigateTo(cleanedUrl);
    }

    //多言語切替
    if (event.target.tagName === "INPUT"
        && event.target.className === "change-language") {
      event.preventDefault();

      const lang_url = "/i18n/setlang/";
      const form = document.getElementById("lang_form");
      var formData = new FormData(form);
      const current_uri = getDisplayedURI(currentPath);
      changingLanguage(lang_url, formData, current_uri);
    }
  });

  const uri = getDisplayedURI(currentPath);
  navigateTo(uri);
  router();
});
