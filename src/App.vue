<script setup>
	import { onMounted, onUnmounted, ref } from 'vue';

	import { Editor } from './lib/editor.ts';
	import { InlineBasicsPlugin } from './lib/plugins/inline-basics/index.ts';
	import { FormattingPlugin } from './lib/plugins/formatting/index.ts';
	import './lib/editor.scss';

	const el = ref();
	let editor = ref();

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
				class: 'text-eyebrow',
			},
			{
				name: 'Double class',
				tag: 'p',
				class: 'double-1 double-2',
			},
			{
				name: 'Hero 1',
				class: 'text-hero-1',
				tag: 'h3',
				allowedTags: ['h1', 'h2', 'h3'],
			},
			{
				name: 'Hero 2',
				class: 'text-hero-2',
				tag: 'h3',
				allowedTags: ['h1', 'h2', 'h3'],
			},
		];

		const inlineBasics = new InlineBasicsPlugin();

		const formattingPlugin = new FormattingPlugin({
			formats,
		});
		editor = new Editor(el.value, {
			toolbar: 'formatting-styles formatting-tags | italic strong',
		});
		editor.use(inlineBasics);
		editor.use(formattingPlugin)
		editor.init();

		editor.value = editor;
	})
	onUnmounted(() => {
		editor.value.destroy();
	})
</script>

<template>
	<div ref="el" class="el editor">
		<p>This is a paragraph</p>
		<h1>This is a H1</h1>
		<h2>This is a H2</h2>
		<h3>This is a H3</h3>
		<p class="double-1 double-2">This is a p with 2 classes</p>
		<p>This is a paragraph</p>
		<p class="text-eyebrow">this is an eyebrow</p>
		<h3 class="text-hero-1">This is a hero 1</h3>
		<h3 class="text-hero-2">This is a hero 2</h3>
		<p>this is yet another paragraph</p>
	</div>
	<p>outside</p>
</template>

<style>


	.el {
		border: 1px solid lightcoral;
		padding: 20px;
		text-align: left;
	}

	body {
		margin: 0;
		padding: 80px;
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
	}

	.text-hero-2 {
		border-left: 10px solid red;
		font-size: 50px;
		font-weight: bold;
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
