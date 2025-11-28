import { useMutation } from '@tanstack/react-query';
import { generateTool, type GeneratedToolBundle } from '@questit/toolkit/generateTool';
import { AI_PROXY_URL } from '../lib/env';
import { getSupabaseClient } from '../lib/supabase';

interface GeneratePayload {
  prompt: string;
  previousCode?: Partial<GeneratedToolBundle> | null;
}

export function useGenerateTool() {
  const supabase = getSupabaseClient();
  return useMutation({
    mutationFn: async ({ prompt, previousCode }: GeneratePayload) => {
      const trimmed = prompt.trim();
      if (!trimmed) {
        throw new Error('Prompt is required.');
      }
      if (!supabase) {
        throw new Error('Supabase is not configured.');
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        throw new Error('Sign in to generate tools.');
      }
      return generateTool(trimmed, AI_PROXY_URL, previousCode ?? null, {
        modelConfig: { provider: 'openai' },
        authToken: token
      });
    }
  });
}
