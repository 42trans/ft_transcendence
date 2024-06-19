// Signup.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Signup");
  }

  async getHtml() {
    const uri = "/accounts/signup/";
    const data = fetchData(uri);
    return data;
  }

  async executeScript(spaElement) {
    const signupModule = await import("/static/accounts/js/signup.js");
    signupModule.setupSignupEventListener();
  }

  async dispose() {
    const signupModule = await import("/static/accounts/js/signup.js");
    signupModule.removeSignupEventListener();
  }
}
