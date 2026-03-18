<script setup lang="ts">
import type Vditor from 'vditor';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import MarkdownViewer from '@/components/markdown-viewer.vue';

interface Props {
  source?: string | null;
}

const props = defineProps<Props>();

const previewRef = ref<HTMLDivElement | null>(null);
const renderMode = ref<'loading' | 'vditor' | 'fallback'>('loading');
const mounted = ref(false);
let renderToken = 0;
let vditorLoader: Promise<typeof Vditor> | null = null;

function normalizeMarkdown(source?: string | null) {
  if (!source) {
    return '';
  }

  const normalized = source.replace(/\r\n?/g, '\n').trim();
  return normalized.replace(/^#\s.+?\n+(?=##|###|####|[^#\n])/u, '');
}

const normalizedSource = computed(() => normalizeMarkdown(props.source));

function loadVditor() {
  if (!vditorLoader) {
    vditorLoader = Promise.all([import('vditor'), import('vditor/dist/index.css')]).then(
      ([module]) => module.default,
    );
  }

  return vditorLoader;
}

async function renderPreview() {
  const currentToken = ++renderToken;

  if (!mounted.value) {
    return;
  }

  const markdown = normalizedSource.value;
  if (!markdown) {
    renderMode.value = 'fallback';
    return;
  }

  renderMode.value = 'loading';
  await nextTick();

  try {
    const Vditor = await loadVditor();
    if (currentToken !== renderToken || !previewRef.value) {
      return;
    }

    previewRef.value.innerHTML = '';

    await Vditor.preview(previewRef.value, markdown, {
      mode: 'light',
      anchor: 0,
      theme: {
        current: 'wechat',
      },
      markdown: {
        toc: false,
        sanitize: true,
        gfmAutoLink: true,
        autoSpace: true,
        fixTermTypo: true,
        listStyle: true,
      },
      hljs: {
        style: 'github',
        lineNumber: false,
      },
      after() {
        if (previewRef.value) {
          previewRef.value.querySelectorAll('a').forEach((link) => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
          });
        }
      },
    });

    if (currentToken !== renderToken) {
      return;
    }

    renderMode.value = 'vditor';
  } catch (error) {
    console.warn('[vditor-preview-h5] fallback to markdown-viewer:', error);
    if (currentToken === renderToken) {
      renderMode.value = 'fallback';
    }
  }
}

watch(normalizedSource, () => {
  void renderPreview();
});

onMounted(() => {
  mounted.value = true;
  void renderPreview();
});

onBeforeUnmount(() => {
  mounted.value = false;
  renderToken += 1;
  if (previewRef.value) {
    previewRef.value.innerHTML = '';
  }
});
</script>

<template>
  <view class="vditor-preview-h5">
    <view v-if="renderMode === 'loading'" class="vditor-preview-h5__loading"
      >讲解预览加载中...</view
    >
    <div v-show="renderMode === 'vditor'" ref="previewRef" class="vditor-preview-h5__content" />
    <MarkdownViewer v-if="renderMode === 'fallback'" :source="normalizedSource" />
  </view>
</template>

<style scoped lang="scss">
.vditor-preview-h5 {
  width: 100%;
}

.vditor-preview-h5__loading {
  padding: 20rpx 0;
  color: #98a2b3;
  font-size: 24rpx;
}

