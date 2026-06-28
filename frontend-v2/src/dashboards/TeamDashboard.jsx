import { useEffect, useState } from "react";
import CarbonTrendChart from "../charts/CarbonTrendChart";
import ModelUsagePie from "../charts/ModelUsagePie";
import EfficiencyGauge from "../charts/EfficiencyGauge";

const API = "http://127.0.0.1:8000";

function fmt(n) {
  if (!n || n === 0) return "0";
  if (n < 0.000001) return (n * 1e9).toFixed(2) + " ng";
  if (n < 0.001)    return (n * 1e6).toFixed(2) + " µg";
  if (n < 1)        return (n * 1000).toFixed(4) + " mg";
  return n.toFixed(4) + " kg";
}

export default function TeamDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch(`${API}/analytics`)
      .then(r => r.json())
      .then(data => { setAnalytics(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#0E0F10] flex items-center justify-center text-white/40">
      Loading…
    </div>
  );

  const trendData   = analytics?.daily_trend.map(d => d.co2_saved) ?? [];
  const trendLabels = analytics?.daily_trend.map(d =>
    new Date(d.day).toLocaleDateString("en-US", { weekday: "short" })
  ) ?? [];

  const tierData = analytics
    ? Object.fromEntries(
        Object.entries(analytics.tier_distribution).map(([k, v]) => [
          k === "cache" ? "Cache Hit" : k.charAt(0).toUpperCase() + k.slice(1), v
        ])
      )
    : {};

  const greenRequests =
    (analytics?.tier_distribution["cache"] || 0) +
    (analytics?.tier_distribution["micro"] || 0);
  const efficiencyScore = analytics?.total_requests > 0
    ? Math.round((greenRequests / analytics.total_requests) * 100)
    : 0;

  // Placeholder leaderboard — will be real once org_id is in schema
  const leaderboard = [
    { team: "Your Team", saved: analytics?.total_saved_kg ?? 0, score: efficiencyScore },
    { team: "Team Beta",  saved: 0.0000021, score: 61 },
    { team: "Team Gamma", saved: 0.0000009, score: 44 },
  ];

  return (
    <div className="min-h-screen bg-[#0E0F10] p-8 text-white space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Team Dashboard</h1>
        <a href="/" className="text-sm text-white/40 hover:text-white transition">← Back to chat</a>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">Total Requests</p>
          <p className="text-2xl font-bold">{analytics?.total_requests ?? "—"}</p>
        </div>
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">Cache Hit Rate</p>
          <p className="text-2xl font-bold text-green-400">{analytics?.cache_hit_rate ?? 0}%</p>
        </div>
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">CO₂ Saved</p>
          <p className="text-2xl font-bold text-green-400">{fmt(analytics?.total_saved_kg)}</p>
        </div>
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">Efficiency Score</p>
          <p className="text-2xl font-bold text-blue-400">{efficiencyScore}%</p>
        </div>
      </div>

      {/* Gauge + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EfficiencyGauge score={efficiencyScore} />
        <div className="bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl mb-4">Model Distribution</h2>
          <ModelUsagePie data={tierData} />
        </div>
      </div>

      {/* Trend */}
      <div className="bg-white/5 p-6 rounded-xl">
        <h2 className="text-xl mb-1">Daily CO₂ Savings Trend</h2>
        <p className="text-white/40 text-xs mb-4">Last {analytics?.daily_trend.length ?? 0} days</p>
        {trendData.length > 0 ? (
          <CarbonTrendChart data={trendData} labels={trendLabels} />
        ) : (
          <p className="text-white/40 text-sm">No trend data yet.</p>
        )}
      </div>

      {/* Leaderboard */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Team Leaderboard</h2>
          <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">
            Multi-team data available after org setup
          </span>
        </div>
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wide">
              <th className="pb-3">Rank</th>
              <th className="pb-3">Team</th>
              <th className="pb-3">CO₂ Saved</th>
              <th className="pb-3">Efficiency</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((row, i) => (
              <tr key={i} className={`border-t border-white/5 ${i === 0 ? "text-green-400" : ""}`}>
                <td className="py-2">{i + 1}</td>
                <td className="py-2 font-medium">{row.team}</td>
                <td className="py-2">{fmt(row.saved)}</td>
                <td className="py-2">{row.score}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}