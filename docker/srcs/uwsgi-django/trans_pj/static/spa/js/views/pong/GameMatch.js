// docker/srcs/uwsgi-django/trans_pj/static/spa/js/views/pong/GameMatch.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";
import { routeTable } from "/static/spa/js/routing/routeTable.js";
import { switchPage } from "/static/spa/js/routing/renderView.js"

const DEBUG_FLOW = 0;

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.params = params
    this.setTitle("GameMatch");
    this.previousPath = window.location.pathname; 
  }

  async getHtml() {
    const matchId = this.params.matchId;
    const uri = `/pong/play/${matchId}`;
          if (DEBUG_FLOW) {  console.log('uri: ', uri); }
    const data = await fetchData(uri);
    // console.log('data', data);
    // if (data.is_playing) {
    //   window.location.href = routeTable['top'].path;
    //   return;
    // }
    return data;
  }

  async executeScript(spaElement) {
    loadAndExecuteScript(spaElement, "/static/pong/three/assets/index.js", true);
  }

  async dispose() {
        if (DEBUG_FLOW) {  console.log('GameMatch: disopose(): start'); }
    // Three.jsのインスタンスを破棄
    if (typeof window.disposePongApp === 'function') {
      window.disposePongApp();
    }
    // 複数ブラウザでmatchが起動しないためのフラグを折る
    // URI が "/pong/play/:matchId" に一致する場合のみフラグをリセット
    const matchId = this.params.matchId;
    const pattern = new RegExp(`^/app/game/match/${matchId}/$`); // 正規表現パターン
    // console.log('previousPath: ', this.previousPath);
    // console.log('pattern: ', pattern);

    if (pattern.test(this.previousPath)) { // パスがパターンに一致するかチェック
      const uri = `/pong/api/tournament/user/match/release_match/${matchId}/`;
      try {
        // console.log('pattern: true: start: uri', uri);

        const response = await fetch(uri, { 
          method: 'POST',
          headers: {
            'X-CSRFToken':  window.csrfToken 
          }
        });
        // console.log('response', response);

        if (!response.ok) {
          if (response.status === 403) {
            console.error('dispose() failed: You are not allowed to release this match.');
          } else {
            console.error('dispose() failed: ', response.statusText);
          }
        }
      } catch (error) {
        console.error('dispose() failed: Error resetting is_playing flag:', error);
      }
    }
  }
  
}
