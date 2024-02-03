// essentially the same as el.closest() but handles text nodes
export const closest = (tag: string, startNode: Node): Element | null => {
    let currentNode: Node = startNode;
    // todo: i think loop is pointless, should never go up more than 1 step before calling .closest()
    while (currentNode && currentNode !== document.body) {
        if (currentNode instanceof HTMLElement) {
            const found = currentNode.closest(tag);
            if (found) {
                return found;
            }
        }
        currentNode = currentNode.parentNode as Node;
    }
    return null;
}
