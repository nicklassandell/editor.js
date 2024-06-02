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

// if node is text node, returns parent element
export const getEl = (node) => {
    return node instanceof Text ? node.parentElement : node;
}

export const elHasClasses = (el, classes) => {
    for (const cls of classes) {
        if (!el.classList.contains(cls)) {
            return false;
        }
    }
    return true;
}

export const sanitizeHtml = (html) => {

    const rootNode = document.createElement('div');
    rootNode.innerHTML = html;

    console.log(rootNode.children)

    if (rootNode?.children?.length) {
        for (const child of rootNode.children) {
            // cleanupInlineStyles(child);
            stripIllegalTags(child);
        }
    }
    console.log(rootNode.innerHTML)
    return rootNode.innerHTML;
}

export const cleanupInlineStyles = (el) => {
    el.removeAttribute('style');
}

export const stripIllegalTags = (el) => {
    if (el.parentNode && !['P', 'H1', 'H2', 'H3', 'H4', 'EM', 'STRONG'].includes(el.nodeName)) {
        el.outerHTML = ' ' + el.innerHTML + ' ';
    }
}

export const insertHTMLAtCurrentCaretPosition = (html) => {
    const selection = getSelection();

    if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        const textNode = document.createTextNode(html);
        range.insertNode(html);

        console.log('inserting:', textNode)
        range.deleteContents();
        range.insertNode(textNode);

        // Place the caret after the inserted content
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
}

export const insertTextAtCaret = (text) => {
    const selection = window.getSelection();
    if (selection.rangeCount) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);

        // Move the caret to the end of the inserted text
        range.setStartAfter(textNode);
        range.collapse(true);
        // Restore the selection
        selection.removeAllRanges();
        selection.addRange(range);
    }
};



export const classesMatch = (el, classes) => {
    let classesMatch = false;

    if (classes?.length) {
        let hasAll = true;

        for (const cls of classes) {
            if (!el.classList.contains(cls)) {
                hasAll = false;
                break;
            }
        }

        classesMatch = hasAll;
    }

    return classesMatch;
}

export const tagsMatch = (el, tag) => {
    let tagMatches = false;

    if (tag) {
        if (el.nodeName.toLowerCase() === tag.toLowerCase()) {
            tagMatches = true;
        }
    }

    return tagMatches;
}

export const changeNodeName = (el, newTag) => {
    let newNode;

    if (el.nodeName.toLowerCase() !== newTag.toLowerCase()) {
        newNode = document.createElement(newTag);
        newNode.innerHTML = el.innerHTML;
        newNode.classList = el.classList;
        // todo: copy allowed attributes
    } else {
        newNode = el;
    }

    return newNode;
}

export const isLinkEl = (el) => {
    return el?.nodeName === 'A';
}

export const unwrapEl = (el) => {
    el.outerHTML = el.innerHTML;
}

export const wrapRange = (range, tag) => {
    const wrapperEl = document.createElement(tag);
    wrapperEl.textContent = range.toString();
    range.surroundContents(wrapperEl);
    return wrapperEl;
}

export const getElStartIndexRelativeToParent = (parentEl, innerEl) => {
    let index = 0;
    for (const childNode of parentEl.childNodes) {
        if (childNode instanceof HTMLElement && childNode.isSameNode(innerEl)) {
            break;
        }
        if (childNode instanceof HTMLElement) {
            index += childNode.innerText.length;
        } else {
            index += childNode.textContent.length;
        }
    }
    return index;
}

export const setSelectionWithinElement = (el, startPos, endPos) => {
    const range = document.createRange();
    let length = 0;
    let hasStart = false;

    // todo: handle nested els?
    for (const childNode of el.childNodes) {
        let thisLength = 0;
        if (childNode instanceof HTMLElement) {
            length += childNode.innerText.length;
            thisLength = childNode.innerText.length;
        } else {
            length += childNode.textContent.length;
            thisLength = childNode.textContent.length;
        }

        if (startPos <= length) {
            const corrected = thisLength + (startPos - length);
            try {
                range.setStart(childNode, corrected);
            } catch (e) {
                return;
            }
            hasStart = true;
        }
        if (hasStart && endPos <= length) {
            const corrected = thisLength + (endPos - length);
            try {
                range.setEnd(childNode, corrected);
            } catch (e) {
                return;
            }
            const selection = window.getSelection() as Selection;
            selection.empty();
            selection.addRange(range);
            return true;
        }
    }
    return false;
}

export const expandRangeByWord = () => {
    // todo: check for whitespace around caret first?
    const selection = window.getSelection() as Selection;
    const orgRange = selection.getRangeAt(0)

    if (!selection.isCollapsed) {
        return selection.getRangeAt(0)
    }

    const clonedRange = selection.getRangeAt(0).cloneRange();


    selection.modify('extend', 'backward', 'word');
    const start = Math.min(selection.anchorOffset, selection.focusOffset)
    selection.modify('extend', 'forward', 'word');
    selection.modify('extend', 'forward', 'word');
    const end = Math.max(selection.anchorOffset, selection.focusOffset)

    // restore initial range
    setTimeout(() => {
        selection.empty();
        selection.addRange(clonedRange);
    })
    console.log('orgRange:', orgRange);
    console.log('clonedRange:', clonedRange);

    const range = selection.getRangeAt(0);
    range.setStart(range.commonAncestorContainer, start);
    range.setEnd(range.commonAncestorContainer, end);
    return range;
}

export const expandRangeToWordBoundary = (orgRange: Range) => {
    const range = orgRange.cloneRange();
    const startNode = range.startContainer;
    let startOffset = range.startOffset;
    const endNode = range.endContainer;
    let endOffset = range.endOffset;

    // Expand start boundary
    while (startOffset > 0 && /\w/.test(startNode.textContent[startOffset - 1])) {
        startOffset--;
    }

    // Expand end boundary
    while (endOffset < endNode.textContent.length && /\w/.test(endNode.textContent[endOffset])) {
        endOffset++;
    }

    const startOffsetDiff = startOffset - range.startOffset;
    const endOffsetDiff = endOffset - range.endOffset;
    console.log('startOffsetDiff', startOffsetDiff, 'endOffsetDiff', endOffsetDiff)

    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);

    return {
        range,
        startOffsetDiff,
        endOffsetDiff,
    }
}

export const expandSelectionByWord = () => {
    // todo: check for whitespace around caret first?
    const selection = window.getSelection() as Selection;
    selection.modify('extend', 'backward', 'word');
    const start = Math.min(selection.anchorOffset, selection.focusOffset)
    selection.modify('extend', 'forward', 'word');
    selection.modify('extend', 'forward', 'word');
    const end = Math.max(selection.anchorOffset, selection.focusOffset)

    const range = selection.getRangeAt(0);
    range.setStart(range.commonAncestorContainer, start);
    range.setEnd(range.commonAncestorContainer, end);
    selection.empty();
    selection.addRange(range);
}

// copy attributes
// const existingAttributes = activeBlockEl.getAttributeNames();
// for (const attrName of existingAttributes) {
//     if (existingAttributes[attrName]) {
//         newNode.setAttribute(attrName, existingAttributes[attrName]);
//     }
// }
