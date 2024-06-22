// Tournament.js

import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Tournament");
  }

  async getHtml() {
    const uri = "/pong/tournament/";
    const data = await fetchData(uri);
    // console.log("Pong:" + data);
    return data;
  }

  async executeScript(spaElement) {
    // await loadAndExecuteScript("/static/pong/js/tournament/TournamentMain.js", true);

    const tournamentModule = await import("/static/pong/js/tournament/TournamentMain.js");
    tournamentModule.setupTournament();
  }
}
