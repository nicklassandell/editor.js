import { closest, isLinkEl, unwrapEl, wrapRange } from '../../utils/el';
import { Editor, EditorPlugin, ToolbarItem } from "../../types.ts";
import { createSimpleToolbarButton } from "../../render-fns/toolbar.ts";

export class LinksPlugin implements EditorPlugin {
    id = 'links'

    linkButton = null

    editor = null

    attach(editor: Editor) {

        this.editor = editor;

        this.linkButton = createSimpleToolbarButton({
            content: 'Link',
            onClick: (e) => this.handleClick(e),
        });
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'link',
            elements: [this.linkButton.getRootElement()],
        });

        // button active states
        editor.on('activeInlineElChange', (inlineEl) => {
            const isLinkEl = inlineEl && !!inlineEl.closest('a');
            this.linkButton.setActive(isLinkEl);
        })
    }

    handleClick(e) {
        const selection = window.getSelection() as Selection;
        if (!selection.anchorNode) return;

        const range = selection.getRangeAt(0);
        let linkEl = closest('a', range.commonAncestorContainer);

        // remove link if it exists and shift is pressed
        if (e.shiftKey && linkEl) {
            unwrapEl(linkEl);
            return;
        }

        // if no link exists and nothing is selected, exit
        if (!linkEl && !range.toString()) {
            return;
        }

        // if no link el exists, wrap selected text first
        if (!linkEl) {
            linkEl = wrapRange(range, 'a');
        }

        const href = linkEl.getAttribute('href') || '';
        const url = prompt('Link URL', href);

        linkEl.setAttribute('href', url);
    }
}
