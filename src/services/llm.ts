import Groq from 'groq-sdk';
import { AppConfig } from '../types/schema';
import { ValidatorError } from './validator';

const MODEL = 'llama-3.3-70b-versatile';

async function groqJSON<T>(
  groq: Groq,
  systemPrompt: string,
  userPrompt: string,
  temperature = 0.3
): Promise<T> {
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt + '\n\nYou must respond with valid JSON only. No markdown, no explanation, just raw JSON.' },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = response.choices[0]?.message?.content ?? '{}';
  return JSON.parse(content) as T;
}

export async function executeCompilation(
  prompt: string,
  mode: 'Fast' | 'Balanced' | 'Production',
  apiKey: string,
  onLog?: (log: string) => void
): Promise<AppConfig> {
  const groq = new Groq({ apiKey });
  const log = (msg: string) => { if (onLog) onLog(msg); };

  // ── Stage 1: Intent Extraction ──────────────────────────────────────────
  log('[Stage 1] Extracting Intent...');
  const intent = await groqJSON<{
    product_type: string;
    core_features: string[];
    target_users: string[];
    complexity: string;
  }>(
    groq,
    'You are an expert product analyst.',
    `Analyze this user request and extract the core intent as JSON with keys: product_type, core_features (array), target_users (array), complexity.\n\nRequest: "${prompt}"`,
    0.2
  );
  log(`[Stage 1] Intent: ${intent.product_type} (${intent.complexity})`);

  // ── Stage 2: Architecture Design ────────────────────────────────────────
  log('[Stage 2] Designing Architecture...');
  const architecture = await groqJSON<{
    entities: string[];
    pages: string[];
    roles: string[];
  }>(
    groq,
    'You are a software architect.',
    `Based on this intent: ${JSON.stringify(intent)}\n\nDesign a system architecture. Return JSON with keys: entities (DB tables, array of strings), pages (UI pages, array of strings), roles (user roles, array of strings).`,
    0.2
  );
  log(`[Stage 2] Architecture: ${architecture.roles.join(', ')} roles, ${architecture.pages.length} pages`);

  // ── Stage 3: Full Schema Synthesis ──────────────────────────────────────
  log('[Stage 3] Synthesizing Sub-Schemas...');
  const config = await groqJSON<AppConfig>(
    groq,
    `You are an expert software compiler. Generate a complete application configuration JSON.

The JSON must have exactly this structure:
{
  "ui": {
    "pages": [
      {
        "name": "string",
        "path": "string",
        "roles": ["string"],
        "components": [
          {
            "name": "string",
            "type": "form|table|dashboard|chart|list",
            "fields": ["string"]
          }
        ]
      }
    ]
  },
  "api": {
    "endpoints": [
      {
        "path": "string",
        "method": "GET|POST|PUT|DELETE",
        "roles": ["string"],
        "payloadFields": ["string"],
        "responseFields": ["string"]
      }
    ]
  },
  "db": {
    "tables": [
      {
        "name": "string",
        "columns": [
          {
            "name": "string",
            "type": "string|int|boolean|timestamp|text|float",
            "required": true
          }
        ],
        "relations": []
      }
    ]
  },
  "auth": {
    "strategy": "jwt|session|oauth",
    "roles": ["string"],
    "permissions": {
      "roleNameHere": ["resource:action"]
    }
  }
}

Rules:
1. All roles in UI pages and API endpoints MUST appear in auth.roles
2. All API endpoint paths should correspond to DB table names
3. Include at least 3 pages and 4 API endpoints
4. Every role must have entries in auth.permissions`,
    `Intent: ${JSON.stringify(intent)}
Architecture: ${JSON.stringify(architecture)}
Original Prompt: "${prompt}"

Generate the complete, consistent application configuration JSON now.`,
    mode === 'Production' ? 0.1 : 0.35
  );

  config.intent = intent;
  config.architecture = architecture;

  log('[Stage 3] Schema synthesis complete.');
  return config;
}

export async function generateRepair(
  config: AppConfig,
  errors: ValidatorError[],
  apiKey: string
): Promise<AppConfig> {
  const groq = new Groq({ apiKey });
  const errorContext = errors.map(e => `[${e.layer}] ${e.rule}: ${e.message}`).join('\n');

  const repaired = await groqJSON<AppConfig>(
    groq,
    `You are an expert software repair engine. You will receive a broken application configuration and a list of schema errors.
Patch the configuration to fix all listed errors while preserving the rest of the structure.
Return the complete repaired configuration JSON.`,
    `Current Configuration:\n${JSON.stringify(config, null, 2)}\n\nErrors to fix:\n${errorContext}\n\nReturn the fully repaired configuration JSON.`,
    0.1
  );

  if (!repaired.intent && config.intent) repaired.intent = config.intent;
  if (!repaired.architecture && config.architecture) repaired.architecture = config.architecture;

  return repaired;
}
