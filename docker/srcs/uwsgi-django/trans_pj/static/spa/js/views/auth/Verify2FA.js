// Verify2FA.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


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

  async executeScript(spaElement) {
    const verify2FaModule = await import("/static/accounts/js/verify_2fa.js");
    verify2FaModule.setupVerify2FaEventListener();
  }

  async dispose() {
    const signupModule = await import("/static/accounts/js/verify_2fa.js");
    signupModule.removeVerify2FaEventListener();
  }

}
