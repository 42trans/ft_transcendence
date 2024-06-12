// docker/srcs/uwsgi-django/trans_pj/static/spa/js/views/pong/GameMatch.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { getUrl } from "../../utility/url.js";
import { loadAndExecuteScript } from "../../utility/script.js";

const DEBUG_FLOW = 1;

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params
    this.setTitle("GameMatch");
  }

  async getHtml() {
    const matchId = this.params.matchId;
    const uri = `/pong/play/${matchId}`;
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript() {
    loadAndExecuteScript("/static/pong/three/assets/index.js", true);
  }

  dispose() {
    if (DEBUG_FLOW) {  console.log('GameMatch: disopose(): start'); }
    // Three.jsのインスタンスを破棄
    if (window.pongApp) {
          if (DEBUG_FLOW) {  console.log('GameMatch: disopose(): window.pongApp is true'); }
      window.pongApp.destroy();
      window.pongApp = null;
    }
  }
}
