import { SimpleToolbarButtonArguments } from "../types.ts";

export const createSimpleToolbarDropdown = () => {
    const dropdownEl = document.createElement('div');
    dropdownEl.classList.add('children');// todo: rename class
    return dropdownEl;
}

export const createSimpleToolbarButton = ({ content, contentFn, onClick }: SimpleToolbarButtonArguments) => {

    const toolbarBtnHolderEl = document.createElement('div');
    toolbarBtnHolderEl.classList.add('toolbar-btn-holder');

    const btnEl = document.createElement('button');
    btnEl.innerHTML = toolbarButtonContentFn({ content, contentFn });
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

    const setActive = (bool) => {
        if (bool) {
            btnEl.classList.add('--active')
        } else {
            btnEl.classList.remove('--active')
        }
    }

    return {
        hide,
        show,
        setActive,
        getRootElement,
        getButtonElement,
        renderChildren,
        destroyChildren,
        getDropdownElement,
    };
}

export const toolbarDividerFn = () => {
    const node = document.createElement('span');
    node.classList.add('divider');
    return node;
}

export const toolbarButtonContentFn = ({ content, contentFn }) => {
    return typeof contentFn === 'function' ? contentFn(this) : content;
}
