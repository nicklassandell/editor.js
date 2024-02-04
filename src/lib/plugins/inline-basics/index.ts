import { closest } from '../../utils/el';
import { Editor, EditorPlugin, SimpleToolbarButtonArguments, ToolbarItem } from "../../types.ts";
import { simpleToolbarButtonFn } from "../../render-fns/toolbar.ts";

export class InlineBasicsPlugin implements EditorPlugin {
    id = 'inline-basics'

    attach(editor: Editor) {
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'italic',
            elements: [
                simpleToolbarButtonFn(<SimpleToolbarButtonArguments>{
                    content: 'Italic',
                    onClick: () => this.applyInlineTag(editor, 'i'),
                }),
            ],
        });

        editor.registerToolbarItem(<ToolbarItem>{
            id: 'strong',
            elements: [
                simpleToolbarButtonFn(<SimpleToolbarButtonArguments>{
                    content: 'Strong',
                    onClick: () => this.applyInlineTag(editor, 'strong'),
                }),
            ],
        });

    }

    applyInlineTag({}, tag: string) {
        if (!tag) return;

        const selection = window.getSelection() as Selection;
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
