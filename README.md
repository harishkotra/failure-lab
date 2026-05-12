# Failure Lab: Agentic Reliability & Synthesis Visualizer

Failure Lab is a high-fidelity visualizer for monitoring and debugging agentic AI workflows. It specifically focuses on how AI agents handle tool-call failures, retries, and the final synthesis of fragmented data.

## Overview

Modern AI agents are brittle at the tool-calling layer. Failure Lab provides a "glass box" view into:
- **Parallel Execution:** How multiple tools are called concurrently.
- **Error Handling:** Real-time visualization of connection refused, timeout, and authentication errors.
- **Recovery Logic:** How agents pivot from failed tool calls to "Optimistic Synthesis".
- **Outcome Synthesis:** Final generation using high-quality LLMs (Gemini/OpenAI) to weave together partial data into a coherent plan.

## Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS
- **Visualization:** [React Flow (@xyflow/react)](https://reactflow.dev/) for the dynamic execution graph.
- **Animations:** Motion (formerly Framer Motion) for smooth state transitions.
- **State Management:** Zustand for centralized agent status and trace history.
- **Backend (Simulated):** Express.ts serving as a proxy to mimic real-world API latency and failure states.
- **Inference Engines:** 
    - Google Gemini AI (@google/genai)
    - OpenAI Node SDK

## Architecture

The app follows a unidirectional data flow:
1. **User Input:** Prompt is captured and stored in Zustand.
2. **Simulation Engine:** Orhcestrates the tool execution cycle.
3. **Execution Graph:** React Flow renders nodes representing the LLM, Tool Calls, and Synthesis Engine.
4. **Proxy Layer:** `server.ts` handles API calls, allowing for controlled injection of failures (latency, 401s, 500s).
5. **Synthesis Engine:** A final call to a "Brain" model (e.g., Gemini 1.5 Pro) to generate the user's requested content based on whatever tool data was successfully retrieved.

```mermaid
graph TD
    A[User Prompt] --> B[Simulation Engine]
    B --> C{Parallel Tool Dispatch}
    C --> D[Weather API]
    C --> E[Hotel Search]
    C --> F[Flight Aggregator]
    D -.-> G[Failure Logic]
    E -.-> G
    G --> H[Retry Orchestrator]
    H --> I[Synthesis Engine]
    I --> J[Final Markdown Plan]
```

## Configuration

To run the full synthesis engine, you need to provide API keys in the app's sidebar:
- **Inference API Key:** Supporting Gemini (default) or OpenAI (if GPT-4o is selected).

## 🍴 Forking & Contributing

### Getting Started
1. Clone the repo.
2. Install dependencies: `npm install`
3. Run dev server: `npm run dev`

### Potential Features to Add
- **Custom Tool Definitions:** Add a JSON editor to define new tool schemas and failure probabilities.
- **Chain of Thought (CoT) Visualizer:** Expand the graph to show internal reasoning steps before tool dispatch.
- **History Replay:** Save execution traces to a database (like Firebase) to replay past failures and analyze agent "hallucination" trends.
- **Multi-Agent Support:** Visualize communication between different agent personas (e.g., Researcher and Writer).

#### Screenshots

<img width="1530" height="1040" alt="failure-lab-1" src="https://github.com/user-attachments/assets/2115cf8a-fc3a-4ab8-95d8-21a5a8604dee" />
<img width="1532" height="1041" alt="failure-lab-2" src="https://github.com/user-attachments/assets/d02cfec2-0ae4-46a2-b4cd-22244c5ea6f1" />
<img width="1530" height="1042" alt="failure-lab-3" src="https://github.com/user-attachments/assets/f0cdf932-aeab-4c7c-8a12-9c58cda6b425" />
<img width="1529" height="1040" alt="failure-lab-4" src="https://github.com/user-attachments/assets/1c1221e2-dd87-465d-9a34-b180e6a2493f" />
<img width="1530" height="1038" alt="failure-lab-5" src="https://github.com/user-attachments/assets/d0dac720-9f3c-45cd-bb1c-ee0f500347e8" />
<img width="1530" height="1041" alt="failure-lab-6" src="https://github.com/user-attachments/assets/1c616720-cd9d-4901-9bc0-20895dece6cd" />
<img width="1527" height="1040" alt="failure-lab-7" src="https://github.com/user-attachments/assets/1a48871e-aca6-4505-b579-a0d6606cb397" />
<img width="1529" height="1044" alt="failure-lab-8" src="https://github.com/user-attachments/assets/4bf5eadd-08ce-48c2-bab4-86a3afd59ff0" />
<img width="1278" height="1041" alt="failure-lab-9" src="https://github.com/user-attachments/assets/3699f40b-30fc-4505-9758-fd97ee9a41e9" />
<img width="1530" height="1040" alt="failure-lab-10" src="https://github.com/user-attachments/assets/ab9235d8-b19b-406d-ad39-7c988d002e44" />
<img width="1529" height="1036" alt="failure-lab-11" src="https://github.com/user-attachments/assets/f159ff66-9d95-42e4-b86e-ca22e5ddcf1d" />
<img width="1532" height="1040" alt="failure-lab-12" src="https://github.com/user-attachments/assets/4b1f38a6-3d82-42f8-8eb2-a0e0aa8158c2" />
