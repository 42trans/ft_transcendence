export default class {
  constructor(params) {
    this.params = params;
  }

  setTitle(title) {
    document.title = title;
  }

  async getHtml() {
    return "";
  }

  async executeScript(spaElement) {
    return "";
  }

  async dispose() {
    // 必要に応じてオーバーライド
  }
}
