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
    await loadAndExecuteScript(spaElement, "/static/accounts/js/history.js", true);
    if (window.MatchHistory) {
      window.MatchHistory.getInstance().loadMatchHistory();
    }
  }

  async dispose() {
    if (window.MatchHistory) {
      window.MatchHistory.dispose();
      window.MatchHistory = null;
    }
  }

}
