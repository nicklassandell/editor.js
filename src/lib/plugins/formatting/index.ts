import { EditorPlugin, SimpleToolbarButtonArguments, ToolbarItem } from '../../types.js';
import { createSimpleToolbarButton, simpleToolbarButtonFn } from "../../render-fns/toolbar.ts";

export class FormattingPlugin implements EditorPlugin {
    id = 'formatting'

    formats = []
    availableFormatClasses = []
    actions = {}
    activeBlockFormat: any = null
    formatsButton: any;
    tagsButton: any;
    formatButtons: Record<string, any> = {}
    tagButtons: Record<string, any> = {}

    constructor(options = {}) {
        this.resolveOptions(options);
        this.computeAvailableFormatClasses();
        console.log(this.formats)
    }

    attach(editor: Editor) {
        this.createToolbarButtons();
        this.registerToolbarButtons(editor);
        this.setupEventListeners(editor);
    }

    setupEventListeners(editor: Editor) {
        editor.on('activeBlockElChange', this.findActiveBlockFormat.bind(this, editor))
        editor.on('activeBlockElChange', this.update.bind(this, editor))
    }

    registerToolbarButtons(editor: Editor) {
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'formatting-styles',
            elements: [
                this.formatsButton.getRootElement(),
                this.tagsButton.getRootElement(),
            ],
        });
    }

    createToolbarButtons() {
        // create format buttons
        this.formats.forEach((format) => {
            this.formatButtons[format.id] = createSimpleToolbarButton({
                content: format.name,
                onClick: () => console.log('clicked', format.name)
            });
        })

        this.formatsButton = createSimpleToolbarButton({
            contentFn: () => {
                return this.activeToolbarButtonId
                    ? this.formats.find((format) => format.id === this.activeToolbarButtonId).name
                    : 'Formats';
            },
        });
        this.formatsButton.renderChildren(this.formats.map((format) => this.formatButtons[format.id].getRootElement()))

        this.tagsButton = createSimpleToolbarButton(<SimpleToolbarButtonArguments>{
            content: 'Tags',
        });
        this.tagsButton.hide();
    }

    update({activeBlockEl}) {
        // set active class in formats
        Object.entries(this.formatButtons).forEach(([buttonId, button]) => {
            if (this.activeBlockFormat && buttonId === this.activeBlockFormat.id) {
                button.getButtonElement().classList.add('--active')
            } else {
                button.getButtonElement().classList.remove('--active');
            }
        })

        // update formats root button text
        this.formatsButton.getButtonElement().innerHTML = (this.activeBlockFormat?.name || 'Formats') + ' <span style="font-size: 10px">▼</span>';

        // update tags
        this.tagButtons = {};
        this.tagsButton.destroyChildren();
        this.tagsButton.hide();
        if (this.activeBlockFormat && this.activeBlockFormat.allowedTags?.length) {
            this.activeBlockFormat.allowedTags.forEach((tag: string) => {
                this.tagButtons['tag-' + tag] = createSimpleToolbarButton({
                    content: tag.toUpperCase(),
                    onClick: () => console.log('clicked:', tag)
                })
            })
            this.tagsButton.renderChildren(Object.values(this.tagButtons).map((btn) => btn.getRootElement()));
            this.tagsButton.getButtonElement().innerHTML = activeBlockEl.nodeName.toUpperCase() + ' <span style="font-size: 10px">▼</span>';;
            this.tagsButton.show();
        }
        return [];
    }

    findActiveBlockFormat({activeBlockEl}) {
        if (!activeBlockEl) {
            this.activeBlockFormat = null;
            return false;
        }

        const sortedFormats = [...this.formats].sort((a, b) => b.weight - a.weight);

        const activeBlockFormat = sortedFormats.find((format) => {
            let hasAllClasses = true;
            for (const cls of format.class) {
                if (!activeBlockEl.classList.contains(cls)) {
                    hasAllClasses = false;
                }
            }
            const tagMatch = activeBlockEl.nodeName.toLowerCase() === format.tag?.toLowerCase();
            if (hasAllClasses && tagMatch) {
                return format;
            }
        })

        this.activeBlockFormat = activeBlockFormat || null;
    }

    // todo: this needs fixing!
    formatBlockActionHandler({activeBlockEl}, actionId) {
        console.log(actionId)
        const data = this.actions[actionId];
        let alreadyHasClasses = false;
        let alreadyHasTag = false;

        if (data.tag) {
            if (activeBlockEl.nodeName.toLowerCase() === data.tag.toLowerCase()) {
                alreadyHasTag = true;
            }
        }
        if (data.class?.length) {
            let has = true;
            for (const cls of data.class) {
                if (!activeBlockEl.classList.contains(cls)) {
                    has = true;
                    break;
                }
            }
            alreadyHasClasses = !has;
        }

        if (alreadyHasTag && alreadyHasClasses) {
            // already applied, remove format

            const newP = document.createElement('p');
            newP.innerHTML = activeBlockEl.innerHTML;

            // copy all attributes to new p el
            const existingAttributes = activeBlockEl.getAttributeNames();
            for (const attrName of existingAttributes) {
                if (existingAttributes[attrName]) {
                    newP.setAttribute(attrName, existingAttributes[attrName]);
                }
            }

            // remove classes
            if (data.class?.length) {
                for (const cls of data.class) {
                    newP.classList.remove(cls);
                }
            }

            console.log('remove')

            // replace node with new paragraph
            activeBlockEl.replaceWith(newP);
        } else {
            // let's apply

            let newNode;
            let isReplacementNode = false;

            console.log(activeBlockEl.nodeName.toLowerCase(), data.tag.toLowerCase())
            if (activeBlockEl.nodeName.toLowerCase() !== data.tag.toLowerCase()) {
                console.log('new node')
                // current el nodename is different, create new el, copy innerHTML and attributes
                newNode = document.createElement(data.tag);
                newNode.innerHTML = activeBlockEl.innerHTML;

                // copy attributes
                const existingAttributes = activeBlockEl.getAttributeNames();
                for (const attrName of existingAttributes) {
                    if (existingAttributes[attrName]) {
                        newNode.setAttribute(attrName, existingAttributes[attrName]);
                    }
                }

                isReplacementNode = true;
            } else {
                // re-use existing el
                newNode = activeBlockEl;
            }

            // strip classes that needs stripping
            if (data.stripClasses?.length) {
                newNode.classList.remove(...data.stripClasses);
            }

            // add new classes
            if (data.class?.length) {
                newNode.classList.add(...data.class);
            }

            if (isReplacementNode) {
                activeBlockEl.replaceWith(newNode);
            }
        }
    }

    resolveOptions(options) {
        this.formats = Array.isArray(options.formats) ? this.processFormats(options.formats) : [];
    }

    processFormats(formats) {
        return formats.map((format) => {
            const classArr = format.class?.length ? format.class.split(/\s/) : [];
            format.id = (classArr.length ? classArr.join('_') : format.tag) + '-' + (Math.round(Math.random() * 100000));
            format.weight = classArr.length;
            format.class = classArr;
            format.activeCheckFn = () => this.activeToolbarButtonId === format.id
            return format;
        })

    }

    computeAvailableFormatClasses() {
        this.availableFormatClasses = [...this.formats.reduce((acc, val) => {
            if (val.class?.length) {
                for (const cls of val.class) {
                    acc.add(cls);
                }
            }
            return acc;
        }, new Set())];
    }
}
