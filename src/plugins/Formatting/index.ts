import type { EditorPlugin, SimpleToolbarButtonArguments, ToolbarItem } from '../../types.js';
import { changeNodeName, elHasClasses, tagsMatch } from "../../utils/el.ts";
import SimpleToolbarButton from "../../toolbar/SimpleToolbarButton.ts";
import DropdownToolbarButton from "../../toolbar/DropdownToolbarButton.ts";
import PlumeEditor from "../../editor.ts";

export default class FormattingPlugin implements EditorPlugin {
    id = 'formatting'

    editor: PlumeEditor | null = null;

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
    }

    attach(editor: PlumeEditor) {
        this.editor = editor;
        this.createToolbarButtons();
        this.registerToolbarButtons(editor);
        this.setupEventListeners(editor);
    }

    setupEventListeners(editor: PlumeEditor) {
        editor.on('activeBlockElChange', this.findActiveBlockFormat.bind(this, editor))
        editor.on('activeBlockElChange', this.update.bind(this, editor))
    }

    registerToolbarButtons(editor: PlumeEditor) {
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'formatting-styles',
            elements: [
                this.formatsButton.rootEl,
                this.tagsButton.rootEl,
            ],
        });
    }

    createToolbarButtons() {
        // create format children buttons
        this.formats.forEach((format) => {
            this.formatButtons[format.id] = new SimpleToolbarButton({
                text: format.name,
                onClick: () => this.formatBlock(format)
            });
        })

        // create formats button (root)
        this.formatsButton = new DropdownToolbarButton({
            text: 'Formats',
            tooltip: 'Select format',
            buttonMinWidth: 120,
        });

        // attach format children to root node
        this.formatsButton.renderChildren(Object.values(this.formatButtons).map((button) => button.rootEl))

        // tags button (root node)
        this.tagsButton = new DropdownToolbarButton(<SimpleToolbarButtonArguments>{
            text: 'Tags',
            tooltip: 'Select SEO tag'
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
        this.formatsButton.setText(this.activeBlockFormat?.name || 'Formats');

        // update tags
        this.tagButtons = {};
        this.tagsButton.hide();
        if (this.activeBlockFormat && this.activeBlockFormat.allowedTags?.length) {
            this.activeBlockFormat.allowedTags.forEach((tag: string) => {
                this.tagButtons['tag-' + tag] = new SimpleToolbarButton({
                    text: '<' + tag.toUpperCase() + '>',
                    onClick: () => this.formatBlock({ tag })
                })
                if (tag.toLowerCase() === activeBlockEl.nodeName.toLowerCase()) {
                    this.tagButtons['tag-' + tag].setActive(true);
                }
            })
            this.tagsButton.renderChildren(Object.values(this.tagButtons).map((btn) => btn.rootEl));
            this.tagsButton.setText('<' + activeBlockEl.nodeName.toUpperCase() + '>');
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

    formatBlock({ tag = undefined, defaultTag = undefined, classes = undefined }) {
        const { activeBlockEl } = this.editor;

        const applyTag = tag || defaultTag || 'p';

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
        this.editor.setActiveBlockEl(newNode);
    }
}
