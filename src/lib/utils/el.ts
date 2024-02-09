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


// copy attributes
// const existingAttributes = activeBlockEl.getAttributeNames();
// for (const attrName of existingAttributes) {
//     if (existingAttributes[attrName]) {
//         newNode.setAttribute(attrName, existingAttributes[attrName]);
//     }
// }
