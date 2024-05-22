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
      console.log('executeScript: Loading scripts...');

      await loadAndExecuteScript("/static/accounts/js/block-user.js");
      await loadAndExecuteScript("/static/accounts/js/unblock-user.js");
      // loadAndExecuteScript("/static/chat/js/test-system-message.js");// await loadAndExecuteScript("/static/accounts/js/friend.js", true);

      console.log('executeScript: Scripts loaded, setting up event listeners...');


      // スクリプトのロード完了後にイベントリスナーを設定
      console.log('executeScript: Event listeners setup complete.');

      // イベントリスナーの設定　関数化すると動かない？
      // await setupEventListeners(
      //     "/static/accounts/js/friend.js",
      //     "setupFriendEventListeners"
      // );
      // try {
      //     await setupEventListeners("/static/accounts/js/friend.js", "setupFriendEventListeners");
      // } catch (error) {
      //     console.error('Error in setting up event listeners:', error);
      // }

      const friendModule = await import("/static/accounts/js/friend.js");
      friendModule.setupFriendEventListeners();

      console.log('executeScript: Event listeners setup complete.');

    }
}
