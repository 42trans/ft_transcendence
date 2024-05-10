import AbstractView from "./AbstractView.js";
import fetchData from "../utility/fetch.js";
import { getUrl } from "../utility/url.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Accounts");
  }

  async getHtml() {
    const uri = getUrl("accounts/");
    const data = await fetchData(uri);
    console.log("Accounts:" + data);
    return data;
  }
}
