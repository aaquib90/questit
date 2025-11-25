import { useMutation } from '@tanstack/react-query';
import { generateTool, type GeneratedToolBundle } from '@questit/toolkit/generateTool';
import { AI_PROXY_URL } from '../lib/env';

interface GeneratePayload {
  prompt: string;
  previousCode?: Partial<GeneratedToolBundle> | null;
}

export function useGenerateTool() {
  return useMutation({
    mutationFn: async ({ prompt, previousCode }: GeneratePayload) => {
      const trimmed = prompt.trim();
      if (!trimmed) {
        throw new Error('Prompt is required.');
      }
      return generateTool(trimmed, AI_PROXY_URL, previousCode ?? null, {
        modelConfig: { provider: 'openai' }
      });
    }
  });
}
