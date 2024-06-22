import AbstractView from "../AbstractView.js";
import fetchData from "../../utility/fetch.js";
import { loadAndExecuteScript } from "../../utility/script.js";


export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("PongTop");
  }

  async getHtml() {
    const uri = "/pong/";
    const data = await fetchData(uri);
    //console.log("Pong:" + data);
    return data;
  }

  async executeScript(spaElement) {
  }
}
