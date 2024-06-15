import type { EditorPlugin, ToolbarItem } from "../../types.ts";
import PlumeEditor from "../../editor.ts";

export default class ToolbarDividerPlugin implements EditorPlugin {
    id = 'divider';

    attach(editor: PlumeEditor) {
        editor.registerToolbarItem(<ToolbarItem>{
            id: '|',
            elements: [
                () => {
                    const node = document.createElement('span');
                    node.classList.add('divider');
                    return node;
                }
            ],
        });
    }
}
