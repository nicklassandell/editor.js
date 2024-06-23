import SimpleToolbarButton from './SimpleToolbarButton.ts';
import chevronDownIcon from '../assets/icons/chevron-down.svg';

// keep track of all instances of this class so we can close other open dropdowns when opening one
const instances = [];

function closeAllOtherDropdowns(thisInstance) {
	instances.forEach((instance) => {
		if (instance.rootEl === thisInstance.rootEl) return;
		instance.hideDropdown();
	})
}

// share click listener between all instances (for hiding on click outside)
document.addEventListener('click', () => {
	instances.forEach((instance) => instance.hideDropdown());
});

export default class DropdownToolbarButton extends SimpleToolbarButton {

	childContainerEl = null;

	constructor(config) {
		super(config);
		instances.push(this);
		this.rootEl.classList.add('dropdown');
		this.createArrowEl();
		this.createChildContainer();
		this.setupToggleListener();
	}

	setupToggleListener() {
		this.buttonEl.addEventListener('click', (e) => {
			e.stopPropagation();
			closeAllOtherDropdowns(this);
			this.toggleDropdown();
		})
	}

	toggleDropdown() {
		this.rootEl.classList.toggle('--is-open');
	}

	showDropdown() {
		this.rootEl.classList.add('--is-open');
	}

	hideDropdown() {
		this.rootEl.classList.remove('--is-open');
	}

	createArrowEl() {
		const arrowEl = document.createElement('div');
		arrowEl.classList.add('arrow');

		const img = document.createElement('img');
		img.src = chevronDownIcon;

		arrowEl.insertAdjacentElement('beforeend', img);
		this.buttonEl.insertAdjacentElement('beforeend', arrowEl);
	}

	createChildContainer() {
		this.childContainerEl = document.createElement('div');
		this.childContainerEl.classList.add('children');
		this.rootEl.insertAdjacentElement('beforeend', this.childContainerEl);
	}

	renderChildren(els) {
		this.childContainerEl.innerHTML = '';

		if (els?.length) {
			els.forEach((el) => {
				this.childContainerEl.insertAdjacentElement('beforeend', el);
			});
		}
	}

}
