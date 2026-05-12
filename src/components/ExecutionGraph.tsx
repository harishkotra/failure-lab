import React, { useMemo } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Handle, 
  Position,
  NodeProps,
  Node as FlowNode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore, ToolStatus } from '../store/useStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, CheckCircle2, CloudLightning, Loader2, RotateCcw, RefreshCw } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AgentNode = ({ data }: NodeProps) => {
  const status = data.status as ToolStatus;
  const theme = useStore((s) => s.theme);
  
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "p-6 shadow-2xl rounded-xl border-2 transition-all duration-700 min-w-[240px] relative overflow-hidden group",
        theme === 'dark' ? "bg-[#09090b]" : "bg-white",
        status === 'running' ? "border-blue-500 shadow-blue-500/10" : (theme === 'dark' ? "border-[#27272a]" : "border-gray-200")
      )}
    >
      {/* Decorative scanning line for when running */}
      {status === 'running' && (
        <motion.div 
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[1px] bg-blue-500/50 z-0 pointer-events-none"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "w-2.5 h-2.5 rounded-sm rotate-45 transition-all duration-500",
            status === 'running' ? "bg-blue-500 shadow-[0_0_10px_#3b82f6]" : (theme === 'dark' ? "bg-[#71717a]" : "bg-gray-300")
          )} />
          <span className={cn(
            "font-mono text-xs font-bold uppercase tracking-[0.2em]",
            theme === 'dark' ? "text-[#fafafa]" : "text-black"
          )}>{String(data.label)}</span>
        </div>
        
        <div className={cn(
          "text-[10px] font-medium italic border-l-2 pl-3 py-1",
          theme === 'dark' ? "text-[#71717a] border-[#27272a]" : "text-gray-400 border-gray-100"
        )}>
          {status === 'running' ? "Orchestrating distributed tool calls..." : 
           status === 'success' ? "All operations stabilized." :
           "Awaiting system initialization"}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={cn("w-2.5 h-2.5 !bg-emerald-500 !border-2", theme === 'dark' ? "!border-[#09090b]" : "!border-white")} />
    </motion.div>
  );
};

const CustomNode = ({ data }: NodeProps) => {
  const status = data.status as ToolStatus;
  const theme = useStore((s) => s.theme);
  const label = String(data.label);
  
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "p-4 rounded-lg border transition-all duration-500 min-w-[200px] shadow-lg",
        theme === 'dark' ? "bg-[#18181b]" : "bg-white",
        status === 'running' && "border-amber-500/50 ring-1 ring-amber-500/20",
        status === 'success' && "border-emerald-500/40 shadow-emerald-500/5",
        status === 'failed' && "border-red-500 shadow-red-500/10",
        status === 'retrying' && "border-amber-500 animate-pulse",
        !status && (theme === 'dark' ? "border-[#27272a]" : "border-gray-200")
      )}
    >
      <Handle type="target" position={Position.Top} className={cn("w-2 h-2 !border-none", theme === 'dark' ? "!bg-[#71717a]" : "!bg-gray-300")} />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              status === 'success' ? "bg-emerald-500" : 
              status === 'failed' ? "bg-red-500" : 
              status === 'running' ? "bg-blue-500 animate-spin" : 
              (theme === 'dark' ? "bg-[#52525b]" : "bg-gray-300")
            )} />
            <span className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-wider",
              theme === 'dark' ? "text-[#fafafa]" : "text-black"
            )}>{label.replace(' API', '')}</span>
          </div>
        </div>
        
        <div className={cn(
          "text-[9px] leading-relaxed font-sans font-medium",
          status === 'running' ? "text-amber-500 animate-pulse" :
          status === 'failed' ? "text-red-500" :
          status === 'success' ? "text-emerald-500" :
          (theme === 'dark' ? "text-[#71717a]" : "text-gray-400")
        )}>
          {status === 'running' ? `Inbound Request -> ${label}...` : 
           status === 'failed' ? "REL_ERR: Connection Refused" : 
           status === 'success' ? "Payload Validated & Sync'd" :
           "Queueing Operation..."}
        </div>

        {(status === 'failed' || status === 'retrying') && (
          <div className={cn(
            "flex justify-between items-center mt-1 border-t pt-2",
            theme === 'dark' ? "border-[#27272a]" : "border-gray-100"
          )}>
            <span className="text-[8px] text-[#71717a]">SYSTEM_AUTH: FAIL</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className={cn("w-2 h-2 !border-none", theme === 'dark' ? "!bg-[#71717a]" : "!bg-gray-300")} />
    </motion.div>
  );
};

const OutputNode = ({ data }: NodeProps) => {
  const status = data.status as ToolStatus;
  const theme = useStore((s) => s.theme);
  
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      className={cn(
        "p-6 shadow-2xl rounded-2xl border-2 transition-all duration-700 min-w-[340px] max-w-[600px] relative overflow-hidden",
        theme === 'dark' ? "bg-[#09090b] border-emerald-500/40" : "bg-white border-emerald-600 shadow-emerald-500/10",
      )}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-emerald-500 !border-white !border-2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <span className={cn(
            "font-mono text-xs font-bold uppercase tracking-[0.3em]",
            theme === 'dark' ? "text-white" : "text-black"
          )}>Outcome Synthesis</span>
        </div>
        
        <div className={cn(
          "relative overflow-hidden",
          theme === 'dark' ? "text-[#a1a1aa]" : "text-gray-700"
        )}>
          {status === 'success' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 opacity-80">
                <div className="w-1 h-3 bg-emerald-500" />
                <p className="font-bold text-emerald-500 text-[10px] uppercase tracking-[0.2em]">Validated Matrix:</p>
              </div>
              <div className={cn(
                "text-[12px] leading-relaxed font-sans font-medium markdown-body",
                theme === 'dark' ? "prose prose-invert" : "prose"
              )}>
                <ReactMarkdown>{String(data.result || "Core inference finalized.")}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <span className="animate-pulse flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-emerald-500">
              <RefreshCw className="w-4 h-4 animate-spin" /> 
              Executing Multi-Modal Synthesis...
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function ExecutionGraph({ nodes, edges }: { nodes: FlowNode[], edges: any[] }) {
  const { onNodesChange, onEdgesChange, theme } = useStore();
  const nodeTypes = useMemo(() => ({ 
    tool: CustomNode, 
    agent: AgentNode,
    outcome: OutputNode 
  }), []);

  return (
    <div className={cn(
      "w-full h-full relative overflow-hidden transition-colors duration-300",
      theme === 'dark' ? "bg-[#09090b]" : "bg-gray-50"
    )}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        className="tool-failure-graph"
        colorMode={theme}
        minZoom={0.2}
      >
        <Background 
          color={theme === 'dark' ? "#18181b" : "#e5e7eb"} 
          gap={24} 
          size={1} 
        />
        <Controls className={cn(
          "shadow-xl border transition-colors",
          theme === 'dark' ? "!bg-[#18181b] !border-[#27272a] !fill-[#fafafa]" : "!bg-white !border-gray-200 !fill-gray-600"
        )} />
      </ReactFlow>
    </div>
  );
}
