import React from 'react';
import { useStore } from '../store/useStore';
import { Zap, Clock, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function MetricsBar() {
  const metrics = useStore((state) => state.metrics);
  const theme = useStore((state) => state.theme);

  const stats = [
    { label: 'Total Latency', value: `${metrics.totalLatency.toLocaleString()}ms`, icon: Clock, color: 'text-emerald-500' },
    { label: 'Retry Count', value: metrics.retryCount.toString(), icon: Zap, color: theme === 'dark' ? 'text-white' : 'text-black' },
    { label: 'Failure Rate', value: `${((metrics.failedTools / 5) * 100).toFixed(1)}%`, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Risk Index', value: `${metrics.hallucinationRisk.toFixed(1)}%`, icon: Activity, color: 'text-amber-500', isProgress: true },
  ];

  return (
    <footer className={cn(
      "h-20 border-t grid grid-cols-5 divide-x transition-colors duration-300",
      theme === 'dark' ? "bg-[#09090b] border-[#27272a] divide-[#27272a]" : "bg-gray-50 border-gray-200 divide-gray-200"
    )}>
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col justify-center items-center">
          <span className={cn(
            "text-[9px] uppercase tracking-[0.2em] mb-1.5 font-bold",
            theme === 'dark' ? "text-[#71717a]" : "text-gray-400"
          )}>{stat.label}</span>
          {stat.isProgress ? (
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-16 h-1.5 rounded-full overflow-hidden border transition-colors",
                theme === 'dark' ? "bg-[#18181b] border-[#27272a]" : "bg-gray-200 border-gray-300"
              )}>
                <div 
                  className={cn("h-full transition-all duration-1000", stat.color.replace('text-', 'bg-'))} 
                  style={{ width: `${parseFloat(stat.value)}%` }} 
                />
              </div>
              <span className={cn(
                "text-xs font-mono font-bold",
                theme === 'dark' ? "text-[#fafafa]" : "text-black"
              )}>{stat.value}</span>
            </div>
          ) : (
            <span className={cn("text-lg font-mono tracking-tighter font-bold", stat.color)}>{stat.value}</span>
          )}
        </div>
      ))}
      
      <div className={cn(
        "flex flex-col justify-center items-center transition-colors",
        theme === 'dark' ? "bg-[#111113]" : "bg-white"
      )}>
        <span className="text-[9px] uppercase text-emerald-500 font-bold tracking-[0.2em] mb-1.5">System Health</span>
        <span className={cn(
          "text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest",
          metrics.failedTools > 0 
            ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        )}>
          {metrics.failedTools > 2 ? 'CRITICAL' : metrics.failedTools > 0 ? 'DEGRADED' : 'OPTIMAL'}
        </span>
      </div>
    </footer>
  );
}
