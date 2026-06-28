export default function EfficiencyGauge({ score }) {
  return (
    <div className="bg-white/5 p-6 rounded-xl">
      <h2 className="text-xl mb-4">Efficiency Score</h2>

      <div className="text-5xl font-bold text-green-400">
        {score}%
      </div>

      <p className="text-white/40 mt-2 text-sm">
        Based on carbon saved vs used over last week.
      </p>
    </div>
  );
}
