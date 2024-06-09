<script setup>
	import { onMounted, onUnmounted, ref } from 'vue';

	import { Editor } from './lib/editor.ts';
	import { InlineBasicsPlugin } from './lib/plugins/inline-basics/index.ts';
	import { FormattingPlugin } from './lib/plugins/formatting/index.ts';
	import { LinksPlugin } from './lib/plugins/links/index.ts';
	import { SourcePlugin } from './lib/plugins/source/index.ts';
	import './lib/editor.scss';

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
		const editors = [{ e: el, ed: editor }, { e: el2, ed: editor2 }];
		// const editors = [{ e: el, ed: editor }];
		for (const { e, ed } of editors) {
			ed.value = new Editor(e.value, {
				toolbar: 'formatting-styles formatting-tags | italic strong | edit-link remove-link | source',
			});

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
	<div ref="el" class="el editor">
		<h1>This is a H1</h1>
		<!--		<h2>This is a H2</h2>-->
		<!--		<h3>This is a H3</h3>-->
		<p class="double-1 double-2"><strong>This</strong> is a p <strong>with</strong> 2 classes</p>
		<p class="text-eyebrow">this is an eyebrow</p>
		<h3 class="text-hero-1">This is a <a href="#foo">hero</a> 1</h3>
		<h2 class="text-hero-2">This is a hero 2</h2>
		<p>this is yet <i>another</i> paragraph</p>
	</div>
	<br><br><br>
	<div ref="el2" class="el editor"></div>
</template>

<style>


	.el {
		border: 1px solid lightcoral;
		padding: 20px;
		text-align: left;
	}

	body {
		margin: 0;
		padding: 50px;
		line-height: 1.2;
	}

	h1 {
		font-size: 40px;
		font-weight: bold;
	}

	h2 {
		font-size: 32px;
		font-weight: bold;
	}

	h3 {
		font-size: 26px;
		font-weight: bold;
	}

	.text-hero-1 {
		border-left: 5px solid red;
		font-size: 70px;
		font-weight: bold;
		padding-left: 10px;
	}

	.text-hero-2 {
		border-left: 10px solid red;
		font-size: 50px;
		font-weight: bold;
		padding-left: 10px;
	}

	.text-eyebrow {
		text-transform: uppercase;
		font-family: monospace;
		letter-spacing: 1px;
		font-size: 18px;
	}

	.double-1 {
		border-left: 4px solid limegreen;
		padding-left: 10px;
	}

	.double-2 {
		border-right: 4px solid limegreen;
	}

</style>
