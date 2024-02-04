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

        const tagToolbarItem: ToolbarItem = {
            id: 'formatting-tags',
            content: 'Tags',
            showCheckFn: () => {
                return this.activeToolbarButtonId
                    ? !!this.formats.find((format) => format.id === this.activeToolbarButtonId)?.allowedTags?.length
                    : false;
            },
            children: () => {
                const active = this.activeToolbarButtonId
                    ? this.formats.find((format) => format.id === this.activeToolbarButtonId)
                    : null;
                if (active && active.allowedTags?.length) {
                    return active.allowedTags.map((tag: string) => <ToolbarItem>{
                        id: 'formatting-tag-' + tag,
                        content: tag.toUpperCase(),
                        apply: 'format-block',
                        applyWith: 'formatting-tag-' + tag,
                    })
                }
                return [];
            }
        }

        this.formats.forEach((format) => {
            // todo: temporary
            for (const tag of ['h1', 'h2', 'h3', 'h4']) {
                this.actions['formatting-tag-' + tag] = {
                    tag: tag,
                };
            }

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
        editorInstance.registerToolbarItem(tagToolbarItem);
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
