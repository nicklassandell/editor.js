export default class GenericToolbarButton {

	rootEl = null;

	constructor() {
		this.createRootEl();
	}

	createRootEl() {
		this.rootEl = document.createElement('div');
		this.rootEl.classList.add('toolbar-btn-holder');
	}

	show() {
		this.rootEl.style.display = null;
	}

	hide() {
		this.rootEl.style.display = 'none';
	}

	setVisibility(bool) {
		bool ? this.show() : this.hide();
	}
}
