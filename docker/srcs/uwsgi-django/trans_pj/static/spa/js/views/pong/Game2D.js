// docker/srcs/uwsgi-django/trans_pj/static/spa/js/views/pong/Game2D.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { getUrl } from "../../utility/url.js";
import { loadAndExecuteScript } from "../../utility/script.js";

const DEBUG_FLOW = 1;

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Free Play 2D-Game");
  }

  async getHtml() {
    const uri = "/pong/online/";
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript(spaElement) {
    loadAndExecuteScript(spaElement, "/static/pong/js/online/PongOnlineIndex.js", true);
  }

  async dispose() {
          if (DEBUG_FLOW) {  console.log('FreePlay: disopose(): start'); }
    // disposePongOnlineClientApp()の定義: static/pong/js/online/PongOnlineIndex.js
    if (typeof window.disposePongOnlineClientApp === 'function') {
      window.disposePongOnlineClientApp();
    }
  }

}
