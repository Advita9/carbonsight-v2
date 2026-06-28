import React from "react";

// export default function PromptSuggestor({ coach, onClose }) {
//   if (!coach) return null;

//   return (
//     <div className="mt-3 w-full max-w-3xl mx-auto animate-fade-in">
//       <div className="p-4 rounded-2xl bg-[#1C1E21] border border-white/10 shadow-lg relative">
        
//         {/* Close button */}
//         <button
//           className="absolute top-2 right-2 text-white/40 hover:text-white"
//           onClick={onClose}
//         >
//           ✕
//         </button>

//         <h3 className="text-sm font-semibold text-green-400 mb-2">
//           🔍 Suggestion for your prompt
//         </h3>

//         <div className="space-y-2 text-xs text-white/70">
//           <p><strong>Clarity:</strong> {coach.clarity}/100</p>
//           <p><strong>Redundancy:</strong> {coach.redundancy}</p>
//           <p><strong>Tip:</strong> {coach.advice}</p>
//           <p><strong>Estimated Energy:</strong> {coach.estimated_energy_kwh.toFixed(7)} kWh</p>
//         </div>
//       </div>
//     </div>
//   );
// }
// export default function PromptSuggestor({ coach, onClose }) {
//   if (!coach) return null;

//   const suggestion = coach.suggestion || coach.optimized || null;
//   const kwh = coach.energy_savings_kwh ?? 0;
//   const co2 = coach.co2_savings_kg ?? 0;

//   return (
//     <div className="fixed bottom-24 right-8 bg-[#1A1C1E] border border-white/10 p-4 rounded-xl shadow-lg w-80 animate-slideUp">
//       <div className="text-sm text-white/80 mb-3">
//         <strong className="text-green-400">Prompt Coach Suggestion</strong>
//       </div>

//       <div className="text-xs text-white/70 mb-3">
//         {suggestion || "No suggestion available."}
//       </div>

//       <div className="text-xs text-green-400 mb-3">
//         Estimated savings: {kwh.toFixed(4)} kWh • {co2.toFixed(4)} kg CO₂
//       </div>

//       <button
//         onClick={onClose}
//         className="mt-2 px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20 transition"
//       >
//         Close
//       </button>
//     </div>
//   );
// }
export default function PromptSuggestor({ coach, onClose }) {
  if (!coach) return null;

  return (
    <div className="fixed bottom-24 right-8 bg-[#1A1C1E] border border-white/10 p-4 rounded-xl shadow-lg w-80 animate-slideUp">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <strong className="text-green-400 text-sm">
          🔍 Prompt Coach Suggestion
        </strong>

        <button
          className="text-white/40 hover:text-white text-sm"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Suggestion details */}
      <div className="space-y-2 text-xs text-white/70 mb-3">
        <p><strong>Clarity Score:</strong> {coach.clarity}/100</p>
        <p><strong>Redundancy:</strong> {coach.redundancy}</p>
        <p><strong>Tip:</strong> {coach.advice}</p>
      </div>

      {/* Energy Estimate */}
      <div className="text-xs text-green-400">
        Estimated Energy Use: {coach.estimated_energy_kwh?.toFixed(7)} kWh
      </div>

    </div>
  );
}
