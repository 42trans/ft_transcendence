import Dashboard from "../views/Dashboard.js";
import Posts from "../views/Posts.js";
import PostView from "../views/PostView.js";
import Settings from "../views/Settings.js";
import Login from "../views/Login.js";
import Lang from "../views/Lang.js";
import Script from "../views/Script.js";
import Script2 from "../views/Script2.js";
import Index from "../views/Index.js";
import Pong from "../views/Pong.js";
import Accounts from "../views/Accounts.js";
import Admin from "../views/Admin.js";

export const Routes = [
  { path: "/", view: Dashboard },
  { path: "/home", view: Index },
  { path: "/pong", view: Pong },
  { path: "/accounts", view: Accounts },
  { path: "/admin", view: Admin },
  { path: "/posts", view: Posts },
  { path: "/posts/:id", view: PostView },
  { path: "/settings", view: Settings },
  { path: "/ja/settings", view: Settings },
  { path: "/login", view: Login },
  { path: "/lang", view: Lang },
  { path: "/script", view: Script },
  { path: "/script2", view: Script2 },
];
