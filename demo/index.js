import PlumeEditor from 'plumejs/editor.ts';
import InlineBasicsPlugin from 'plumejs/plugins/InlineBasics/index.ts';
import FormattingPlugin from 'plumejs/plugins/Formatting/index.ts';
import LinksPlugin from 'plumejs/plugins/Links/index.ts';
import SourcePlugin from 'plumejs/plugins/Source/index.ts';
import ToolbarDividerPlugin from 'plumejs/plugins/ToolbarDivider/index.ts';
import 'plumejs/css/index.scss';

const formats = [
	{
		name: 'Paragraph',
		tag: 'p',
	},
	{
		name: 'Heading 1',
		classes: ['h1'],
		defaultTag: 'h1',
		allowedTags: ['h1', 'h2', 'h3'],
	},
	{
		name: 'Heading 2',
		classes: ['h2'],
		defaultTag: 'h2',
		allowedTags: ['h1', 'h2', 'h3'],
	},
	{
		name: 'Heading 3',
		classes: ['h3'],
		defaultTag: 'h3',
		allowedTags: ['h1', 'h2', 'h3'],
	},
	{
		name: 'Eyebrow',
		tag: 'p',
		classes: ['text-eyebrow'],
	},
	{
		name: 'Double class',
		tag: 'p',
		classes: ['double-1', 'double-2'],
	},
	{
		name: 'Hero 1',
		classes: ['text-hero-1'],
		defaultTag: 'h3',
		allowedTags: ['h1', 'h2', 'h3'],
	},
	{
		name: 'Hero 2',
		classes: ['text-hero-2'],
		defaultTag: 'h3',
		allowedTags: ['h1', 'h2', 'h3'],
	},
];

const editorEl = document.querySelector('#editor1');
const editor = new PlumeEditor(editorEl, {
	toolbar: 'formatting-styles formatting-tags | italic strong | edit-link remove-link | source',
});

editor.use(new ToolbarDividerPlugin())
editor.use(new LinksPlugin())
editor.use(new SourcePlugin());
editor.use(new InlineBasicsPlugin());
editor.use(new FormattingPlugin({
	formats,
}))
editor.init();
