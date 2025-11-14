import { useMemo, useState } from 'react';

export const MODEL_OPTIONS = [
  {
    id: 'gemini:2.5-flash',
    label: 'Google · Gemini 2.5 Flash',
    provider: 'gemini',
    model: 'gemini-2.5-flash'
  },
  {
    id: 'anthropic:claude-3-5-haiku-20241022',
    label: 'Anthropic · Claude 3.5 Haiku (2024-10-22)',
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022'
  },
  {
    id: 'openai:gpt-4o-mini',
    label: 'OpenAI · GPT-4o mini',
    provider: 'openai',
    model: 'gpt-4o-mini'
  }
];

export function useModelManager() {
  const [modelId, setModelId] = useState(() => {
    if (typeof window === 'undefined') return MODEL_OPTIONS[0].id;
    try {
      const params = new URLSearchParams(window.location.search);
      const paramModel = params.get('model');
      if (paramModel && MODEL_OPTIONS.some((option) => option.id === paramModel)) {
        return paramModel;
      }
    } catch {
      // ignore malformed URLs
    }
    return MODEL_OPTIONS[0].id;
  });

  const selectedModelOption = useMemo(
    () => MODEL_OPTIONS.find((option) => option.id === modelId) || MODEL_OPTIONS[0],
    [modelId]
  );

  return {
    modelId,
    setModelId,
    selectedModelOption,
    options: MODEL_OPTIONS
  };
}

