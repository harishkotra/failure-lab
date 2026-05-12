import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Sidebar from './components/Sidebar';
import ExecutionGraph from './components/ExecutionGraph';
import Inspector from './components/Inspector';
import MetricsBar from './components/MetricsBar';
import { useStore } from './store/useStore';
import { runSimulation } from './engine/simulationEngine';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const { 
    isRunning, 
    setRunning, 
    tools, 
    nodes, 
    edges, 
    addLog, 
    setNodes, 
    setEdges, 
    updateMetrics,
    resetSimulation,
    theme
  } = useStore();

  const handleStart = async () => {
    resetSimulation();
    setRunning(true);
    
    try {
      await runSimulation(
        tools, 
        addLog,
        setNodes,
        setEdges,
        updateMetrics
      );
    } catch (err) {
      addLog({
        id: 'error-fatal',
        timestamp: 0,
        type: 'tool:error',
        message: 'Simulation engine experienced a fatal runtime error.'
      });
    } finally {
      setRunning(false);
    }
  };

  const handleStop = () => {
    setRunning(false);
  };

  return (
    <div className={cn(
      "flex flex-col h-screen overflow-hidden font-sans selection:bg-blue-500/30 transition-colors duration-300",
      theme === 'dark' ? "bg-black text-white" : "bg-white text-gray-900"
    )}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Left: Configuration */}
        <Sidebar onStart={handleStart} onStop={handleStop} />

        {/* Main Content: Graph Visualization */}
        <main className={cn(
          "flex-1 relative overflow-hidden",
          theme === 'dark' ? "bg-[#09090b]" : "bg-gray-50"
        )}>
          <div className="absolute top-4 left-4 z-10 flex gap-2">
             <div className={cn(
                "backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-widest border transition-all",
                theme === 'dark' ? "bg-[#09090b]/80 border-[#27272a] text-[#71717a]" : "bg-white/80 border-gray-200 text-gray-400"
             )}>
                Live Runtime Graph
             </div>
          </div>
          
          <ExecutionGraph nodes={nodes} edges={edges} />
        </main>

        {/* Right Sidebar: Trace Inspector */}
        <aside className="w-96 shrink-0 border-l border-transparent">
          <Inspector />
        </aside>
      </div>

      {/* Bottom Bar: Metrics */}
      <MetricsBar />
    </div>
  );
}
