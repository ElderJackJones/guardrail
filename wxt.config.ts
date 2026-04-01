import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    "permissions": ['storage', 'webNavigation'],
    "background": {
      "service_worker": "background.js"
    },
    "name": "guardrail", 
    "description": "The internet in your hands, not the other way around.",
    "version": "1.0.0",
  }
});
