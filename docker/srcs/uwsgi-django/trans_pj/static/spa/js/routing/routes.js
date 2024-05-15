import Dashboard    from "../views/Dashboard.js";
import Index        from "../views/Index.js";
import Pong         from "../views/Pong.js";

import FreePlay     from "../views/Pong.js";
import Tournament   from "../views/Pong.js";
import Game1vs1     from "../views/Pong.js";

import GameHistory  from "../views/Pong.js";

import UserProfile  from "../views/Pong.js";
import Friend       from "../views/Pong.js";
import DM           from "../views/Pong.js";

import Login        from "../views/Login.js";
import Signup       from "../views/Signup.js";

// import Posts from "../views/Posts.js";
// import PostView from "../views/PostView.js";
// import Settings from "../views/Settings.js";
// import Accounts from "../views/Accounts.js";
// import Admin from "../views/Admin.js";

import Lang from "../views/Lang.js";
import Script from "../views/Script.js";
import Script2 from "../views/Script2.js";


export const Routes = [
  { path: "/",            view: Dashboard },
  { path: "/home",        view: Index },
  { path: "/pong",        view: Pong },

  { path: "/pong",        view: FreePlay },
  { path: "/tournament",  view: Tournament },
  { path: "/pong",        view: Game1vs1 },

  { path: "/history",     view: GameHistory },

  { path: "/user",        view: UserProfile },
  { path: "/friend",      view: Friend },
  { path: "/dm",          view: DM },

  { path: "/login",       view: Login },
  { path: "/signup",      view: Signup },

  // { path: "/accounts", view: Accounts },
  // { path: "/admin", view: Admin },
  // { path: "/posts", view: Posts },
  // { path: "/posts/:id", view: PostView },
  // { path: "/settings", view: Settings },
  // { path: "/ja/settings", view: Settings },
  { path: "/lang", view: Lang },
  { path: "/script", view: Script },
  { path: "/script2", view: Script2 },
];
