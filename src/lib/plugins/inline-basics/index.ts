import {
    closest, expandRangeToWordBoundary,
    getElStartIndexRelativeToParent,
    setSelectionWithinElement,
    unwrapEl,
    wrapRange
} from '../../utils/el';
import { Editor, EditorPlugin, ToolbarItem } from "../../types.ts";
import { createSimpleToolbarButton } from "../../render-fns/toolbar.ts";

export class InlineBasicsPlugin implements EditorPlugin {
    id = 'inline-basics'
    buttons = {}
    editor = null

    attach(editor: Editor) {

        this.editor = editor;

        this.buttons.italicButton = createSimpleToolbarButton({
            icon: 'italic',
            onClick: () => this.applyInlineTag(editor, 'i'),
        });
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'italic',
            elements: [this.buttons.italicButton.getRootElement()],
        });


        this.buttons.boldButton = createSimpleToolbarButton({
            icon: 'bold',
            onClick: () => this.applyInlineTag(editor, 'strong'),
        });
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'strong',
            elements: [this.buttons.boldButton.getRootElement()],
        });

        // button active states
        editor.on('activeInlineElChange', (inlineEl) => {
            const isItalic = inlineEl && !!inlineEl.closest('i');
            const isBold = inlineEl && !!inlineEl.closest('strong');
            this.buttons.italicButton.setActive(isItalic);
            this.buttons.boldButton.setActive(isBold);
        })
    }

    applyInlineTag({}, tag: string) {
        if (!tag) return;

        const selection = window.getSelection() as Selection;
        if (!selection.anchorNode || !(selection.anchorNode instanceof Text)) {
            return;
        }

        const range = selection.getRangeAt(0);
        const existingTag = closest(tag, range.commonAncestorContainer);

        if (!existingTag) {
            const currentSelectionLength = selection.focusOffset - selection.anchorOffset;

            const { range, startOffsetDiff } = expandRangeToWordBoundary(selection.getRangeAt(0));
            const newEl = wrapRange(range, tag);
            const textNode = newEl.childNodes[0];

            // restore caret position/selection
            const sel = window.getSelection() as Selection;
            sel.setBaseAndExtent(textNode, -startOffsetDiff, textNode, -startOffsetDiff + currentSelectionLength)
        } else {
            const parentEl = existingTag.parentElement;
            const range = selection.getRangeAt(0);
            const startWithin = range.startOffset;
            const endWithin = range.endOffset;
            const relativeStartIndex = getElStartIndexRelativeToParent(parentEl, existingTag);

            unwrapEl(existingTag);

            const startIndex = relativeStartIndex + startWithin;
            const endIndex = relativeStartIndex + endWithin;
            setSelectionWithinElement(parentEl, startIndex, endIndex);
        }

        this.editor.update();
    }
}
