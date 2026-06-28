// src/components/OptimizedChip.jsx

export default function OptimizedChip({ optimized, savings_kwh, savings_co2 }) {
  const kwh = Number(savings_kwh ?? 0);
  const co2 = Number(savings_co2 ?? 0);
  return (
    <div
      className="animate-slideFadeIn max-w-2xl rounded-xl border border-green-500/40 
                 bg-green-500/5 px-5 py-4 shadow-lg shadow-green-500/10 
                 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-green-400 text-sm font-semibold">
          Optimized Prompt
        </span>
        <span className="text-green-400 animate-pulse">⚡</span>
      </div>

      {/* Optimized Text */}
      <p className="mt-3 text-[15px] text-green-100 italic leading-relaxed 
                    border-l-2 border-green-500/40 pl-3">
        "{optimized}"
      </p>

      

      {/* Savings Row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-green-300">
        <div className="flex items-center gap-1">
          <span className="font-semibold">Saved:</span>
          <span className="text-green-200">{kwh.toFixed(6)} kWh</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-semibold">•</span>
          <span className="text-green-200">{co2.toFixed(6)} kg CO₂</span>
        </div>
      </div>
    </div>
  );
}




