import GenericToolbarButton from './GenericToolbarButton.js';

export default class SimpleToolbarButton extends GenericToolbarButton {

	buttonEl = null;

	get textEl() {
		return this._textEl ? this._textEl : this._textEl = this.buttonEl.querySelector('.text');
	}

	get iconEl() {
		return this._iconEl ? this._iconEl : this._iconEl = this.buttonEl.querySelector('.icon');
	}

	constructor(config) {
		super();

		this.createButtonEl();

		if (config.icon) {
			this.setIcon(config.icon);
		}

		if (config.text) {
			this.setText(config.text);
		}

		if (config.onClick) {
			this.addClickListener(config.onClick);
		}

		if (typeof config.show == 'boolean') {
			this.setVisibility(config.show);
		}
	}

	createButtonEl() {
		this.buttonEl = document.createElement('button');
		this.buttonEl.classList.add('simple');
		this.rootEl.insertAdjacentElement('beforeend', this.buttonEl);

	}

	addClickListener(fn) {
		if (typeof fn === 'function') {
			this.buttonEl.addEventListener('click', fn);
		}
	}

	setText(text) {
		// delete el if passing empty value
		if (!text) {
			if (this.textEl) {
				this.textEl.outerHTML = '';
			}
			return;
		}
		// create el if it doesn't already exist
		if (!this.textEl) {
			const textEl = document.createElement('span');
			textEl.classList.add('text');
			this.buttonEl.insertAdjacentElement('beforeend', textEl);
		}
		this.textEl.innerText = text;
	}

	setIcon(iconName) {
		// delete el if passing empty value
		if (!iconName) {
			if (this.iconEl) {
				this.iconEl.outerHTML = '';
			}
			return;
		}
		// create el if it doesn't already exist
		if (!this.iconEl) {
			const iconEl = document.createElement('img');
			iconEl.classList.add('icon');
			this.buttonEl.insertAdjacentElement('afterbegin', iconEl);
		}
		this.iconEl.src = iconName;
	}

	setActive(bool) {
		if (bool) {
			this.buttonEl.classList.add('--active')
		} else {
			this.buttonEl.classList.remove('--active')
		}
	}


}
