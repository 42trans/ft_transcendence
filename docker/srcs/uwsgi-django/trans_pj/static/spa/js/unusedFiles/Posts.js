import AbstractView from "./AbstractView.js";
import { loadAndExecuteScript } from "../utility/script.js";

export default class extends AbstractView {
  constructor(params) {
    super(params);
    this.setTitle("Posts");
  }

  async getHtml() {
    return `
            <h1>Posts</h1>
            <p>You are viewing the posts!!!111a1234zzz</p>
            <a href="/settings" class="nav__link" data-link>Settings</a>
        `;
  }
  async executeScript() {
    //executeScriptTab("");
  }
}
