import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

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

  async executeScript() {
    console.log('executeScript: Loading scripts...');
    // await loadAndExecuteScript("/static/accounts/js/online-status.js", true);

    console.log('executeScript: Scripts loaded, setting up event listeners...');

    const friendModule = await import("/static/accounts/js/friend.js");
    friendModule.setupFriendEventListeners();
    friendModule.fetchFriendList();
    friendModule.fetchFriendRequestList();

    // const onlineStatusModule = await import("/static/accounts/js/online-status.js");
    // onlineStatusModule.setupDeleteFriendEventListeners();

    console.log('executeScript: Event listeners setup complete.');
  }
}
