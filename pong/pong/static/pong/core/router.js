// RootingList must be contain component, parameters, state
import "./component.js";

export class Router {
  constructor(rootElement, routingList, context) {
    this.pageStack = [];
    this.rootElement = rootElement;
    this.routingList = routingList;
    this.context = context;
    window.addEventListener("popstate", (e) => {
      if (e.state === null) {
        return;
      }
      if (e.state.depth < this.pageStack.length) {
        this.onHistoryBack();
      } else {
        this.onHistoryForward(e.state);
      }
    });
  }

  setContext(name, value) {
    this.context[name] = value;
  }

  getContext(name) {
    return this.context[name];
  }

  // 指定したpathに遷移する。
  goNextPage(path) {
    return this.changePage(path);
  }

  //前のページに戻る
  goBackPage() {
    return history.back();
  }

  // 実際にpathに遷移させる。
  changePage(path) {
    let route = this.searchRouteFromPath(path);
    //TODO Return 404 Error Page
    if (route === null) {
      route = this.searchRouteFromPath("/error");
    }

    if (path !== "/signin" && path !== "/signup") {
      this.verifyAndRefreshToken().catch((error) => {
        console.log(error);
        path = "/signin";
        route = this.searchRouteFromPath("/signin");
        let component = new route.component(
          this,
          route.parameters,
          route.state,
        );

        if (0 < this.pageStack.length) {
          this.getForegroundPage.beforePageUnload();
          this.getForegroundPage.element.parentNode.removeChild(
            this.getForegroundPage.element,
          );
        }

        const data = {
          depth: this.pageStack.length + 1,
          path: path,
        };

        if (this.pageStack.length === 0) {
          history.replaceState(data, null, path);
        } else {
          history.pushState(data, null, path);
        }
        this.pageStack.push(component);
        this.rootElement.appendChild(component.element);
        component.afterPageLoaded();
        return component;
      });
    }

    let component = new route.component(this, route.parameters, route.state);

    if (0 < this.pageStack.length) {
      this.getForegroundPage.beforePageUnload();
      this.getForegroundPage.element.parentNode.removeChild(
        this.getForegroundPage.element,
      );
    }

    const data = {
      depth: this.pageStack.length + 1,
      path: path,
    };

    if (this.pageStack.length === 0) {
      history.replaceState(data, null, path);
    } else {
      history.pushState(data, null, path);
    }
    this.pageStack.push(component);
    this.rootElement.appendChild(component.element);
    component.afterPageLoaded();
    return component;
  }

  onHistoryBack() {
    //TODO これはいるのかわからん
    if (this.pageStack.length === 1) {
      return;
    }

    const currentPage = this.pageStack.pop();
    currentPage.beforePageUnload();
    currentPage.router = null;
    currentPage.element.parentNode.removeChild(currentPage.element);

    const page = this.getForegroundPage;
    this.rootElement.appendChild(page.element);
    page.afterPageLoaded();
  }

  onHistoryForward(data) {
    this.getForegroundPage.beforePageUnload();
    this.getForegroundPage.element.parentNode.removeChild(
      this.getForegroundPage.element,
    );

    const route = this.searchRouteFromPath(data.path);
    //TODO 組み込みエラーページができるまで何もしない。
    if (route === null) {
      console.log("Error: onHistoryForward: No such path entry.");
    }
    const component = new route.component(this, route.parameters, route.state);
    this.pageStack.push(component);

    this.rootElement.appendChild(component.element);
    component.afterPageLoaded();
  }

  searchRouteFromPath(path) {
    path = path.replace(/\/$/, "");
    if (path === "") path = "/";
    for (let i = 0; i < this.routingList.length; i++) {
      let route = this.routingList[i];
      if (route.path !== path) continue;
      let parameters = {};
      return {
        component: route.component,
        parameters: parameters,
        state: route.state,
      };
    }
    //TODO 組み込みのエラーページコンポーネントを返す。
    return null;
  }

  get getForegroundPage() {
    return this.pageStack[this.pageStack.length - 1];
  }

  verifyAndRefreshToken = async () => {
    const verifyResponse = await fetch("/pong/api/v1/auth/token/verify", {
      method: "POST",
    });
    if (verifyResponse.ok) {
      return true;
    }

    const refreshResponse = await fetch("/pong/api/v1/auth/token/refresh", {
      method: "POST",
    });
    if (refreshResponse.ok) {
      return true;
    }
    throw Error(verifyResponse.statusText);
  };
}
