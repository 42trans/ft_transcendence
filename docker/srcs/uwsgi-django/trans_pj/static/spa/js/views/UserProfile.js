// UserProfile.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("UserProfile");
  }

  async getHtml() {
    // const uri = getUrl("/accounts/user/");
    const uri = "/accounts/user/";
    const data = await fetchData(uri);
    return data;
  }

  async executeScript() {
    // executeScriptTab("/static/accounts/js/friend.js");
    // executeScriptTab("/static/accounts/js/online-status.js", true);

    import("/static/accounts/js/userProfile.js")
        .then(module => {
          module.fetchUserProfile();
          module.fetchFriendList();
          module.fetchFriendRequestList();
        })
        .catch(error => console.error("Failed to load user profile scripts:", error));

    import("/static/accounts/js/disable_2fa.js")
      .then(module => {
          document.querySelector('button').addEventListener('click', module.disableToken)
      })
      .catch(error => console.error("Failed to load user profile scripts:", error));

  }

}
