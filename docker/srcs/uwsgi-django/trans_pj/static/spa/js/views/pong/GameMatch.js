// docker/srcs/uwsgi-django/trans_pj/static/spa/js/views/pong/GameMatch.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { getUrl } from "../../utility/url.js";
import { loadAndExecuteScript } from "../../utility/script.js";

const DEBUG_FLOW = 0;

// --------------------------------------
// グローバルスコープ
// --------------------------------------
// let isEventListenerRegistered = false;
// イベントリスナーの削除 
function  unregisterEventListenerSwitchPageResetState() {
        if (DEBUG_FLOW) {  console.log('GameMatch: unregisterEventListenerSwitchPageResetState(): start'); }
  // handleSwitchPageResetState(): docker/srcs/vite/pong-three/src/index.jsに実装
  window.removeEventListener('switchPageResetState', window.handleSwitchPageResetState);
  window.isEventListenerRegistered = false; 
}
// --------------------------------------
export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params
    this.setTitle("GameMatch");
  }

  async getHtml() {
    const matchId = this.params.matchId;
    const uri = `/pong/play/${matchId}`;
          if (DEBUG_FLOW) {  console.log('uri: ', uri); }
    const data = await fetchData(uri);
    return data;
  }

  async executeScript() {
    loadAndExecuteScript("/static/pong/three/assets/index.js", true);
  }

  async dispose() {
        if (DEBUG_FLOW) {  console.log('GameMatch: disopose(): start'); }
    // Three.jsのインスタンスを破棄
    if (window.pongApp) {
          if (DEBUG_FLOW) {  console.log('GameMatch: disopose(): window.pongApp is true'); }
      await window.pongApp.destroy();
      window.pongApp = null;
    }
    unregisterEventListenerSwitchPageResetState();
  }
}
