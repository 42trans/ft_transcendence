// Verify2FA.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Verify2FA");
  }

  async getHtml() {
    const uri = "/accounts/verify/verify_2fa/";
    const data = fetchData(uri);
    return data;
  }
  async executeScript() {
    loadAndExecuteScript("/static/accounts/js/verify_2fa.js", true);

  }
}
