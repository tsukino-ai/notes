---
title: Actions 参�?
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x-skill/skills-zh/x-card/reference/ACTIONS.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

# Actions 参�?

本文档介绍用户交互如何通过 `onAction` 从组件流�?Agent。实现按钮处理器、表单提交或任何用户交互时阅读本文档�?

---

## Action 流程

```
组件（Button 点击�?
  �?Card 解析 action.event.context 中的路径
  �?Card 调用 onAction(ActionPayload)
  �?XCard.Box 转发到你�?onAction 处理�?
  �?你的代码�?Agent 发送新命令 / 更新 cmdQueue
```

---

## ActionPayload

```typescript
interface ActionPayload {
  name: string; // 来自 action.event.name
  surfaceId: string; // 触发动作�?Surface
  /**
   * 组件传递的上下文，已自动解�?path 引用为实际值�?
   * action.event.context 中的 { path: "xxx" } 会被转换�?{ value: "实际�? } 格式�?
   */
  context: Record<string, any>;
}
```

---

## Path 引用自动解析

当组件触�?action 时，X-Card 会自动将 context 中的 path 引用解析为实际值�?

### v0.9 格式

```json
{
  "id": "submit_btn",
  "component": "Button",
  "action": {
    "event": {
      "name": "submit_form",
      "context": {
        "username": { "path": "/form/username", "label": "用户�? },
        "email": { "path": "/form/email", "label": "邮箱" }
      }
    }
  }
}
```

用户点击按钮时，`onAction` 收到�?

```typescript
{
  name: 'submit_form',
  surfaceId: 'contact_form',
  // path 引用自动解析�?{ value } 格式
  context: {
    username: { value: '张三', label: '用户�? },
    email: { value: 'test@example.com', label: '邮箱' }
  }
}
```

### v0.8 格式

v0.8 使用数组格式定义路径绑定�?

```json
{
  "id": "submit_btn",
  "component": {
    "Button": {
      "action": {
        "name": "submit_form",
        "context": [
          { "key": "username", "value": { "path": "/form/username" } },
          { "key": "email", "value": { "path": "/form/email" } }
        ]
      }
    }
  }
}
```

解析后的 payload�?

```typescript
{
  name: 'submit_form',
  surfaceId: 'contact_form',
  context: {
    username: { value: '张三' },
    email: { value: 'test@example.com' }
  }
}
```

> **注意**：只�?context 中本身就�?`{ path: "xxx" }` 格式的值才会被转换。组件传递的实际值（�?`{ value: "实际�? }`）不会被错误转换�?

---

## 在组件上定义 Action

```json
{
  "id": "submit_btn",
  "component": "Button",
  "text": "提交",
  "action": {
    "event": {
      "name": "submit_form",
      "context": {
        "email": { "path": "/form/email" },
        "name": { "path": "/form/name" },
        "subscribe": { "path": "/form/subscribe" }
      }
    }
  }
}
```

用户点击按钮时，`onAction` 收到�?

```typescript
{
  name: 'submit_form',
  surfaceId: 'contact_form',
  // path 引用自动解析�?{ value } 格式
  context: {
    email: { value: 'alice@example.com' },
    name: { value: 'Alice' },
    subscribe: { value: true }
  }
}
```

---

## �?React 中处�?Action

```tsx
const handleAction = (payload: ActionPayload) => {
  if (payload.name === 'submit_form') {
    // 配置中使�?{ path } 绑定�?key 会被解析�?{ value, ...rest } 格式�?
    // 配置侧字面量和组件运行时传入的值保持原样�?
    const email = payload.context.email?.value;
    const name = payload.context.name?.value;
    // 1. 调用 Agent API
    // 2. 追加新命令作为响�?
    setCmdQueue(prev => [
      ...prev,
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: payload.surfaceId,
          components: [
            { id: 'root', component: 'Text', text: `感谢 ${name}！确认邮件已发送至 ${email}。` }
          ]
        }
      }
    ]);
  }
};

<XCard.Box commands={cmdQueue} onAction={handleAction} components={...}>
  <XCard.Card id="contact_form" />
</XCard.Box>
```

---

## 表单提交模式

完整的表单提交闭环（含验证）�?

```tsx
// 1. Agent 发送表单结�?
const formCommands: XAgentCommand_v0_9[] = [
  { version: 'v0.9', createSurface: { surfaceId: 'form', catalogId: 'local://cat.json' } },
  {
    version: 'v0.9',
    updateComponents: {
      surfaceId: 'form',
      components: [
        { id: 'root', component: 'Column', children: ['email_input', 'submit_btn'] },
        {
          id: 'email_input',
          component: 'TextField',
          label: '邮箱',
          value: { path: '/form/email' },
          checks: [
            { call: 'required', args: { value: { path: '/form/email' } }, message: '邮箱不能为空' },
            { call: 'email', args: { value: { path: '/form/email' } }, message: '邮箱格式不正�? },
          ],
        },
        {
          id: 'submit_btn',
          component: 'Button',
          text: '提交',
          action: { event: { name: 'submit', context: { email: { path: '/form/email' } } } },
        },
      ],
    },
  },
  { version: 'v0.9', updateDataModel: { surfaceId: 'form', path: '/form', value: { email: '' } } },
];

// 2. 处理提交
// 配置中使�?{ path } 绑定�?key 会被解析�?{ value, ...rest } 格式�?
// 配置侧字面量和组件运行时传入的值保持原样�?
const handleAction = async (payload: ActionPayload) => {
  if (payload.name === 'submit') {
    const email = payload.context.email?.value;
    // 显示加载状�?
    setCmdQueue((prev) => [
      ...prev,
      { version: 'v0.9', updateDataModel: { surfaceId: 'form', path: '/ui/loading', value: true } },
    ]);
    // 调用 Agent 处理，返回后展示结果
    const result = await callAgent({ email });
    setCmdQueue((prev) => [
      ...prev,
      {
        version: 'v0.9',
        updateDataModel: { surfaceId: 'form', path: '/ui/loading', value: false },
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'form',
          components: [{ id: 'root', component: 'Text', text: `完成�?{result}` }],
        },
      },
    ]);
  }
};
```

---

## 客户端函�?Action

纯本地操作（不需要服务端往返）�?

```json
{
  "id": "link_btn",
  "component": "Button",
  "text": "打开文档",
  "action": {
    "functionCall": {
      "call": "openUrl",
      "args": { "url": "https://a2ui.org" }
    }
  }
}
```

内置函数：`openUrl`、`formatString`、`formatNumber`、`formatDate`、`formatCurrency`、`pluralize`、`and`、`or`、`not`�?

---

## Button 上的校验 checks

�?`checks` �?Button 在条件不满足时自动禁用：

```json
{
  "id": "submit_btn",
  "component": "Button",
  "text": "提交",
  "checks": [
    {
      "condition": {
        "call": "and",
        "args": {
          "values": [
            { "call": "required", "args": { "value": { "path": "/form/name" } } },
            { "call": "email", "args": { "value": { "path": "/form/email" } } }
          ]
        }
      },
      "message": "姓名和有效邮箱均为必填项"
    }
  ],
  "action": {
    "event": {
      "name": "submit",
      "context": { "name": { "path": "/form/name" }, "email": { "path": "/form/email" } }
    }
  }
}
```

> ⚠️ `action.event.context` 中的路径�?*写入目标**，指向用户输入数据在数据模型中的存储位置。Card �?Action 触发时通过读取数据模型来解析这些路径——不要将其误认为读取绑定来源�?
