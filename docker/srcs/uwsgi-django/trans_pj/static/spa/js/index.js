import { Routes } from ".//routing/routes.js";
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
  let tmp_path = window.location.pathname;
  document.body.addEventListener("click", (e) => {
    // ページ切替
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      tmp_path = e.target.href;
      navigateTo(tmp_path);
    }

    //多言語切替
    if (
      e.target.tagName === "INPUT" &&
      e.target.className === "change-language"
    ) {
      e.preventDefault();

      const lang_url = "/i18n/setlang/";
      const form = document.getElementById("lang_form");
      var formData = new FormData(form);
      const current_uri = getDisplayedURI(tmp_path);
      changingLanguage(lang_url, formData, current_uri);
    }
  });

  const uri = getDisplayedURI(tmp_path);
  navigateTo(uri);
  router();
});
