export class Component {
	constructor(router, parameters, state, containerSelector) {
		this.router = router;
		this.parameters = parameters;
		this.state = state || {};
		this.containerSelector = containerSelector;
		this.element = Component.createElementFromHTML(this.html, this.containerTag);
		this.element.classList.add('component');
	}

	get containerTag() {
		return 'div';
	}
	set containerTag(newTag) {}

	get html() {
		return this._html || '';
	}
	set html(newHtml) {
		console.log("Setting new HTML:", newHtml);
		this._html = newHtml;
		this.render();
	}

	onEnterForeground() {}

	setState(newState) {
		const prevState = { ...this.state };
		this.state = { ...this.state, ...newState };
		this.update(prevState, this.state);
	}

	goNextPage = (path) => {
		this.router.goNextPage(path);
	}

	getRouteContext(name) {
		return (this.router.getContext(name));
	}

	setRouteContext(name, value) {
		this.router.setContext(name, value);
	}

	render() {
		console.log("Rendering component:", this.html);
		this.element = Component.createElementFromHTML(this.html, this.containerTag);
		
		// if (this.containerSelector) {
		// 	const container = document.querySelector(this.containerSelector);
		// 	if (container) {
		// 		console.log("Rendering component in container:", this.containerSelector);
		// 		container.innerHTML = '';
		// 		container.appendChild(this.element);
		// 	} else {
		// 		console.warn(`Container ${this.containerSelector} not found. Appending to body instead.`);
		// 	}
		// } else {
		// 	console.log("No containerSelector provided. Appending to body.");
		// }
	}

	update(prevState, newState) {
		const changedKeys = Object.keys(newState).filter(key => newState[key] !== prevState[key]);
		changedKeys.forEach(key => {
			const newValue = newState[key];
			const element = this.findElement(`[data-state-key="${key}"]`);
			if (element) {
				element.textContent = newValue;
			}
		});
	}

	findElement(query) {
		return this.element.querySelector(query);
	}

	findElements(query) {
		let nodeList = this.element.querySelectorAll(query);
		return Array.from(nodeList, (element) => {
			if (element instanceof HTMLElement) {
				return (element);
			}
			throw 'findElements: Some element of Query are not HTMLElement.';
		});
	}

	static createElementFromHTML(html, containerTag) {
		let newElement = document.createElement(containerTag);
		newElement.innerHTML = html.trim();
		let firstElement = newElement;
		// let firstElement = newElement.firstElementChild;
		if (firstElement instanceof HTMLElement) {
			return firstElement;
		}
		throw 'createElementFromHTML: First element of newElement is not HTMLElement.';
	}
}
