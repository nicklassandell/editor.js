import GenericToolbarButton from './GenericToolbarButton.ts';

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

		this.rootEl.classList.add('simple');
		this.createButtonEl();

		if (config.icon) {
			this.setIcon(config.icon);
		}

		if (config.text) {
			this.setText(config.text);
		}

		if (config.tooltip) {
			this.setTooltipText(config.tooltip);
		}

		if (config.hasOwnProperty('buttonMinWidth')) {
			this.setButtonMinWidth(config.buttonMinWidth);
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
		this.rootEl.insertAdjacentElement('beforeend', this.buttonEl);

	}

	addClickListener(fn) {
		if (typeof fn === 'function') {
			this.buttonEl.addEventListener('click', fn);

			// for css anims
			this.buttonEl.addEventListener('mousedown', () => {
				this.buttonEl.classList.add('--pressed');
				setTimeout(() => {
					this.buttonEl.classList.remove('--pressed');
				}, 200)
			})
		}
	}

	setTooltipText(text) {
		this.buttonEl.dataset.tooltip = text;
	}

	setButtonMinWidth(minWidth) {
		if (!minWidth) {
			this.buttonEl.style.minWidth = null;
		} else {
			if (typeof minWidth === 'number') {
				minWidth = `${minWidth}px`;
			}
			this.buttonEl.style.minWidth = minWidth;
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
			// make sure textEl is placed after icon, or at in the beginning of the button
			// (not at the end, there may be other stuff there, like an arrow in the DropdownToolbarButton)
			if (this.iconEl) {
				this.iconEl.insertAdjacentElement('afterend', textEl);
			} else {
				this.buttonEl.insertAdjacentElement('afterbegin', textEl);
			}
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
			iconEl.draggable = false;
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
