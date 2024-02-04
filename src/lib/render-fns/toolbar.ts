import { SimpleToolbarButtonArguments } from "../types.ts";

export const createSimpleToolbarDropdown = () => {
    const dropdownEl = document.createElement('div');
    dropdownEl.classList.add('children');// todo: rename class
    return dropdownEl;
}

export const createSimpleToolbarButton = ({
                                              content,
                                              contentFn,
                                              onClick
                                          }: SimpleToolbarButtonArguments) => {

    const toolbarBtnHolderEl = document.createElement('div');
    toolbarBtnHolderEl.classList.add('toolbar-btn-holder');

    const btnEl = document.createElement('button');
    btnEl.innerHTML = toolbarButtonContentFn({content, contentFn});
    if (typeof onClick === 'function') {
        btnEl.addEventListener('click', onClick);
    }
    toolbarBtnHolderEl.insertAdjacentElement('afterbegin', btnEl);

    const getDropdownElement = () => {
        return toolbarBtnHolderEl.querySelector(':scope > .children') || null;
    }

    const renderChildren = (childNodes: Element | Element[]) => {
        let dropdownEl = getDropdownElement();
        const alreadyExists = !!dropdownEl;
        if (dropdownEl) {
            dropdownEl.innerHTML = '';
        } else {
            dropdownEl = createSimpleToolbarDropdown();
        }

        childNodes = Array.isArray(childNodes) ? childNodes : (childNodes instanceof Element ? [childNodes] : [])

        if (childNodes?.length) {
            childNodes.forEach((childNode: Element) => dropdownEl.insertAdjacentElement('beforeend', childNode));
        }

        if (!alreadyExists) {
            toolbarBtnHolderEl.insertAdjacentElement('beforeend', dropdownEl)
        }
    }

    const destroyChildren = () => {
        const dropdownEl = getDropdownElement();
        if (dropdownEl) {
            dropdownEl.outerHTML = '';
        }
    }

    const getRootElement = () => toolbarBtnHolderEl;
    const getButtonElement = () => btnEl;

    const hide = () => toolbarBtnHolderEl.style.display = 'none';
    const show = () => toolbarBtnHolderEl.style.display = '';

    return {
        hide,
        show,
        getRootElement,
        getButtonElement,
        renderChildren,
        destroyChildren,
        getDropdownElement,
    };
}

export const simpleToolbarButtonFn = ({
                                          content,
                                          contentFn,
                                          children,
                                          childrenFn,
                                          onClick
                                      }: SimpleToolbarButtonArguments) => {
    const computedChildren = typeof childrenFn === 'function' ? childrenFn() : children;

    let childrenHolderEl;

    if (computedChildren?.length) {
        childrenHolderEl = document.createElement('div');
        childrenHolderEl.classList.add('children');
        for (const childEl of computedChildren) {
            childrenHolderEl.insertAdjacentElement('beforeend', childEl);
        }
    }

    const renderChildren = () => {
        childrenHolderEl.innerHTML = '';
        return (childNodes) => {
            if (childNodes?.length) {
                childNodes.forEach((childNode) => childrenHolderEl.insertAdjacentElement('afterbegin', childNode));
            }
        }
    }

    const toolbarBtnHolderEl = document.createElement('div');
    toolbarBtnHolderEl.classList.add('toolbar-btn-holder');

    const btnEl = document.createElement('button');
    btnEl.innerHTML = toolbarButtonContentFn({content, contentFn});
    if (typeof onClick === 'function') {
        btnEl.addEventListener('click', onClick);
    }

    toolbarBtnHolderEl.insertAdjacentElement('afterbegin', btnEl);
    if (childrenHolderEl) {
        toolbarBtnHolderEl.insertAdjacentElement('afterbegin', childrenHolderEl);
    }

    return toolbarBtnHolderEl;
}

export const toolbarDividerFn = () => {
    const node = document.createElement('span');
    node.classList.add('divider');
    return node;
}

export const toolbarButtonContentFn = ({content, contentFn}) => {
    return typeof contentFn === 'function' ? contentFn(this) : content;
}
