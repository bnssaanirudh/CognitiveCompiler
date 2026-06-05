"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { AppConfig } from '../types/schema';
import { LayoutDashboard, Database, Server, Key, Layout, Plus, Trash2, CheckCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RuntimeProps {
  config: AppConfig | null;
}

// ─── Toast Notification ───────────────────────────────────────────────────────
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl"
    >
      <CheckCircle size={16} className="text-emerald-400 shrink-0" />
      {message}
    </motion.div>
  );
}

// ─── Form Component ────────────────────────────────────────────────────────────
function LiveForm({
  fields,
  tableName,
  onSubmit,
}: {
  fields: string[];
  tableName: string;
  onSubmit: (tableName: string, record: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map(f => [f, '']))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fields.every(f => !values[f]?.trim())) return;
    onSubmit(tableName, { ...values });
    setValues(Object.fromEntries(fields.map(f => [f, ''])));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {fields.map(f => (
        <div key={f}>
          <label className="block text-xs font-bold tracking-wider text-slate-500 mb-2 uppercase">{f}</label>
          <input
            type={f.toLowerCase().includes('email') ? 'email' : f.toLowerCase().includes('password') ? 'password' : f.toLowerCase().includes('date') ? 'date' : 'text'}
            value={values[f] || ''}
            onChange={e => setValues(v => ({ ...v, [f]: e.target.value }))}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all placeholder-slate-400"
            placeholder={`Enter ${f}...`}
          />
        </div>
      ))}
      <button
        type="submit"
        className="bg-slate-900 text-white hover:bg-slate-800 text-sm font-bold px-6 py-3 rounded-xl transition-all w-full active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
      >
        <Send size={14} /> Submit Record
      </button>
    </form>
  );
}

