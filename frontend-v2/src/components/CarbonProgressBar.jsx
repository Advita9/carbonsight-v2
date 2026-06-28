export default function CarbonProgressBar({ used = 0, saved = 0 }) {
  const total = used + saved;
  const percentSaved = total > 0 ? (saved / total) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-white/60">
        <span>Energy Used</span>
        <span>Energy Saved</span>
      </div>

      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-500 transition-all"
          style={{ width: `${percentSaved}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-red-400">{used.toFixed(6)} kWh</span>
        <span className="text-green-400">{saved.toFixed(6)} kWh</span>
      </div>
    </div>
  );
}
