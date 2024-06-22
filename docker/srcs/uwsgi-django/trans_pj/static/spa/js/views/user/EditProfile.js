// UserProfile.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("EditProfile");
  }

  async getHtml() {
    // const uri = getUrl("/accounts/user/");
    const uri = "/accounts/edit/";
    const data = await fetchData(uri);
    return data;
  }

  async executeScript(spaElement) {
    // loadAndExecuteScript("/static/accounts/js/edit_profile.js", true);

    const loginModule = await import("/static/accounts/js/edit_profile.js");
    loginModule.setupUpdateNicknameEventListener();
    loginModule.setupUpdatePasswordEventListener();
  }

}
