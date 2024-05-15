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
  let currentPath = window.location.pathname;
  navigateTo(currentPath);  // URLに基づいて適切なルートをセットアップ
  router();  // コンテンツをロードして表示

  document.body.addEventListener("click", (event) => {
    // ページ切替
    if (event.target.matches("[data-link]")) {
      event.preventDefault();
      currentPath = event.target.href;
      navigateTo(currentPath);
    }

    //多言語切替
    if (
      event.target.tagName === "INPUT" &&
      event.target.className === "change-language"
    ) {
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
