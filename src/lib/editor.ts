import { defaultOptions } from './data/defaultOptions.js';
import { EditorConfig, EditorPlugin, ToolbarItem } from "./types.ts";
import { closest } from "./utils/el.ts";
import { toolbarDividerFn } from "./render-fns/toolbar.ts";

export class Editor {
    activeBlockEl = null
    activeInlineEl = null
    plugins: Record<string, EditorPlugin> = {}
    actionHandlers = {}
    toolbarItems: Record<string, ToolbarItem> = {}
    eventHandlers: Record<string, Function[]> = {}

    config: EditorConfig = {
        blockTags: [],
        inlineTags: [],
        validAttributes: [],
        toolbarLayout: '',
    }

    constructor(el: HTMLElement, options: EditorConfig = {}) {
        console.log('editor:', this)
        this.el = el;
        this.id = 'editor-' + Math.round(Math.random() * 100000000);
        this.resolveOptions(options);
    }

    init() {
        this.el.classList.add(this.id);
        this.el.innerHTML = `<div class="content" contenteditable="true">${this.el.innerHTML}</div>`;
        this.contentEl = this.el.querySelector('.content');

        if (this.contentEl.innerHTML.length === 0) {
            this.contentEl.innerHTML = '<p>x</p>';
        }

        this.contentEl.addEventListener('keyup', this.update.bind(this));
        this.contentEl.addEventListener('mouseup', this.update.bind(this))

        // disable native formatting keyboard shortcuts, will add our own
        // todo: refactor elsewhere.
        this.contentEl.addEventListener('keydown', (e) => {
            if (['b', 'i', 'u'].includes(e.key) && e.composed) {
                e.preventDefault();
            }
        });

        this.buildToolbar();
    }

    update() {
        console.log('editor: something changed')
        this.findActiveElements();
    }

    findActiveElements() {
        const newActiveBlockEl = closest(this.config.blockTags.join(', '), window.getSelection().anchorNode);
        const newActiveInlineEl = closest(this.config.inlineTags.join(', '), window.getSelection().anchorNode);

        if ((!this.activeBlockEl && newActiveBlockEl) || (this.activeBlockEl && !this.activeBlockEl.isSameNode(newActiveBlockEl))) {
            this.activeBlockEl = newActiveBlockEl;
            this.dispatchEvent('activeBlockElChange', this.activeBlockEl);
        }

        if ((!this.activeInlineEl && newActiveInlineEl) || (this.activeInlineEl && !this.activeInlineEl.isSameNode(newActiveInlineEl))) {
            this.activeInlineEl = newActiveInlineEl;
            this.dispatchEvent('activeInlineElChange', this.activeInlineEl);
        }
    }

    use(pluginInstance: EditorPlugin) {
        this.plugins[pluginInstance.id] = pluginInstance;
        this.plugins[pluginInstance.id].attach(this);
    }

    on(eventName: string, eventHandler: Function) {
        if (!this.eventHandlers.hasOwnProperty(eventName)) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(eventHandler);
    }

    dispatchEvent(eventName: string, event: any) {
        if (this.eventHandlers.hasOwnProperty(eventName)) {
            for (const handler of this.eventHandlers[eventName]) {
                handler(event);
            }
        }
    }

    destroy() {
        // todo: write
        this.toolbarEl.outerHTML = '';
    }

    registerActionHandler(handlerId, handler) {
        this.actionHandlers[handlerId] = handler;
    }

    registerToolbarItem(item: ToolbarItem) {
        this.toolbarItems[item.id] = item;
    }

    resolveOptions(options: EditorConfig) {
        this.config.blockTags = options.blockTags || defaultOptions.blockTags;
        this.config.inlineTags = options.inlineTags || defaultOptions.inlineTags;
        this.config.validAttributes = options.validAttributes || defaultOptions.validAttributes;
        this.config.toolbarLayout = options.toolbar || defaultOptions.toolbarLayout;
    }

    buildToolbar() {
        const html = `<div class="toolbar"></div>`;
        this.el.insertAdjacentHTML('afterbegin', html);
        this.showHideToolbar();
        this.toolbarEl = document.querySelector(`.${this.id} .toolbar`);
        // this.toolbarEl.addEventListener('click', this.onToolbarClick.bind(this));
        this.updateToolbar();
    }

    updateToolbar() {
        //this.findActiveToolbarBtn();

        const layout = this.config.toolbarLayout.split(' ').filter((id) => id === '|' || this.toolbarItems.hasOwnProperty(id));

        const nodes = [];
        for (const itemId of layout) {
            if (itemId === '|') {
                nodes.push(toolbarDividerFn());
            } else {
                const item = this.toolbarItems[itemId];
                const elements = item.elements;
                if (elements?.length) {
                    nodes.push(...elements)
                }
            }
        }

        console.log('toolbar nodes:', nodes)

        if (nodes.length) {
            for (const node of nodes) {
                this.toolbarEl.insertAdjacentElement('beforeend', node);
            }
        }
    }

    showHideToolbar() {
        // if (this.toolbarEl) {
        // 	if (this.selection) {
        // 		this.toolbarEl.style.display = null;
        // 	} else {
        // 		this.toolbarEl.style.display = 'none';
        // 	}
        // }
    }

    onToolbarClick(e) {
        const toolbarEl = e.target.closest('[data-action-id], [data-apply]');
        if (toolbarEl) {
            const apply = toolbarEl.dataset.apply;
            if (apply) {
                const applyWith = toolbarEl.dataset.applyWith;
                this.actionHandlers[apply](this, applyWith);
            }

            this.updateToolbar();
        }
    }
}
