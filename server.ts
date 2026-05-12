import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for Tools with Failure Injection
  app.post("/api/tool-call", async (req, res) => {
    const { toolId, config, params, credentials } = req.body;
    const { failureMode, failureProbability, latency } = config;

    // 1. Simulate Latency
    const effectiveLatency = failureMode === 'timeout' ? latency * 5 : latency;
    await new Promise(resolve => setTimeout(resolve, effectiveLatency));

    // 2. Simulate Probabilistic Failure
    if (Math.random() < failureProbability && failureMode !== 'none') {
       if (failureMode === 'random') {
         return res.status(500).json({ error: "RANDOM_SYSTEM_FAILURE", message: "An unexpected error occurred in the distributed system." });
       }
       if (failureMode === 'timeout') {
         return res.status(504).json({ error: "GATEWAY_TIMEOUT", message: "The upstream tool exceeded the allowed maximum response time." });
       }
    }

    try {
      let data = {};

      if (toolId === 't-weather') {
        const apiKey = credentials?.weather || credentials?.inference;
        if (!apiKey) {
          data = { error: "AUTH_REQUIRED", message: "Weather infrastructure requires an API key in the Sidebar." };
        } else {
          const resp = await fetch("https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current_weather=true");
          data = { ...(await resp.json()), _auth: "Authorized" };
        }
      } else if (toolId === 't-currency') {
        const apiKey = credentials?.currency || credentials?.inference;
        if (!apiKey) {
           data = { error: "AUTH_REQUIRED", message: "Currency data requires a platform API key." };
        } else {
          const resp = await fetch("https://api.frankfurter.app/latest?from=USD&to=JPY");
          data = { ...(await resp.json()), _auth: "Authorized" };
        }
      } else if (toolId === 't-search') {
        const apiKey = credentials?.search || credentials?.tavily || credentials?.inference;
        if (!apiKey) {
           data = { error: "AUTH_REQUIRED", message: "Global search requires a valid API key (Tavily/OpenAI)." };
        } else {
           const resp = await fetch("https://api.tavily.com/search", {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ api_key: apiKey, query: params?.query || "Tokyo travel events", search_depth: "basic" })
           });
           data = await resp.json();
        }
      } else if (toolId === 't-hotels') {
        const apiKey = credentials?.hotels || credentials?.inference;
        if (!apiKey) {
          data = { error: "AUTH_REQUIRED", message: "Hotel provider requires an API key." };
        } else {
          data = { status: "success", provider: "Integrated", message: "Live lookup complete.", results: ["Park Hyatt Tokyo", "Hotel Gajoen"] };
        }
      } else if (toolId === 't-flights') {
        const apiKey = credentials?.flights || credentials?.inference;
        if (!apiKey) {
          data = { error: "AUTH_REQUIRED", message: "Flight aggregator requires an API key." };
        } else {
          data = { status: "success", provider: "Integrated", message: "Real-time verification pass.", results: ["JL001", "NH126"] };
        }
      } else {
        data = { error: "UNKNOWN_TOOL", message: "The requested tool is not mapped to a real provider." };
      }

      // 3. Simulate Data Corruption
      if (failureMode === 'malformed') {
        // Return something that is definitely not what's expected
        return res.send("<html><body>ERROR: SYSTEM_OVERLOAD_OR_CORRUPT_BUFFER</body></html>");
      }
      
      if (failureMode === 'partial') {
        // Strip data
        return res.json({ status: "partial", results: [] });
      }

      if (failureMode === 'stale') {
        // Simulate old data
        return res.json({ ...data, _metadata: { last_updated: "2021-08-12", cache: "STALE" } });
      }

      res.json(data);
    } catch (error) {
      res.status(502).json({ error: "BAD_GATEWAY", message: "Failed to communicate with the upstream service." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
