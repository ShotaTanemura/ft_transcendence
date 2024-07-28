export class Component {
	constructor(router, parameters, state, containerSelector) {
		this.router = router;
		this.parameters = parameters;
        this.state = state || {};
        this.containerSelector = containerSelector || '#app';
		this.element = Component.createElementFromHTML(this.html, this.containerTag);
		this.element.classList.add('component');
	}

	get containerTag() {return 'div';}
	set containerTag(newTag){}

	get html(){ return this._html || ''; }
	set html(newHtml){
		console.log("Setting new HTML:", newHtml);
		this._html = newHtml;
		this.render();
	}

	onEnterForeground(){
	}

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
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
		this.element = Component.createElementFromHTML(this.html, this.containerTag);
		
		if (this.containerSelector) {
			const container = document.querySelector(this.containerSelector);
			if (container) {
				container.innerHTML = '';
				container.appendChild(this.element);
			} else {
				console.error(`Container element with selector "${this.containerSelector}" not found`);
			}
		} else {
			console.error("Container selector not provided");
		}
	}

	findElement(query) {
		return this.element.querySelector(query);
	}

	findElements(query) {
		let nodeList = this.element.querySelectorAll(query);
		return Array.from(nodeList, (element) => {
			if (element instanceof HTMLElement)	{
				return (element);
			}
			throw 'findElements: Some element of Query are not HTMLElement.';
		});
	}

	static createElementFromHTML(html, containerTag) {
		let new_element = document.createElement(containerTag);
		new_element.innerHTML = html.trim();
		// first_element = new_element.firstChild;だと最初の要素のみしか追加されない。
		let first_element = new_element;
		if (first_element instanceof HTMLElement) {
			return first_element;
		}
		throw 'createElementFromHTML: First element of new_element is not HTMLElement.';
	}
}
