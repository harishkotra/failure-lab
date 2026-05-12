import { useStore, ToolConfig, ToolStatus, TraceEvent } from '../store/useStore';
import { Node, Edge } from '@xyflow/react';

const INITIAL_NODES: Node[] = [
  { id: 'agent-planner', type: 'agent', data: { label: 'Planner Agent' }, position: { x: 250, y: 0 } },
];

export async function runSimulation(
  tools: ToolConfig[], 
  onLog: (e: TraceEvent) => void,
  onUpdateNodes: (nodes: Node[]) => void,
  onUpdateEdges: (edges: Edge[]) => void,
  onUpdateMetrics: (metrics: any) => void
) {
  const startTime = Date.now();
  let retryCount = 0;
  let failedTools = 0;
  let riskSum = 0;
  const toolResults: any[] = [];

  const logs: TraceEvent[] = [];
  const nodes: Node[] = [...INITIAL_NODES];
  const edges: Edge[] = [];

  const addNode = (id: string, label: string, type: string, status: ToolStatus, x: number, y: number) => {
    nodes.push({ id, type, data: { label, status }, position: { x, y } });
    onUpdateNodes([...nodes]);
  };

  const addEdge = (source: string, target: string, animated = true, status: 'success' | 'fail' | 'retry' = 'success') => {
    const color = status === 'success' ? '#10b981' : status === 'fail' ? '#f43f5e' : '#f59e0b';
    edges.push({ 
      id: `${source}-${target}-${Date.now()}`, 
      source, 
      target, 
      animated,
      style: { stroke: color, strokeWidth: 2 }
    });
    onUpdateEdges([...edges]);
  };

  const emitEvent = (type: TraceEvent['type'], message: string, data?: any) => {
    const ev: TraceEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now() - startTime,
      type,
      message,
      data
    };
    onLog(ev);
    return ev;
  };

  const updateAgentStatus = (status: ToolStatus) => {
    const agentNode = nodes.find(n => n.id === 'agent-planner');
    if (agentNode) {
      agentNode.data = { ...agentNode.data, status };
      onUpdateNodes([...nodes]);
    }
  };

  // Start Phase
  updateAgentStatus('running');
  const { selectedModel } = useStore.getState();
  emitEvent('llm:start', `Reasoning Engine [${selectedModel}] generating active strategy...`, { model: selectedModel });
  await new Promise(r => setTimeout(r, 800));
  emitEvent('llm:end', 'Execution plan locked: Routing requests through user-provided infrastructure keys.');

  const toolPositions = [
    { x: 0, y: 150 },
    { x: 125, y: 150 },
    { x: 250, y: 150 },
    { x: 375, y: 150 },
    { x: 500, y: 150 },
  ];

  // Execute Tools
  const executeTool = async (tool: ToolConfig, index: number) => {
    const nodeId = `node-${tool.id}`;
    addNode(nodeId, tool.name, 'tool', 'running', toolPositions[index].x, toolPositions[index].y);
    addEdge('agent-planner', nodeId);
    emitEvent('tool:start', `Requesting ${tool.name}...`, { toolId: tool.id });

    const callApi = async () => {
      const response = await fetch("/api/tool-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          toolId: tool.id, 
          config: tool, 
          params: { query: useStore.getState().prompt },
          credentials: useStore.getState().apiKeys
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP_${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("MALFORMED_RESPONSE");
      }

      return await response.json();
    };

    try {
      const data = await callApi();
      emitEvent('tool:end', `${tool.name} returned successfully.`, { data });
      toolResults.push({ tool: tool.name, data, success: true });
      return { success: true, risk: 0 };
    } catch (err: any) {
      failedTools++;
      riskSum += 0.4;
      emitEvent('tool:error', `${tool.name} failed: ${err.message}`, { toolId: tool.id });
      
      // Reasoning for Retry
      emitEvent('llm:start', `Observed network instability while calling ${tool.name}. Diagnosed error code: ${err.message}. Reasoning: This failure pattern suggests a transient gateway issue. Logic dictates a high-velocity retry attempt before declaring state corruption.`, { context: 'Recovery Strategy', tool: tool.name });
      
      // Attempt Retry
      retryCount++;
      emitEvent('tool:retry', `Retrying ${tool.name} (Attempt 1)...`, { toolId: tool.id });
      addEdge(nodeId, nodeId, true, 'retry'); 
      
      await new Promise(r => setTimeout(r, 1500));
      
      try {
        // For retry, we temporarily lower the failure probability to simulate "fixing" it or a transient error passing
        const retryTool = { ...tool, failureProbability: 0 };
        const response = await fetch("/api/tool-call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            toolId: tool.id, 
            config: retryTool, 
            params: { query: useStore.getState().prompt },
            credentials: useStore.getState().apiKeys
          })
        });

        if (!response.ok) throw new Error("RETRY_FAILED");
        const data = await response.json();
        
        emitEvent('recovery:success', `${tool.name} recovered after retry.`, { data });
        toolResults.push({ tool: tool.name, data, success: true });
        return { success: true, risk: 0.1 };
      } catch (retryErr) {
        emitEvent('llm:start', `Secondary attempt for ${tool.name} also failed. Upstream source definitively unreachable. Reasoning: Continuing to halt would exceed latency budget. Logic: Pivot to 'Optimistic Synthesis' mode. We will use historical context to fill this data gap.`, { context: 'Fallback Logic', tool: tool.name });
        emitEvent('recovery:failed', `${tool.name} critical failure. Falling back to cached/simulated data.`);
        emitEvent('hallucination:warning', `Agent likely to hallucinate ${tool.name} data due to failure.`);
        riskSum += 0.3;
        toolResults.push({ tool: tool.name, error: "Critical Failure", success: false });
        return { success: false, risk: 0.6 };
      }
    }
  };

  const results = await Promise.all(tools.map((t, i) => executeTool(t, i)));
  
  // Final reasoning
  emitEvent('llm:start', 'Synthesizing final response from tool outputs using Inference Engine...');
  const totalRisk = Math.min(100, (riskSum / (tools.length || 1)) * 100);
  
  // Create Output Node
  const outputId = 'output-synthesis';
  addNode(outputId, 'Outcome Synthesis', 'outcome', 'running', 250, 450);

  // Connect all tools to output
  tools.forEach(t => {
    addEdge(`node-${t.id}`, outputId, true, 'success');
  });

  // Real LLM Synthesis
  let finalPlan = "";
  try {
    const { prompt, apiKeys, selectedModel } = useStore.getState();
    const inferenceKey = apiKeys.inference;
    const fallbackGeminiKey = process.env.GEMINI_API_KEY;
    
    let provider = 'gemini';
    let modelId = 'gemini-1.5-flash';
    let apiKey = '';

    if (selectedModel === 'OpenAI GPT-4o') {
      provider = 'openai';
      modelId = 'gpt-4o';
      apiKey = inferenceKey || '';
      if (!apiKey) throw new Error("Missing 'Inference API Key' for OpenAI.");
    } else {
      provider = 'gemini';
      const modelMapping: Record<string, string> = {
        'Gemini 2.0 (Integrated)': 'gemini-2.0-flash',
        'Anthropic Claude 3.5': 'gemini-1.5-flash',
        'Featherless (Compatible)': 'gemini-1.5-flash',
        'Ollama (Localhost)': 'gemini-1.5-flash'
      };
      modelId = modelMapping[selectedModel] || 'gemini-1.5-flash';
      apiKey = inferenceKey || fallbackGeminiKey || '';
      if (!apiKey) throw new Error("NO_API_KEY");
    }

    const response = await fetch("/api/synthesis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        model: modelId,
        apiKey,
        prompt,
        toolResults
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP_${response.status}`);
    }

    const data = await response.json();
    finalPlan = data.result || "Synthesis engine returned an empty result.";
  } catch (err: any) {
    console.error("Synthesis Error:", err);
    finalPlan = err.message === "NO_API_KEY" 
      ? "SYSTEM_ERROR: Synthesis failed because no valid 'Inference API Key' was provided in the sidebar. Please add a Gemini/OpenAI key to complete the cycle."
      : `CRITICAL_SYS_FAILURE: Multi-modal synthesis aborted. Reason: ${err.message}`;
  }
  
  // Update output with results
  const finalOutputNode = nodes.find(n => n.id === outputId);
  if (finalOutputNode) {
    finalOutputNode.data = { 
      ...finalOutputNode.data, 
      status: 'success', 
      result: finalPlan
    };
    onUpdateNodes([...nodes]);
  }

  onUpdateMetrics({
    totalLatency: Date.now() - startTime,
    retryCount,
    failedTools,
    hallucinationRisk: totalRisk,
    recoveryRate: ((tools.length - failedTools) / tools.length) * 100
  });

  emitEvent('llm:end', 'Execution complete. Task served.');
  updateAgentStatus('success');
}
