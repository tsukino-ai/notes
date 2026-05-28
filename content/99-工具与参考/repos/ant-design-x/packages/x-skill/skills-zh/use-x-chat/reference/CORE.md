---
title: CORE
author: ant-design
date: 2026-05-28
source: https://github.com/ant-design/x/blob/main/packages/x-skill/skills-zh/use-x-chat/reference/CORE.md
tags:
  - react
  - ai-ui
  - ant-design-x
  - component-library
---

### 1. 消息管理

#### 获取消息列表

```ts
const { messages } = useXChat({ provider });
// messages 结构: MessageInfo<ChatMessage>[]
// 实际消息数据�?msg.message �?
// msg.status: 'local' | 'loading' | 'updating' | 'success' | 'error' | 'abort'
```

#### 手动设置消息（不触发请求�?

```ts
const { setMessages } = useXChat({ provider });

// 清空消息
setMessages([]);

// 添加欢迎消息
setMessages([
  {
    id: 'welcome',
    message: { content: '欢迎使用 AI 助手', role: 'assistant' },
    status: 'success',
  },
]);
```

#### 更新单条消息

```ts
const { setMessage } = useXChat({ provider });

// 更新消息内容
setMessage('msg-id', {
  message: { content: '新的内容', role: 'assistant' },
});

// 标记为错误状�?
setMessage('msg-id', { status: 'error' });

// �?extraInfo 的更�?
setMessage('msg-id', {
  message: { content: '已编�?, role: 'user' },
  extraInfo: { edited: true, editedAt: Date.now() },
});
```

#### 删除消息

```ts
const { removeMessage } = useXChat({ provider });

// 删除第一条消�?
removeMessage(messages[0]?.id);

// 删除所�?error 状态的消息
messages.filter((m) => m.status === 'error').forEach((m) => removeMessage(m.id));
```

### 2. 请求控制

#### 发送消�?

```ts
const { onRequest } = useXChat({ provider });

// 基础使用（onRequest 参数类型�?Partial<Input>�?
onRequest({ query: '用户问题' });

// 带额外元数据（extraInfo 保存�?MessageInfo.extraInfo 中）
onRequest({ query: '用户问题' }, { extraInfo: { sourceId: 'msg-123', isRetry: false } });

// 对于 OpenAIChatProvider，发送完整消息数�?
onRequest({
  messages: [{ role: 'user', content: '问题内容' }],
  temperature: 0.7,
});
```

#### 中断请求

```tsx
const { abort, isRequesting } = useXChat({ provider });

<button onClick={abort} disabled={!isRequesting}>
  停止生成
</button>;
// abort 会触�?requestFallback，error.name === 'AbortError'
```

#### 重新生成（onReload�?

```tsx
const { messages, onReload, isRequesting } = useXChat({ provider });

// �?assistant 消息添加重新生成按钮
items={messages.map((msg) => ({
  key: msg.id,
  role: msg.message.role,
  content: msg.message.content,
  loading: msg.status === 'loading',
  footer: msg.message.role === 'assistant' && (
    <Button
      size="small"
      type="text"
      icon={<SyncOutlined />}
      loading={msg.status === 'loading' && isRequesting}
      onClick={() => onReload(msg.id, {}, { extraInfo: { isRegenerate: true } })}
    >
      重新生成
    </Button>
  ),
}))}
```

> ⚠️ `onReload` 第二个参数是 `requestParams`，通常�?`{}` 即可（会复用原有上下文）

### 3. 错误处理

#### 统一错误处理

```tsx
const { messages } = useXChat({
  provider,
  requestFallback: (_, { error, errorInfo, messageInfo }) => {
    // 用户主动取消
    if (error.name === 'AbortError') {
      return {
        content: messageInfo?.message?.content || '已取消回�?,
        role: 'assistant' as const,
      };
    }

    // 超时错误
    if (error.name === 'TimeoutError' || error.name === 'StreamTimeoutError') {
      return { content: '请求超时，请稍后重试', role: 'assistant' as const };
    }

    // 服务器返回的错误信息
    if (errorInfo?.error?.message) {
      return { content: errorInfo.error.message, role: 'assistant' as const };
    }

    // 网络错误兜底
    return { content: '网络异常，请稍后重试', role: 'assistant' as const };
  },
});
```

#### 异步 requestFallback

```tsx
requestFallback: async (requestParams, { error, messageInfo }) => {
  if (error.name === 'AbortError') {
    return { content: messageInfo?.message?.content || '已取�?, role: 'assistant' };
  }
  // 可以做异步操作，如上报错�?
  await reportError(error);
  return { content: '已记录错误，请稍后重�?, role: 'assistant' };
},
```

### 4. 默认消息与占�?

