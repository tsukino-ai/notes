# Deep Agents Customization & Backends 原文

> 来源：https://docs.langchain.com/oss/python/deepagents/customization + backends + permissions
> 抓取日期：2026-05-11

## Customization

### System Prompt 四层结构

Deep Agents builds the system prompt from up to four named parts so that caller-supplied instructions, the SDK's built-in agent guidance, and any model-specific profile overrides can coexist with predictable precedence.

The four named parts (each may be absent):

| Name | Source | Notes |
|------|--------|-------|
| USER | system_prompt= argument to create_deep_agent | str or SystemMessage; omitted when unset. |
| BASE | The SDK default (BASE_AGENT_PROMPT) | Always present unless replaced by a profile's CUSTOM. |
| CUSTOM | profile base_system_prompt | Replaces BASE when set. |
| SUFFIX | profile system_prompt_suffix | Appended at the end. |

The order is always USER -> (BASE or CUSTOM) -> SUFFIX, joined by blank lines.

Two invariants:
- USER is always at the front. The caller's text precedes any SDK or profile content.
- SUFFIX is always at the end. Profile suffixes sit closest to the conversation history.

### Built-in Middleware

- TodoListMiddleware: Tracks and manages todo lists for organizing agent tasks and work
- FilesystemMiddleware: Handles file system operations such as reading, writing, and navigating directories
- SubAgentMiddleware: Spawns and coordinates subagents for delegating tasks to specialized agents
- SummarizationMiddleware: Condenses message history to stay within context limits when conversations grow long

### Custom Middleware

Deep Agents support any middleware, including built-in middleware, prebuilt middleware from LangChain, provider-specific middleware, and custom middleware.

Pass middleware to the middleware argument of create_deep_agent.

## Backends

### Built-in backends

| Backend | Description | Persistence |
|---------|-------------|-------------|
| StateBackend (default) | Ephemeral in-memory filesystem stored in LangGraph state | Single thread only |
| FilesystemBackend | Local disk read/write under a configurable root_dir | Persistent |
| StoreBackend | LangGraph BaseStore (Redis, Postgres, etc.) | Cross-thread durable |
| LocalShellBackend | Extends FilesystemBackend with execute tool | Host system — no isolation |
| CompositeBackend | Routes different paths to different backends | Depends on routed backends |
| Sandbox backends | Modal, Daytona, Runloop, Deno, LangSmith | Isolated ephemeral |

### Sandbox Backends

- Modal — `pip install langchain-modal`
- Runloop — `pip install langchain-runloop`
- Daytona — `pip install langchain-daytona`
- LangSmith — `pip install "langsmith[sandbox]"` (private beta)

## Permissions

Declarative permission rules for filesystem tools. Rules are evaluated in declaration order — first-match-wins.

```python
from deepagents import FilesystemPermission, create_deep_agent

agent = create_deep_agent(
    model=model,
    backend=backend,
    permissions=[
        FilesystemPermission(
            operations=["write"],
            paths=["/**"],
            mode="deny",
        ),
    ],
)
```

Subagents inherit parent permissions by default. Override with the permissions field in subagent spec.
