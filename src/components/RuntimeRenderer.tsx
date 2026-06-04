"use client";
import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types/schema';
import { LayoutDashboard, Database, Server, Key } from 'lucide-react';

interface RuntimeProps {
  config: AppConfig | null;
}

export default function RuntimeRenderer({ config }: RuntimeProps) {
  const [role, setRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('ui'); 
  const [activePage, setActivePage] = useState<string>('');
  const [mockDb, setMockDb] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (config) {
      // Initialize DB
      const newDb: Record<string, any[]> = {};
      config.db.tables.forEach(t => {
        newDb[t.name] = [];
        // Seed default records to make UI look alive
        if (t.name === 'contacts') {
           newDb[t.name].push({ email: 'john@acme.inc', name: 'John Doe', phone: '555-0100' });
           newDb[t.name].push({ email: 'sara@startup.io', name: 'Sara Smith', phone: '555-0200' });
        }
      });
      setMockDb(newDb);
      
      const defaultRole = config.auth.roles?.[0] || '';
      setRole(defaultRole);
      
      const firstPage = config.ui.pages.filter(p => p.roles.includes(defaultRole))[0]?.path || '';
      setActivePage(firstPage);
    }
  }, [config]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-xl">
        <p>Awaiting valid compilation to launch runtime preview.</p>
      </div>
    );
  }

  const availableRoles = config.auth.roles || [];
  const pages = config.ui.pages.filter(p => p.roles.includes(role));
  const currentPage = pages.find(p => p.path === activePage) || pages[0];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          <span className="ml-2 text-sm font-semibold text-neutral-300">
             {config.intent?.product_type || "Generated App"} - Live
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-neutral-800 rounded-lg p-1">
            <button onClick={() => setActiveTab('ui')} className={`px-3 py-1 text-xs rounded-md transition-colors ${activeTab === 'ui' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}>UI App</button>
            <button onClick={() => setActiveTab('api')} className={`px-3 py-1 text-xs rounded-md transition-colors ${activeTab === 'api' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}>API Simulator</button>
            <button onClick={() => setActiveTab('db')} className={`px-3 py-1 text-xs rounded-md transition-colors ${activeTab === 'db' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}>DB Inspector</button>
          </div>
          <select 
            value={role} 
            onChange={e => {
              setRole(e.target.value);
              const firstAvail = config.ui.pages.filter(p => p.roles.includes(e.target.value))[0]?.path || '';
              setActivePage(firstAvail);
            }}
            className="bg-neutral-800 border border-neutral-700 text-xs rounded px-2 py-1 outline-none text-indigo-400 font-medium"
          >
            {availableRoles.map(r => <option key={r} value={r}>Role: {r}</option>)}
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'ui' && (
          <>
            <div className="w-48 bg-neutral-950 border-r border-neutral-800 flex flex-col p-3 gap-1">
              <div className="text-[10px] uppercase text-neutral-500 font-bold mb-2 tracking-wider px-2">Navigation</div>
              {pages.map(page => (
                <button
                  key={page.path}
                  onClick={() => setActivePage(page.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${activePage === page.path || currentPage?.path === page.path ? 'bg-indigo-600/20 text-indigo-400' : 'text-neutral-400 hover:bg-neutral-800'}`}
                >
                  <LayoutDashboard size={14} />
                  {page.name}
                </button>
              ))}
              {pages.length === 0 && <div className="text-xs text-red-400/80 px-2 mt-2">No accessible pages for {role}.</div>}
            </div>
            
            <div className="flex-1 p-8 bg-[#0a0a0a] overflow-y-auto">
              {currentPage ? (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <h1 className="text-3xl font-semibold text-white tracking-tight mb-8">{currentPage.name}</h1>
                  {currentPage.components.map((comp, i) => (
                    <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
                      <h3 className="text-sm font-medium text-indigo-400 mb-5 tracking-wide">{comp.name}</h3>
                      
                      {comp.type === 'form' && (
                        <div className="space-y-4 max-w-md">
                          {comp.fields?.map(f => (
                            <div key={f}>
                              <label className="block text-xs font-medium text-neutral-400 mb-1.5 capitalize">{f}</label>
                              <input type="text" className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all" placeholder={`Enter ${f}...`} />
                            </div>
                          ))}
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors mt-2 shadow-lg shadow-indigo-500/20">Submit</button>
                        </div>
                      )}

                      {comp.type === 'table' && (
                        <div className="overflow-x-auto rounded-lg border border-neutral-800">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-950 border-b border-neutral-800">
                              <tr>
                                {comp.fields?.map(f => <th key={f} className="p-4 text-neutral-400 font-medium capitalize text-xs tracking-wider">{f}</th>)}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {(() => {
                                  const possibleTable = config.db.tables.find(t => t.name === currentPage.path || currentPage.name.toLowerCase().includes(t.name) || t.name === 'contacts');
                                  const records = possibleTable ? mockDb[possibleTable.name] || [] : [];
                                  
                                  if (records.length === 0) {
                                    return <tr><td colSpan={comp.fields?.length} className="p-8 text-center text-neutral-600">No data found in connected mock DB.</td></tr>;
                                  }

                                  return records.map((rec, ri) => (
                                    <tr key={ri} className="hover:bg-neutral-800/30 transition-colors">
                                      {comp.fields?.map(f => <td key={f} className="p-4 text-neutral-300">{rec[f] || '-'}</td>)}
                                    </tr>
                                  ));
                                })()}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {comp.type === 'dashboard' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {comp.fields?.map(f => (
                             <div key={f} className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col justify-center items-start shadow-inner">
                               <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{f}</div>
                               <div className="text-3xl font-bold text-white mt-2">1,240</div>
                               <div className="text-xs text-green-500 mt-2 font-medium">+12.5% from last week</div>
                             </div>
                           ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-600">Select an accessible page from the sidebar.</div>
              )}
            </div>
          </>
        )}

        {activeTab === 'db' && (
          <div className="flex-1 p-8 bg-[#0a0a0a] overflow-y-auto">
             <div className="flex items-center gap-3 mb-8">
               <Database className="text-indigo-400" size={24} />
               <h2 className="text-2xl font-semibold text-white tracking-tight">Database Inspector</h2>
             </div>
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {config.db.tables.map(table => (
                  <div key={table.name} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-md">
                    <div className="bg-neutral-950 px-5 py-3 border-b border-neutral-800 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <Database size={14} className="text-neutral-500" />
                         <span className="font-semibold text-sm text-indigo-300">{table.name}</span>
                      </div>
                      <span className="text-xs font-medium bg-neutral-800 text-neutral-400 px-2 py-1 rounded-full">{mockDb[table.name]?.length || 0} rows</span>
                    </div>
                    <div className="p-0 overflow-x-auto">
                       <table className="w-full text-sm text-left">
                         <thead className="bg-neutral-900 border-b border-neutral-800/80">
                           <tr>
                             {table.columns.map(c => (
                               <th key={c.name} className="px-5 py-3 font-medium text-neutral-400 text-xs">
                                 {c.name} <span className="text-neutral-600 font-normal ml-1">({c.type})</span>
                               </th>
                             ))}
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-neutral-800/50">
                           {mockDb[table.name]?.map((row, i) => (
                             <tr key={i} className="hover:bg-neutral-800/20">
                               {table.columns.map(c => <td key={c.name} className="px-5 py-3 text-neutral-300 font-mono text-xs">{row[c.name] || 'null'}</td>)}
                             </tr>
                           ))}
                           {(!mockDb[table.name] || mockDb[table.name].length === 0) && <tr><td colSpan={table.columns.length} className="p-6 text-center text-neutral-600">Empty table. No rows found.</td></tr>}
                         </tbody>
                       </table>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="flex-1 p-8 bg-[#0a0a0a] overflow-y-auto">
             <div className="flex items-center gap-3 mb-8">
               <Server className="text-green-400" size={24} />
               <h2 className="text-2xl font-semibold text-white tracking-tight">API Sandbox</h2>
             </div>
             <div className="grid gap-4">
                {config.api.endpoints.map((endpoint, i) => (
                  <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-widest ${
                        endpoint.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        endpoint.method === 'POST' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        endpoint.method === 'DELETE' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>{endpoint.method}</span>
                      <span className="font-mono text-sm text-neutral-200">/{endpoint.path}</span>
                      <div className="flex ml-auto gap-2 items-center text-xs text-neutral-500 bg-neutral-950 px-2 py-1 rounded-md border border-neutral-800">
                         <Key size={12} className="text-indigo-400" />
                         <span>Roles: {endpoint.roles.join(', ')}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-800/50">
                       {endpoint.payloadFields && endpoint.payloadFields.length > 0 && (
                         <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                           <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2 font-semibold">Request Payload Schema</div>
                           <pre className="font-mono text-[13px] text-indigo-300 leading-relaxed overflow-x-auto">
                             {`{\n`}{endpoint.payloadFields.map(f => `  "${f}": "..."`).join(',\n')}{`\n}`}
                           </pre>
                         </div>
                       )}
                       {endpoint.responseFields && endpoint.responseFields.length > 0 && (
                         <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                           <div className="text-[11px] uppercase tracking-wider text-neutral-500 mb-2 font-semibold">Response Schema</div>
                           <pre className="font-mono text-[13px] text-green-300 leading-relaxed overflow-x-auto">
                             {`{\n`}{endpoint.responseFields.map(f => `  "${f}": "..."`).join(',\n')}{`\n}`}
                           </pre>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
