// Disable2FA.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { executeScriptTab } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Disable2FA");
  }

  async getHtml() {
    const uri = "/accounts/verify/disable_2fa/";
    const data = fetchData(uri);
    return data;
  }
  async executeScript() {
    executeScriptTab("/static/accounts/js/disable_2fa.js");

    // import("/static/accounts/js/disable_2fa.js")
    //     .then(module => {
    //       document.querySelector('button').addEventListener('click', module.disableToken)
    //     })
    //     .catch(error => console.error("Failed to load user profile scripts:", error));

  }
}
