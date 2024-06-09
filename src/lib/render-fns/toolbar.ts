import { SimpleToolbarButtonArguments } from "../types.ts";

import linkIcon from '../../assets/icons/link.svg';
import removeLinkIcon from '../../assets/icons/remove-link.svg';
import boldIcon from '../../assets/icons/bold.svg';
import italicIcon from '../../assets/icons/italic.svg';
import sourceCodeIcon from '../../assets/icons/sourcecode.svg';

const icons = {
    'remove-link': removeLinkIcon,
    link: linkIcon,
    bold: boldIcon,
    italic: italicIcon,
    sourcecode: sourceCodeIcon,
};

export const createSimpleToolbarDropdown = () => {
    const dropdownEl = document.createElement('div');
    dropdownEl.classList.add('children');// todo: rename class
    return dropdownEl;
}

export const createSimpleToolbarButton = ({ content, contentFn, icon, onClick, show: shouldShow }: SimpleToolbarButtonArguments) => {

    const toolbarBtnHolderEl = document.createElement('div');
    toolbarBtnHolderEl.classList.add('toolbar-btn-holder');
    if (shouldShow === false) {
        toolbarBtnHolderEl.style.display = 'none';
    }

    const btnEl = document.createElement('button');
    if (icon) {
        toolbarBtnHolderEl.classList.add('--has-icon');
        const src = icons[icon];
        btnEl.innerHTML = `<img src="${src}" />`;
    } else {
        toolbarBtnHolderEl.classList.add('--has-text');
        btnEl.innerHTML = toolbarButtonContentFn({ content, contentFn });
    }
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
    const setVisibility = (bool) => bool ? show() : hide();

    const setActive = (bool) => {
        if (bool) {
            btnEl.classList.add('--active')
        } else {
            btnEl.classList.remove('--active')
        }
    }

    return {
        setVisibility,
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
