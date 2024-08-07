// UserProfile.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("ChangeAvatar");
  }

  async getHtml() {
    // const uri = getUrl("/accounts/user/");
    const uri = "/accounts/change-avatar/";
    const data = await fetchData(uri);
    return data;
  }

  async executeScript(spaElement) {
    const uploadAvatarModule = await import("/static/accounts/js/upload-avatar.js");
    uploadAvatarModule.setupUploadAvatarEventListener();

  }

}
