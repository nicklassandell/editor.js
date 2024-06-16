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
				tag: 'h1',
			},
			{
				name: 'Heading 2',
				tag: 'h2',
			},
			{
				name: 'Heading 3',
				tag: 'h3',
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
				<h1>This is a H1</h1>
				<!--		<h2>This is a H2</h2>-->
				<!--		<h3>This is a H3</h3>-->
				<p class="double-1 double-2"><strong>This</strong> is a p <strong>with</strong> 2 classes</p>
				<p class="text-eyebrow">this is an eyebrow</p>
				<h3 class="text-hero-1">This is a <a href="#foo">hero</a> 1</h3>
				<h2 class="text-hero-2">This is a hero 2</h2>
				<p>You can do anything here - the only pre-requisite is that it makes you happy. Now we'll take the almighty fan brush. How to paint. That's easy. What to paint. That's much harder. It's life. It's interesting. It's fun. Let's go up in here, and start having some fun</p>
				<p>Isn't it fantastic that you can change your mind and create all these happy things? There are no limits in this world. Isn't that fantastic? You can just push a little tree out of your brush like that.</p>
				<p>this is yet <i>another</i> paragraph</p>
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

		h1 {
			font-size: 2.5rem;
			font-weight: bold;
		}

		h2 {
			font-size: 2rem;
			font-weight: bold;
		}

		h3 {
			font-size: 1.625rem;
			font-weight: bold;
		}

		.text-hero-1 {
			border-left: 5px solid red;
			font-size: 4.375rem;
			font-weight: bold;
			padding-left: 10px;
		}

		.text-hero-2 {
			border-left: 10px solid red;
			font-size: 3.125rem;
			font-weight: bold;
			padding-left: 10px;
		}

		.text-eyebrow {
			text-transform: uppercase;
			font-family: monospace;
			letter-spacing: 1px;
			font-size: 1.125rem;
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
