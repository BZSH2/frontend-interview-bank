<script setup lang="ts">
import MarkdownIt from 'markdown-it/dist/markdown-it.js';
import MpHtml from 'mp-html/dist/uni-app/components/mp-html/mp-html.vue';
import { computed } from 'vue';

interface Props {
  source?: string | null;
}

const props = defineProps<Props>();

const markdown = new MarkdownIt({
  html: false,
  breaks: true,
  linkify: true,
});

markdown.renderer.rules.code_inline = (tokens, idx) => {
  const content = markdown.utils.escapeHtml(tokens[idx].content);
  return `<code style="display:inline-block;padding:4rpx 10rpx;border-radius:10rpx;background:#eef4ff;color:#1d4ed8;font-family:SFMono-Regular,Consolas,Monaco,monospace;font-size:0.92em;word-break:break-word;">${content}</code>`;
};

markdown.renderer.rules.fence = (tokens, idx) => {
  const content = markdown.utils.escapeHtml(tokens[idx].content);
  return `<pre style="margin:0 0 20rpx;padding:20rpx 22rpx;border-radius:18rpx;background:#0f172a;color:#e2e8f0;overflow:auto;box-sizing:border-box;"><code style="display:block;white-space:pre;word-break:normal;font-family:SFMono-Regular,Consolas,Monaco,monospace;font-size:24rpx;line-height:1.8;color:inherit;background:transparent;">${content}</code></pre>`;
};

function normalizeMarkdown(source?: string | null) {
  if (!source) {
    return '';
  }

  const normalized = source.replace(/\r\n?/g, '\n').trim();
  return normalized.replace(/^#\s.+?\n+(?=##|###|####|[^#\n])/u, '');
}

const html = computed(() => {
  const content = normalizeMarkdown(props.source);
  return content ? markdown.render(content) : '';
});

const tagStyle: Record<string, string> = {
  h1: 'margin: 8rpx 0 18rpx; font-size: 34rpx; font-weight: 700; line-height: 1.45; color: #101828;',
  h2: 'margin: 24rpx 0 18rpx; font-size: 32rpx; font-weight: 700; line-height: 1.5; color: #101828;',
  h3: 'margin: 20rpx 0 14rpx; font-size: 30rpx; font-weight: 700; line-height: 1.55; color: #1d2939;',
  h4: 'margin: 16rpx 0 12rpx; font-size: 28rpx; font-weight: 600; line-height: 1.55; color: #344054;',
  p: 'margin: 0 0 18rpx; color: #1f2329; font-size: 28rpx; line-height: 1.9; white-space: normal; word-break: break-word;',
  ul: 'margin: 0 0 18rpx; padding-left: 1.5em; color: #1f2329; font-size: 28rpx; line-height: 1.85;',
  ol: 'margin: 0 0 18rpx; padding-left: 1.5em; color: #1f2329; font-size: 28rpx; line-height: 1.85;',
  li: 'margin: 0 0 10rpx; color: #1f2329; font-size: 28rpx; line-height: 1.85;',
  blockquote:
    'margin: 0 0 20rpx; padding: 18rpx 20rpx 18rpx 22rpx; border-left: 6rpx solid #91caff; border-radius: 0 16rpx 16rpx 0; background: #f3f8ff; color: #475467; line-height: 1.85; box-sizing: border-box;',
  hr: 'margin: 24rpx 0; border: 0; border-top: 1px solid #dbe5f0;',
  a: 'color: #1677ff; word-break: break-all; text-decoration: none;',
  strong: 'font-weight: 700; color: #101828;',
  em: 'font-style: italic; color: #344054;',
  img: 'display:block; max-width: 100%; border-radius: 16rpx; margin: 8rpx 0 18rpx;',
  table:
    'margin: 0 0 20rpx; width: 100%; border-collapse: separate; border-spacing: 0; overflow: hidden; border-radius: 14rpx; background: #ffffff;',
  th: 'padding: 14rpx 16rpx; border: 1px solid #d9e1ec; background: #f7faff; text-align: left; color: #344054; font-size: 24rpx; font-weight: 600;',
  td: 'padding: 14rpx 16rpx; border: 1px solid #d9e1ec; color: #344054; font-size: 24rpx; line-height: 1.7; vertical-align: top;',
};
</script>

<template>
  <view v-if="html" class="markdown-viewer">
    <MpHtml
      :content="html"
      :tag-style="tagStyle"
      container-style="color:#1f2329;font-size:28rpx;line-height:1.9;word-break:break-word;overflow:hidden;"
      :copy-link="false"
      :preview-img="true"
      :lazy-load="true"
      :scroll-table="true"
      :set-title="false"
      selectable
    />
  </view>
</template>

<style scoped lang="scss">
.markdown-viewer {
  width: 100%;
}
</style>
