<script setup>
	import { Editor } from './editor.js';
	import './editor.scss';
	import { onMounted, onUnmounted, ref } from 'vue';

	const el = ref();

	const editor = ref();

	onMounted(() => {
		editor.value = new Editor(el.value);
	})
	onUnmounted(() => {
		editor.value.destroy();
	})
</script>

<template>
	<div ref="el" class="el editor">
		<p>This is a paragraph</p>
		<h1>This is a H1</h1>
		<h2 class="style-2">This is a H2</h2>
		<div style="border: 1px solid darkslategray;">
			<p>this is a multiline<br><u>paragraph</u>, cool huh?</p>
		</div>
		<div style="border: 1px solid darkslategray;">
			this is in a div
		</div>
		<p>this is yet another paragraph</p>
	</div>
	<p>outside</p>
</template>

<style>


	.el {
		border: 1px solid lightcoral;
		padding: 20px;
		width: 80%;
		text-align: left;
	}

	.style-1 {
		background: orange;
	}

	.style-2 {
		color: red;
		font-weight: bold;
	}

</style>