.vditor-preview-h5__content {
  width: 100%;

  :deep(.vditor-reset) {
    padding: 0;
    margin: 0;
    color: #121826;
    font-size: 29rpx;
    line-height: 1.88;
    letter-spacing: 0.01em;
    word-break: break-word;
  }

  :deep(.vditor-reset > :first-child) {
    margin-top: 0 !important;
  }

  :deep(.vditor-reset > :last-child) {
    margin-bottom: 0 !important;
  }

  :deep(.vditor-reset h1) {
    display: none;
  }

  :deep(.vditor-reset h2) {
    margin: 24rpx 0 16rpx;
    color: #121826;
    font-size: 34rpx;
    line-height: 1.5;
    font-weight: 700;
  }

  :deep(.vditor-reset h3) {
    margin: 20rpx 0 12rpx;
    color: #1d2939;
    font-size: 31rpx;
    line-height: 1.55;
    font-weight: 700;
  }

  :deep(.vditor-reset h4) {
    margin: 16rpx 0 10rpx;
    color: #344054;
    font-size: 28rpx;
    line-height: 1.55;
    font-weight: 600;
  }

  :deep(.vditor-reset p) {
    margin: 0 0 16rpx;
    color: #121826;
    line-height: 1.88;
  }

  :deep(.vditor-reset ul),
  :deep(.vditor-reset ol) {
    margin: 0 0 16rpx;
    padding-left: 1.45em;
  }

  :deep(.vditor-reset li) {
    margin-bottom: 10rpx;
    line-height: 1.82;
  }

  :deep(.vditor-reset li > p) {
    margin: 0 0 8rpx;
  }

  :deep(.vditor-reset li:last-child > p:last-child) {
    margin-bottom: 0;
  }

  :deep(.vditor-reset blockquote) {
    margin: 0 0 18rpx;
    padding: 18rpx 20rpx 18rpx 22rpx;
    border-left: 4rpx solid #d8d4cc;
    border-radius: 0 16rpx 16rpx 0;
    background: #faf9f7;
    color: #667085;
  }

  :deep(.vditor-reset blockquote > :last-child) {
    margin-bottom: 0;
  }

  :deep(.vditor-reset hr) {
    margin: 22rpx 0;
    border: 0;
    border-top: 1px solid #ebe7df;
  }

  :deep(.vditor-reset a) {
    color: #3f4a66;
    text-decoration: none;
    word-break: break-all;
  }

  :deep(.vditor-reset strong) {
    color: #121826;
    font-weight: 700;
  }

  :deep(.vditor-reset code:not(.hljs)) {
    padding: 4rpx 10rpx;
    border-radius: 10rpx;
    background: #f4f3f0;
    color: #3f4a66;
    font-family: SFMono-Regular, Consolas, Monaco, monospace;
    font-size: 0.92em;
  }

  :deep(.vditor-copy) {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 10rpx;
  }

  :deep(.vditor-copy textarea) {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    pointer-events: none;
  }

  :deep(.vditor-copy span) {
    display: inline-flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 14rpx;
    border-radius: 999rpx;
    background: #f4f3f0;
    color: #667085;
    font-size: 22rpx;
  }

  :deep(.vditor-copy svg) {
    width: 24rpx;
    height: 24rpx;
  }

  :deep(.vditor-reset pre) {
    margin: 0 0 18rpx;
    padding: 20rpx 22rpx;
    border-radius: 18rpx;
    background: #161c2d;
    color: #edf0f5;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.vditor-reset .hljs) {
    background: transparent;
    color: inherit;
  }

  :deep(.vditor-reset pre code) {
    font-family: SFMono-Regular, Consolas, Monaco, monospace;
    font-size: 24rpx;
    line-height: 1.8;
  }

  :deep(.vditor-reset table) {
    display: block;
    max-width: 100%;
    margin: 0 0 18rpx;
    overflow-x: auto;
    border-spacing: 0;
    border-collapse: collapse;
    -webkit-overflow-scrolling: touch;
    border-radius: 14rpx;
  }

  :deep(.vditor-reset th),
  :deep(.vditor-reset td) {
    padding: 14rpx 16rpx;
    border: 1px solid #e7e5df;
    font-size: 24rpx;
    line-height: 1.7;
    vertical-align: top;
    background: #fff;
  }

  :deep(.vditor-reset th) {
    background: #faf9f7;
    color: #344054;
    font-weight: 600;
  }

  :deep(.vditor-reset img) {
    display: block;
    max-width: 100%;
    margin: 8rpx 0 18rpx;
    border-radius: 16rpx;
  }
}
</style>
