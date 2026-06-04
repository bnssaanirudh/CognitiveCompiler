import { AppConfig } from '../types/schema';
import { ValidatorError } from './validator';

export async function executeMockCompilation(prompt: string): Promise<AppConfig> {
  const p = prompt.toLowerCase();
  const isEdgeCase = p.includes('free forever') || p.includes('edge') || p.includes('impossible');

  if (isEdgeCase) {
    // Generate a horribly broken config to test heavy repair
    return {
      intent: { type: "EdgeApp", conflicts: ["pricing"] },
      architecture: { entities: ["User"] },
      ui: { pages: [{ name: "Dashboard", path: "dashboard", components: [{ type: "dashboard", name: "Stats", fields: ["revenue"] }], roles: ["admin"] }] },
      api: { endpoints: [{ path: "stats", method: "GET", roles: ["admin"], responseFields: ["amount"] }] },
      db: { tables: [] }, // Missing DB tables entirely
      auth: { roles: [], permissions: {} } // Missing Roles
    };
  }

  // Standard CRM response containing a few intentional, common LLM hallucinations
  return {
    intent: { product_type: "CRM", modules: ["auth", "contacts", "dashboard"], roles: ["admin", "user"] },
    architecture: { pages: ["Dashboard", "Contacts"], entities: ["User", "Contact"] },
    ui: {
      pages: [
        {
          name: "Contacts",
          path: "contacts",
          roles: ["admin", "user"],
          components: [
            // Intentional Error 1: UI requests 'phone' which API doesn't provide
            { type: "table", name: "ContactsTable", fields: ["email", "phone"] }, 
            { type: "form", name: "CreateContact", fields: ["email", "name"] }
          ]
        }
      ]
    },
    api: {
      endpoints: [
        { path: "contacts", method: "GET", roles: ["admin", "user"], responseFields: ["email", "name"] }, 
        { path: "contacts", method: "POST", roles: ["admin", "user"], payloadFields: ["email", "name"] },
        // Intentional Error 2: API endpoint secured by role 'manager' which isn't in Auth schema
        { path: "dashboard", method: "GET", roles: ["manager"] } 
      ]
    },
    db: {
      tables: [
        { name: "contacts", columns: [{ name: "email", type: "string" }, { name: "name", type: "string" }] }
      ]
    },
    auth: {
      roles: ["admin", "user"],
      permissions: { admin: ["all"], user: ["read"] }
    }
  };
}

export async function generateMockRepair(config: AppConfig, errors: ValidatorError[]): Promise<AppConfig> {
  const repairedConfig = JSON.parse(JSON.stringify(config)) as AppConfig;

  // Simulate LLM reasoning through targeted error messages
  for (const error of errors) {
    if (error.layer === 'UI' && error.message.includes('phone')) {
      const getEndpoint = repairedConfig.api.endpoints.find(e => e.path === 'contacts' && e.method === 'GET');
      if (getEndpoint && !getEndpoint.responseFields?.includes('phone')) getEndpoint.responseFields?.push('phone');
      
      const contactTable = repairedConfig.db.tables.find(t => t.name === 'contacts');
      if (contactTable && !contactTable.columns.find(c => c.name === 'phone')) {
         contactTable.columns.push({ name: 'phone', type: 'string' });
      }
    }
    if (error.layer === 'API' && error.message.includes('unknown table')) {
       // Parse table name from: "references unknown table 'stats' in DB schema"
       const match = error.message.match(/'([^']+)'/);
       if (match && match[1]) {
          const tableName = match[1];
          if (!repairedConfig.db.tables.find(t => t.name === tableName)) {
            repairedConfig.db.tables.push({ name: tableName, columns: [{ name: "id", type: "string" }, { name: "amount", type: "number" }]});
          }
       }
    }
    if (error.layer === 'AUTH' && error.message.includes('unknown role')) {
       const match = error.message.match(/'([^']+)'/);
       if (match && match[1]) {
         const roleName = match[1];
         if (!repairedConfig.auth.roles.includes(roleName)) {
            repairedConfig.auth.roles.push(roleName);
         }
       }
    }
  }

  return repairedConfig;
}
