import { AppConfig } from '../types/schema';

// Augmenting types for the validator errors
export interface ValidatorError {
  rule: string;
  message: string;
  layer: 'UI' | 'API' | 'DB' | 'AUTH' | 'CROSS';
}

export function validateConfig(config: AppConfig): ValidatorError[] {
  const errors: ValidatorError[] = [];
  const { ui, api, db, auth } = config;

  if (!auth?.roles || auth.roles.length === 0) {
    errors.push({ rule: 'Rule 3', message: 'No roles defined in auth schema.', layer: 'AUTH' });
    return errors; // Cannot proceed without basic schemas
  }

  // Pre-compute DB tables
  const dbTables = new Set(db?.tables?.map(t => t.name) || []);
  const dbColumnsByTable = new Map(db?.tables?.map(t => [t.name, new Set(t.columns.map(c => c.name))]) || []);

  // Validate API mappings to DB (Rule 2)
  api?.endpoints?.forEach(endpoint => {
    // Basic heuristic: the path usually contains the table name
    const pathParts = endpoint.path.split('/').filter(Boolean);
    const possibleTable = pathParts[0];

    if (possibleTable && !dbTables.has(possibleTable)) {
      errors.push({
        rule: 'Rule 2',
        message: `API endpoint path '/${endpoint.path}' references unknown table '${possibleTable}' in DB schema.`,
        layer: 'API'
      });
    }

    if (endpoint.payloadFields && possibleTable && dbTables.has(possibleTable)) {
      const tableColumns = dbColumnsByTable.get(possibleTable)!;
      endpoint.payloadFields.forEach(field => {
        if (!tableColumns.has(field)) {
          errors.push({
            rule: 'Rule 2',
            message: `API field '${field}' in '/${endpoint.path}' not found in DB table '${possibleTable}'.`,
            layer: 'API'
          });
        }
      });
    }
    
    // Check Auth constraints (Rule 3)
    endpoint.roles.forEach(role => {
      if (!auth.roles.includes(role) && role !== 'public') {
        errors.push({
          rule: 'Rule 3',
          message: `API endpoint '/${endpoint.path}' references unknown role '${role}'.`,
          layer: 'AUTH'
        });
      }
    });
  });

  // Validate UI mappings to API (Rule 1)
  ui?.pages?.forEach(page => {
    page.roles.forEach(role => {
      if (!auth.roles.includes(role) && role !== 'public') {
        errors.push({
          rule: 'Rule 3',
          message: `UI page '${page.name}' references unknown role '${role}'.`,
          layer: 'AUTH'
        });
      }
    });

    page.components.forEach(comp => {
      if (comp.fields) {
        // Find an API endpoint that might serve this
        const pathMatch = page.path.replace('/', '');
        const endpoint = api?.endpoints?.find(e => 
          e.path === pathMatch || e.path === `${pathMatch}s` || `${e.path}s` === pathMatch
        );
        
        if (endpoint) {
          const apiFields = new Set([...(endpoint.payloadFields || []), ...(endpoint.responseFields || [])]);
          comp.fields.forEach(field => {
            if (!apiFields.has(field)) {
              errors.push({
                rule: 'Rule 1',
                message: `UI component '${comp.name}' field '${field}' not found in API schema for related path '/${endpoint.path}'.`,
                layer: 'UI'
              });
            }
          });
        }
      }
    });
  });

  return errors;
}
