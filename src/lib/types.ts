export interface EditorPlugin {
    id: string,
    attach: Function
}

export type EditorConfig = {
    blockTags: string[]
    inlineTags: string[]
    validAttributes: string[]
    toolbarLayout: string
}

export type Editor = {
    registerActionHandler: Function
    registerToolbarItem: Function
}

export type ToolbarItem = {
    id: string
    content?: string
    contentFn?: Function
    apply?: string
    applyWith?: string
    action?: string
    renderFn?: Function
    children?: ToolbarItem[]
    childrenFn?: Function
    activeCheckFn?: Function
}

export type SimpleToolbarButtonArguments = {
    content?: string
    contentFn?: Function
    children?: ToolbarItem[]
    childrenFn?: Function
    onClick?: Function
    show?: boolean
}
