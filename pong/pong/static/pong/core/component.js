export class Component {
  constructor(router, parameters, state) {
    this.router = router;
    this.parameters = parameters;
    this.state = state;
    this.element = Component.createElementFromHTML(
      this.html,
      this.containerTag,
    );
    this.element.classList.add("component");
  }

  get containerTag() {
    return "div";
  }
  set containerTag(newTag) {}

  get html() {
    return "";
  }
  set html(newHtml) {}

  afterPageLoaded() {}

  beforePageUnload() {}

  goNextPage = (path) => {
    this.router.goNextPage(path);
  };

  getRouteContext(name) {
    return this.router.getContext(name);
  }

  setRouteContext(name, value) {
    this.router.setContext(name, value);
  }

  unsetRouteContext(name) {
    this.router.unsetContext(name);
  }

  findElement(query) {
    return this.element.querySelector(query);
  }

  findElements(query) {
    let nodeList = this.element.querySelectorAll(query);
    return Array.from(nodeList, (element) => {
      if (element instanceof HTMLElement) {
        return element;
      }
      throw "findElements: Some element of Query are not HTMLElement.";
    });
  }

  render() {
    this.element.innerHTML = this.html;
  }

  static createElementFromHTML(html, containerTag) {
    let new_element = document.createElement(containerTag);
    new_element.innerHTML = html.trim();
    // first_element = new_element.firstChild;だと最初の要素のみしか追加されない。
    let first_element = new_element;
    if (first_element instanceof HTMLElement) {
      return first_element;
    }
    throw "createElementFromHTML: First element of new_element is not HTMLElement.";
  }
}
