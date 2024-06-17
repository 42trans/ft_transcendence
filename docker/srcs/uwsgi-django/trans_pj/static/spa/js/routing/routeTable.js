// import Dashboard    from "../views/Dashboard.js";
import Home         from "../views/Home.js";
import PongTop      from "../views/pong/PongTop.js";

import FreePlay     from "../views/pong/FreePlay.js";
import Tournament   from "../views/pong/Tournament.js";
import Game2D       from "../views/pong/Game2D.js";
import Game3D       from "../views/pong/Game3D.js";
import GameMatch    from "../views/pong/GameMatch.js";

import GameHistory  from "../views/user/GameHistory.js";

import UserProfile  from "../views/user/UserProfile.js";
import UserInfo     from "../views/user/UserInfo.js";
import Friends      from "../views/user/Friends.js";
import DMSessions   from "../views/chat/DMSessions.js";
import DMwithUser   from "../views/chat/DMwithUser.js";

import EditProfile  from "../views/user/EditProfile.js";
import ChangeAvatar from "../views/user/ChangeAvatar.js";
import Enable2FA    from "../views/auth/Enable2FA.js";
import Verify2FA    from "../views/auth/Verify2FA.js";

import Signup       from "../views/auth/Signup.js";
import Login        from "../views/auth/Login.js";
// import Logout       from "../views/auth/Logout.js";

// import Posts from "../views/Posts.js";
// import PostView from "../views/PostView.js";
// import Settings from "../views/Settings.js";
// import Accounts from "../views/Accounts.js";
// import Admin from "../views/Admin.js";

// import Lang from "../views/Lang.js";
// import Script1 from "../views/Script1.js";
// import Script2 from "../views/Script2.js";


export const routeTable = {
  // { path: "/app/",      view: Dashboard },
  home          : { path: "/app/home/", view: Home },
  top           : { path: "/app/",      view: PongTop },

  // game
  tournament    : { path: "/app/game/tournament/",   view: Tournament },
  game2d        : { path: "/app/game/game-2d/",      view: Game2D },
  game3d        : { path: "/app/game/game-3d/",      view: Game3D },
  gameMatch     : { path: "/app/game/match/:matchId/",  view: GameMatch },

  gameHistory   : { path: "/app/user/game-history/", view: GameHistory },

  // user
  userProfile   : { path: "/app/user/profile/",               view: UserProfile },  // private profile
  userInfo      : { path: "/app/user/info/:nickname/",        view: UserInfo },     // public profile
  userInfoBase  : { path: "/app/user/info/",                  view: UserInfo },

  friends       : { path: "/app/user/friends/",               view: Friends },
  dmSessions    : { path: "/app/dm/",                         view: DMSessions },
  dmWithUser    : { path: "/app/dm/:nickname/",               view: DMwithUser },
  dmWithUserBase: { path: "/app/dm/",                         view: DMwithUser },

  editProfile   : { path: "/app/user/profile/edit/",          view: EditProfile },
  changeAvatar  : { path: "/app/user/profile/change-avatar/", view: ChangeAvatar },

  // auth
  enable2fa     : { path: "/app/auth/enable-2fa/",   view: Enable2FA },
  veryfy2fa     : { path: "/app/auth/verify-2fa/",   view: Verify2FA },

  signup        : { path: "/app/auth/signup/",       view: Signup },
  login         : { path: "/app/auth/login/",        view: Login },
  oAuthLogin    : { path: "/accounts/oauth-ft/",     view: Login },  // viewは関係なし

  // 開発用テストリンク
  // lang    : { path: "/lang/",         view: Lang },
  // script1 : { path: "/script1/",      view: Script1 },  // SPA用 ≠ django urls
  // script2 : { path: "/script2/",      view: Script2 },
};
