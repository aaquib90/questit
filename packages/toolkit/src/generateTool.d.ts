export interface GenerateToolOptions {
  modelConfig?: {
    provider?: string;
    model?: string;
  };
  memoryConfig?: {
    mode?: 'none' | 'device' | 'session' | string;
    retention?: 'session' | 'persistent' | string;
  };
  requestMetadata?: Record<string, unknown>;
  authToken?: string | null;
  getAuthToken?: () => Promise<string | null> | string | null;
}

export interface GeneratedToolBundle {
  html: string;
  css: string;
  js: string;
}

export declare function generateTool(
  prompt: string,
  endpoint?: string,
  previousCode?: Partial<GeneratedToolBundle> | null,
  options?: GenerateToolOptions
): Promise<GeneratedToolBundle>;

declare const _default: {
  generateTool: typeof generateTool;
};

export default _default;
