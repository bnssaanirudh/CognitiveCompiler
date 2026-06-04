import { AppConfig } from '../types/schema';
import { validateConfig, ValidatorError } from './validator';
import { attemptRepair } from './repair';
import { executeMockCompilation } from './mockLLM';

export interface CompilationResult {
  config: AppConfig | null;
  logs: string[];
  success: boolean;
  rawErrors: ValidatorError[];
  metrics: {
    latencyMs: number;
    repairCycles: number;
    schemaErrors: number;
  };
}

export async function compilePrompt(
  prompt: string,
  mode: 'Fast' | 'Balanced' | 'Production'
): Promise<CompilationResult> {
  const startTime = Date.now();
  const logs: string[] = [];
  
  logs.push(`[Stage 1] Intent Extraction for prompt: "${prompt.substring(0, 30)}..."`);
  logs.push(`[Stage 2] Generating Architecture Graph`);
  logs.push(`[Stage 3] Synthesizing UI, API, DB, and Auth schemas`);

  // Simulate LLM latency based on mode
  await new Promise(r => setTimeout(r, mode === 'Fast' ? 800 : mode === 'Balanced' ? 1500 : 2500));
  
  // Call generator (contains deterministic mock outputs including initial errors)
  let config = await executeMockCompilation(prompt);

  logs.push(`[Stage 4] Running Consistency Validator Engine`);
  let validationErrors = validateConfig(config);
  const initialErrorCount = validationErrors.length;
  
  let repairCycles = 0;
  let finalSuccess = true;

  if (validationErrors.length > 0) {
    logs.push(`[Validator] ⚠️ Found ${validationErrors.length} cross-layer schema consistency errors.`);
    validationErrors.forEach(err => logs.push(`   -> [${err.layer}] ${err.rule}: ${err.message}`));

    if (mode !== 'Fast') {
      logs.push(`[Stage 5] Initiating Targeted Repair Engine (${mode} mode)`);
      const repairResult = await attemptRepair(config, validationErrors, mode);
      config = repairResult.repairedConfig;
      repairCycles = repairResult.repairCycles;
      validationErrors = validateConfig(config); // ensure we have final list
      
      if (repairResult.success) {
        logs.push(`[Repair] ✅ Successfully repaired all errors after ${repairCycles} cycle(s).`);
      } else {
        logs.push(`[Repair] ❌ Failed to repair all errors after ${repairCycles} cycle(s).`);
        finalSuccess = false;
      }
    } else {
      logs.push(`[Repair] Skipped due to 'Fast' mode configuration. Compilation blocked.`);
      finalSuccess = false; 
    }
  } else {
    logs.push(`[Validator] ✅ All UI, API, DB, and Auth constraints passed successfully.`);
  }

  logs.push(`[Stage 6] Emitting Executable App Config`);

  const latencyMs = Date.now() - startTime + (repairCycles * 1000);
  
  return {
    config: finalSuccess ? config : config, // still return config to let UI show broken state if fast
    logs,
    success: finalSuccess,
    rawErrors: validationErrors,
    metrics: {
      latencyMs,
      repairCycles,
      schemaErrors: initialErrorCount,
    }
  };
}
