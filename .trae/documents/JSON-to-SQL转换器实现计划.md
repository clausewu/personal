# JSON to SQL 转换器实现计划

## 项目概述
使用 JavaScript 实现一个 JSON 转 SQL 的转换工具，支持浏览器端和服务器端运行。

## 技术栈
- **运行时**: JavaScript (Browser + Server 通用)
- **前端框架**: Vue3 + Vite + Ant Design Vue
- **代码编辑器**: Monaco Editor
- **语言**: TypeScript
- **代码规范**: ESLint

## 项目结构
```
json-to-sql/
├── src/
│   ├── core/
│   │   ├── parser.ts          # JSON 解析核心逻辑
│   │   └── sql-generator.ts   # SQL 生成器
│   ├── components/
│   │   ├── JsonEditor.vue     # JSON 输入编辑器
│   │   ├── SqlEditor.vue      # SQL 输出编辑器
│   │   └── ControlPanel.vue   # 控制面板
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── eslint.config.js
```

## 实现步骤

### 1. 项目初始化
- 创建 package.json，配置 Vue3、Vite、Ant Design Vue、Monaco Editor、TypeScript、ESLint 依赖
- 配置 Vite 构建工具
- 配置 TypeScript 编译选项
- 配置 ESLint 规则

### 2. JSON 解析核心实现
- 创建 `core/parser.ts`
- 实现 JSON 字符串转对象
- 实现静态参数替换逻辑
- 实现 `@xxx` 语法递归解析
- **重点**: 实现括号嵌套子查询替换算法，解决 `@a(xx = @b())` 的嵌套调用问题

### 3. SQL 生成器实现
- 创建 `core/sql-generator.ts`
- 从入口点开始解析
- 整合参数替换与递归解析
- 输出最终 SQL 字符串

### 4. 前端界面开发
- 创建 Vue3 组件结构
- 使用 Ant Design Vue 搭建基础 UI
- 集成 Monaco Editor 实现代码编辑、高亮、格式化

### 5. 数据绑定与交互
- 实现 JSON 输入与 SQL 输出的实时转换
- 处理错误提示与边界情况

## 核心算法说明

### 括号嵌套处理
传统正则非贪婪替换无法处理嵌套括号。优化方案：
1. 识别 `@xxx(...)` 模式时，记录括号深度
2. 遇到左括号深度+1，右括号深度-1
3. 只有当深度归零时，才认为一个完整的调用表达式结束
4. 支持多层嵌套调用

### 递归解析流程
```
1. 输入 JSON 字符串
2. JSON.parse() 转为对象
3. 从 entry 入口开始解析
4. 首次解析：替换静态 params
5. 扫描 @xxx 调用语法
6. 对每个 @xxx 递归调用解析器
7. 递归时：先替换静态参数 → 再替换调用参数 → 继续递归
8. 返回最终 SQL
```

## 验证方式
- 使用 `npm run dev` 启动开发服务器
- 在浏览器中测试 JSON 转 SQL 功能
- 验证嵌套调用如 `@a(xx = @b())` 是否正确解析
