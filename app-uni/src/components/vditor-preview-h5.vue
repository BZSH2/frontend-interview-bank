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
      markdown: {
        toc: false,
        sanitize: true,
        gfmAutoLink: true,
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
      >讲解增强预览加载中...</view
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
  color: #667085;
  font-size: 24rpx;
}

.vditor-preview-h5__content {
  width: 100%;

  :deep(.vditor-reset) {
    padding: 0;
    margin: 0;
    color: #1f2329;
    font-size: 30rpx;
    line-height: 1.9;
    word-break: break-word;
  }

  :deep(.vditor-reset h1) {
    display: none;
  }

  :deep(.vditor-reset h2) {
    margin: 28rpx 0 18rpx;
    color: #101828;
    font-size: 34rpx;
    line-height: 1.5;
    font-weight: 700;
  }

  :deep(.vditor-reset h3) {
    margin: 22rpx 0 14rpx;
    color: #1d2939;
    font-size: 31rpx;
    line-height: 1.55;
    font-weight: 700;
  }

  :deep(.vditor-reset h4) {
    margin: 18rpx 0 12rpx;
    color: #344054;
    font-size: 28rpx;
    line-height: 1.55;
    font-weight: 600;
  }

  :deep(.vditor-reset p) {
    margin: 0 0 18rpx;
    color: #1f2329;
    line-height: 1.9;
  }

  :deep(.vditor-reset ul),
  :deep(.vditor-reset ol) {
    margin: 0 0 18rpx;
    padding-left: 1.5em;
  }

  :deep(.vditor-reset li) {
    margin-bottom: 10rpx;
    line-height: 1.85;
  }

  :deep(.vditor-reset blockquote) {
    margin: 0 0 20rpx;
    padding: 18rpx 20rpx 18rpx 22rpx;
    border-left: 6rpx solid #91caff;
    border-radius: 0 16rpx 16rpx 0;
    background: #f3f8ff;
    color: #475467;
  }

  :deep(.vditor-reset hr) {
    margin: 26rpx 0;
    border: 0;
    border-top: 1px solid #dbe5f0;
  }

  :deep(.vditor-reset a) {
    color: #1677ff;
    text-decoration: none;
    word-break: break-all;
  }

  :deep(.vditor-reset strong) {
    color: #101828;
    font-weight: 700;
  }

  :deep(.vditor-reset code:not(.hljs)) {
    padding: 4rpx 10rpx;
    border-radius: 10rpx;
    background: #eef4ff;
    color: #1d4ed8;
    font-family: SFMono-Regular, Consolas, Monaco, monospace;
    font-size: 0.92em;
  }

  :deep(.vditor-reset pre) {
    margin: 0 0 20rpx;
    padding: 20rpx 22rpx;
    border-radius: 18rpx;
    background: #f8fafc;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.vditor-reset pre code) {
    font-family: SFMono-Regular, Consolas, Monaco, monospace;
    font-size: 24rpx;
    line-height: 1.8;
  }

  :deep(.vditor-reset table) {
    display: block;
    max-width: 100%;
    margin: 0 0 20rpx;
    overflow-x: auto;
    border-spacing: 0;
    border-collapse: collapse;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.vditor-reset th),
  :deep(.vditor-reset td) {
    padding: 14rpx 16rpx;
    border: 1px solid #d9e1ec;
    font-size: 24rpx;
    line-height: 1.7;
    vertical-align: top;
    background: #fff;
  }

  :deep(.vditor-reset th) {
    background: #f7faff;
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
