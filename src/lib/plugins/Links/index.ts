import { closest, wrapRange } from '../../utils/el';
import { Editor, EditorPlugin, ToolbarItem } from "../../types.ts";
import { Modal } from '../../utils/modal.js';
import SimpleToolbarButton from "../../toolbar/SimpleToolbarButton";

import linkIcon from '@/assets/icons/link.svg';
import removeLinkIcon from '@/assets/icons/remove-link.svg';

export default class LinksPlugin implements EditorPlugin {
    id = 'links'

    editLinkButton = null
    removeLinkButton = null

    editor = null

    attach(editor: Editor) {

        this.editor = editor;

        this.editLinkButton = new SimpleToolbarButton({
            icon: linkIcon,
            onClick: (e) => this.handleEditClick(e),
        });
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'edit-link',
            elements: [this.editLinkButton.rootEl],
        });

        this.removeLinkButton = new SimpleToolbarButton({
            icon: removeLinkIcon,
            onClick: (e) => this.handleRemoveClick(e),
            show: false,
        });
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'remove-link',
            elements: [this.removeLinkButton.rootEl],
        });

        // button active states
        editor.on('activeInlineElChange', (inlineEl) => {
            const isLinkEl = inlineEl ? !!inlineEl.closest('a') : false;
            this.editLinkButton.setActive(isLinkEl);
            this.removeLinkButton.setVisibility(isLinkEl);
        })
    }

    handleRemoveClick() {
        const linkEl = this.editor.activeInlineEl && this.editor.activeInlineEl.closest('a');
        if (!linkEl) return;
        linkEl.outerHTML = linkEl.innerHTML;
        this.editor.setActiveInlineEl(null);
    }

    handleEditClick(e) {
        const selection = window.getSelection() as Selection;
        if (!selection.anchorNode) return;

        const range = selection.getRangeAt(0);
        let linkEl = closest('a', range.commonAncestorContainer);

        // if no link exists and nothing is selected, exit
        if (!linkEl && !range.toString()) {
            return;
        }

        // if no link el exists, wrap selected text first
        if (!linkEl) {
            linkEl = wrapRange(range, 'a');
        }

        const currHref = linkEl.getAttribute('href') || '';

        const modal = new Modal();
        modal.setTitle('Edit Link');
        modal.setContentHTML(`
            <p style="margin: 0 0 4px; font-size: .9rem;">Link URL</p>
            <input class="editor-modal-input" placeholder="Enter link url..." value="${currHref}">
        `);
        modal.setFooterActions([
            {
                btnStyle: 'secondary',
                text: 'Cancel',
                onClick() {
                    modal.destroy();
                }
            },
            {
                btnStyle: 'secondary',
                text: 'Remove Link',
                onClick: () => {
                    linkEl.outerHTML = linkEl.innerHTML;
                    modal.destroy();
                    this.editor.setActiveInlineEl(null);
                }
            },
            {
                btnStyle: 'primary',
                text: 'Save',
                onClick() {
                    const newHref = modal.contentEl.querySelector('.editor-modal-input').value;
                    linkEl.setAttribute('href', newHref);
                    modal.destroy();
                }
            }
        ])
        modal.contentEl.querySelector('input').focus();
    }
}
