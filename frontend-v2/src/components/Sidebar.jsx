// // src/components/Sidebar.jsx
// import CarbonProgressBar from "./CarbonProgressBar";

// export default function Sidebar({ history }) {
//   const modelCounts = {};
//   let totalCO2Saved = 0;
//   let cachedCount = 0;

//   // Compute total energy used + saved
//   const totalEnergyUsed = history
//     .filter((m) => m.carbon)
//     .reduce((sum, m) => sum + (m.carbon.used || 0), 0);

//   const totalEnergySaved = history
//     .filter((m) => m.carbon)
//     .reduce((sum, m) => sum + (m.carbon.saved || 0), 0);

//   // Compute model usage, cache hits, and CO₂ saved
//   history.forEach((msg) => {
//     if (msg.role === "assistant") {
//       // Model usage
//       if (msg.model) {
//         modelCounts[msg.model] = (modelCounts[msg.model] || 0) + 1;
//       }

//       // Cache hits
//       if (msg.cached) cachedCount++;

//       // CO₂ saved calculation
//       if (msg.carbon?.predicted_kwh && msg.carbon?.actual_kwh) {
//         const predicted = msg.carbon.predicted_kwh;
//         const actual = msg.carbon.actual_kwh;
//         const savedKwh = Math.max(predicted - actual, 0);

//         // Convert kWh to CO₂ (kg)
//         totalCO2Saved += savedKwh * 0.475;
//       }
//     }
//   });

//   return (
//     <aside className="w-64 border-r border-white/10 p-5 hidden md:flex flex-col bg-[#0E0F10]">

//       {/* HEADER */}
//       <h2 className="text-xl font-semibold mb-4 text-white">History</h2>

//       {/* CHAT HISTORY LIST */}
//       <div className="flex-1 overflow-y-auto space-y-3 pr-2">
//         {history.map((msg, i) =>
//           msg.role === "user" ? (
//             <div
//               key={i}
//               className="text-white/70 text-sm truncate hover:text-white cursor-pointer transition"
//             >
//               • {msg.text.slice(0, 40)}...
//             </div>
//           ) : null
//         )}
//       </div>

//       {/* FOOTER STATS */}
//       <div className="mt-6 space-y-4 border-t border-white/10 pt-4">

//         {/* MODEL USAGE */}
//         <div>
//           <h3 className="text-white/80 font-semibold text-sm mb-1">Model Usage</h3>
//           {Object.keys(modelCounts).length === 0 && (
//             <p className="text-white/40 text-xs">No model calls yet</p>
//           )}

//           {Object.keys(modelCounts).map((m) => (
//             <p key={m} className="text-white/60 text-xs">
//               {m}: <span className="text-white">{modelCounts[m]}</span>
//             </p>
//           ))}
//         </div>

//         {/* CACHED RESPONSES */}
//         <div>
//           <h3 className="text-white/80 font-semibold text-sm mb-1">Cache Hits</h3>
//           <p className="text-white/60 text-xs">{cachedCount} responses served from cache</p>
//         </div>

//         {/* CO₂ SAVED */}
//         <div>
//           <h3 className="text-white/80 font-semibold text-sm mb-1">CO₂ Saved</h3>
//           <p className="text-green-400 font-medium text-sm">
//             {totalCO2Saved.toFixed(6)} kg
//           </p>
//         </div>

//         {/* ENERGY BREAKDOWN BAR */}
//         <div className="mt-6">
//           <h2 className="font-semibold text-lg">Energy Breakdown</h2>
//           <CarbonProgressBar used={totalEnergyUsed} saved={totalEnergySaved} />
//         </div>

//       </div>
//     </aside>
//   );
// }


// src/components/Sidebar.jsx
import CarbonProgressBar from "./CarbonProgressBar";
import { useMemo } from "react";

export default function Sidebar({ history }) {

  // 🔥 Compute stats dynamically based on history
  const {
  modelCounts,
  cachedCount,
  totalCO2Saved,
  totalEnergyUsed,
  totalEnergySaved
} = useMemo(() => {

  let modelCounts = {};
  let cachedCount = 0;
  let totalCO2Saved = 0;
  let totalEnergyUsed = 0;
  let totalEnergySaved = 0;

  // Helper: find original non-cached message for cache hits
  const findOriginal = (cachedMsg) =>
    history.find(m =>
      m.role === "assistant" &&
      !m.cached &&
      m.model === cachedMsg.model &&
      m.text === cachedMsg.text // matching predicted response
    );

  history.forEach(msg => {
    if (msg.role !== "assistant") return;

    // Count model usage
    if (msg.model) {
      modelCounts[msg.model] = (modelCounts[msg.model] || 0) + 1;
    }

    if (msg.cached) {
      cachedCount++;

      // 🔥 Cached = add entire original actual_kwh as saved energy
      const original = findOriginal(msg);
      if (original?.carbon?.actual_kwh != null) {
        const savedKwh = original.carbon.actual_kwh;
        totalEnergySaved += savedKwh;

        // CO₂ conversion
        totalCO2Saved += savedKwh * 0.475;
      }
      return; // skip remaining logic for cached
    }

    // Normal uncached inference
    if (msg.carbon) {
      const { predicted_kwh, actual_kwh } = msg.carbon;

      if (actual_kwh != null) totalEnergyUsed += actual_kwh;
      if (predicted_kwh != null && actual_kwh != null) {
        totalEnergySaved += Math.max(predicted_kwh - actual_kwh, 0);
        totalCO2Saved += Math.max(predicted_kwh - actual_kwh, 0) * 0.475;
      }
    }
  });

  return {
    modelCounts,
    cachedCount,
    totalCO2Saved,
    totalEnergyUsed,
    totalEnergySaved
  };
}, [history]);
 // Recalculates every time messages change

  return (
    <aside className="w-64 border-r border-white/10 p-5 hidden md:flex flex-col bg-[#0E0F10]">

      <h2 className="text-xl font-semibold mb-4 text-white">History</h2>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {history.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="text-white/70 text-sm truncate hover:text-white cursor-pointer transition">
              • {msg.text.slice(0, 40)}...
            </div>
          ) : null
        )}
      </div>

      <div className="mt-6 space-y-4 border-t border-white/10 pt-4">

        {/* Model Usage */}
        <div>
          <h3 className="text-white/80 font-semibold text-sm mb-1">Model Usage</h3>
          {Object.keys(modelCounts).length === 0 && (
            <p className="text-white/40 text-xs">No model calls yet</p>
          )}
          {Object.keys(modelCounts).map(model => (
            <p key={model} className="text-white/60 text-xs">
              {model}: <span className="text-white">{modelCounts[model]}</span>
            </p>
          ))}
        </div>

        {/* Cache Hits */}
        <div>
          <h3 className="text-white/80 font-semibold text-sm mb-1">Cache Hits</h3>
          <p className="text-white/60 text-xs">{cachedCount} responses served from cache</p>
        </div>

        {/* CO₂ Saved */}
        <div>
          <h3 className="text-white/80 font-semibold text-sm mb-1">CO₂ Saved</h3>
          <p className="text-green-400 font-medium text-sm">
            {totalCO2Saved.toFixed(6)} kg
          </p>
        </div>

        {/* Energy Breakdown */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg">Energy Breakdown</h2>
          <CarbonProgressBar
            used={totalEnergyUsed}
            saved={totalEnergySaved}
          />
        </div>

      </div>
    </aside>
  );
}
