export default function EcoPlanPanel({ loading, steps }) {
  return (
    <div className="w-full animate-fade-in">
      <div className="text-xs uppercase tracking-wide text-purple-400 mb-2">
        Eco-Execution Plan
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-white/60">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
          Generating plan…
        </div>
      )}

      <div className="space-y-3 mt-3">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm animate-slideIn"
          >
            <span className="text-purple-400 font-semibold mr-2">
              Step {idx + 1}
            </span>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

