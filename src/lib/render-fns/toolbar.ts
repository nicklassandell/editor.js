export const simpleToolbarItemFn = (item, editor) => {
    const attrs = [];
    // console.log(item)

    if (item.apply) {
        attrs.push(`data-apply="${item.apply}"`);
        attrs.push(`data-apply-with="${item.applyWith || ''}"`);
    }

    const show = typeof item.showCheckFn === 'function' ? item.showCheckFn() : true;

    if (!show) return ''; // todo: not nice

    const children = typeof item.children === 'function' ? item.children() : item.children;

    let childrenHtml = '';
    if (children?.length) {
        childrenHtml += '<div class="children">';
        for (const child of children) {
            childrenHtml += simpleToolbarItemFn(child, editor);
        }
        childrenHtml += '</div>';
    }

    const isActive = item.activeCheckFn ? item.activeCheckFn(editor) : false;

    return `
        <div class="toolbar-btn-holder">
            <button ${attrs.join(' ')} class="${isActive ? '--active' : ''}">
                ${toolbarButtonContentFn(item)}
            </button>
            ${childrenHtml}
        </div>
    `;
}

export const toolbarDividerFn = () => {
    return '<span class="divider"></span>';
}


export const toolbarButtonContentFn = (item) => {
    return typeof item.content === 'function' ? item.content(this) : item.content;
}
