import { defineConfig } from 'vite';

export default defineConfig({
	base: process.env.ASSET_BASE_PATH || '/',
});
