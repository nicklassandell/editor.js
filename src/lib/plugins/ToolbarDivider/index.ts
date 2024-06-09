import type { EditorPlugin, ToolbarItem } from "@/lib/types.ts";
import Editor from "@/lib/editor.ts";

export default class ToolbarDividerPlugin implements EditorPlugin {
    id = 'divider';

    attach(editor: Editor) {
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
