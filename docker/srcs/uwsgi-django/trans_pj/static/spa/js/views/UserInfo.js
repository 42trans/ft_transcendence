// UserInfo.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript, setupEventListeners } from "../utility/script.js";


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
      await loadAndExecuteScript("/static/accounts/js/block-user.js");
      await loadAndExecuteScript("/static/accounts/js/unblock-user.js");
      // loadAndExecuteScript("/static/chat/js/test-system-message.js");// await loadAndExecuteScript("/static/accounts/js/friend.js", true);

      const friendModule = await import("/static/accounts/js/friend.js");
      friendModule.setupFriendRequestListEventListeners();
    }
}
