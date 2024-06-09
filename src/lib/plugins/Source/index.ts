import { Editor, EditorPlugin, ToolbarItem } from "../../types.ts";
import { Modal } from '../../utils/modal.js';
import SimpleToolbarButton from '../../toolbar/SimpleToolbarButton.js';
import sourceCodeIcon from '@/assets/icons/sourcecode.svg';

export default class SourcePlugin implements EditorPlugin {
    id = 'source'
    sourceButton = null
    editor = null

    attach(editor: Editor) {
        this.editor = editor;
        this.sourceButton = new SimpleToolbarButton({
            icon: sourceCodeIcon,
            tooltip: 'Edit Source',
            onClick: () => this.handleClick(),
        });
        editor.registerToolbarItem(<ToolbarItem>{
            id: 'source',
            elements: [this.sourceButton.rootEl],
        });
    }

    handleClick() {
        const html = this.editor.contentEl.innerHTML;

        const modal = new Modal({ width: 'md' });
        modal.setTitle('Edit Source Code');
        modal.setContentHTML(`
            <textarea class="editor-modal-input" rows="24" placeholder="Enter HTML...">
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
                btnStyle: 'primary',
                text: 'Save',
                onClick: () => {
                    const newHtml = modal.contentEl.querySelector('textarea').value;
                    this.editor.setHtml(newHtml);
                    modal.destroy();
                }
            }
        ])
        modal.contentEl.querySelector('textarea').value = html;
    }
}
