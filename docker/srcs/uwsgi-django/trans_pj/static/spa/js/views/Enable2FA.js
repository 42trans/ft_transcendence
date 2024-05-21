// Enable2FA.js

import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Enable2FA");
  }

  async getHtml() {
    const uri = "/accounts/verify/enable_2fa/";
    const data = fetchData(uri);
    return data;
  }

  async executeScript() {
    loadAndExecuteScript("/static/accounts/js/enable_2fa.js", true);

    import("/static/accounts/js/enable_2fa.js")
        .then(module => {
          module.fetchEnable2FA();
　        document.querySelector('button').addEventListener('click', module.verifyToken)
        })
        .catch(error => console.error("Failed to load user profile scripts:", error));
  }

}
