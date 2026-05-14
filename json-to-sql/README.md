# JSON to SQL 转换器

一个功能强大的 JSON 到 SQL 转换工具，支持嵌套查询、参数替换和语法格式化。

## 特性

- 🌱 **简洁直观的界面** - 基于 Vue 3 和 Ant Design Vue 构建的现代化界面
- 🔄 **嵌套查询支持** - 支持通过 @ 符号引用其他节点
- 📝 **智能参数替换** - 使用 {param} 语法动态替换参数
- ✨ **代码高亮** - 基于 Monaco Editor 的专业代码编辑器
- 🔤 **关键字格式化** - 自动将 SQL 关键字转换为大写
- 🧹 **代码美化** - 自动格式化和修剪空白
- 📦 **TypeScript 支持** - 完整的类型定义

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 即可使用。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## 使用说明

### JSON 结构

转换器接受以下格式的 JSON 输入：

```json
{
  "entry": "entryNodeName",
  "nodes": {
    "node1": {
      "type": "select",
      "sql": "SELECT * FROM table WHERE id = {id}",
      "params": {
        "id": 1
      }
    },
    "node2": {
      "type": "select",
      "sql": "SELECT * FROM another_table WHERE ref_id IN (@node1)"
    }
  }
}
```

### 主要功能

#### 1. 参数替换

使用 `{paramName}` 语法在 SQL 中定义参数，然后在 `params` 对象或控制面板中提供值：

```json
{
  "nodes": {
    "getUser": {
      "type": "select",
      "sql": "SELECT * FROM users WHERE status = {status}",
      "params": {
        "status": "active"
      }
    }
  }
}
```

#### 2. 节点引用

使用 `@nodeName` 语法引用其他节点：

```json
{
  "nodes": {
    "getUser": {
      "type": "select",
      "sql": "SELECT id FROM users WHERE status = 'active'"
    },
    "getOrders": {
      "type": "select",
      "sql": "SELECT * FROM orders WHERE user_id IN (@getUser)"
    }
  }
}
```

#### 3. 带参数的节点调用

使用 `@nodeName(key=value)` 语法传递参数：

```json
{
  "nodes": {
    "getUser": {
      "type": "select",
      "sql": "SELECT id FROM users WHERE id = {id}"
    },
    "getOrders": {
      "type": "select",
      "sql": "SELECT * FROM orders WHERE user_id = @getUser(id=123)"
    }
  }
}
```

### 选项设置

- **关键字大写** - 将 SQL 关键字自动转换为大写
- **自动格式化** - 自动修剪多余的空白字符

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集，提供类型安全
- **Vite** - 下一代前端构建工具
- **Ant Design Vue** - 企业级 UI 组件库
- **Monaco Editor** - 强大的代码编辑器

## 项目结构

```
json-to-sql/
├── src/
│   ├── components/
│   │   ├── CodeEditor.vue      # 代码编辑器组件
│   │   └── ControlPanel.vue    # 控制面板组件
│   ├── core/
│   │   ├── parser.ts           # JSON 解析核心模块
│   │   └── sql-generator.ts    # SQL 生成器核心模块
│   ├── App.vue                 # 主应用组件
│   └── main.ts                 # 应用入口
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## 核心模块

### 解析器 (parser.ts)

`JsonSqlParser` 负责解析 JSON 结构并转换为 SQL，主要功能：

- 解析 JSON 节点结构
- 处理参数替换
- 解析嵌套节点引用
- 处理带参数的节点调用

### SQL 生成器 (sql-generator.ts)

`SqlGenerator` 负责 SQL 的格式化和验证：

- 关键字大写转换
- 空白字符修剪
- SQL 语法验证

## 许可证

MIT
