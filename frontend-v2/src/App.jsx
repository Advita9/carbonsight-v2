
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import CarbonTooltip from "./components/CarbonTooltip";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { loadHistory, saveHistory } from "./utils/history";
import OptimizedChip from "./components/OptimizedChip";
import PromptSuggestor from "./components/PromptSuggestor";
import CarbonForecastPanel from "./components/CarbonForecastPanel";
import EcoPlanPanel from "./components/EcoPlanPanel";

export default function App() {
  const [messages, setMessages] = useState(loadHistory());
  const [input, setInput] = useState("");
  const [carbonData, setCarbonData] = useState(null);
  const [modelUsed, setModelUsed] = useState("");
  const [optimizePrompt, setOptimizePrompt] = useState(false);
  const [coachData, setCoachData] = useState(null);
  const [suggestMode, setSuggestMode] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [ecoPlanMode, setEcoPlanMode] = useState(false);
  const [planData, setPlanData] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planSteps, setPlanSteps] = useState([]);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [planLoading, setPlanLoading] = useState(false);

  const [burstAlert, setBurstAlert] = useState(null);


  const DEMO_USER_ID = "demo-user";



  // Save chat history automatically
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  
  const sendMessage = async () => {
  if (!input.trim()) return;

  let workingPrompt = input;
  let plan = null;

  /* Clear suggest mode if active */
  if (suggestMode) {
    setCoachData(null);
    setSuggestMode(false);
  }

 

    // OPTIMIZE MODE — call /optimize
    if (optimizePrompt) {
      try {
        const optRes = await fetch(
          "http://127.0.0.1:8000/optimize",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: input }),
          }
        );

        const parsedOpt = await optRes.json();
        workingPrompt = parsedOpt.optimized;

        // Show optimized chip BEFORE user message
        setMessages(prev => [
          ...prev,
          {
            role: "optimize-chip",
            optimized: parsedOpt.optimized,
            savings_kwh: parsedOpt.energy_savings_kwh,
            savings_co2: parsedOpt.co2_savings_kg,
          }
        ]);

      } catch (err) {
        console.error("Optimization failed:", err);
      }
    }


  /* ECO PLAN MODE */
  if (ecoPlanMode) {
    try {
      setPlanLoading(true);
      setPlanSteps([]);
      setVisibleSteps([]);

      const res = await fetch(
        "http://127.0.0.1:8000/plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: workingPrompt })
        }
      );

      const data = await res.json();
      const steps = data.plan || [];

      setPlanSteps(steps);

      // fake "thinking" delay
      setTimeout(() => {
        setPlanLoading(false);

        // 🎬 reveal steps one by one
        steps.forEach((step, index) => {
          setTimeout(() => {
            setVisibleSteps(prev => [...prev, step]);
          }, index * 700); // stagger animation
        });

      }, 1200);

    } catch (err) {
      console.error("Plan generation failed:", err);
      setPlanLoading(false);
    }
  }


    /* ======================================
          Add USER message
      ====================================== */
    setMessages(prev => [...prev, { role: "user", text: input }]);

    /* ======================================
          Call /ask with plan (optional)
      ====================================== */
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/ask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: workingPrompt,
            plan: ecoPlanMode ? plan : null,   // only include plan when enabled
            user_id: DEMO_USER_ID,
          }),
        }
      );

      const parsed = await res.json();
      if (parsed.burst?.burst && parsed.burst?.swap_suggestion) {
        setBurstAlert({
          message: parsed.burst.swap_suggestion,
          calls: parsed.burst.calls_in_window,
          score: parsed.burst.burst_score,
        });
        setTimeout(() => setBurstAlert(null), 12000);
      }

      const assistantMessage = {
        role: "assistant",
        text: parsed.response,
        model: parsed.modelUsed,
        cached: parsed.cached || false,
        carbon: parsed.carbon ? {
          predicted_kwh: parsed.carbon.predicted_kwh,
          actual_kwh: parsed.carbon.actual_kwh,
          predicted_co2: parsed.carbon.predicted_co2,
          actual_co2: parsed.carbon.actual_co2
        } : null
      };

      setMessages(prev => [...prev, assistantMessage]);

      setModelUsed(parsed.modelUsed);
      setCarbonData(parsed.carbon || null);

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "⚠️ Error contacting backend." }
      ]);
    }

    setInput("");
  };


  const fetchForecast = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/forecast",
        { method: "GET" }
      );
      const data = await res.json();
      setForecastData(data);
    } catch (err) {
      console.error("Forecast fetch error:", err);
    }
  };


  return (
    <div className="h-screen w-screen bg-[#0E0F10] text-white flex flex-col">
      {/* NAVBAR */}
      <Navbar
        carbonData={carbonData}
        modelUsed={modelUsed}
        isCached={
          [...messages].reverse().find((m) => m.role === "assistant")?.cached ||
          false
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar history={messages} />

        {/* MAIN CHAT */}
        <main className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((msg, idx) => {
              // 1️⃣ Special UI for optimize chip
              if (msg.role === "optimize-chip") {
                return (
                  <OptimizedChip 
                    key={idx}
                    optimized={msg.optimized}
                    savings_kwh={msg.savings_kwh}
                    savings_co2={msg.savings_co2}
                  />
                );
              }

              //  Normal messages
              return (
                <div key={idx} className="relative group flex flex-col max-w-3xl">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-7 ${
                      msg.role === "user"
                        ? "self-end bg-blue-600/30"
                        : "self-start bg-white/5"
                    }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>

                  {msg.cached && (
                    <span className="text-xs text-green-400 font-semibold mt-1">
                      ✓ Served from cache
                    </span>
                  )}

                  {msg.model && (
                    <span className="text-xs text-white/40">
                      Model: {msg.model}
                    </span>
                  )}

                  {msg.role === "assistant" && msg.carbon && (
                    <div className="hidden group-hover:block absolute left-0 top-full z-50">
                      <CarbonTooltip data={msg} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {burstAlert && (
          <div className="mx-6 mb-2 px-5 py-4 bg-amber-500/10 border border-amber-400/30 rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-amber-400 text-xl mt-0.5"></span>
                <div>
                  <p className="text-sm font-semibold text-amber-300 mb-1">
                   High compute interval detected
                  </p>
                  <p className="text-sm text-amber-200/80">
                    {burstAlert.calls} AI requests sent in the last 5 minutes —
                    {" "}above your normal usage pattern.
                    Switching to a lighter model now would reduce energy use by up to 75%
                    and qualify you for green swap rewards.
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="text-xs text-white/40">
                      Burst score: <span className="text-amber-400 font-mono">{burstAlert.score}×</span>
                      <span className="ml-1 text-white/25">threshold</span>
                    </div>
                    <div className="text-xs text-white/40">
                      Detected by: <span className="text-white/60">sliding window monitor</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 w-32 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(burstAlert.score * 50, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/30">
                      {burstAlert.score}× above threshold
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBurstAlert(null)}
                className="text-white/20 hover:text-white/60 text-lg leading-none mt-0.5"
              >
                ×
              </button>
            </div>

            {/* What this means for ESG */}
            <div className="mt-4 pt-3 border-t border-amber-400/10 flex items-center gap-2">
              <span className="text-xs text-white/30">
                🌿 This session's burst would have cost{" "}
                <span className="text-white/50">
                  ~{(burstAlert.calls * 0.000018 * 1e6).toFixed(1)} µg CO₂
                </span>{" "}
                at Pro tier vs{" "}
                <span className="text-green-400">
                  ~{(burstAlert.calls * 0.000001 * 1e6).toFixed(1)} µg CO₂
                </span>{" "}
                at Micro — carbon ledger is tracking this.
              </span>
            </div>
          </div>
        )}

          {/* INPUT PANEL */}
          <div className="p-6 border-t border-white/10 bg-[#0F1012]">
            <div className="max-w-3xl mx-auto flex items-center gap-3 bg-[#1A1C1E] p-4 rounded-xl">
              <textarea
                className="flex-1 bg-transparent outline-none resize-none text-sm"
                placeholder={
                  optimizePrompt
                    ? "R-EcoWrite — your prompt will be rewritten…"
                    : "Ask Carbonsight anything..."
                }
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                onClick={async () => {
                  if (suggestMode) {
                    // Turn off and clear suggestion
                    setCoachData(null);
                    setSuggestMode(false);
                    return;
                  }

                  // Turn ON: fetch suggestions
                  try {
                    const res = await fetch(
                      "http://127.0.0.1:8000/coach",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt: input })
                      }
                    );

                    const data = await res.json();
                    setCoachData(data);
                    setSuggestMode(true);

                  } catch (err) {
                    console.error(err);
                  }
                }}
                className={`
                  px-3 py-2 rounded-lg text-xs font-semibold transition
                  ${suggestMode ? "bg-green-500 text-black" : "bg-white/10 text-white/60"}
                `}
              >
                Suggest
              </button>


              {/* OPTIMIZE TOGGLE */}
              <button
                onClick={() => setOptimizePrompt(!optimizePrompt)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  optimizePrompt
                    ? "bg-green-500 text-black"
                    : "bg-white/10 text-white/50"
                }`}
              >
                Optimize
              </button>

              <button
                onClick={() => setEcoPlanMode(!ecoPlanMode)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  ecoPlanMode ? "bg-purple-500 text-black" : "bg-white/10 text-white/60"
                }`}
              >
                Eco-Plan
              </button>


              {/* SEND */}
              <button
                onClick={sendMessage}
                className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400"
              >
                Send
              </button>
            </div>
          </div>

              {/* Burst Demo Button */}
              <button
                onClick={async () => {
                  // Reset burst window so demo always starts clean
                  await fetch("http://127.0.0.1:8000/burst/reset?user_id=demo-user", {
                    method: "POST"
                  });
                  const demoPrompts = [
                    "What is machine learning?",
                    "How does gradient descent work?",
                    "Explain neural network layers",
                    "What is backpropagation?",
                    "Compare supervised vs unsupervised learning",
                    "What is overfitting in ML models?",
                  ];

                  for (let i = 0; i < demoPrompts.length; i++) {
                    const prompt = demoPrompts[i];

                    // Show user message in chat immediately
                    setMessages(prev => [...prev, { role: "user", text: prompt }]);

                    // Realistic typing delay between sends (1.2s – 2.5s)
                    await new Promise(r => setTimeout(r, 1200 + Math.random() * 1300));


                    try {
                      const res = await fetch("http://127.0.0.1:8000/ask", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ prompt, user_id: "demo-user" })
                      });
                      const parsed = await res.json();

                      // Add assistant response to chat
                      setMessages(prev => [...prev, {
                        role: "assistant",
                        text: parsed.response,
                        model: parsed.modelUsed,
                        cached: parsed.cached || false,
                        carbon: parsed.carbon || null,
                      }]);

                      setModelUsed(parsed.modelUsed);
                      setCarbonData(parsed.carbon || null);

                      // Check for burst
                      if (parsed.burst?.burst && parsed.burst?.swap_suggestion) {
                        setBurstAlert({
                          message: parsed.burst.swap_suggestion,
                          calls: parsed.burst.calls_in_window,
                          score: parsed.burst.burst_score,
                        });
                        setTimeout(() => setBurstAlert(null), 12000);
                        break;
                      }

                    } catch (err) {
                      console.error("Demo query failed:", err);
                    }
                    // Small gap between sends — just enough to feel human, 
                    // API response time (3-4s) provides the main pacing
                    await new Promise(r => setTimeout(r, 300));
                  }
                }}
                className="px-3 py-2 bg-purple-500/20 text-purple-400 text-xs rounded-lg hover:bg-purple-500/30 transition"
                title="Demo: simulates a burst of AI queries at realistic speed"
              >
                Burst Test Demo
              </button>

          <PromptSuggestor
            coach={coachData}
            onClose={() => {
              setCoachData(null);
              setSuggestMode(false);
            }}
          />

        </main>

          {ecoPlanMode && (
  <EcoPlanPanel loading={planLoading} steps={visibleSteps} />
)}




      </div>

    </div>
  );
}
