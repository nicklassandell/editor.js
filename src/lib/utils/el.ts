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

export const elHasClasses = (el, classes) => {
    for (const cls of classes) {
        if (!el.classList.contains(cls)) {
            return false;
        }
    }
    return true;
}

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
            range.setStart(childNode, corrected);
            hasStart = true;
        }
        if (hasStart && endPos <= length) {
            const corrected = thisLength + (endPos - length);
            range.setEnd(childNode, corrected);
            const selection = window.getSelection() as Selection;
            selection.empty();
            selection.addRange(range);
            return true;
        }
    }
    return false;
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