// ─── Live Table ────────────────────────────────────────────────────────────────
function LiveTable({
  fields,
  records,
  onDelete,
}: {
  fields: string[];
  records: Record<string, string>[];
  onDelete: (index: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {fields.map(f => (
              <th key={f} className="px-5 py-3 text-slate-500 font-bold uppercase text-[10px] tracking-widest">{f}</th>
            ))}
            <th className="px-5 py-3 text-slate-400 font-bold uppercase text-[10px] tracking-widest w-10">Del</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.length === 0 ? (
            <tr>
              <td colSpan={fields.length + 1} className="p-8 text-center text-slate-400 text-xs italic font-mono">
                No records yet. Use a form to add data.
              </td>
            </tr>
          ) : (
            records.map((rec, ri) => (
              <tr key={ri} className="hover:bg-slate-50 transition-colors group">
                {fields.map(f => (
                  <td key={f} className="px-5 py-3 text-slate-700 font-medium text-sm">{rec[f] ?? rec[Object.keys(rec).find(k => k.toLowerCase() === f.toLowerCase()) ?? ''] ?? '—'}</td>
                ))}
                <td className="px-5 py-3">
                  <button
                    onClick={() => onDelete(ri)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-600 p-1 rounded"
                    title="Delete row"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main RuntimeRenderer ──────────────────────────────────────────────────────
export default function RuntimeRenderer({ config }: RuntimeProps) {
  const [role, setRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('ui');
  const [activePage, setActivePage] = useState<string>('');
  const [mockDb, setMockDb] = useState<Record<string, Record<string, string>[]>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [apiCallLog, setApiCallLog] = useState<{ time: string; method: string; path: string; status: number }[]>([]);

  // Seed initial DB with realistic data
  useEffect(() => {
    if (!config) return;
    const newDb: Record<string, Record<string, string>[]> = {};
    config.db.tables.forEach(t => {
      const name = t.name.toLowerCase();
      if (name.includes('user') || name.includes('contact') || name.includes('customer') || name.includes('client')) {
        newDb[t.name] = [
          Object.fromEntries(t.columns.map(c => [c.name, seedValue(c.name, 'Alice Johnson')])),
          Object.fromEntries(t.columns.map(c => [c.name, seedValue(c.name, 'Bob Martinez')])),
        ];
      } else if (name.includes('order') || name.includes('product') || name.includes('item') || name.includes('menu')) {
        newDb[t.name] = [
          Object.fromEntries(t.columns.map(c => [c.name, seedValue(c.name, 'Item A')])),
          Object.fromEntries(t.columns.map(c => [c.name, seedValue(c.name, 'Item B')])),
        ];
      } else {
        newDb[t.name] = [];
      }
    });
    setMockDb(newDb);
    const defaultRole = config.auth.roles?.[0] || '';
    setRole(defaultRole);
    const firstPage = config.ui.pages.filter(p => p.roles.includes(defaultRole))[0]?.path || '';
    setActivePage(firstPage);
  }, [config]);

  const handleFormSubmit = useCallback((tableName: string, record: Record<string, string>) => {
    setMockDb(prev => ({
      ...prev,
      [tableName]: [...(prev[tableName] || []), record],
    }));
    setToast(`✅ Record added to "${tableName}" table`);
    // Log a simulated API call
    const endpoint = config?.api.endpoints.find(e => e.method === 'POST' && e.path.toLowerCase().includes(tableName.toLowerCase()));
    if (endpoint) {
      setApiCallLog(prev => [{
        time: new Date().toLocaleTimeString(),
        method: 'POST',
        path: '/' + endpoint.path.replace(/^\/+/, ''),
        status: 201,
      }, ...prev.slice(0, 9)]);
    }
  }, [config]);

  const handleDeleteRow = useCallback((tableName: string, index: number) => {
    setMockDb(prev => ({
      ...prev,
      [tableName]: prev[tableName].filter((_, i) => i !== index),
    }));
    setToast(`🗑️ Row deleted from "${tableName}"`);
  }, []);

  // Find which DB table best matches a UI page/component
  const findTable = useCallback((pageName: string, compName: string) => {
    if (!config) return null;
    const targets = [compName, pageName].map(s => s.toLowerCase());
    return config.db.tables.find(t => {
      const tn = t.name.toLowerCase();
      return targets.some(target => target.includes(tn) || tn.includes(target.split(' ')[0]));
    }) || config.db.tables[0] || null;
  }, [config]);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50">
        <Layout size={48} className="mb-4 opacity-20" />
        <p className="text-sm tracking-wider font-medium uppercase text-slate-400 font-mono">Runtime Inactive</p>
        <p className="text-xs text-slate-400 mt-2">Compile a prompt to see a live preview</p>
      </div>
    );
  }

  const availableRoles = config.auth.roles || [];
  const pages = config.ui.pages.filter(p => p.roles.includes(role));
  const currentPage = pages.find(p => p.path === activePage) || pages[0];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </AnimatePresence>

      {/* Browser chrome header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="ml-2 bg-white border border-slate-200 rounded-lg px-4 py-1 text-xs font-mono text-slate-500 min-w-[200px]">
            localhost:3001/{activePage.replace(/^\/+/, '') || ''}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/50 rounded-lg p-0.5 border border-slate-200">
            {(['ui', 'api', 'db'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'ui' ? 'UI App' : tab === 'api' ? 'API Log' : 'DB'}
              </button>
            ))}
          </div>
          <select
            value={role}
            onChange={e => {
              setRole(e.target.value);
              const firstAvail = config.ui.pages.filter(p => p.roles.includes(e.target.value))[0]?.path || '';
              setActivePage(firstAvail);
            }}
            className="bg-white border border-slate-200 text-xs rounded-md px-3 py-1.5 outline-none text-emerald-600 font-mono focus:border-emerald-400 cursor-pointer"
          >
            {availableRoles.map(r => (
              <option key={r} value={r}>👤 {r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          {/* ── UI TAB ── */}
          {activeTab === 'ui' && (
            <motion.div key="ui" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex">
              {/* Sidebar nav */}
              <div className="w-52 bg-slate-50 border-r border-slate-200 flex flex-col p-3 gap-1 shrink-0">
                <div className="text-[9px] uppercase text-slate-400 font-bold mb-3 tracking-widest px-2">
                  {config.intent?.product_type || 'App'} — {role}
                </div>
                {pages.map(page => (
                  <button
                    key={page.path}
                    onClick={() => setActivePage(page.path)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${(activePage === page.path || currentPage?.path === page.path) ? 'bg-emerald-500 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.35)]' : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'}`}
                  >
                    <LayoutDashboard size={13} />
                    {page.name}
                  </button>
                ))}
                {pages.length === 0 && (
                  <div className="text-xs text-rose-500 px-2 mt-2">No pages accessible for role: <b>{role}</b></div>
                )}
              </div>

              {/* Page content */}
              <div className="flex-1 p-6 bg-[#f8fafc] overflow-y-auto">
                {currentPage ? (
                  <motion.div key={currentPage.path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl mx-auto">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentPage.name}</h1>

                    {currentPage.components.map((comp, i) => {
                      const matchedTable = findTable(currentPage.name, comp.name);
                      const tableRecords = matchedTable ? (mockDb[matchedTable.name] || []) : [];
                      const compType = comp.type?.toLowerCase() || '';

                      return (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                          <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-5 flex items-center gap-2">
                            <Layout size={12} /> {comp.name}
                            {matchedTable && <span className="text-slate-400 font-normal normal-case tracking-normal">→ {matchedTable.name}</span>}
                          </h3>

                          {/* FORM */}
                          {(compType === 'form' || compType === 'login' || compType === 'register') && (
                            <LiveForm
                              fields={comp.fields?.length ? comp.fields : (matchedTable?.columns.map(c => c.name) || ['name', 'email'])}
                              tableName={matchedTable?.name || 'records'}
                              onSubmit={handleFormSubmit}
                            />
                          )}

                          {/* TABLE / LIST */}
                          {(compType === 'table' || compType === 'list' || compType === 'grid') && (
                            <LiveTable
                              fields={comp.fields?.length ? comp.fields : (matchedTable?.columns.slice(0, 5).map(c => c.name) || [])}
                              records={tableRecords}
                              onDelete={(idx) => matchedTable && handleDeleteRow(matchedTable.name, idx)}
                            />
                          )}

                          {/* DASHBOARD */}
                          {(compType === 'dashboard' || compType === 'analytics' || compType === 'stats' || compType === 'overview') && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {(comp.fields?.length ? comp.fields : ['Total Records', 'Active Users', 'Revenue', 'Pending', 'Completed', 'Growth']).map((f, fi) => (
                                <div key={f} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-200 transition-colors">
                                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{f}</div>
                                  <div className="text-2xl font-bold text-slate-800 mt-2">
                                    {fi === 0 ? config.db.tables.reduce((a, t) => a + (mockDb[t.name]?.length || 0), 0) :
                                     fi === 1 ? availableRoles.length :
                                     fi === 2 ? '$12,400' :
                                     fi === 3 ? '3' :
                                     fi === 4 ? '18' : '↑ 24%'}
                                  </div>
                                  <div className="text-xs text-emerald-600 mt-2 font-semibold">
                                    {fi % 2 === 0 ? '+12.5% ↑' : 'Live'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* NAVBAR */}
                          {compType === 'navbar' && (
                            <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-xl">
                              <span className="text-white font-bold text-sm">{config.intent?.product_type || 'App'}</span>
                              {comp.fields?.map(f => (
                                <button key={f} className="text-slate-400 hover:text-white text-xs transition-colors px-2 py-1 rounded">{f}</button>
                              ))}
                              <div className="ml-auto text-xs text-emerald-400 font-mono bg-emerald-900/30 px-3 py-1 rounded-lg">{role}</div>
                            </div>
                          )}

                          {/* CHART */}
                          {(compType === 'chart' || compType === 'graph') && (
                            <div className="h-40 flex items-end gap-3 px-2">
                              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                  <div
                                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all hover:from-emerald-600"
                                    style={{ height: `${h}%` }}
                                  />
                                  <span className="text-[9px] text-slate-400">{idx + 1}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Fallback for unknown types */}
                          {!['form', 'login', 'register', 'table', 'list', 'grid', 'dashboard', 'analytics', 'stats', 'overview', 'navbar', 'chart', 'graph'].includes(compType) && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500 font-mono">
                              Component type: <span className="text-emerald-600 font-bold">{comp.type}</span>
                              {comp.fields && comp.fields.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                                  {comp.fields.map(f => <span key={f} className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-600">{f}</span>)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm italic">
                    Select a page from the sidebar
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── API LOG TAB ── */}
          {activeTab === 'api' && (
            <motion.div key="api" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-6 bg-[#f8fafc] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-teal-100 border border-teal-200 rounded-xl"><Server className="text-teal-600" size={20} /></div>
                <h2 className="text-xl font-bold text-slate-900">API Sandbox</h2>
              </div>

              {/* Live call log */}
              {apiCallLog.length > 0 && (
                <div className="mb-6 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Request Log
                  </div>
                  {apiCallLog.map((log, i) => (
                    <div key={i} className={`flex items-center gap-4 px-5 py-3 text-xs font-mono border-b border-slate-100 last:border-0 ${i === 0 ? 'bg-emerald-50' : 'bg-white'}`}>
                      <span className="text-slate-400">{log.time}</span>
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">{log.method}</span>
                      <span className="text-slate-700 font-medium">{log.path}</span>
                      <span className="ml-auto text-emerald-600 font-bold">{log.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Endpoint list */}
              <div className="grid gap-4">
                {config.api.endpoints.map((ep, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wider uppercase ${
                        ep.method === 'GET' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                        ep.method === 'POST' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        ep.method === 'DELETE' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>{ep.method}</span>
                      <span className="font-mono text-sm text-slate-800 font-medium">/{ep.path.replace(/^\/+/, '')}</span>
                      <div className="ml-auto flex items-center gap-2 text-[10px] uppercase font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                        <Key size={12} className="text-teal-500" /> {ep.roles.join(', ')}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                      {ep.payloadFields && ep.payloadFields.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Request</div>
                          <pre className="font-mono text-xs text-slate-600 leading-relaxed">{`{\n`}{ep.payloadFields.map(f => `  "${f}": "..."`).join(',\n')}{`\n}`}</pre>
                        </div>
                      )}
                      {ep.responseFields && ep.responseFields.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 font-bold">Response</div>
                          <pre className="font-mono text-xs text-emerald-600 leading-relaxed">{`{\n`}{ep.responseFields.map(f => `  "${f}": "..."`).join(',\n')}{`\n}`}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── DB TAB ── */}
          {activeTab === 'db' && (
            <motion.div key="db" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-6 bg-[#f8fafc] overflow-y-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-emerald-100 border border-emerald-200 rounded-xl"><Database className="text-emerald-600" size={20} /></div>
                <h2 className="text-xl font-bold text-slate-900">Database Inspector</h2>
                <span className="ml-auto text-xs text-slate-400 font-mono bg-white border border-slate-200 px-3 py-1 rounded-full">
                  {config.db.tables.length} tables · {config.db.tables.reduce((a, t) => a + (mockDb[t.name]?.length || 0), 0)} total rows
                </span>
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {config.db.tables.map(table => (
                  <div key={table.name} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Database size={14} className="text-slate-400" />
                        <span className="font-bold text-sm text-slate-800">{table.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-full">
                        {mockDb[table.name]?.length || 0} rows
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {table.columns.map(c => (
                              <th key={c.name} className="px-4 py-3 font-bold text-slate-500 text-[10px] uppercase tracking-widest whitespace-nowrap">
                                {c.name} <span className="text-slate-400 font-normal">({c.type})</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mockDb[table.name]?.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              {table.columns.map(c => (
                                <td key={c.name} className="px-4 py-3 text-slate-700 font-mono text-xs whitespace-nowrap">
                                  {row[c.name] !== undefined && row[c.name] !== '' ? row[c.name] : <span className="text-slate-300">null</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {(!mockDb[table.name] || mockDb[table.name].length === 0) && (
                            <tr>
                              <td colSpan={table.columns.length} className="p-6 text-center text-slate-400 text-xs italic">
                                Empty table
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Seed helper ──────────────────────────────────────────────────────────────
function seedValue(columnName: string, name: string): string {
  const col = columnName.toLowerCase();
  if (col.includes('name')) return name;
  if (col.includes('email')) return name.toLowerCase().replace(' ', '.') + '@example.com';
  if (col.includes('phone') || col.includes('mobile')) return '+1-555-' + Math.floor(1000 + Math.random() * 9000);
  if (col.includes('role')) return 'user';
  if (col.includes('status')) return 'active';
  if (col.includes('price') || col.includes('amount') || col.includes('cost')) return '$' + (Math.random() * 200 + 10).toFixed(2);
  if (col.includes('quantity') || col.includes('qty') || col.includes('stock') || col.includes('count')) return String(Math.floor(10 + Math.random() * 90));
  if (col.includes('date') || col.includes('created') || col.includes('updated')) return new Date().toISOString().split('T')[0];
  if (col.includes('id') || col === 'id') return String(Math.floor(1000 + Math.random() * 9000));
  if (col.includes('description') || col.includes('notes') || col.includes('bio')) return 'Sample ' + columnName;
  if (col.includes('address') || col.includes('city')) return '123 Main St';
  if (col.includes('age')) return String(Math.floor(25 + Math.random() * 30));
  return 'value-' + columnName.slice(0, 4);
}
