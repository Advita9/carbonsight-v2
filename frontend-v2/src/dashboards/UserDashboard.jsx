import { useEffect, useState } from "react";
import EfficiencyGauge from "../charts/EfficiencyGauge";
import CarbonTrendChart from "../charts/CarbonTrendChart";
import ModelUsagePie from "../charts/ModelUsagePie";

const API = "http://127.0.0.1:8000";

function fmt(n) {
  if (!n || n === 0) return "0";
  if (n < 0.000001) return (n * 1e9).toFixed(2) + " ng";
  if (n < 0.001)    return (n * 1e6).toFixed(2) + " µg";
  if (n < 1)        return (n * 1000).toFixed(4) + " mg";
  return n.toFixed(4) + " kg";
}

export default function UserDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch(`${API}/analytics`)
      .then(r => r.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#0E0F10] flex items-center justify-center text-white/40">
      Loading analytics…
    </div>
  );

  if (error) return (
    <div className="h-screen bg-[#0E0F10] flex items-center justify-center text-red-400">
      Failed to load: {error}
    </div>
  );

  // --- shape transformations ---

  // CarbonTrendChart expects a plain number array
  // daily_trend is [{day, co2_saved, co2_used, requests, cache_hits}]
  const trendData = stats.daily_trend.map(d => d.co2_saved);
  // labels to match
  const trendLabels = stats.daily_trend.map(d =>
    new Date(d.day).toLocaleDateString("en-US", { weekday: "short" })
  );

  // ModelUsagePie expects {key: count} — tier_distribution already is this
  // but we rename "cache" to "Cache Hit" for readability
  const tierData = Object.fromEntries(
    Object.entries(stats.tier_distribution).map(([k, v]) => [
      k === "cache" ? "Cache Hit" : k.charAt(0).toUpperCase() + k.slice(1),
      v
    ])
  );

  // Efficiency score = % of requests that were cache hits or micro
  const greenRequests =
    (stats.tier_distribution["cache"] || 0) +
    (stats.tier_distribution["micro"] || 0);
  const efficiencyScore = stats.total_requests > 0
    ? Math.round((greenRequests / stats.total_requests) * 100)
    : 0;

  // Badges based on real data
  const badges = [];
  if (stats.cache_hit_rate >= 50) badges.push("Cache Champion 🏆");
  if (stats.cache_hit_rate >= 80) badges.push("Cache Master 🌟");
  if ((stats.tier_distribution["pro"] || 0) === 0) badges.push("Pro-Free Run ✅");
  if (efficiencyScore >= 70) badges.push("Efficient Prompting Lv1 🌿");
  if (stats.total_saved_kg > 0) badges.push("Carbon Saver 🌍");

  return (
    <div className="min-h-screen bg-[#0E0F10] p-8 text-white space-y-8">

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Your Efficiency Dashboard</h1>
        <a href="/" className="text-sm text-white/40 hover:text-white transition">
          ← Back to chat
        </a>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">Total Requests</p>
          <p className="text-2xl font-bold">{stats.total_requests}</p>
        </div>
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">Cache Hit Rate</p>
          <p className="text-2xl font-bold text-green-400">{stats.cache_hit_rate}%</p>
        </div>
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">CO₂ Used</p>
          <p className="text-2xl font-bold text-orange-400">{fmt(stats.total_co2_kg)}</p>
        </div>
        <div className="bg-[#1A1C1E] p-5 rounded-xl">
          <p className="text-xs text-white/50 mb-1">CO₂ Saved</p>
          <p className="text-2xl font-bold text-green-400">{fmt(stats.total_saved_kg)}</p>
        </div>
      </div>

      {/* Gauge + Pie */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EfficiencyGauge score={efficiencyScore} />
        <div className="bg-white/5 p-6 rounded-xl">
          <h2 className="text-xl mb-4">Model Usage Distribution</h2>
          <ModelUsagePie data={tierData} />
        </div>
      </div>

      {/* Trend chart */}
      <div className="bg-white/5 p-6 rounded-xl">
        <h2 className="text-xl mb-4">CO₂ Saved — Last {stats.daily_trend.length} Days</h2>
        {trendData.length > 0 ? (
          <CarbonTrendChart data={trendData} labels={trendLabels} />
        ) : (
          <p className="text-white/40 text-sm">No trend data yet — keep chatting.</p>
        )}
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl mb-3">Badges Earned</h2>
        {badges.length === 0 ? (
          <p className="text-white/40 text-sm">No badges yet — start chatting to earn them.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {badges.map((b, i) => (
              <div key={i} className="bg-green-600/20 border border-green-400/40 px-4 py-2 rounded-lg text-sm">
                {b}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier breakdown table */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h2 className="text-xl mb-4">Request Breakdown</h2>
        <table className="w-full text-left text-sm text-white/80">
          <thead>
            <tr className="text-white/40 text-xs uppercase tracking-wide">
              <th className="pb-3">Tier</th>
              <th className="pb-3">Requests</th>
              <th className="pb-3">% of Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats.tier_distribution).map(([tier, count]) => (
              <tr key={tier} className="border-t border-white/5">
                <td className="py-2 capitalize">{tier}</td>
                <td className="py-2">{count}</td>
                <td className="py-2 text-white/50">
                  {stats.total_requests > 0
                    ? ((count / stats.total_requests) * 100).toFixed(1)
                    : 0}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

// Extended chart component that accepts custom labels
// (your existing CarbonTrendChart has hardcoded Mon-Sun labels)
function CarbonTrendChartLabelled({ data, labels }) {
  const { Line } = require("react-chartjs-2");
  return (
    <Line
      data={{
        labels,
        datasets: [{
          label: "CO₂ Saved (kg)",
          data,
          borderColor: "#22C55E",
          backgroundColor: "rgba(34,197,94,0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#22C55E",
        }]
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${(ctx.raw * 1e6).toFixed(2)} µg CO₂`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: "rgba(255,255,255,0.4)",
              callback: v => (v * 1e6).toFixed(1) + " µg"
            },
            grid: { color: "rgba(255,255,255,0.05)" }
          },
          x: {
            ticks: { color: "rgba(255,255,255,0.4)" },
            grid: { color: "rgba(255,255,255,0.05)" }
          }
        }
      }}
    />
  );
}
