import { Routes } from "./routes.js";
import { getUrl } from "../utility/url.js";
import { isLogined } from "../utility/user.js";

const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map(
    (result) => result[1]
  );
  if (values.length > 0) {
    alert(values);
  }
  const url = match.result.toString();

  return Object.fromEntries(
    keys.map((key, i) => {
      alert(key);
      alert(i);
      return [key, values[i]];
    })
  );
};

export const navigateTo = (url) => {
  console.log("history pushState:" + url);
  history.pushState(null, null, url);
  router();
};

export const router = async () => {
  const potentialMatches = Routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let match = potentialMatches.find(
    (potentialMatch) => potentialMatch.result !== null
  );

  if (!match) {
    match = {
      route: Routes[0],
      result: [getUrl(Routes[0].path)],
    };
  }

  if (isLogined() == false) {
    match = {
      route: Routes[0],
      result: [getUrl(Routes[0].path)],
    };
  }
  const view = new match.route.view(getParams(match));

  const html = await view.getHtml();
  document.querySelector("#app").innerHTML = html;

  try {
    view.executeScript();
  } catch (error) {
    //console.error(error);
  }
};
