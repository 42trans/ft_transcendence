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
      executeScriptTab("/static/chat/js/test-system-message.js");
      // executeScriptTab("/static/accounts/js/friend.js");


      // `friend.js`を動的にインポートし、適切な要素にイベントリスナーを設定する
      import("/static/accounts/js/friend.js")
          .then(module => {
              // すべての友達リクエスト関連の要素にイベントを設定
              document.querySelectorAll('.sendFriendRequestButton').forEach(button => {
                  button.addEventListener('click', () => module.sendFriendRequest(button.dataset.userid));
              });
              document.querySelectorAll('.cancelFriendRequestButton').forEach(button => {
                  button.addEventListener('click', () => module.cancelFriendRequest(button.dataset.userid));
              });
              document.querySelectorAll('.acceptFriendRequestButton').forEach(button => {
                  button.addEventListener('click', () => module.acceptFriendRequest(button.dataset.userid));
              });
              document.querySelectorAll('.rejectFriendRequestButton').forEach(button => {
                  button.addEventListener('click', () => module.rejectFriendRequest(button.dataset.userid));
              });
              document.querySelectorAll('.deleteFriendButton').forEach(button => {
                  button.addEventListener('click', () => module.deleteFriend(button.dataset.userid));
              });
      }).catch(error => console.error("Failed to load user profile scripts:", error));



      // `friend.js`を動的にインポートし、適切な要素にイベントリスナーを設定する
      import("/static/accounts/js/disable_2fa.js")
          .then(module => {
            // すべての友達リクエスト関連の要素にイベントを設定
            document.querySelectorAll('.disable2FAButton').forEach(button => {
              button.addEventListener('click', () => module.disable2FA());
            });
          }).catch(error => console.error("Failed to load user profile scripts:", error));

      // import("/static/accounts/js/disable_2fa.js")
      //     .then(module => {
      //       document.querySelector('button').addEventListener('click', module.disable2FA)
      //     })
      //     .catch(error => console.error("Failed to load user profile scripts:", error));


  }
}
