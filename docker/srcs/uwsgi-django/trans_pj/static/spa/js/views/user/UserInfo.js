// UserInfo.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
    constructor(params) {
        super(params);
        this.params = params
        this.setTitle("UserInfo");
    }

    async getHtml() {
        const userId = this.params.userId;
        const uri = `/accounts/info/${userId}/`;
        const data = await fetchData(uri);
        return data;
    }

    async executeScript(spaElement) {
      const blockUserModule = await import("/static/accounts/js/block-user.js");
      blockUserModule.setupBlockUserEventListener();

      const unblockUserModule = await import("/static/accounts/js/unblock-user.js");
      unblockUserModule.setupUnBlockUserEventListener();

      const friendModule = await import("/static/accounts/js/friend.js");
      friendModule.setupFriendRequestListEventListeners();
      friendModule.setupDeleteFriendEventListener();
    }
}
