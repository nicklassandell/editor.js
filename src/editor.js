export class Editor {

	styles = ['style-1', 'style-2']
	tags = ['h1', 'h2', 'p', 'div']
	formats = [
		{
			id: 'italic',
			name: 'italic',
			apply: {
				setTag: 'i',
			},
		},
		{
			id: 'bold',
			name: 'bold',
			apply: {
				setTag: 'b',
			},
		},
	]

	blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5']
	inlineTags = ['span', 'b', 'i', 'u', 'strong']
	validAttributes = ['class']

	constructor(el) {
		this.el = el;
		this.id = 'editor-' + Math.round(Math.random() * 100000000);
		this.setup();
		this.toolbarEl = this.buildToolbar();
		this.setSelection(null);
	}

	setup() {
		this.el.classList.add(this.id);
		this.el.innerHTML = `<div class="content" contenteditable="true">${this.el.innerHTML}</div>`;
		this.contentEl = this.el.querySelector('.content');

		this.contentEl.addEventListener('mouseup', (e) => {
			this.setSelection(window.getSelection());
			this.showHideToolbar();
		})

		document.addEventListener('click', (e) => {
			if (!e.target.closest('.' + this.id)) {
				this.setSelection(null);
			}
		})
	}

	destroy() {
		this.toolbarEl.outerHTML = '';
	}

	buildToolbar() {
		let stylesHtml = '';
		let tagsHtml = '';
		let formatsHtml = '';
		for (const style of this.styles) {
			stylesHtml += `<button data-action="set-style" data-style="${style}">${style}</button>`;
		}
		for (const tag of this.tags) {
			tagsHtml += `<button data-action="set-tag" data-tag="${tag}">${tag}</button>`;
		}
		for (const format of this.formats) {
			formatsHtml += `<button data-action="set-format" data-format="${format.id}">${format.name}</button>`;
		}
		const html = `
			<div class="toolbar" style="display: flex; border: 1px solid darkkhaki; padding: 5px; gap: 5px;">
				${stylesHtml}
				<span></span>
				${tagsHtml}
				<span></span>
				${formatsHtml}
			</div>
		`;
		this.el.insertAdjacentHTML('afterbegin', html);
		this.showHideToolbar();
		const el = document.querySelector('.' + this.id + ' .toolbar');
		console.log('.' + this.id + ' .toolbar')

		el.addEventListener('click', this.onToolbarClick.bind(this));

		return el;
	}

	setSelection(selection) {
		this.selection = selection;
		this.showHideToolbar();
	}

	showHideToolbar() {
		if (this.toolbarEl) {
			if (this.selection) {
				this.toolbarEl.style.display = null;
			} else {
				this.toolbarEl.style.display = 'none';
			}
		}
	}

	onToolbarClick(e) {
		const actionEl = e.target.closest('[data-action]');
		if (actionEl) {
			const action = actionEl.dataset.action;
			this.handleAction(action, actionEl);
		}
	}

	getClosestBlockEl() {
		if (this.selection) {
			const textNode = this.selection.anchorNode;
			const el = textNode.parentNode;
			const blockEl = el.closest(this.blockTags.join(','));
			if (blockEl.closest(`.${this.id} .content`) && !blockEl.classList.contains('content')) {
				return blockEl;
			}
		}
	}

	handleAction(action, actionEl) {
		if (action === 'set-style') {
			const style = actionEl.dataset.style;
			if (style) {
				const blockEl = this.getClosestBlockEl();
				if (blockEl) {
					const styleToSet = actionEl.dataset.style;
					let alreadyExists = false;
					if (blockEl.classList.contains(styleToSet)) {
						alreadyExists = true;
					}

					// first remove all other styles
					for (const style of this.styles) {
						blockEl.classList.remove(style);
					}

					if (!alreadyExists) {
						blockEl.classList.add(styleToSet);
					}
				}
			}
		} else if (action === 'set-tag') {
			const tag = actionEl.dataset.tag;
			if (tag) {
				const blockEl = this.getClosestBlockEl();
				if (blockEl) {
					const tagToSet = actionEl.dataset.tag;
					console.log(blockEl.outerHTML)
					const blockInnerHtml = blockEl.innerHTML;
					const attributes = [];
					for (const validAttr of this.validAttributes) {
						attributes.push({
							attribute: validAttr,
							value: blockEl.getAttribute(validAttr),
						})
					}
					const attributesHtml = attributes.map((attr) => {
						if (attr.value) {
							return `${attr.attribute}="${attr.value}"`;
						}
					}).filter((attrHtml) => !!attrHtml).join(' ');
					const newHtml = `<${tagToSet} ${attributesHtml}>${blockInnerHtml}</${tagToSet}>`
					console.log(newHtml)
					blockEl.outerHTML = newHtml;
				}
			}
		} else if (action === 'set-format') {
			const formatId = actionEl.dataset.format;
			const format = this.formats.find((f) => f.id === formatId);
			if (format) {
				// this is broken, does not respect other HTML within the parent

				const parentEl = this.selection.anchorNode.parentNode;
				const txt = parentEl.innerText;//this.selection.toString();

				const startPos = this.selection.anchorOffset;
				const endPos = this.selection.extentOffset;
				const before = txt.slice(0, startPos);
				const end = txt.slice(endPos);
				let middle = txt.slice(startPos, endPos);

				const tag = format.apply.setTag;

				parentEl.innerHTML = `${before}<${tag}>${middle}</${tag}>${end}`;
			}
		}
	}
}

const applyFns = {
	setNodeName(nodeName, textNode) {
		// const newEl = document.createElement(nodeName);
		// const text = textNode.data;
		// window.x = textNode;
		// console.dir(textNode)
		// newEl.innerText = text;
		// textNode.replaceWith(text);
		// console.log(newEl)
	},
};