#### 同步默认消息

```tsx
const { messages } = useXChat({
  provider,
  defaultMessages: [
    { id: 'sys', message: { role: 'developer', content: '系统提示�? }, status: 'success' },
    { id: '0', message: { role: 'user', content: '你好' }, status: 'success' },
    { id: '1', message: { role: 'assistant', content: '你好！我�?AI 助手' }, status: 'success' },
  ],
});
```

#### 异步加载默认消息（从服务器拉取历史）

```tsx
const { messages, isDefaultMessagesRequesting } = useXChat({
  provider,
  conversationKey: activeKey,
  defaultMessages: async ({ conversationKey }) => {
    const history = await fetchHistory(conversationKey);
    return history.map((item, index) => ({
      id: `history_${index}`,
      message: { role: item.role, content: item.content },
      status: 'success' as const,
    }));
  },
});

// isDefaultMessagesRequesting: 异步加载中为 true
if (isDefaultMessagesRequesting) {
  return <Spin />;
}
```

#### 自定义请求占位符

```tsx
requestPlaceholder: (requestParams, { messages }) => {
  return {
    content: `正在为您生成回复（已�?${messages.length} 条消息）...`,
    role: 'assistant',
  };
},
```

### 5. parser：消息格式转�?

�?`ChatMessage` 需要拆分为多条气泡时使�?`parser`（一转多）：

```tsx
import { useXChat } from '@ant-design/x-sdk';

// 场景：一�?ChatMessage 包含思考链 + 回答，需要拆成两个气泡展�?
const { parsedMessages } = useXChat({
  provider,
  parser: (message: MyMessage) => {
    if (message.reasoning && message.content) {
      return [
        { content: message.reasoning, role: 'assistant', type: 'reasoning' },
        { content: message.content, role: 'assistant', type: 'answer' },
      ];
    }
    return { content: message.content, role: message.role };
  },
});

// 使用 parsedMessages 代替 messages 传给 Bubble.List
<Bubble.List
  items={parsedMessages.map(({ id, message, status }) => ({
    key: id,
    role: message.role,
    content: message.content,
    loading: status === 'loading',
  }))}
/>;
```

### 6. extraInfo：消息元数据

```tsx
// 发送时附加 extraInfo
onRequest(
  { query: '你好' },
  { extraInfo: { sourceComponent: 'SearchPanel', queryId: 'q-001' } },
);

// �?messages 中读�?extraInfo
messages.map((msg) => ({
  key: msg.id,
  content: msg.message.content,
  // extraInfo 存储了发送时附加的元数据
  'data-query-id': msg.extraInfo?.queryId,
}));

// requestFallback 可以�?extraInfo 判断消息来源
requestFallback: (requestParams, { messageInfo }) => {
  const isRetry = messageInfo?.extraInfo?.isRetry;
  return {
    content: isRetry ? '重试也失败了' : '请求失败',
    role: 'assistant',
  };
},
```

### 7. developer / system 角色处理

`OpenAIChatProvider` 支持 `developer` �?`system` 角色作为系统提示词，这类消息通常不展示给用户�?

```tsx
const { messages, setMessage } = useXChat({
  provider,
  defaultMessages: [
    // developer 角色：相当于 system 提示�?
    { id: 'sys', message: { role: 'developer', content: '你是一个有用的助手' }, status: 'success' },
    { id: '0', message: { role: 'user', content: '你好' }, status: 'success' },
    { id: '1', message: { role: 'assistant', content: '你好�? }, status: 'success' },
  ],
});

// 过滤�?developer/system 消息不展�?
const chatMessages = messages.filter(
  (m) => m.message.role !== 'developer' && m.message.role !== 'system',
);

// 动态修改系统提示词
const updateSystemPrompt = (newPrompt: string) => {
  setMessage('sys', {
    message: { role: 'developer', content: newPrompt },
  });
};
```

### 8. Bubble.List �?role 配置

> ⚠️ **常见错误**：`Bubble.List` 使用的是 `role` 属性，不是 `roles`

```tsx
// �?正确
<Bubble.List
  role={{
    assistant: { placement: 'start' },
    user: { placement: 'end' },
    system: { variant: 'borderless' },
  }}
  items={...}
/>

// �?错误（roles 不是正确属性）
<Bubble.List roles={{ ... }} items={...} />
```

`Bubble.List` �?`items` �?`role` 字段值必须与 `role` 配置�?key 匹配�?

```tsx
items={messages.map(({ id, message, status }) => ({
  key: id,
  role: message.role,    // 'user' | 'assistant' | 'system' �?对应 role 配置中的 key
  content: message.content,
  loading: status === 'loading',
  // status 可以直接传入（非必须但有时有用）
  status: status,
}))}
```
