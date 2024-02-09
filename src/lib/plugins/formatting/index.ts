import { EditorPlugin, SimpleToolbarButtonArguments, ToolbarItem } from '../../types.js';
import { createSimpleToolbarButton } from "../../render-fns/toolbar.ts";
import { changeNodeName, classesMatch, elHasClasses, tagsMatch } from "../../utils/el.ts";

export class FormattingPlugin implements EditorPlugin {
    id = 'formatting'

    editor: Editor | null = null;

    formats = []
    availableFormatClasses = []
    activeBlockFormat: any = null

    formatsButton: any;
    tagsButton: any;
    formatButtons: Record<string, any> = {}
    tagButtons: Record<string, any> = {}

    constructor(options = {}) {
        this.resolveOptions(options);
        this.computeAvailableFormatClasses();
        console.log('formats:', this.formats)
    }

    attach(editor: Editor) {
        this.editor = editor;
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
        // create format children buttons
        this.formats.forEach((format) => {
            this.formatButtons[format.id] = createSimpleToolbarButton({
                content: format.name,
                onClick: () => this.formatBlock(format)
            });
        })

        // create formats button (root)
        this.formatsButton = createSimpleToolbarButton({
            contentFn: () => {
                return this.activeToolbarButtonId
                    ? this.formats.find((format) => format.id === this.activeToolbarButtonId).name
                    : 'Formats';
            },
        });

        // attach format children to root node
        this.formatsButton.renderChildren(Object.values(this.formatButtons).map((button) => button.getRootElement()))

        // tags button (root node)
        this.tagsButton = createSimpleToolbarButton(<SimpleToolbarButtonArguments>{
            content: 'Tags',
        });
        this.tagsButton.hide();
    }

    update({ activeBlockEl }) {
        // set active class in formats
        Object.entries(this.formatButtons).forEach(([buttonId, button]) => {
            const isActive = this.activeBlockFormat && buttonId === this.activeBlockFormat.id;
            button.setActive(isActive);
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
                    onClick: () => this.formatBlock({ tag })
                })
                if (tag.toLowerCase() === activeBlockEl.nodeName.toLowerCase()) {
                    this.tagButtons['tag-' + tag].setActive(true);
                }
            })
            this.tagsButton.renderChildren(Object.values(this.tagButtons).map((btn) => btn.getRootElement()));
            this.tagsButton.getButtonElement().innerHTML = activeBlockEl.nodeName.toUpperCase() + ' <span style="font-size: 10px">▼</span>';
            this.tagsButton.show();
        }
        return [];
    }

    findActiveBlockFormat({ activeBlockEl }) {
        if (!activeBlockEl) {
            this.activeBlockFormat = null;
            return false;
        }

        const sortedFormats = [...this.formats].sort((a, b) => b.weight - a.weight);

        const activeBlockFormat = sortedFormats.find((format) => {
            const hasAllClasses = elHasClasses(activeBlockEl, format.classes);
            const tagMatch = format.tag ? tagsMatch(activeBlockEl, format.tag) : true;
            return hasAllClasses && tagMatch;
        })

        this.activeBlockFormat = activeBlockFormat || null;
    }

    resolveOptions(options) {
        this.formats = Array.isArray(options.formats) ? this.processFormats(options.formats) : [];
    }

    processFormats(formats) {
        // todo: structuredClone should not be necessary
        return structuredClone(formats).map((format) => {
            const classArr = format.classes?.length ? format.classes : [];
            format.id = (classArr.length ? classArr.join('_') : format.tag) + '-' + (Math.round(Math.random() * 100000));
            format.weight = classArr.length;
            format.classes = classArr;
            format.activeCheckFn = () => this.activeToolbarButtonId === format.id
            return format;
        })

    }

    computeAvailableFormatClasses() {
        this.availableFormatClasses = [...this.formats.reduce((acc, val) => {
            if (val.classes?.length) {
                for (const cls of val.classes) {
                    acc.add(cls);
                }
            }
            return acc;
        }, new Set())];
    }

    formatBlock({ tag, defaultTag, classes }) {
        const { activeBlockEl } = this.editor;

        const applyTag = tag || defaultTag || 'p';

        console.log('applying to el:', activeBlockEl)
        console.log('applying tag:', applyTag)
        console.log('applying classes:', classes)

        // console.log('already has classes?', clsMatches);
        // console.log('already has tag?', tagMatches);
        // console.log('existing classes:', activeBlockEl.classList)
        // console.log('new classes:', classes)
        // console.log('tag and classes match?', tagMatches && clsMatches)


        const newNode = changeNodeName(activeBlockEl, applyTag);

        if (classes !== undefined) {
            // strip classes that needs stripping
            for (const stripClass of this.availableFormatClasses) {
                if (classes?.length && classes.includes(stripClass)) continue;
                newNode.classList.remove(stripClass);
            }

            // apply new classes
            newNode.classList.add(...classes);
        }

        activeBlockEl.replaceWith(newNode);
    }
}
