import Dashboard    from "../views/Dashboard.js";
import Home        from "../views/Home.js";
import Pong         from "../views/Pong.js";

import FreePlay     from "../views/Pong.js";
import Tournament   from "../views/Tournament.js";
import Game1vs1     from "../views/Game1vs1.js";

import GameHistory  from "../views/UserProfile.js";

import UserProfile  from "../views/UserProfile.js";
import UserInfo     from "../views/UserInfo.js";
import Friend       from "../views/Friend.js";
import DMSessions   from "../views/DMSessions.js";
import DMwithUser   from "../views/DMwithUser.js";

import EditProfile  from "../views/EditProfile.js";
import ChangeAvatar from "../views/ChangeAvatar.js";
import Enable2FA    from "../views/Enable2FA.js";
import Disable2FA   from "../views/Disable2FA.js";
import Verify2FA    from "../views/Verify2FA.js";

import Signup       from "../views/Signup.js";
import Login        from "../views/Login.js";
import Logout       from "../views/Logout.js";

// import Posts from "../views/Posts.js";
// import PostView from "../views/PostView.js";
// import Settings from "../views/Settings.js";
// import Accounts from "../views/Accounts.js";
// import Admin from "../views/Admin.js";

import Lang from "../views/Lang.js";
import Script1 from "../views/Script1.js";
import Script2 from "../views/Script2.js";


export const Routes = [
  { path: "/",              view: Dashboard },
  { path: "/home/",         view: Home },
  { path: "/game/",         view: Pong },

  { path: "/game/",         view: FreePlay },
  { path: "/tournament/",   view: Tournament },
  { path: "/game-1vs1/",    view: Game1vs1 },

  { path: "/game-history/", view: GameHistory },

  { path: "/user-profile/",         view: UserProfile },  // private profile
  { path: "/user-info/:nickname/",  view: UserInfo },     // public profile
  { path: "/user-friend/",          view: Friend },
  { path: "/dm/",                   view: DMSessions },
  { path: "/dm-with/:nickname/",    view: DMwithUser },

  { path: "/edit-profile/",         view: EditProfile },
  { path: "/change-avatar/",        view: ChangeAvatar },  // todo: edit-profileに統合
  { path: "/enable-2fa/",           view: Enable2FA },
  { path: "/verify-2fa/",           view: Verify2FA },

  { path: "/signup/",       view: Signup },
  { path: "/login/",        view: Login },
  { path: "/logout/",       view: Logout },

  // { path: "/accounts", view: Accounts },
  // { path: "/admin", view: Admin },
  // { path: "/posts", view: Posts },
  // { path: "/posts/:id", view: PostView },
  // { path: "/settings", view: Settings },
  // { path: "/ja/settings", view: Settings },
  { path: "/lang/",         view: Lang },
  { path: "/script1/",      view: Script1 },  // SPA用 ≠ django urls
  { path: "/script2/",      view: Script2 },
];
