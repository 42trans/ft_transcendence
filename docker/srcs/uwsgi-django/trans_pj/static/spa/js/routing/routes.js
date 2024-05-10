import Dashboard from "../views/Dashboard.js";
import Posts from "../views/Posts.js";
import PostView from "../views/PostView.js";
import Settings from "../views/Settings.js";
import Test from "../views/Test.js";
import Lang from "../views/Lang.js";
import Spa from "../views/Spa.js";
import Index from "../views/Index.js";

export const Routes = [
  { path: "/", view: Dashboard },
  { path: "/home", view: Index },
  { path: "/top", view: Dashboard },
  { path: "/posts", view: Posts },
  { path: "/posts/:id", view: PostView },
  { path: "/settings", view: Settings },
  { path: "/ja/settings", view: Settings },
  { path: "/test", view: Test },
  { path: "/lang", view: Lang },
  { path: "/spa", view: Spa },
];
