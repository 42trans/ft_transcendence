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
  path !== undefined ? path : "";
  //if (path === undefined) {
  //return getUrl("");
  //}
  return getUrl(path);
};

document.addEventListener("DOMContentLoaded", () => {
  // フォーム内の全てのinput要素を取得
  const inputs = document.querySelectorAll("input");

  // 各input要素にクリックイベントを追加
  inputs.forEach((input) => {
    input.addEventListener("click", function (e) {
      e.preventDefault();

      const lang_url = "/i18n/setlang/";
      const form = document.getElementById("lang_form");
      var formData = new FormData(form);
      const current_uri = getDisplayedURI(tmp_path);
      changingLanguage(lang_url, formData, current_uri);
    });
  });

  let tmp_path = window.location.pathname;
  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
      e.preventDefault();
      tmp_path = e.target.href;
      console.log("click tmp_path:" + tmp_path);
      navigateTo(tmp_path);
    }

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

  console.log("navi uri No.1:" + tmp_path);
  const uri = getDisplayedURI(tmp_path);
  console.log("navi uri No.2:" + tmp_path);
  navigateTo(uri);
  router();
});
