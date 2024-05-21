// Login.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Login");
  }

  async getHtml() {
    const uri = "/accounts/login/";
    const data = fetchData(uri);
    return data;
  }
  async executeScript() {
    loadAndExecuteScript("/static/accounts/js/login.js");
  }
}
