<template>
  <div class="editor-container">
    <div class="editor-header">
      <span class="editor-title">{{ title }}</span>
      <a-space>
        <a-button size="small" @click="handleFormat">
          <template #icon><FormatPainterOutlined /></template>
          格式化
        </a-button>
        <a-button size="small" @click="handleCopy">
          <template #icon><CopyOutlined /></template>
          复制
        </a-button>
      </a-space>
    </div>
    <div ref="editorRef" class="monaco-editor-wrapper"></div>
    <a-modal
      v-model:open="copyModalVisible"
      title="复制成功"
      :footer="null"
      width="200px"
      centered
    >
      <p style="text-align: center;">内容已复制到剪贴板</p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import * as monaco from 'monaco-editor';
import { FormatPainterOutlined, CopyOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

interface Props {
  modelValue: string;
  title: string;
  language?: string;
  readOnly?: boolean;
  minLines?: number;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'json',
  readOnly: false,
  minLines: 10,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'change', value: string): void;
}>();

const editorRef = ref<HTMLDivElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;
const copyModalVisible = ref(false);

onMounted(() => {
  if (!editorRef.value) return;

  editor = monaco.editor.create(editorRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: 'vs-dark',
    readOnly: props.readOnly,
    minimap: { enabled: false },
    lineNumbers: 'on',
    fontSize: 14,
    fontFamily: 'Consolas, "Courier New", monospace',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true,
    renderLineHighlight: 'line',
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
  });

  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || '';
    emit('update:modelValue', value);
    emit('change', value);
  });
});

watch(() => props.modelValue, (newValue) => {
  if (editor && newValue !== editor.getValue()) {
    editor.setValue(newValue);
  }
});

onBeforeUnmount(() => {
  editor?.dispose();
});

const handleFormat = () => {
  if (editor) {
    editor.getAction('editor.action.formatDocument')?.run();
  }
};

const handleCopy = async () => {
  if (editor) {
    try {
      await navigator.clipboard.writeText(editor.getValue());
      copyModalVisible.value = true;
      setTimeout(() => {
        copyModalVisible.value = false;
      }, 1000);
    } catch {
      message.error('复制失败');
    }
  }
};

defineExpose({
  getEditor: () => editor,
  format: () => handleFormat(),
});
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border-bottom: 1px solid #d9d9d9;
}

.editor-title {
  font-weight: 500;
  color: #262626;
}

.monaco-editor-wrapper {
  flex: 1;
  min-height: 200px;
}
</style>
