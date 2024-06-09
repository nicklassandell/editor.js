export interface EditorPlugin {
    id: string,
    attach: Function
}

export type EditorConfig = {
    blockTags?: string[]
    inlineTags?: string[]
    validAttributes?: string[]
    toolbar?: string
    toolbarLayout?: string
}

export type ToolbarItem = {
    id: string
    elements: (HTMLElement | (() => HTMLElement))[]
}

export type SimpleToolbarButtonArguments = {
    icon?: string
    content?: string
    contentFn?: Function
    children?: ToolbarItem[]
    childrenFn?: Function
    onClick?: Function
    show?: boolean
}
