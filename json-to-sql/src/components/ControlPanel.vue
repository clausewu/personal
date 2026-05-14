<template>
  <div class="control-panel">
    <a-card title="转换控制" size="small">
      <a-form layout="vertical" :model="formState">
        <a-form-item label="初始参数 (JSON)">
          <a-textarea
            v-model:value="formState.params"
            placeholder='{"key": "value"}'
            :rows="3"
            @change="handleParamsChange"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleConvert" :loading="loading">
              <template #icon><SwapOutlined /></template>
              转换
            </a-button>
            <a-button @click="handleReset">
              <template #icon><ReloadOutlined /></template>
              重置
            </a-button>
            <a-button @click="handleLoadExample">
              <template #icon><ThunderboltOutlined /></template>
              加载示例
            </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card title="选项设置" size="small" class="options-card">
      <a-form layout="vertical" :model="optionsState">
        <a-form-item label="关键字大写">
          <a-switch v-model:checked="optionsState.uppercaseKeywords" @change="handleConvert" />
        </a-form-item>
        <a-form-item label="自动格式化">
          <a-switch v-model:checked="optionsState.autoFormat" @change="handleConvert" />
        </a-form-item>
      </a-form>
    </a-card>

    <a-card v-if="errorMessage" title="错误信息" size="small" class="error-card">
      <a-alert :message="errorMessage" type="error" show-icon />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { SwapOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons-vue';
import { generateSql } from '../core/sql-generator';

interface Props {
  jsonContent: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'convert', sql: string): void;
  (e: 'error', message: string): void;
  (e: 'update:sqlContent', sql: string): void;
}>();

const loading = ref(false);
const errorMessage = ref('');

const formState = reactive({
  params: '{}',
});

const optionsState = reactive({
  uppercaseKeywords: true,
  autoFormat: true,
});

const handleParamsChange = () => {
  handleConvert();
};

const handleConvert = () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    let params: Record<string, unknown> = {};
    if (formState.params.trim()) {
      params = JSON.parse(formState.params);
    }

    const result = generateSql(props.jsonContent, params, {
      uppercaseKeywords: optionsState.uppercaseKeywords,
      trimWhitespace: optionsState.autoFormat,
    });

    if (result.error) {
      errorMessage.value = result.error;
      emit('error', result.error);
    } else {
      emit('convert', result.sql);
      emit('update:sqlContent', result.sql);
    }
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Unknown error';
    errorMessage.value = error;
    emit('error', error);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formState.params = '{}';
  errorMessage.value = '';
  emit('update:sqlContent', '');
};

const handleLoadExample = () => {
  const example = `{
  "entry": "getUserOrders",
  "nodes": {
    "getUserOrders": {
      "type": "select",
      "sql": "SELECT * FROM orders WHERE user_id = {userId}",
      "params": {
        "userId": 123
      }
    },
    "getOrderItems": {
      "type": "select",
      "sql": "SELECT * FROM order_items WHERE order_id IN (@getUserOrders)"
    }
  }
}`;
  
  window.dispatchEvent(new CustomEvent('load-example', { detail: { json: example } }));
};
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.options-card {
  margin-top: 8px;
}

.error-card {
  margin-top: 8px;
}
</style>
