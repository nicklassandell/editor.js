import { closest } from '../../utils/el';
import { Editor, EditorPlugin, ToolbarItem } from "../../types.ts";
import { createSimpleToolbarButton } from "../../render-fns/toolbar.ts";

export class InlineBasicsPlugin implements EditorPlugin {
    id = 'inline-basics'

    buttons = {}

    attach(editor: Editor) {

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

        const wrapperEl = document.createElement(tag);
        // wrapperEl.appendChild(range.extractContents());
        wrapperEl.textContent = range.toString();

        const existingTag = closest(tag, range.commonAncestorContainer);
        if (existingTag) {
            // remove
            console.log('removing')
            const newRange = document.createRange();
            newRange.selectNodeContents(existingTag);
            selection.removeAllRanges();
            selection.addRange(newRange);

            existingTag.outerHTML = existingTag.innerHTML;
            // existingTag.parentNode.replaceChild(existingTag.firstChild, existingTag)
        } else if (!selection.isCollapsed) {
            // add
            console.log('wrapping')
            range.surroundContents(wrapperEl);
            const textNode = wrapperEl.firstChild as Node;

            const newRange = document.createRange();
            newRange.selectNodeContents(textNode);

            // const selection = window.getSelection();
            // selection.removeAllRanges();
            // selection.addRange(newRange);
            // this.setSelection(selection)
        }
    }
}
