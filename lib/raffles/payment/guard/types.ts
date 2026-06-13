export interface ExecutionGuardContext {

  executionKey: string

}

export interface ExecutionGuardResult {

  allowed: boolean

  reason?: string

}