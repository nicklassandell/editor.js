import type { EditorPlugin } from '@/lib/types.ts';
import { ToolbarItem } from "../../types.ts";

export default class ToolbarDividerPlugin implements EditorPlugin {
    id = 'divider';

    attach(editor) {
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
