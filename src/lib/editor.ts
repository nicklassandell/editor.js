import { defaultOptions } from './data/defaultOptions.js';
import { EditorConfig, EditorPlugin, ToolbarItem } from "./types.ts";
import {
    cleanupInlineStyles,
    closest,
    getEl,
} from "./utils/el.ts";

export default class Editor {
    id: string | null = null;
    el: HTMLElement | null = null;
    contentEl: HTMLElement | null = null;
    activeBlockEl: HTMLElement | null = null
    activeInlineEl: HTMLElement | null = null
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

        this.contentEl.addEventListener('keyup', this.update.bind(this));
        this.contentEl.addEventListener('mouseup', this.update.bind(this))
        this.contentEl.addEventListener('click', (e) => {
            if (e.shiftKey) {
                this.blockifyRootNodes();
                this.cleanupInlineStyles();
            }
        })
        this.contentEl.addEventListener('paste', (e) => {
            e.preventDefault();

            const clipboardData = e.clipboardData;
            const pastedText = clipboardData.getData('text/plain');
            const processedText = pastedText;

            document.execCommand('insertText', false, processedText);
        })

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
        // console.log('editor: something changed')
        this.findActiveElements();
    }

    blockifyRootNodes() {
        const els = [];
        let newNode = document.createElement('p');
        let didCorrect = false;
        for (const node of this.contentEl.childNodes) {
            // if text node
            if (node instanceof Text) {
                // console.log('should be text node')
                if (node.textContent) {
                    newNode.insertAdjacentText('beforeend', node.textContent);
                }
                didCorrect = true;

            } else if (node instanceof HTMLElement) {
                let el = getEl(node);
                const isBlockEl = el.matches(this.config.blockTags.join(', '));

                if (el && el.isSameNode(this.contentEl)) {
                    el = null;
                }

                // if inline el
                if (!isBlockEl) {
                    // idk why i need to do node.outerHTML instead of incertAdjacentElement with node. It seems to skip some nodes if we do that.
                    newNode.insertAdjacentHTML('beforeend', node.outerHTML);
                    didCorrect = true;
                    continue;
                }

                // at this point it must be a block el
                // first append current paragraph node to els and make a new empty one
                if (newNode.innerHTML) {
                    els.push(newNode);
                    newNode = document.createElement('p');
                }
                // then append block el
                els.push(el);
            }
        }

        if (didCorrect) {
            if (newNode.innerHTML) {
                els.push(newNode);
            }
            this.contentEl.innerHTML = '';
            for (const el of els) {
                this.contentEl.insertAdjacentElement('beforeend', el);
                console.log(el);
            }
            const lastBlock = this.contentEl.children[this.contentEl.children.length - 1];
            const lastNode = lastBlock.childNodes[lastBlock.childNodes.length - 1];
            console.log(lastNode, lastNode.length)
            window.getSelection().setPosition(lastNode, lastNode.length)
        }
    }

    cleanupInlineStyles() {
        cleanupInlineStyles(this.contentEl);
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
        this.updateToolbar();
    }

    updateToolbar() {
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
