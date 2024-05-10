import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Test2");
  }

  async getHtml() {
    const uri = getUrl("/pong/lang/");
    const data = await fetchData(uri);
    return data;
  }
}
