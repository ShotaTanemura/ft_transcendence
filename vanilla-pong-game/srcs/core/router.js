// RootingList must be contain component, parameters, store
import './component.js'

export class Router {
	constructor(rootElement, routingList) {
		this.pageStack = [];
		this.rootElement = rootElement;
		this.routingList = routingList;
		window.addEventListener('popstate', (e) => {
			if (e.state.depth < this.pageStack.length) {
				this.onHistoryBack();
			} else {
				this.onHistoryForward(e.state);
			}
		});
	}
	
	// 指定したpathに遷移する。
	gonextPage(path) {
		return this.changePage(path)		
	}

	//前のページに戻る
	goBackPage() {
		return history.back();
	}

	// 実際にpathに遷移させる。
	changePage(path) {
		let route = this.searchRouteFromPath(path);
		//TODO 組み込みのエラーページができるまで何もしない。
		if (route === null) {
			console.log('Error: changePage: No such path entry.');
			return null;
		}
		let component = new route.component(this, route.parameters, route.store);

		if (0 < this.pageStack.length) {
			this.getForegroundPage.element.parentNode.removeChild(this.getForegroundPage.element);
		}

		let data = {
			depth: this.pageStack.length + 1,
			path: path
		};

		if (this.pageStack.length === 0) {
			history.replaceState(data, null, path);
		} else {
			history.pushState(data, null, path);
		}
		this.pageStack.push(component);
		this.rootElement.appendChild(component.element);
		component.onEnterForeground();
		return component; 
	}

	onHistoryBack() {
		//TODO これはいるのかわからん
		if (this.pageStack.length === 1) {
			return ;
		}

		let currentPage = this.pageStack.pop();
		currentPage.router = null;
		currentPage.element.parentNode.removeChild(currentPage.element);

		let page = this.getForegroundPage;
		this.rootElement.appendChild(page.element);
		page.onEnterForeground();
	}
	
	onHistoryForward(data) {
		this.getForegroundPage.element.parentNode.removeChild(this.getForegroundPage.element);

		let route = this.searchRouteFromPath(data.path);
		//TODO 組み込みエラーページができるまで何もしない。
		if (route === null) {
			console.log('Error: onHistoryForward: No such path entry.');
		}
		let component  = new route.component(this, route.parameters, route.store);
		this.pageStack.push(component);

		this.rootElement.appendChild(component.element);
		component.onEnterForeground();
	}

	searchRouteFromPath(path) {
		if (path === "") path = "/";
		for (let i = 0; i < this.routingList.length; i++) {
			let route = this.routingList[i];
			//TODO idなど個人によってpathを変えるなら、完全一致だけでなく、正規表現を用いた一致も必要。
			if (route.path !== path) continue;
			let parameters = {};
			return {
				component: route.component,
			 	parameters: parameters,
			 	store: route.store
			}
			 
		}
		//TODO 組み込みのエラーページコンポーネントを返す。
		return (null);
	}
	
	get getForegroundPage() {
		return this.pageStack[this.pageStack.length - 1];
	}
	
}

