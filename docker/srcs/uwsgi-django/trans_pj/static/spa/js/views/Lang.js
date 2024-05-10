import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Lang");
  }

  async getHtml() {
    const uri = getUrl("/lang");
    const data = await fetchData(uri);
    return data;
  }
}
