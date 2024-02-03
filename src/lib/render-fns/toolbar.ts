export const simpleToolbarItemFn = (item, editor) => {
    const attrs = [];
    // console.log(item)

    if (item.apply) {
        attrs.push(`data-apply="${item.apply}"`);
        attrs.push(`data-apply-with="${item.applyWith || ''}"`);
    }


    let childrenHtml = '';
    if (item.children?.length) {
        childrenHtml += '<div class="children">';
        for (const child of item.children) {
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
