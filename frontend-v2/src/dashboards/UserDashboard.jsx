import { useEffect, useState } from "react";
import { mockUserStats } from "../mock/mockUserStats";
import EfficiencyGauge from "../charts/EfficiencyGauge";
import CarbonTrendChart from "../charts/CarbonTrendChart";
import ModelUsagePie from "../charts/ModelUsagePie";

export default function UserDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // later → fetch("/users/me", { headers: { Authorization } })
    setStats(mockUserStats);
  }, []);

  if (!stats) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-8 text-white space-y-10">

      <h1 className="text-3xl font-semibold">Your Efficiency Dashboard</h1>

      {/* Score + Pie chart section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <EfficiencyGauge score={stats.efficiency_score} />
        <ModelUsagePie usage={stats.model_usage} />
      </div>

      {/* Carbon Trend Line */}
      <div className="bg-white/5 p-6 rounded-xl">
        <h2 className="text-xl mb-4">Your Carbon Trend (Last 7 days)</h2>
        <CarbonTrendChart data={stats.carbon_trend} />
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl mb-3">Badges Earned</h2>
        <div className="flex gap-4">
          {stats.badges.map((b,i) => (
            <div key={i} className=" bg-green-600/20 border border-green-400 px-4 py-2 rounded-lg">
              {b}
            </div>
          ))}
        </div>
      </div>

      {/* Prompt History */}
      <div>
        <h2 className="text-xl mb-3">Your Recent Prompts</h2>
        <div className="space-y-4">
          {stats.history.map((h,i) => (
            <div key={i} className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-white/70">{h.prompt}</p>
              <p className="text-xs text-white/40">
                Used: {h.used} kWh | Saved: {h.saved} kWh | Model: {h.model}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
