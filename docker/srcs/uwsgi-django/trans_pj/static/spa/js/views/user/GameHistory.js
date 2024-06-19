// GameHistory.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("GameHistory");
  }

  async getHtml() {
    const uri = "/accounts/history/";
    const data = await fetchData(uri);
    return data;
  }

  async executeScript(spaElement) {
    // loadAndExecuteScript("/static/accounts/js/history.js");
  }

}
