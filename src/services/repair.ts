import { AppConfig } from '../types/schema';
import { validateConfig, ValidatorError } from './validator';
import { generateMockRepair } from './mockLLM';

export async function attemptRepair(
  config: AppConfig,
  errors: ValidatorError[],
  mode: 'Fast' | 'Balanced' | 'Production'
): Promise<{ repairedConfig: AppConfig; repairCycles: number; success: boolean }> {
  let currentConfig = JSON.parse(JSON.stringify(config)) as AppConfig;
  let currentErrors = [...errors];
  let cycles = 0;
  const maxCycles = mode === 'Production' ? 3 : mode === 'Balanced' ? 1 : 0;

  while (currentErrors.length > 0 && cycles < maxCycles) {
    cycles++;
    // We isolate the failing layer and request a targeted fix
    // using our mockLLM (or live LLM in the future).
    currentConfig = await generateMockRepair(currentConfig, currentErrors);
    currentErrors = validateConfig(currentConfig);
  }

  return {
    repairedConfig: currentConfig,
    repairCycles: cycles,
    success: currentErrors.length === 0
  };
}
