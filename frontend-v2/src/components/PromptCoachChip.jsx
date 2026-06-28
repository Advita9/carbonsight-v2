// src/components/PromptCoachChip.jsx
import React from "react";

export default function PromptCoachChip({ coach }) {
  if (!coach) return null;

  return (
    <div className="mt-2 p-3 rounded-xl bg-[#1F2124] border border-white/10 text-xs animate-fade-in shadow-md">
      <div className="flex items-center gap-3 mb-1 text-white/80">

        <span className="px-2 py-1 bg-white/10 rounded-lg">
          🔍 Clarity: {coach.clarity}/100
        </span>

        <span className="px-2 py-1 bg-white/10 rounded-lg">
          ♻️ Redundancy: {coach.redundancy}
        </span>

        <span className="px-2 py-1 bg-white/10 rounded-lg">
          ⚡ {coach.estimated_energy_kwh.toFixed(7)} kWh
        </span>

      </div>

      <div className="text-green-400 italic">
        💡 {coach.advice}
      </div>
    </div>
  );
}
