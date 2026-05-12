import React from 'react';
import { useStore, ToolConfig } from '../store/useStore';
import { 
  Settings2, 
  Zap, 
  Trash2, 
  Play, 
  Square,
  AlertCircle,
  WifiOff,
  Database,
  RefreshCw,
  Cpu,
  Clock,
  History,
  Sun,
  Moon,
  Key,
  Globe,
  Plane,
  Hotel,
  CloudSun,
  DollarSign
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Sidebar({ onStart, onStop }: { onStart: () => void, onStop: () => void }) {
  const { tools, updateToolConfig, prompt, setPrompt, isRunning, theme, toggleTheme, apiKeys, setApiKey } = useStore();

  const failureModes = [
    { id: 'none', label: 'None', icon: Zap },
    { id: 'timeout', label: 'Timeout', icon: Clock },
    { id: 'malformed', label: 'Malformed', icon: Database },
    { id: 'stale', label: 'Stale Data', icon: History },
    { id: 'random', label: 'Random Error', icon: WifiOff },
  ];

  const credentials = [
    { id: 'search', label: 'Search', icon: Globe, placeholder: 'Tavily / OpenAI Key' },
    { id: 'flights', label: 'Flights', icon: Plane, placeholder: 'Amadeus / Skyscanner' },
    { id: 'hotels', label: 'Hotels', icon: Hotel, placeholder: 'SerpApi / TripAdvisor' },
    { id: 'weather', label: 'Weather', icon: CloudSun, placeholder: 'OpenWeatherMap' },
    { id: 'currency', label: 'Currency', icon: DollarSign, placeholder: 'Fixer.io / Frankfurter' },
  ];

  return (
    <div className={cn(
      "flex flex-col h-full border-r w-64 shrink-0 transition-colors duration-300",
      theme === 'dark' ? "bg-[#0c0c0e] border-[#27272a]" : "bg-white border-gray-200"
    )}>
      {/* Simulation Controls Header */}
      <div className={cn(
        "p-4 border-b transition-colors",
        theme === 'dark' ? "bg-[#09090b] border-[#27272a]" : "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h1 className={cn(
            "font-bold tracking-tighter text-base flex items-center gap-2",
            theme === 'dark' ? "text-white" : "text-black"
          )}>
            <div className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="font-mono uppercase">FAILURE LAB</span>
          </h1>
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg border transition-all",
              theme === 'dark' ? "border-[#27272a] text-[#71717a] hover:text-white hover:bg-[#18181b]" : "border-gray-200 text-gray-500 hover:text-black hover:bg-gray-100"
            )}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cn(
              "text-[10px] uppercase font-bold mb-2 block tracking-widest",
              theme === 'dark' ? "text-[#71717a]" : "text-gray-400"
            )}>Inference Engine</label>
            <div className="space-y-2">
              <select 
                value={useStore.getState().selectedModel}
                onChange={(e) => useStore.getState().setSelectedModel(e.target.value)}
                className={cn(
                  "w-full border text-xs px-2 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors",
                  theme === 'dark' ? "bg-[#18181b] border-[#27272a] text-[#fafafa]" : "bg-white border-gray-200 text-black"
                )}
              >
                <option>Gemini 2.0 (Integrated)</option>
                <option>OpenAI GPT-4o</option>
                <option>Anthropic Claude 3.5</option>
                <option>Featherless (Compatible)</option>
                <option>Ollama (Localhost)</option>
              </select>
              
              <div className="relative">
                <Key className="w-3 h-3 absolute left-2.5 top-2.5 text-[#52525b]" />
                <input 
                  type="password"
                  value={apiKeys.inference || ''}
                  onChange={(e) => setApiKey('inference', e.target.value)}
                  className={cn(
                    "w-full border text-[10px] pl-8 pr-2 py-2 rounded focus:outline-none transition-colors",
                    theme === 'dark' ? "bg-[#09090b] border-[#27272a] text-[#fafafa] focus:border-[#3f3f46]" : "bg-white border-gray-200 text-black focus:border-gray-400"
                  )}
                  placeholder="Inference API Key..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className={cn(
              "text-[10px] uppercase font-bold mb-2 block tracking-widest",
              theme === 'dark' ? "text-[#71717a]" : "text-gray-400"
            )}>Scenario</label>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={cn(
                "w-full border text-[11px] p-2 rounded h-20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none font-mono transition-colors",
                theme === 'dark' ? "bg-[#18181b] border-[#27272a] text-[#fafafa]" : "bg-white border-gray-200 text-black"
              )}
              placeholder="Describe the user query..."
            />
          </div>

          <button 
            disabled={isRunning}
            onClick={onStart}
            className={cn(
              "w-full py-2 rounded text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-2",
              isRunning 
                ? (theme === 'dark' ? "bg-[#18181b] text-[#71717a] border-[#27272a]" : "bg-gray-100 text-gray-400 border-gray-200 shadow-none") 
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/10 border-none"
            )}
          >
            {isRunning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'EXECUTING...' : 'TEST PIPELINE'}
          </button>
        </div>
      </div>

      {/* Tool List / Fault Injection */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Credentials Section */}
        <div>
          <h2 className={cn(
            "text-[10px] font-bold uppercase tracking-widest mb-3",
            theme === 'dark' ? "text-[#71717a]" : "text-gray-400"
          )}>Infrastructure Keys</h2>
          <div className="space-y-3">
            {credentials.map((cred) => (
              <div key={cred.id}>
                <div className="flex items-center gap-2 mb-1">
                  <cred.icon className="w-3 h-3 text-[#52525b]" />
                  <label className="text-[9px] uppercase font-bold text-[#52525b] block tracking-wider">{cred.label}</label>
                </div>
                <input 
                  type="password"
                  value={apiKeys[cred.id] || ''}
                  onChange={(e) => setApiKey(cred.id, e.target.value)}
                  className={cn(
                    "w-full border text-[10px] px-2 py-1.5 rounded focus:outline-none transition-colors",
                    theme === 'dark' ? "bg-[#09090b] border-[#27272a] text-[#fafafa] focus:border-[#3f3f46]" : "bg-white border-gray-200 text-black focus:border-gray-400"
                  )}
                  placeholder={cred.placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className={cn(
              "text-[10px] font-bold uppercase tracking-widest",
              theme === 'dark' ? "text-[#71717a]" : "text-gray-400"
            )}>Simulation Faults</h2>
            <span className="text-[9px] text-emerald-500 px-1.5 py-0.5 bg-emerald-500/10 rounded font-bold uppercase">Ready</span>
          </div>

          <div className="space-y-3">
            {tools.map((tool) => (
              <div key={tool.id} className={cn(
                "flex flex-col gap-3 p-3 rounded border transition-all",
                theme === 'dark' ? "bg-[#18181b] border-[#27272a] hover:border-[#3f3f46]" : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
              )}>
                <div className="flex justify-between items-center">
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-tight font-mono",
                    theme === 'dark' ? "text-[#fafafa]" : "text-black"
                  )}>{tool.name.replace(' API', '')}</span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    tool.failureMode === 'none' ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.3)]" : "bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                  )} />
                </div>

                <div className="space-y-2">
                  <select 
                    value={tool.failureMode}
                    onChange={(e) => updateToolConfig(tool.id, { failureMode: e.target.value as any })}
                    className={cn(
                      "w-full text-[10px] border p-1.5 rounded transition-colors",
                      theme === 'dark' ? "bg-[#09090b] border-[#27272a]" : "bg-white border-gray-200",
                      tool.failureMode !== 'none' ? "text-red-500 font-bold" : (theme === 'dark' ? "text-[#a1a1aa]" : "text-gray-500")
                    )}
                  >
                    {failureModes.map(mode => (
                      <option key={mode.id} value={mode.id}>{mode.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] uppercase font-bold">
                    <span className={theme === 'dark' ? "text-[#3f3f46]" : "text-gray-300"}>Failure Prob %</span>
                    <span className={tool.failureProbability > 0 ? "text-amber-500" : (theme === 'dark' ? "text-[#3f3f46]" : "text-gray-300")}>
                      {Math.round(tool.failureProbability * 100)}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.05"
                    value={tool.failureProbability}
                    onChange={(e) => updateToolConfig(tool.id, { failureProbability: parseFloat(e.target.value) })}
                    className={cn(
                      "w-full h-1 rounded-lg appearance-none cursor-pointer accent-emerald-500",
                      theme === 'dark' ? "bg-[#27272a]" : "bg-gray-200"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cn(
        "p-4 border-t transition-colors space-y-3",
        theme === 'dark' ? "bg-[#111113] border-[#27272a]" : "bg-gray-50 border-gray-200"
      )}>
        <div className={cn(
          "w-full text-[9px] font-bold uppercase py-2 rounded transition-all tracking-widest border text-center font-mono",
          theme === 'dark' ? "bg-[#27272a] text-[#71717a] border-transparent" : "bg-white text-gray-400 border-gray-200 shadow-sm"
        )}>
          SYSTEM_STABLE
        </div>

        <div className="flex flex-col gap-1.5 pt-1">
          <p className={cn(
            "text-[9px] font-bold uppercase tracking-wider",
            theme === 'dark' ? "text-[#52525b]" : "text-gray-400"
          )}>Built By <a href="https://harishkotra.me" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">Harish Kotra</a></p>
          <a href="https://dailybuild.xyz" target="_blank" rel="noopener noreferrer" className={cn(
            "text-[9px] font-bold uppercase tracking-wider transition-colors",
            theme === 'dark' ? "text-[#3f3f46] hover:text-[#71717a]" : "text-gray-300 hover:text-gray-500"
          )}>Checkout my other builds</a>
        </div>
      </div>
    </div>
  );
}
