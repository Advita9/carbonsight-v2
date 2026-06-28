// src/components/CarbonMeter.jsx
import React from "react";

export default function CarbonMeter({ carbon, model }) {
  if (!carbon) {
    return (
        <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
        <span className="text-xs text-green-400">Cached response</span>
        </div>
    );
    }


  const used = carbon.actual_kwh?.toFixed(6);
  const saved = (carbon.predicted_kwh - carbon.actual_kwh).toFixed(6);
  const ratio = carbon.actual_kwh / carbon.predicted_kwh;

  // Bubble color logic
  const bubbleColor =
    model?.includes("micro") || carbon.cached
      ? "bg-green-500"
      : model?.includes("lite")
      ? "bg-yellow-400"
      : "bg-red-500";

  return (
    <div className="flex flex-col items-end text-right">
      {/* Bubble + Text */}
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${bubbleColor} animate-pulse`}></div>
        <span className="text-xs text-white/70">
          Used: {used} kWh | Saved: {saved} kWh
        </span>
      </div>

      {/* Bar Meter */}
      <div className="w-40 h-2 bg-white/10 rounded-full mt-1 overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${Math.min(ratio * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}
