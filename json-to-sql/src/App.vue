<template>
  <a-config-provider :locale="zhCN">
    <div class="app-container">
      <a-layout>
        <a-layout-header class="header">
          <h1>JSON to SQL 转换器</h1>
        </a-layout-header>

        <a-layout-content class="content">
          <a-row :gutter="16">
            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <div class="editor-section">
                <CodeEditor
                  v-model="jsonContent"
                  title="JSON 输入"
                  language="json"
                  :min-lines="20"
                  @change="handleJsonChange"
                />
              </div>
            </a-col>

            <a-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
              <div class="result-section">
                <CodeEditor
                  v-model="sqlContent"
                  title="SQL 输出"
                  language="sql"
                  :read-only="true"
                  :min-lines="20"
                />
              </div>
            </a-col>
          </a-row>

          <a-row :gutter="16" class="control-row">
            <a-col :span="24">
              <ControlPanel
                :json-content="jsonContent"
                v-model:sql-content="sqlContent"
                @convert="handleConvert"
                @error="handleError"
              />
            </a-col>
          </a-row>
        </a-layout-content>

        <a-layout-footer class="footer">
          JSON to SQL 转换器 - 支持嵌套查询
        </a-layout-footer>
      </a-layout>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import CodeEditor from './components/CodeEditor.vue';
import ControlPanel from './components/ControlPanel.vue';
import { message } from 'ant-design-vue';

const jsonContent = ref('');
const sqlContent = ref('');

const defaultExample = `{
  "entry": "getUserOrders",
  "nodes": {
    "getUserOrders": {
      "type": "select",
      "sql": "SELECT id, name, email FROM users WHERE status = {status}",
      "params": {
        "status": "active"
      }
    },
    "getUserDetails": {
      "type": "select",
      "sql": "SELECT * FROM user_details WHERE user_id = @getUserOrders(id = {id})"
    },
    "getOrderCount": {
      "type": "select",
      "sql": "SELECT COUNT(*) as total FROM orders WHERE user_id IN (@getUserOrders)"
    }
  }
}`;

const handleLoadExample = (event: CustomEvent) => {
  jsonContent.value = event.detail.json;
  message.success('示例已加载');
};

onMounted(() => {
  jsonContent.value = defaultExample;
  window.addEventListener('load-example', handleLoadExample as EventListener);
});

onBeforeUnmount(() => {
  window.removeEventListener('load-example', handleLoadExample as EventListener);
});

const handleJsonChange = (value: string) => {
  jsonContent.value = value;
};

const handleConvert = (sql: string) => {
  sqlContent.value = sql;
};

const handleError = (error: string) => {
  message.error(error);
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-container {
  min-height: 100vh;
  background: #f0f2f5;
}

.header {
  background: #001529;
  color: white;
  padding: 0 24px;
  display: flex;
  align-items: center;
}

.header h1 {
  color: white;
  font-size: 20px;
  margin: 0;
}

.content {
  padding: 24px;
}

.editor-section,
.result-section {
  height: 400px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.control-row {
  margin-top: 16px;
}

.footer {
  text-align: center;
  color: #8c8c8c;
  font-size: 12px;
  padding: 12px;
}
</style>
