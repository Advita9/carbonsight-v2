export default function CarbonTooltip({ data }) {
  const carbon = data?.carbon;

  if (!carbon) {
    // Show cached tooltip anyway
    return (
      <div className="bg-[#1A1C1E] text-white p-3 rounded-lg shadow-xl text-xs border border-white/10 w-64">
        <p><strong>Model:</strong> {data.model || "Unknown"}</p>
        <p className="text-green-400 mt-1">Served from cache ✓</p>
        <p className="text-white/50">(No energy used)</p>
      </div>
    );
  }

  const used = carbon.actual_kwh ?? 0;
  const saved = Math.max((carbon.predicted_kwh ?? 0) - used, 0);

  const co2_used = carbon.actual_co2 ?? 0;
  const co2_saved = Math.max((carbon.predicted_co2 ?? 0) - co2_used, 0);

  const savedWh = saved * 1000;
  const savedMg = co2_saved * 1_000_000;

  return (
    <div className="bg-[#1A1C1E] text-white p-3 rounded-lg shadow-xl text-xs border border-white/10 w-64">
      <p><strong>Model:</strong> {data.model || "Unknown"}</p>

      {/* <p><strong>Energy Used:</strong> {used.toFixed(6)} kWh</p>
      <p><strong>Energy Saved:</strong> {saved.toFixed(6)} kWh</p>

      <p><strong>CO₂ Used:</strong> {co2_used.toFixed(6)} kg</p>
      <p><strong>CO₂ Saved:</strong> {co2_saved.toFixed(6)} kg</p> */}

      <p>
        <strong>Energy Used:</strong>{" "}
        {used < 0.000001
          ? used.toExponential(3)
          : used.toFixed(6)} kWh
      </p>

      <p>
        <strong>Energy Saved:</strong>{" "}
        {savedWh < 0.000001
          ? savedWh.toExponential(3)
          : savedWh.toFixed(6)} kWh
      </p>

      <p>
        <strong>CO₂ Used:</strong>{" "}
        {co2_used < 0.000001
          ? co2_used.toExponential(3)
          : co2_used.toFixed(6)} kg
      </p>

      <p>
        <strong>CO₂ Saved:</strong>{" "}
        {savedMg < 0.000001
          ? savedMg.toExponential(3)
          : savedMg.toFixed(6)} mg
      </p>

      {data.cached && (
        <p className="text-green-400 mt-1">Served from cache ✓</p>
      )}
    </div>
  );
}
