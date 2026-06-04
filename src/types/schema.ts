export interface UISchema {
  pages: {
    name: string;
    path: string;
    components: {
      type: 'table' | 'form' | 'dashboard' | 'list' | 'navbar';
      name: string;
      fields?: string[];
    }[];
    roles: string[];
  }[];
}

export interface APISchema {
  endpoints: {
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    roles: string[];
    payloadFields?: string[];
    responseFields?: string[];
  }[];
}

export interface DBSchema {
  tables: {
    name: string;
    columns: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date' | 'uuid';
      isPrimary?: boolean;
      references?: { table: string; column: string };
    }[];
  }[];
}

export interface AuthSchema {
  roles: string[];
  permissions: Record<string, string[]>;
}

export interface AppConfig {
  intent?: any;
  architecture?: any;
  ui: UISchema;
  api: APISchema;
  db: DBSchema;
  auth: AuthSchema;
}
