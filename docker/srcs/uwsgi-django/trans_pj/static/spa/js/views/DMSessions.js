import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";
import { loadAndExecuteScript } from "../utility/script.js";

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
  async executeScript() {
    // executeScriptTab("/static/chat/js/dm-sessions.js", true);

    import("/static/chat/js/dm-sessions.js")
        .then(module => {
          module.fetchDMList();
          module.startDMwithUser();
        })
        .catch(error => console.error("Failed to load user profile scripts:", error));

  }
}
