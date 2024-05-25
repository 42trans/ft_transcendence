import Dashboard    from "../views/Dashboard.js";
import Home         from "../views/Home.js";
import PongTop      from "../views/pong/PongTop.js";

import FreePlay     from "../views/pong/FreePlay.js";
import Tournament   from "../views/pong/Tournament.js";
import Game1vs1     from "../views/pong/Game1vs1.js";

import GameHistory  from "../views/user/GameHistory.js";

import UserProfile  from "../views/user/UserProfile.js";
import UserInfo     from "../views/user/UserInfo.js";
import Friends      from "../views/user/Friends.js";
import DMSessions   from "../views/chat/DMSessions.js";
import DMwithUser   from "../views/chat/DMwithUser.js";

import EditProfile  from "../views/user/EditProfile.js";
import ChangeAvatar from "../views/user/ChangeAvatar.js";
import Enable2FA    from "../views/auth/Enable2FA.js";
import Disable2FA   from "../views/Disable2FA.js";
import Verify2FA    from "../views/auth/Verify2FA.js";

import Signup       from "../views/auth/Signup.js";
import Login        from "../views/auth/Login.js";
// import Logout       from "../views/auth/Logout.js";

// import Posts from "../views/Posts.js";
// import PostView from "../views/PostView.js";
// import Settings from "../views/Settings.js";
// import Accounts from "../views/Accounts.js";
// import Admin from "../views/Admin.js";

import Lang from "../views/Lang.js";
import Script1 from "../views/Script1.js";
import Script2 from "../views/Script2.js";


export const routeTable = [
  { path: "/",              view: Dashboard },
  { path: "/home/",         view: Home },
  { path: "/game/",         view: PongTop },

  // game
  { path: "/free-play/",    view: FreePlay },
  { path: "/tournament/",   view: Tournament },
  { path: "/game-1vs1/",    view: Game1vs1 },

  { path: "/game-history/", view: GameHistory },

  // user
  { path: "/user-profile/",         view: UserProfile },  // private profile
  { path: "/user-info/:nickname/",  view: UserInfo },     // public profile
  { path: "/user-friends/",         view: Friends },
  { path: "/dm/",                   view: DMSessions },
  { path: "/dm-with/:nickname/",    view: DMwithUser },

  { path: "/edit-profile/",         view: EditProfile },
  { path: "/change-avatar/",        view: ChangeAvatar },

  // auth
  { path: "/enable-2fa/",           view: Enable2FA },
  { path: "/verify-2fa/",           view: Verify2FA },

  { path: "/signup/",       view: Signup },
  { path: "/login/",        view: Login },

  // 開発用テストリンク
  { path: "/lang/",         view: Lang },
  { path: "/script1/",      view: Script1 },  // SPA用 ≠ django urls
  { path: "/script2/",      view: Script2 },
];
