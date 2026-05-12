import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  applyNodeChanges, 
  applyEdgeChanges, 
  NodeChange, 
  EdgeChange 
} from '@xyflow/react';

export type ToolStatus = 'idle' | 'running' | 'success' | 'failed' | 'retrying' | 'degraded';

export interface ToolConfig {
  id: string;
  name: string;
  failureMode: 'none' | 'timeout' | 'malformed' | 'partial' | 'stale' | 'random';
  failureProbability: number;
  latency: number; // ms
}

export interface TraceEvent {
  id: string;
  timestamp: number;
  type: 'llm:start' | 'llm:end' | 'tool:start' | 'tool:end' | 'tool:error' | 'tool:retry' | 'hallucination:warning' | 'recovery:success' | 'recovery:failed';
  message: string;
  data?: any;
  duration?: number;
}

export interface SimulationState {
  isRunning: boolean;
  theme: 'dark' | 'light';
  prompt: string;
  selectedModel: string;
  nodes: Node[];
  edges: Edge[];
  logs: TraceEvent[];
  tools: ToolConfig[];
  apiKeys: Record<string, string>;
  metrics: {
    totalLatency: number;
    retryCount: number;
    failedTools: number;
    hallucinationRisk: number;
    recoveryRate: number;
  };
  
  // Actions
  setPrompt: (prompt: string) => void;
  setSelectedModel: (model: string) => void;
  setRunning: (isRunning: boolean) => void;
  toggleTheme: () => void;
  setApiKey: (key: string, value: string) => void;
  updateToolConfig: (id: string, updates: Partial<ToolConfig>) => void;
  addLog: (event: TraceEvent) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  updateMetrics: (updates: Partial<SimulationState['metrics']>) => void;
  resetSimulation: () => void;
}

export const useStore = create<SimulationState>((set) => ({
  isRunning: false,
  theme: 'dark',
  prompt: 'Plan a 3-day trip to Tokyo',
  selectedModel: 'Gemini 2.0 (Integrated)',
  nodes: [],
  edges: [],
  logs: [],
  tools: [
    { id: 't-weather', name: 'Weather API', failureMode: 'none', failureProbability: 0.2, latency: 450 },
    { id: 't-flights', name: 'Flight Search', failureMode: 'none', failureProbability: 0.1, latency: 1200 },
    { id: 't-hotels', name: 'Hotel API', failureMode: 'none', failureProbability: 0.1, latency: 800 },
    { id: 't-currency', name: 'Currency Conv', failureMode: 'none', failureProbability: 0.05, latency: 300 },
    { id: 't-search', name: 'Web Search', failureMode: 'none', failureProbability: 0.15, latency: 1500 },
  ],
  apiKeys: {},
  metrics: {
    totalLatency: 0,
    retryCount: 0,
    failedTools: 0,
    hallucinationRisk: 0,
    recoveryRate: 0,
  },

  setPrompt: (prompt) => set({ prompt }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setRunning: (isRunning) => set({ isRunning }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setApiKey: (key, value) => set((state) => ({
    apiKeys: { ...state.apiKeys, [key]: value }
  })),
  updateToolConfig: (id, updates) => set((state) => ({
    tools: state.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  })),
  addLog: (event) => set((state) => ({ logs: [event, ...state.logs] })),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) => set((state) => ({
    nodes: applyNodeChanges(changes, state.nodes)
  })),
  onEdgesChange: (changes) => set((state) => ({
    edges: applyEdgeChanges(changes, state.edges)
  })),
  updateMetrics: (updates) => set((state) => ({ 
    metrics: { ...state.metrics, ...updates } 
  })),
  resetSimulation: () => set({ 
    logs: [], 
    nodes: [], 
    edges: [], 
    metrics: {
      totalLatency: 0,
      retryCount: 0,
      failedTools: 0,
      hallucinationRisk: 0,
      recoveryRate: 0,
    }
  }),
}));
