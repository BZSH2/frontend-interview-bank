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

const html = computed(() => {
  const content = props.source?.trim();
  return content ? markdown.render(content) : '';
});

const tagStyle: Record<string, string> = {
  h1: 'margin: 0 0 20rpx; font-size: 38rpx; font-weight: 700; line-height: 1.5;',
  h2: 'margin: 0 0 18rpx; font-size: 34rpx; font-weight: 700; line-height: 1.5;',
  h3: 'margin: 0 0 16rpx; font-size: 30rpx; font-weight: 600; line-height: 1.5;',
  h4: 'margin: 0 0 16rpx; font-size: 28rpx; font-weight: 600; line-height: 1.5;',
  p: 'margin: 0 0 16rpx; line-height: 1.8; color: #1f2329; font-size: 28rpx; white-space: normal;',
  ul: 'margin: 0 0 16rpx; padding-left: 2em; line-height: 1.8; color: #1f2329; font-size: 28rpx;',
  ol: 'margin: 0 0 16rpx; padding-left: 2em; line-height: 1.8; color: #1f2329; font-size: 28rpx;',
  li: 'margin: 0 0 8rpx; line-height: 1.8; color: #1f2329; font-size: 28rpx;',
  blockquote:
    'margin: 0 0 16rpx; padding: 0 0 0 20rpx; border-left: 6rpx solid #91caff; color: #4e5969; line-height: 1.8;',
  pre: 'margin: 0 0 16rpx; padding: 20rpx; border-radius: 16rpx; background: #0f172a; color: #e2e8f0; white-space: pre-wrap; word-break: break-word; overflow: auto; font-size: 24rpx; line-height: 1.8;',
  code: 'font-family: monospace; word-break: break-word;',
  a: 'color: #1677ff; word-break: break-all; text-decoration: none;',
  img: 'max-width: 100%; border-radius: 16rpx;',
  table: 'margin: 0 0 16rpx; width: 100%; border-collapse: collapse;',
  th: 'padding: 12rpx; border: 1px solid #d9e1ec; background: #f7faff; text-align: left;',
  td: 'padding: 12rpx; border: 1px solid #d9e1ec;',
};
</script>

<template>
  <view v-if="html" class="markdown-viewer">
    <MpHtml
      :content="html"
      :tag-style="tagStyle"
      container-style="color: #1f2329; font-size: 28rpx; line-height: 1.8;"
      :copy-link="false"
      :preview-img="true"
      :scroll-table="true"
      selectable
    />
  </view>
</template>

<style scoped lang="scss">
.markdown-viewer {
  width: 100%;
}
</style>
