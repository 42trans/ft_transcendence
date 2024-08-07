// Friends.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Friend");
  }

  async getHtml() {
    const uri = "/accounts/friends/";
    const data = await fetchData(uri);
    return data;
  }

  async executeScript(spaElement) {
    // loadAndExecuteScript("/static/accounts/js/friend.js", true);
    const friendModule = await import("/static/accounts/js/friend.js");
    friendModule.fetchFriendList();
    friendModule.fetchFriendRequestList();
  }
}
