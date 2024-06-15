import { defaultOptions } from './data/defaultOptions';
import { EditorConfig, EditorPlugin, ToolbarItem } from "./types";
import { cleanupInlineStyles, closest, getEl, } from "./utils/el.ts";

export default class PlumeEditor {
    id: string | null = null;
    el: HTMLElement | null = null;
    toolbarEl: HTMLElement | null = null;
    contentEl: HTMLElement | null = null;
    activeBlockEl: HTMLElement | null = null
    activeInlineEl: HTMLElement | null = null
    plugins: Record<string, EditorPlugin> = {}
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
        this.el.classList.add('plume');
        this.id = 'plume-' + Math.round(Math.random() * 100000000);
        this.resolveOptions(options);
    }

    init() {
        this.el.classList.add(this.id);
        this.el.innerHTML = `<div class="content" contenteditable="true">${this.el.innerHTML || '<p>&#x200b;</p>'}</div>`;
        this.contentEl = this.el.querySelector('.content');

        this.contentEl.addEventListener('keyup', this.update.bind(this));
        this.contentEl.addEventListener('mouseup', this.update.bind(this))
        this.contentEl.addEventListener('paste', (e) => {
            e.preventDefault();

            // todo: Allow pasting html and sanitize pasted input. Should filter out disallowed tags & attributes.
            const clipboardData = e.clipboardData;
            const plainText = clipboardData.getData('text/plain');

            // todo: Handle insertion ourselves, execCommand is deprecated and there's no need to use it. It's also
            //  the only place in the codebase where it is used.
            document.execCommand('insertText', false, plainText);
        })

        // disable native formatting keyboard shortcuts, will add our own
        this.contentEl.addEventListener('keydown', (e) => {
            if (['b', 'i', 'u'].includes(e.key) && e.composed) {
                e.preventDefault();
            }
        });

        this.buildToolbar();
    }

    update() {
        this.findActiveElements();
    }

    findActiveElements() {
        const anchorNode = window.getSelection().anchorNode;
        let newActiveBlockEl = closest(this.config.blockTags.join(', '), anchorNode);
        const newActiveInlineEl = closest(this.config.inlineTags.join(', '), anchorNode);

        if (newActiveBlockEl && this.contentEl.isSameNode(newActiveBlockEl)) {
            newActiveBlockEl = null;
        }

        if ((!this.activeBlockEl && newActiveBlockEl) || (this.activeBlockEl && !this.activeBlockEl.isSameNode(newActiveBlockEl))) {
            this.setActiveBlockEl(newActiveBlockEl);
        }

        if ((!this.activeInlineEl && newActiveInlineEl) || (this.activeInlineEl && !this.activeInlineEl.isSameNode(newActiveInlineEl))) {
            this.setActiveInlineEl(newActiveInlineEl);
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
        // todo: handle destroy event (& call destroy() on plugins)
        this.toolbarEl.outerHTML = '';
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

    setActiveBlockEl(blockEl) {
        this.activeBlockEl = blockEl;
        this.dispatchEvent('activeBlockElChange', this.activeBlockEl);
    }

    setActiveInlineEl(inlineEl) {
        this.activeInlineEl = inlineEl;
        this.dispatchEvent('activeInlineElChange', this.activeInlineEl);
    }

    setHtml(html) {
        this.contentEl.innerHTML = html;
        this.setActiveBlockEl(null);
        this.setActiveInlineEl(null);
    }

    buildToolbar() {
        const html = `<div class="toolbar"></div>`;
        this.el.insertAdjacentHTML('afterbegin', html);
        this.toolbarEl = document.querySelector(`.${this.id} .toolbar`);
        this.renderToolbarItems();
    }

    renderToolbarItems() {
        const layout = this.config.toolbarLayout.split(/\s+/g);

        const nodes = [];
        for (const itemId of layout) {
            const item = this.toolbarItems[itemId];
            if (!item) {
                continue;
            }
            const elements = item.elements;
            if (elements?.length) {
                elements.forEach((el) => {
                    if (typeof el === 'function') {
                        nodes.push(el());
                    } else {
                        nodes.push(el)
                    }
                })
            }
        }

        if (nodes.length) {
            for (const node of nodes) {
                this.toolbarEl.insertAdjacentElement('beforeend', node);
            }
        }
    }
}
