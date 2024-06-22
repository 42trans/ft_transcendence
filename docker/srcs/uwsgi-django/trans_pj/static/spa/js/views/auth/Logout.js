// Logout.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Logout");
  }

  async getHtml() {
    const uri = "/accounts/logout/";
    const data = fetchData(uri);
    return data;
  }

  async executeScript(spaElement) {
    const logoutModule = await import("/static/accounts/js/logout.js");
    logoutModule.setupLogoutEventListener();
  }
}
