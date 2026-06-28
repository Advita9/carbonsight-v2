import React from "react";

export default function CarbonForecastPanel({ forecast }) {
  if (!forecast) return null;

  return (
    <div className="
      fixed right-6 top-20 w-72 bg-[#1A1C1E] border border-white/10 
      rounded-xl shadow-xl p-4 text-sm animate-slideIn
    ">
      <h2 className="text-lg font-semibold mb-2 text-green-400">
        📈 Carbon Forecast
      </h2>

      <div className="space-y-1">
        <p>Avg per prompt: <b>{forecast.avg_kwh.toFixed(6)} kWh</b></p>
        <p>Avg CO₂: <b>{forecast.avg_co2.toFixed(6)} kg</b></p>
        <p>Prompts/day: <b>{forecast.prompts_per_day.toFixed(2)}</b></p>

        <hr className="border-white/10 my-2" />

        <p className="text-green-300">
          7-day energy forecast:<br />
          <b>{forecast.forecast_kwh.toFixed(6)} kWh</b>
        </p>

        <p className="text-green-300">
          7-day CO₂ forecast:<br />
          <b>{forecast.forecast_co2.toFixed(6)} kg</b>
        </p>
      </div>
    </div>
  );
}
