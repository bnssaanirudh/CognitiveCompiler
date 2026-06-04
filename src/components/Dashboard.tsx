"use client";
import React, { useState } from 'react';
import { Play, Activity, CheckCircle, XCircle, Code2, Layers, Wrench, ChevronRight } from 'lucide-react';
import { compilePrompt, CompilationResult } from '../services/compiler';
import JsonViewer from './JsonViewer';
import RuntimeRenderer from './RuntimeRenderer';

export default function Dashboard() {
  const [prompt, setPrompt] = useState("Build a CRM with login, contacts, dashboard, role-based access. Admins can view analytics.");
  const [mode, setMode] = useState<'Fast'|'Balanced'|'Production'>('Balanced');
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'ui'|'api'|'db'|'auth'>('ui');

  const handleCompile = async () => {
    setIsCompiling(true);
    setResult(null);
    try {
       const res = await compilePrompt(prompt, mode);
       setResult(res);
    } catch(e) {
       console.error(e);
    }
    setIsCompiling(false);
  };

  const evalCases = [
    "Build a CRM with login, contacts, dashboard, role-based access.",
    "Edge case: Paid subscription but free forever.",
    "Build a Hospital management system with roles for doctors and nurses.",
    "Build a Restaurant POS with tables, orders, kitchen view.",
    "Impossible edge case: No login but role-based permissions."
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden p-2 gap-2">
      {/* Left Sidebar: Settings & Eval */}
      <div className="w-[340px] flex flex-col gap-2">
         {/* Title */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex items-center gap-4">
            <div className="bg-indigo-600/20 text-indigo-400 p-2.5 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              <Code2 size={24} />
            </div>
            <div>
               <h1 className="font-bold text-lg tracking-tight">App Compiler</h1>
               <p className="text-[10px] text-indigo-400/80 uppercase tracking-widest font-bold mt-0.5">Lovable / Bolt Engine</p>
            </div>
         </div>

         {/* Prompt Input */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col flex-1">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2 text-neutral-200"><Layers size={16} className="text-indigo-400"/> Natural Language Intent</h2>
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl p-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none flex-1 font-mono text-neutral-300 transition-all shadow-inner"
              placeholder="Describe your application..."
            />
            
            <div className="mt-5 flex flex-col gap-3">
               <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex justify-between">
                 Compilation Mode
                 {mode === 'Fast' && <span className="text-blue-400">Low Cost</span>}
                 {mode === 'Balanced' && <span className="text-yellow-400">Medium Cost</span>}
                 {mode === 'Production' && <span className="text-red-400">High Cost</span>}
               </label>
               <div className="grid grid-cols-3 gap-2 bg-[#0a0a0a] p-1.5 rounded-lg border border-neutral-800">
                 {['Fast', 'Balanced', 'Production'].map(m => (
                   <button 
                     key={m} 
                     onClick={() => setMode(m as any)}
                     className={`py-2 text-xs font-semibold rounded-md transition-colors ${mode === m ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                   >
                     {m}
                   </button>
                 ))}
               </div>
            </div>

            <button 
              onClick={handleCompile}
              disabled={isCompiling}
              className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-3.5 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.2)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
               {isCompiling ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Play size={16} fill="currentColor"/>}
               {isCompiling ? 'Compiling Application...' : 'Compile Application'}
            </button>
         </div>

         {/* Eval Suite */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex-1 overflow-y-auto">
            <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-neutral-200"><Activity size={16} className="text-green-400"/> Evaluation Suite</h2>
            <div className="space-y-2.5">
              {evalCases.map((c, i) => (
                <div key={i} onClick={() => setPrompt(c)} className="p-3.5 bg-[#0a0a0a] border border-neutral-800/80 rounded-xl text-xs text-neutral-400 hover:border-neutral-600 hover:text-neutral-200 cursor-pointer transition-all group shadow-sm">
                   <div className="flex justify-between items-center gap-3">
                     <span className="line-clamp-2 leading-relaxed">{c}</span>
                     <ChevronRight size={14} className="text-neutral-600 group-hover:text-white shrink-0" />
                   </div>
                </div>
              ))}
            </div>
         </div>
      </div>

      {/* Center: Pipeline & Logs */}
      <div className="flex-1 flex flex-col gap-2 min-w-[450px]">
         {/* Metrics */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex gap-6 items-center shadow-sm">
            <div className="flex-1">
               <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1.5 tracking-wider">Status</div>
               <div className="flex items-center gap-2 font-mono text-sm font-semibold">
                 {result?.success ? <span className="text-green-400 flex items-center gap-1.5"><CheckCircle size={16}/> Compilation Success</span> : result ? <span className="text-red-400 flex items-center gap-1.5"><XCircle size={16}/> Compilation Failed</span> : <span className="text-neutral-500">Idle / Ready</span>}
               </div>
            </div>
            <div className="w-px h-10 bg-neutral-800"></div>
            <div className="flex-1">
               <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1.5 tracking-wider">Total Latency</div>
               <div className="font-mono text-sm text-neutral-200">{result ? `${(result.metrics.latencyMs/1000).toFixed(2)}s` : '-'}</div>
            </div>
            <div className="w-px h-10 bg-neutral-800"></div>
            <div className="flex-1">
               <div className="text-[10px] uppercase text-neutral-500 font-bold mb-1.5 tracking-wider">Targeted Repair Cycles</div>
               <div className="font-mono text-sm text-yellow-400 flex items-center gap-1.5"><Wrench size={14}/> {result ? result.metrics.repairCycles : '-'}</div>
            </div>
         </div>

         {/* Pipeline Logs */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex-1 flex flex-col shadow-sm">
            <h2 className="text-sm font-semibold mb-4 text-neutral-200">Compilation Pipeline Logs</h2>
            <div className="flex-1 bg-[#0a0a0a] border border-neutral-800 rounded-xl p-5 overflow-y-auto font-mono text-[13px] leading-relaxed shadow-inner">
               {result ? (
                 result.logs.map((log, i) => {
                   const isError = log.includes('❌') || log.includes('Failed');
                   const isSuccess = log.includes('✅') || log.includes('passed successfully');
                   const isWarning = log.includes('⚠️') || log.includes('Found');
                   const isStage = log.includes('[Stage');
                   return (
                     <div key={i} className={`mb-2 py-0.5 ${isError ? 'text-red-400 bg-red-400/5 px-2 rounded -mx-2' : isSuccess ? 'text-green-400' : isWarning ? 'text-yellow-400' : isStage ? 'text-indigo-300 font-semibold mt-3 first:mt-0' : 'text-neutral-400'}`}>
                       {log}
                     </div>
                   );
                 })
               ) : (
                 <div className="text-neutral-600 h-full flex flex-col items-center justify-center italic gap-3">
                   <div className="w-16 h-16 border-4 border-dashed border-neutral-800 rounded-full animate-[spin_10s_linear_infinite] opacity-50"></div>
                   Waiting for compiler invocation...
                 </div>
               )}
            </div>
         </div>

         {/* Schema Viewer */}
         <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 h-[35%] flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-sm font-semibold text-neutral-200">Compiler Abstract Syntax Tree (Schemas)</h2>
               {result?.config && (
                 <div className="flex bg-[#0a0a0a] rounded-lg p-1 border border-neutral-800">
                   {['ui','api','db','auth'].map(t => (
                     <button key={t} onClick={() => setActiveSchemaTab(t as any)} className={`px-4 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-colors ${activeSchemaTab === t ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}>{t} Schema</button>
                   ))}
                 </div>
               )}
            </div>
            <div className="flex-1 border border-neutral-800 rounded-xl overflow-hidden bg-[#1e1e1e] relative">
               {result?.config ? (
                 <div className="absolute inset-0">
                    <JsonViewer data={result.config[activeSchemaTab]} />
                 </div>
               ) : (
                 <div className="flex items-center justify-center h-full text-neutral-600 text-sm italic">Schema artifacts will appear here after compilation.</div>
               )}
            </div>
         </div>
      </div>

      {/* Right Sidebar: Runtime Renderer */}
      <div className="flex-[1.4] relative rounded-xl overflow-hidden p-0 shadow-2xl border border-neutral-800">
         <RuntimeRenderer config={result?.config || null} />
      </div>
    </div>
  );
}
