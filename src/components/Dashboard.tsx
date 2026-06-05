"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Play, Activity, CheckCircle, XCircle, Code2, Wrench, ArrowRight, Terminal, ChevronLeft, Zap, BookOpen, Layers, ExternalLink, X } from 'lucide-react';
import { compilePrompt, CompilationResult } from '../services/compiler';
import JsonViewer from './JsonViewer';
import RuntimeRenderer from './RuntimeRenderer';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Documentation Modal ──────────────────────────────────────────────────────
function DocsModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-center">
              <BookOpen size={16} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Documentation</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2 flex items-center gap-2"><Zap size={16} className="text-emerald-500"/>What is ForgeEngine?</h3>
            <p>ForgeEngine is an AI compiler that translates natural language intent into fully structured, validated, and executable application configurations — spanning UI schema, API schema, DB schema, and Auth schema.</p>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-3">How the Pipeline Works</h3>
            <div className="space-y-3">
              {[
                ['Stage 1 — Intent Extraction', 'The LLM parses your natural language and extracts structured intent: product type, core features, target users, and complexity level.'],
                ['Stage 2 — Architecture Design', 'A second LLM pass designs the system architecture — deciding which DB entities, pages, and roles are needed.'],
                ['Stage 3 — Schema Synthesis', 'The full AppConfig is generated: UI pages with components, REST API endpoints, relational DB tables, and role-based auth permissions.'],
                ['Stage 4 — Consistency Validation', 'The Validator Engine checks cross-layer integrity: roles used in UI must exist in Auth, API endpoints must map to DB tables, etc.'],
                ['Stage 5 — Repair Engine', 'If errors are found (in Balanced/Production mode), the Repair Engine performs surgical LLM patches until all constraints pass.'],
                ['Stage 6 — Emission', 'The final validated config is emitted and rendered live in the Runtime Preview.'],
              ].map(([title, desc]) => (
                <div key={title} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="font-semibold text-slate-800 mb-1">{title}</p>
                  <p className="text-slate-600 text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="font-bold text-slate-900 text-base mb-2">Compilation Modes</h3>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                ['Fast', 'No repair cycles. Instant output. Best for quick prototyping.', 'bg-amber-50 border-amber-200 text-amber-700'],
                ['Balanced', '1 repair cycle if validation fails. Good for demos.', 'bg-blue-50 border-blue-200 text-blue-700'],
                ['Production', 'Up to 3 repair cycles. Strictest validation. Use for submissions.', 'bg-emerald-50 border-emerald-200 text-emerald-700'],
              ].map(([mode, desc, cls]) => (
                <div key={mode} className={`p-3 rounded-lg border ${cls}`}>
                  <p className="font-bold mb-1">{mode}</p>
                  <p className="opacity-80">{desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Architecture Modal ───────────────────────────────────────────────────────
function ArchModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">System Architecture</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-5 text-sm text-slate-700">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs leading-loose text-slate-600">
            {`User Input (Natural Language)
      ↓
[Next.js Server Action] compiler.ts
      ↓
[LLM Stage 1] Intent Extraction  ──→ { product_type, features, roles }
      ↓
[LLM Stage 2] Architecture Design ──→ { entities, pages, roles }
      ↓
[LLM Stage 3] Schema Synthesis ───→ Full AppConfig JSON
      ↓
[Validator Engine] validator.ts ───→ Cross-layer consistency checks
      ↓ (if errors)
[Repair Engine] repair.ts ─────────→ Surgical LLM patch (1-3 cycles)
      ↓
[Emission] Final AppConfig ────────→ UI + Runtime Preview`}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'LLM Provider', value: 'Groq — llama-3.3-70b-versatile', color: 'text-purple-600' },
              { label: 'Generation Mode', value: 'JSON Object (direct Groq SDK)', color: 'text-blue-600' },
              { label: 'Validation Strategy', value: 'Zod + Cross-layer rule engine', color: 'text-emerald-600' },
              { label: 'Repair Strategy', value: 'LLM surgical patching (max 3 cycles)', color: 'text-amber-600' },
              { label: 'Frontend', value: 'Next.js 16 + React 19 + Tailwind 4', color: 'text-slate-600' },
              { label: 'Runtime Preview', value: 'Live in-browser app simulator', color: 'text-teal-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
                <p className={`text-xs font-semibold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'Fast' | 'Balanced' | 'Production'>('Balanced');
  const [isCompiling, setIsCompiling] = useState(false);
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'ui' | 'api' | 'db' | 'auth'>('ui');
  const [hasStarted, setHasStarted] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showArch, setShowArch] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [result?.logs]);

  const handleCompile = async (overridePrompt?: string) => {
    const p = overridePrompt ?? prompt;
    if (!p.trim()) return;
    if (overridePrompt) setPrompt(overridePrompt);
    setHasStarted(true);
    setIsCompiling(true);
    setResult(null);
    try {
      const res = await compilePrompt(p, mode);
      setResult(res);
    } catch (e) {
      console.error(e);
    }
    setIsCompiling(false);
  };

  const handleReset = () => {
    setHasStarted(false);
    setResult(null);
    setPrompt('');
  };

  const evalCases = [
    'Build a CRM with login, contacts, dashboard, role-based access.',
    'Build a Restaurant POS with tables, orders, kitchen view.',
    'Build a Hospital management system with roles for doctors and nurses.',
    'Impossible edge case: No login but role-based permissions.',
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans selection:bg-emerald-500/20 relative">
      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-400/8 blur-[120px] rounded-full pointer-events-none" />

      {/* Modals */}
      <AnimatePresence>
        {showDocs && <DocsModal onClose={() => setShowDocs(false)} />}
        {showArch && <ArchModal onClose={() => setShowArch(false)} />}
      </AnimatePresence>

      <div className="relative z-10 w-full h-full flex flex-col items-center">

        {/* Header */}
        <header className="w-full max-w-[1600px] flex items-center justify-between py-4 px-6 border-b border-slate-200 bg-white/90 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            {hasStarted && (
              <button
                onClick={handleReset}
                className="mr-1 p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
                title="Back to home"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div className="w-9 h-9 border border-emerald-200 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Terminal size={18} className="text-emerald-600" />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">Forge<span className="text-emerald-600">Engine</span></h1>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowDocs(true)}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <BookOpen size={14} /> Documentation
            </button>
            <button
              onClick={() => setShowArch(true)}
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Layers size={14} /> Architecture
            </button>
            <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono text-slate-600">v1.0.0-beta</div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {/* ── HERO / HOME ── */}
          {!hasStarted ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
              className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl px-6 text-center overflow-y-auto py-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold mb-8 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Compiler Online
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 text-slate-900">
                Software Generation <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Engineered for Reliability</span>
              </h2>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
                Compile human intent into strict, validated, and executable application configurations. Powered by deterministic AST schema mapping and intelligent self-repair.
              </p>

              {/* Input Box */}
              <div className="w-full bg-white border border-slate-200 rounded-xl p-3 shadow-xl shadow-slate-200/50 transition-all focus-within:border-emerald-400 focus-within:shadow-emerald-100/50">
                <textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleCompile(); }}
                  className="w-full bg-transparent p-4 text-sm focus:outline-none resize-none font-mono text-slate-800 placeholder-slate-400"
                  placeholder="> Describe the system architecture... (e.g. A healthcare portal with secure doctor/patient roles)"
                  rows={4}
                />
                <div className="flex items-center justify-between p-2 mt-1 border-t border-slate-100 pt-3">
                  <div className="flex gap-2">
                    {(['Fast', 'Balanced', 'Production'] as const).map(m => (
                      <button
                        key={m}
                        id={`mode-${m.toLowerCase()}`}
                        onClick={() => setMode(m)}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${mode === m ? 'bg-slate-900 text-white shadow' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                      >
                        {m} Mode
                      </button>
                    ))}
                  </div>
                  <button
                    id="compile-btn"
                    onClick={() => handleCompile()}
                    disabled={!prompt.trim() || isCompiling}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] active:scale-[0.98]"
                  >
                    Initiate Compilation <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Eval Suite */}
              <div className="mt-12 w-full text-left">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Evaluation Test Suite — click to load & compile</p>
                <div className="grid grid-cols-2 gap-3">
                  {evalCases.map((c, i) => (
                    <button
                      key={i}
                      id={`eval-case-${i}`}
                      onClick={() => handleCompile(c)}
                      className="text-left p-4 bg-white border border-slate-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-xs text-slate-600 font-mono shadow-sm group"
                    >
                      <span className="text-emerald-500 font-bold mr-1 group-hover:text-emerald-600">#{i + 1}</span> {c}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

          ) : (
            /* ── WORKSPACE ── */
            <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 w-full flex p-5 gap-5 overflow-hidden max-w-[1600px]"
            >
              {/* Left Column */}
              <div className="w-[420px] flex flex-col gap-4 shrink-0">

                {/* Prompt re-run bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex gap-2">
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={2}
                    className="flex-1 bg-transparent text-xs font-mono text-slate-700 placeholder-slate-400 focus:outline-none resize-none"
                    placeholder="Edit prompt and recompile..."
                  />
                  <button
                    id="recompile-btn"
                    onClick={() => handleCompile()}
                    disabled={!prompt.trim() || isCompiling}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-xs transition-all self-end shrink-0 active:scale-[0.98]"
                  >
                    {isCompiling ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play size={12} />}
                    {isCompiling ? 'Compiling...' : 'Recompile'}
                  </button>
                </div>

                {/* Status Card */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-800"><Activity size={16} className="text-emerald-500" /> Execution Status</h2>
                    {isCompiling ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Processing
                      </div>
                    ) : result?.success ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle size={14} /> Success
                      </div>
                    ) : result ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-200">
                        <XCircle size={14} /> Failed
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
                        Idle
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Time</p>
                      <p className="text-base font-mono text-slate-800">{result ? `${(result.metrics.latencyMs / 1000).toFixed(2)}s` : '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Repairs</p>
                      <p className="text-base font-mono text-teal-600">{result ? result.metrics.repairCycles : '--'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Errors</p>
                      <p className="text-base font-mono text-red-500">{result ? result.metrics.schemaErrors : '--'}</p>
                    </div>
                  </div>
                </div>

                {/* Pipeline Logs */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm min-h-0">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 shrink-0">
                    <Terminal size={14} className="text-slate-500" />
                    <h3 className="text-xs font-bold text-slate-700 tracking-wide">Compiler stdout</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 bg-[#f8fafc] font-mono text-[11.5px] leading-relaxed">
                    {isCompiling && !result && (
                      <div className="text-slate-500 flex items-center gap-3 mb-2">
                        <div className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                        Initializing ForgeEngine pipeline...
                      </div>
                    )}
                    {result?.logs.map((log, i) => {
                      const isError = log.includes('[Error]') || log.includes('❌') || log.includes('Failed');
                      const isSuccess = log.includes('✅') || log.includes('passed successfully');
                      const isWarning = log.includes('⚠️') || log.includes('Found');
                      const isStage = log.startsWith('[Stage');
                      const isRepair = log.startsWith('[Repair');
                      return (
                        <div key={i} className={`mb-1.5 py-0.5 ${isError ? 'text-red-500' : isSuccess ? 'text-emerald-600 font-semibold' : isWarning ? 'text-amber-600' : isStage ? 'text-blue-600 font-semibold mt-2' : isRepair ? 'text-teal-600' : 'text-slate-600'}`}>
                          {log}
                        </div>
                      );
                    })}
                    <div ref={logEndRef} />
                  </div>
                </div>

                {/* AST Viewer */}
                <div className="h-[260px] bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm shrink-0">
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 shrink-0">
                    <h3 className="text-xs font-bold text-slate-700 tracking-wide flex items-center gap-2"><Code2 size={14} className="text-slate-500" /> Abstract Syntax Tree</h3>
                    <div className="flex bg-slate-200/50 rounded-md p-0.5 border border-slate-200">
                      {(['ui', 'api', 'db', 'auth'] as const).map(t => (
                        <button
                          key={t}
                          id={`ast-tab-${t}`}
                          onClick={() => setActiveSchemaTab(t)}
                          className={`px-3 py-1 text-[10px] uppercase font-bold rounded transition-colors ${activeSchemaTab === t ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 bg-[#f8fafc] overflow-hidden relative">
                    {result?.config ? (
                      <div className="absolute inset-0">
                        <JsonViewer data={result.config[activeSchemaTab]} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs italic font-mono">Awaiting schema generation...</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Runtime Preview */}
              <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-xl bg-white min-w-0">
                <RuntimeRenderer config={result?.config || null} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
