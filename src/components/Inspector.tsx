import React, { useState } from 'react';
import { useStore, TraceEvent } from '../store/useStore';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Activity, 
  Clock, 
  FileText, 
  MessageSquare, 
  AlertTriangle, 
  Terminal,
  History,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Inspector() {
  const [activeTab, setActiveTab] = useState<'timeline' | 'logs' | 'thoughts' | 'response'>('timeline');
  const logs = useStore((state) => state.logs);
  const theme = useStore((state) => state.theme);

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'logs', label: 'Raw Logs', icon: Terminal },
    { id: 'thoughts', label: 'Thoughts', icon: MessageSquare },
    { id: 'response', label: 'Anomalies', icon: AlertTriangle },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full border-l transition-colors duration-300",
      theme === 'dark' ? "bg-[#0c0c0e] border-[#27272a]" : "bg-white border-gray-200"
    )}>
      {/* Tabs */}
      <div className={cn(
        "flex border-b transition-colors",
        theme === 'dark' ? "bg-[#09090b] border-[#27272a]" : "bg-gray-50 border-gray-200"
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3.5 text-[9px] uppercase tracking-widest font-bold transition-all border-b-2",
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-500 " + (theme === 'dark' ? "bg-[#18181b]" : "bg-white")
                : "border-transparent text-[#71717a] hover:text-emerald-500 hover:bg-[#111113]/5"
            )}
          >
            {activeTab === tab.id && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 font-mono text-[11px]">
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log.id} className={cn(
                "relative pl-5 border-l py-1 transition-all",
                theme === 'dark' ? "border-[#27272a]" : "border-gray-200",
                log.type.includes('error') ? "border-red-500/50 bg-red-500/5" :
                log.type.includes('warning') ? "border-amber-500/50 bg-amber-500/5 shadow-[inset_0_0_20px_rgba(245,158,11,0.02)]" :
                (theme === 'dark' ? "hover:bg-white/[0.02]" : "hover:bg-gray-50")
              )}>
                <div className={cn(
                  "absolute -left-[3px] top-0 w-[6px] h-[6px] rounded-full",
                  log.type.includes('error') ? "bg-red-500" :
                  log.type.includes('warning') ? "bg-amber-500" :
                  (theme === 'dark' ? "bg-[#27272a]" : "bg-gray-300")
                )} />
                <div className="flex justify-between text-[#71717a] mb-2 font-bold tracking-tight">
                  <span className="uppercase text-[8px]">{log.type}</span>
                  <span className="text-[9px]">{log.timestamp}ms</span>
                </div>
                <div className={cn(
                  "leading-relaxed",
                  theme === 'dark' ? "text-[#fafafa]" : "text-black",
                  log.type.includes('error') && "text-red-400 font-bold",
                  log.type.includes('warning') && "text-amber-600 italic font-medium"
                )}>
                  {log.message}
                </div>
              </div>
            )).reverse()}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-1.5">
            {logs.map((log) => (
              <div key={log.id} className={cn(
                "grid grid-cols-[70px_1fr] gap-3 py-1.5 border-b group transition-colors",
                theme === 'dark' ? "border-[#18181b]" : "border-gray-100"
              )}>
                <span className="text-[#3f3f46] font-bold text-[9px] group-hover:text-emerald-500 transition-colors">[{log.timestamp}ms]</span>
                <span className={cn(
                   log.type.includes('error') ? "text-red-500" :
                   log.type.includes('retry') ? "text-amber-500" :
                   (theme === 'dark' ? "text-[#a1a1aa]" : "text-gray-600")
                )}>
                  {log.type}: {log.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'thoughts' && (
          <div className="space-y-4">
            <h3 className={cn(
              "text-[10px] font-bold uppercase mb-3 tracking-widest",
              theme === 'dark' ? "text-[#71717a]" : "text-gray-400"
            )}>Runtime Cognition</h3>
            <div className="space-y-4">
              {logs.filter(l => l.type === 'llm:start').map(l => (
                <div key={l.id} className={cn(
                   "rounded p-4 border relative overflow-hidden group transition-colors",
                   theme === 'dark' ? "bg-[#111113] border-[#27272a]" : "bg-gray-50 border-gray-200"
                )}>
                  <div className={cn(
                    "absolute top-0 left-0 w-1 h-full transition-all",
                    l.data?.context ? "bg-amber-500" : "bg-emerald-500/20 group-hover:bg-emerald-500"
                  )} />
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#3f3f46]">
                      {l.data?.context || "Strategic Planning"}
                    </span>
                    {l.data?.tool && (
                      <span className={cn(
                         "text-[8px] px-1.5 py-0.5 rounded",
                         theme === 'dark' ? "bg-[#18181b] text-[#71717a]" : "bg-white text-gray-400 border border-gray-200"
                      )}>
                        Target: {l.data.tool}
                      </span>
                    )}
                  </div>

                  <span className="text-emerald-500 text-lg absolute top-1 right-3 opacity-20">"</span>
                  <div className={cn(
                    "leading-relaxed italic text-[11px]",
                    theme === 'dark' ? "text-[#a1a1aa]" : "text-gray-600"
                  )}>
                    {l.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("h-[1px] flex-1", theme === 'dark' ? "bg-[#27272a]" : "bg-gray-100")} />
              <div className={cn("text-[10px] font-bold uppercase tracking-[0.2em]", theme === 'dark' ? "text-[#71717a]" : "text-gray-400")}>Anomalies</div>
              <div className={cn("h-[1px] flex-1", theme === 'dark' ? "bg-[#27272a]" : "bg-gray-100")} />
            </div>
            
            {logs.filter(l => l.type === 'hallucination:warning').length === 0 ? (
              <div className={cn("flex flex-col items-center justify-center pt-20 text-center gap-3", theme === 'dark' ? "text-[#71717a]" : "text-gray-400")}>
                <ShieldCheck className="w-8 h-8 opacity-20" />
                <p className="max-w-[200px] leading-relaxed">No critical integrity violations detected in the current trace.</p>
              </div>
            ) : (
              logs.filter(l => l.type === 'hallucination:warning').map(l => (
                <div key={l.id} className="bg-red-500/5 border border-red-500/20 p-4 rounded relative overflow-hidden shadow-lg shadow-red-500/5">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 animate-pulse" />
                  <div className="flex items-center gap-2 text-red-500 font-bold mb-3 uppercase tracking-tighter text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    HALLUCINATION_DETECTED
                  </div>
                  <p className={cn("leading-relaxed mb-4 text-[11px]", theme === 'dark' ? "text-[#fafafa]" : "text-black")}>
                    The agent is attempting to synthesize a response using invalid or fabricated state data.
                    Trace analysis shows a <b>reasoning loophole</b>.
                  </p>
                  <div className="flex justify-between items-center text-[9px] font-bold text-[#71717a] border-t border-red-500/10 pt-3">
                     <span>RISK_SCORE: 0.84</span>
                     <span className="text-red-400">CRITICAL_LEAK</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
