// UserProfile.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { executeScriptTab } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("UserProfile");
  }

  async getHtml() {
    const uri = getUrl("/accounts/user/");
    const data = await fetchData(uri);
    return data;
  }

  async executeScript() {
    executeScriptTab("../static/accounts/js/userProfile.js");
    executeScriptTab("../static/accounts/js/logout.js");
    executeScriptTab("../static/accounts/js/friend.js");
    executeScriptTab("../static/accounts/js/online-status.js");
  }

}