import type { ContentBlockParam, MessageParam, ToolResultBlockParam, ToolUseBlock } from '@anthropic-ai/sdk/resources/index.mjs'

export type MessageOrigin = 'user' | 'api' | 'system' | 'tool'

export type SystemMessageLevel = 'info' | 'warning' | 'error'

export interface BaseMessage {
  uuid: string
  timestamp?: number
}

export interface UserMessage extends BaseMessage {
  type: 'user'
  message: MessageParam
  toolResults?: ToolResultBlockParam[]
}

export interface AssistantMessage extends BaseMessage {
  type: 'assistant'
  message: {
    role: 'assistant'
    content: ContentBlockParam[]
  }
  costUSD?: number
  durationMs?: number
  isApiErrorMessage?: boolean
}

export interface SystemMessage extends BaseMessage {
  type: 'system'
  level?: SystemMessageLevel
  content: string
}

export interface SystemInformationalMessage extends BaseMessage {
  type: 'system_informational'
  content: string
}

export interface SystemLocalCommandMessage extends BaseMessage {
  type: 'system_local_command'
  command: string
  result?: unknown
}

export interface SystemAPIErrorMessage extends BaseMessage {
  type: 'system_api_error'
  error: string
}

export interface SystemThinkingMessage extends BaseMessage {
  type: 'system_thinking'
  thinking: string
}

export interface SystemCompactBoundaryMessage extends BaseMessage {
  type: 'system_compact_boundary'
}

export interface SystemMicrocompactBoundaryMessage extends BaseMessage {
  type: 'system_microcompact_boundary'
}

export interface SystemMemorySavedMessage extends BaseMessage {
  type: 'system_memory_saved'
  memory: string
}

export interface SystemFileSnapshotMessage extends BaseMessage {
  type: 'system_file_snapshot'
  path: string
  content: string
}

export interface SystemBridgeStatusMessage extends BaseMessage {
  type: 'system_bridge_status'
  status: string
}

export interface SystemAwaySummaryMessage extends BaseMessage {
  type: 'system_away_summary'
  summary: string
}

export interface SystemAgentsKilledMessage extends BaseMessage {
  type: 'system_agents_killed'
  agentIds: string[]
}

export interface SystemApiMetricsMessage extends BaseMessage {
  type: 'system_api_metrics'
  metrics: Record<string, unknown>
}

export interface SystemTurnDurationMessage extends BaseMessage {
  type: 'system_turn_duration'
  durationMs: number
}

export interface SystemPermissionRetryMessage extends BaseMessage {
  type: 'system_permission_retry'
}

export interface SystemScheduledTaskFireMessage extends BaseMessage {
  type: 'system_scheduled_task_fire'
  taskId: string
}

export interface SystemStopHookSummaryMessage extends BaseMessage {
  type: 'system_stop_hook_summary'
  summary: string
}

export interface ProgressMessage extends BaseMessage {
  type: 'progress'
  toolUseID: string
  content: string
}

export interface AttachmentMessage extends BaseMessage {
  type: 'attachment'
  path: string
  mimeType?: string
}

export interface HookResultMessage extends BaseMessage {
  type: 'hook_result'
  hookName: string
  result: unknown
}

export interface TombstoneMessage extends BaseMessage {
  type: 'tombstone'
  originalUuid: string
}

export interface ToolUseSummaryMessage extends BaseMessage {
  type: 'tool_use_summary'
  toolUseID: string
  summary: string
}

export interface GroupedToolUseMessage extends BaseMessage {
  type: 'grouped_tool_use'
  toolUses: ToolUseBlock[]
}

export interface CollapsedReadSearchGroup extends BaseMessage {
  type: 'collapsed_read_search'
  messages: Message[]
}

export interface StopHookInfo {
  hookName: string
  reason: string
}

export interface CompactMetadata {
  originalMessageCount: number
  compactedAt: number
}

export type PartialCompactDirection = 'head' | 'tail'

export type CollapsibleMessage =
  | ProgressMessage
  | HookResultMessage
  | ToolUseSummaryMessage

export type Message =
  | UserMessage
  | AssistantMessage
  | SystemMessage
  | SystemInformationalMessage
  | SystemLocalCommandMessage
  | SystemAPIErrorMessage
  | SystemThinkingMessage
  | SystemCompactBoundaryMessage
  | SystemMicrocompactBoundaryMessage
  | SystemMemorySavedMessage
  | SystemFileSnapshotMessage
  | SystemBridgeStatusMessage
  | SystemAwaySummaryMessage
  | SystemAgentsKilledMessage
  | SystemApiMetricsMessage
  | SystemTurnDurationMessage
  | SystemPermissionRetryMessage
  | SystemScheduledTaskFireMessage
  | SystemStopHookSummaryMessage
  | ProgressMessage
  | AttachmentMessage
  | HookResultMessage
  | TombstoneMessage
  | ToolUseSummaryMessage
  | GroupedToolUseMessage
  | CollapsedReadSearchGroup

export interface NormalizedUserMessage {
  type: 'user'
  uuid: string
  content: string
}

export interface NormalizedAssistantMessage {
  type: 'assistant'
  uuid: string
  content: string
}

export type NormalizedMessage = NormalizedUserMessage | NormalizedAssistantMessage

export type RenderableMessage = Message

export interface StreamEvent {
  type: string
  data?: unknown
}

export interface RequestStartEvent {
  type: 'request_start'
  requestId: string
}
