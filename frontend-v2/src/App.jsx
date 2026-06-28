
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





  // Save chat history automatically
  useEffect(() => {
    saveHistory(messages);
  }, [messages]);

  
  const sendMessage = async () => {
  if (!input.trim()) return;

  let workingPrompt = input;
  let plan = null;

  /* 0️⃣ Clear suggest mode if active */
  if (suggestMode) {
    setCoachData(null);
    setSuggestMode(false);
  }

 

    /* ======================================
          2️⃣ OPTIMIZE MODE — call /optimize
      ====================================== */
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


  /* 1️⃣ ECO PLAN MODE */
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

      // ⏳ fake "thinking" delay
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
          3️⃣ Add USER message
      ====================================== */
    setMessages(prev => [...prev, { role: "user", text: input }]);

    /* ======================================
          4️⃣ Call /ask with plan (optional)
      ====================================== */
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/ask",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: workingPrompt,
            plan: ecoPlanMode ? plan : null   // only include plan when enabled
          }),
        }
      );

      const parsed = await res.json();

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

              // 2️⃣ Normal messages
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
