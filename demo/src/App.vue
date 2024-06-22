<script setup>
	import { onMounted, onUnmounted, ref } from 'vue';

	import PlumeEditor from 'plumejs/editor.ts';
	import InlineBasicsPlugin from 'plumejs/plugins/InlineBasics/index.ts';
	import FormattingPlugin from 'plumejs/plugins/Formatting/index.ts';
	import LinksPlugin from 'plumejs/plugins/Links/index.ts';
	import SourcePlugin from 'plumejs/plugins/Source/index.ts';
	import ToolbarDividerPlugin from 'plumejs/plugins/ToolbarDivider/index.ts';
	import 'plumejs/css/index.scss';

	const el = ref();
	const el2 = ref();
	const editor = ref();
	const editor2 = ref();

	onMounted(() => {

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
		const editors = [{ e: el, ed: editor }];
		// const editors = [{ e: el, ed: editor }];
		for (const { e, ed } of editors) {
			ed.value = new PlumeEditor(e.value, {
				toolbar: 'formatting-styles formatting-tags | italic strong | edit-link remove-link | source',
			});

			ed.value.use(new ToolbarDividerPlugin())
			ed.value.use(new LinksPlugin())
			ed.value.use(new SourcePlugin());
			ed.value.use(new InlineBasicsPlugin());
			ed.value.use(new FormattingPlugin({
				formats,
			}))
			ed.value.init();

		}
	})
	onUnmounted(() => {
		editor.value.destroy();
		editor2.value.destroy();
	})
</script>

<template>
	<div class="container">
		<h1>Plume.js</h1>
		<p>This is a demo of the Plume editor.</p>
		<br>

		<div class="editor-holder">
			<div ref="el" class="el">
				<h2 class="h2">Unleash the Power of Creativity</h2>
				<p>Imagine a world where every idea turns into a masterpiece. A realm where innovation knows no bounds and creativity flows like a river. Welcome to such a world, where your thoughts become reality.</p>
				<p>In this land of endless possibilities, your imagination is your only limit. From the tallest mountains of inspiration to the deepest valleys of thought, every creation is a testament to your ingenuity.</p>
				<p class="text-eyebrow">Discover Our Magic</p>
				<h2 class="h2">What Sets Us Apart?</h2>
				<p>With a touch of brilliance and a spark of genius, we transform the mundane into the extraordinary. Our secret? An unwavering commitment to pushing boundaries and exploring uncharted territories of creativity.</p>
			</div>
		</div>
	</div>
</template>

<style lang="scss">


	html {
		height: 100%;
	}

	body {
		margin: 0;
		padding: 50px;
		min-height: 100%;
		background: linear-gradient(175deg, #1b509f, #194588 50%, #f1f1f1 50.001%);
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
	}

	.editor-holder {
		padding: 8px;
		background: rgba(255 255 255 / .08);
		border-radius: 12px;
	}

	.plume .content {
		h1, h2, h3, p {
			line-height: 1.15;
		}

		p {
			line-height: 1.4;
		}

		.h1 {
			font-size: 2.5rem;
			font-weight: bold;
		}

		.h2 {
			font-size: 2rem;
			font-weight: bold;
		}

		.h3 {
			font-size: 1.625rem;
			font-weight: bold;
		}

		.text-hero-1 {
			font-size: 3rem;
			font-weight: bold;
			text-transform: uppercase;
			background: black;
			color: white;
			padding: 8px 14px;
		}

		.text-hero-2 {
			font-size: 2rem;
			font-weight: bold;
			text-transform: uppercase;
			background: black;
			color: white;
			padding: 8px 14px;
		}

		.text-eyebrow {
			text-transform: uppercase;
			font-family: monospace;
			letter-spacing: 1px;
			font-size: 1rem;

			& + .h1, & + .h2, & + .h3 {
				margin-top: 0;
			}
		}

		.double-1 {
			border-left: 4px solid limegreen;
			padding-left: 10px;
		}

		.double-2 {
			border-right: 4px solid limegreen;
		}
	}


</style>
