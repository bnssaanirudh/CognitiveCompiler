import { AppConfig } from '../types/schema';
import { validateConfig, ValidatorError } from './validator';
import { generateRepair } from './llm';

export async function attemptRepair(
  config: AppConfig,
  errors: ValidatorError[],
  mode: 'Fast' | 'Balanced' | 'Production',
  onLog: (msg: string) => void
): Promise<{ repairedConfig: AppConfig; repairCycles: number; success: boolean }> {
  let currentConfig = JSON.parse(JSON.stringify(config)) as AppConfig;
  let currentErrors = [...errors];
  let cycles = 0;
  const maxCycles = mode === 'Production' ? 3 : mode === 'Balanced' ? 1 : 0;
  const apiKey = process.env.GROQ_API_KEY || '';

  while (currentErrors.length > 0 && cycles < maxCycles) {
    cycles++;
    onLog(`[Repair Cycle ${cycles}] Requesting LLM to patch ${currentErrors.length} validation errors...`);
    
    try {
      currentConfig = await generateRepair(currentConfig, currentErrors, apiKey);
    } catch (e: any) {
      onLog(`[Repair Error] LLM generation failed during repair: ${e.message}`);
      break;
    }
    
    currentErrors = validateConfig(currentConfig);
  }

  return {
    repairedConfig: currentConfig,
    repairCycles: cycles,
    success: currentErrors.length === 0
  };
}
