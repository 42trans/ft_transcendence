// DMSessions.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("DMSessions");
  }

  async getHtml() {
    const uri = "/chat/dm-sessions/";
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript(spaElement) {
    const dmSessionModule = await import("/static/chat/js/dm-sessions.js");
    dmSessionModule.fetchDMList();
    dmSessionModule.startDMwithUser();
    // トーナメント招待機能
    dmSessionModule.tournamentInvite();

  }
}
