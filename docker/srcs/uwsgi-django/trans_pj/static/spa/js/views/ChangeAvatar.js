// UserProfile.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { executeScriptTab } from "../utility/script.js";

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

  async executeScript() {
    executeScriptTab("/static/accounts/js/upload-avatar.js");
  }

}
