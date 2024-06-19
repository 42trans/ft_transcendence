import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "./url.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Script1");
  }

  async getHtml() {
    const uri = "/view/script1/";
    const data = await fetchData(uri);
    return data;
  }
  async executeScript() {
    loadAndExecuteScript("/static/spa/js/script/test.js");
  }
}
