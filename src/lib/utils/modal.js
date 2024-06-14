const instances = [];

document.body.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		closeTopModal();
	}
})

function closeTopModal() {
	if (!instances.length) return;
	const top = instances[instances.length - 1];
	if (top.config.cancellable) {
		top.destroy();
	}
}

export class Modal {

	id = 'editor-' + (Math.random() * 10000).toFixed(0);
	el = null;
	config = {
		cancellable: true,
		width: 'sm',
	}

	constructor(config) {
		this.config = { ...this.config, ...(config || {}) };
		this.create();
		instances.push(this);
	}

	get titleEl() {
		return this.el.querySelector('.inner .header .title');
	}

	get contentEl() {
		return this.el.querySelector('.inner .content');
	}

	get footerActionsEl() {
		return this.el.querySelector('.inner .footer .actions');
	}

	create() {
		const html = `
			<div id="${this.id}" class="plume-modal outer --width-${this.config.width}">
				<div class="inner">
					<div class="header"><p class="title"></p></div>
					<div>
						<form>
							<div class="content"></div>
						</form>
					</div>
					<div class="footer"><div class="actions"></div></div>
				</div>
			</div>
		`;
		document.body.insertAdjacentHTML('beforeend', html);
		this.el = document.querySelector('#' + this.id);

		// allow enter to submit
		this.el.querySelector('form').addEventListener('submit', (e) => {
			e.preventDefault();
			// click primary button if it exists
			const primaryActions = this.footerActionsEl.querySelectorAll('button.plume-btn.--primary');
			if (primaryActions.length === 1) {
				primaryActions[0].click();
			}
		})

		if (this.config.cancellable) {
			this.el.addEventListener('click', (e) => {
				if (e.target.matches('.plume-modal.outer')) {
					this.destroy();
				}
			})
		}
	}

	destroy() {
		this.el.outerHTML = '';
	}

	setContentHTML(html) {
		this.contentEl.innerHTML = html;
	}

	setTitle(titleText) {
		this.titleEl.innerText = titleText;
	}

	setFooterActions(actions) {
		for (const action of actions) {
			const html = `<button class="plume-btn --${action.btnStyle}">${action.text}</button>`;
			this.footerActionsEl.insertAdjacentHTML('beforeend', html);
			const el = this.footerActionsEl.querySelector('button:last-child');
			el.addEventListener('click', action.onClick);
		}
	}

}
