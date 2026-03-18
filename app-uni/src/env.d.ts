/// <reference types="vite/client" />

declare module 'mp-html/dist/uni-app/components/mp-html/mp-html.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

declare module 'markdown-it/dist/markdown-it.js' {
  import type MarkdownIt from 'markdown-it';

  const MarkdownItConstructor: typeof MarkdownIt;
  export default MarkdownItConstructor;
}
