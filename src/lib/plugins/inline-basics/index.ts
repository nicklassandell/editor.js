import {
    closest, expandSelectionByWord,
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
            content: 'Italic',
            onClick: () => this.applyInlineTag(editor, 'i'),
        });
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'italic',
            elements: [this.buttons.italicButton.getRootElement()],
        });


        this.buttons.boldButton = createSimpleToolbarButton({
            content: 'Bold',
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
        if (!selection.anchorNode) return;

        const range = selection.getRangeAt(0);
        const existingTag = closest(tag, range.commonAncestorContainer);

        if (existingTag) {
            const parentEl = existingTag.parentElement;
            const range = selection.getRangeAt(0);
            const startWithin = range.startOffset;
            const endWithin = range.endOffset;
            const relativeStartIndex = getElStartIndexRelativeToParent(parentEl, existingTag);

            unwrapEl(existingTag);


            const startIndex = relativeStartIndex + startWithin;
            const endIndex = relativeStartIndex + endWithin;
            console.log('start:', startIndex, 'end:', endIndex);
            // console.log(parentEl)
            const res = setSelectionWithinElement(parentEl, startIndex, endIndex);
            console.log(res)
        } else {
            // if nothing is selected, select word around cared
            if (selection.isCollapsed) {
                expandSelectionByWord()
            }
            if (selection.isCollapsed) {
                console.error("Couldn't expand selection");
                return;
            }

            const rrr = selection.getRangeAt(0);
            const newEl = wrapRange(rrr, tag);

            const range = document.createRange();
            range.setStart(newEl.childNodes[0], 0);
            range.setEnd(newEl.childNodes[0], newEl.childNodes[0].textContent.length);

            const sel = window.getSelection() as Selection;
            sel.empty();
            sel.addRange(range);

        }

        this.editor.update();
    }
}
