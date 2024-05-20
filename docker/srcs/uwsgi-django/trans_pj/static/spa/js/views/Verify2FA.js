// Verify2FA.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { executeScriptTab } from "../utility/script.js";

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
    executeScriptTab("/static/accounts/js/verify_2fa.js");
  }
}
