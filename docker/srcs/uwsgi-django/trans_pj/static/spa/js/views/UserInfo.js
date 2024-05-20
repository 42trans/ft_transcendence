// UserInfo.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { executeScriptTab } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params
    this.setTitle("UserInfo");
  }

  async getHtml() {
    const nickname = this.params.nickname;
    const uri = `/accounts/info/${nickname}/`;
    console.log('UserInfo: uri: ' + uri)
    const data = await fetchData(uri);
    return data;
  }

  async executeScript() {
      executeScriptTab("/static/accounts/js/block-user.js");
      executeScriptTab("/static/accounts/js/unblock-user.js");
      executeScriptTab("/static/accounts/js/friend.js", true);
      executeScriptTab("/static/chat/js/test-system-message.js");
  }

}
