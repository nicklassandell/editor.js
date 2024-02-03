import { EditorPlugin, ToolbarItem } from '../../types.js';

export class FormattingPlugin implements EditorPlugin {
    id = 'formatting'

    formats = []
    availableFormatClasses = []
    actions = {}
    toolbarButtons: ToolbarItem[] = []
    activeToolbarButtonId: string | null = null

    constructor(options = {}) {
        this.resolveOptions(options);
        this.computeAvailableFormatClasses();
    }

    attach(editorInstance: Editor) {
        const rootToolbarItem: ToolbarItem = {
            id: 'formatting-styles',
            content: () => {
                return this.activeToolbarButtonId
                    ? this.formats.find((format) => format.id === this.activeToolbarButtonId).name
                    : 'Formats';
            },
            children: [],
        };

        this.formats.forEach((format) => {
            const actionId = (format.id).replace('--', '-');
            this.actions[actionId] = {
                tag: format.tag,
                class: format.class,
                stripClasses: this.availableFormatClasses.filter((availClass) => !format.class.includes(availClass)),
            };
            rootToolbarItem.children.push(<ToolbarItem>{
                id: 'formatting-' + actionId,
                content: format.name,
                apply: 'format-block',
                applyWith: actionId,
                activeCheckFn: format.activeCheckFn,
                weight: format.weight,
            })
        })

        this.toolbarButtons = rootToolbarItem.children;

        editorInstance.registerActionHandler('format-block', this.formatBlockActionHandler.bind(this));
        editorInstance.registerToolbarItem(rootToolbarItem);
        editorInstance.on('activeBlockElChange', this.computeActiveToolbarBtn.bind(this))
    }

    computeActiveToolbarBtn(activeBlockEl) {
        if (!activeBlockEl) {
            this.activeToolbarButtonId = null;
            return false;
        }

        const sorted = [...this.toolbarButtons].sort((a, b) => b.weight - a.weight);

        for (const item of sorted) {
            const action = this.actions[item.applyWith];
            let hasAllClasses = true;
            for (const cls of action.class) {
                if (!activeBlockEl.classList.contains(cls)) {
                    hasAllClasses = false;
                }
            }
            const tagMatch = activeBlockEl.nodeName.toLowerCase() === action.tag?.toLowerCase();
            if (hasAllClasses && tagMatch) {
                this.activeToolbarButtonId = item.applyWith;
                break;
            }
        }

    }

    formatBlockActionHandler({activeBlockEl}, actionId) {
        const data = this.actions[actionId];
        let alreadyHasClasses = true;
        let alreadyHasTag = true;

        if (data.tag) {
            if (activeBlockEl.nodeName.toLowerCase() !== data.tag.toLowerCase()) {
                alreadyHasTag = false;
            }
        }
        if (data.class.length) {
            for (const cls of data.class) {
                if (!activeBlockEl.classList.contains(cls)) {
                    alreadyHasClasses = false;
                    break;
                }
            }
        }

        if (alreadyHasTag && alreadyHasClasses) {
            // already applied

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
            for (const cls of data.class) {
                newP.classList.remove(cls);
            }

            // replace node with new paragraph
            activeBlockEl.replaceWith(newP);
        } else {
            // let's apply

            let newNode;
            let isReplacementNode = false;

            if (activeBlockEl.nodeName.toLowerCase() !== data.tag.toLowerCase()) {
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
            newNode.classList.remove(...data.stripClasses);

            // add new classes
            newNode.classList.add(...data.class);

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
