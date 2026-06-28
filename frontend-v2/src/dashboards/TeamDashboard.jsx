import { useEffect, useState } from "react";
import CarbonTrendChart from "../charts/CarbonTrendChart";
import ModelUsagePie from "../charts/ModelUsagePie";
import EfficiencyGauge from "../charts/EfficiencyGauge";

export default function TeamDashboard() {
  const [teamStats, setTeamStats] = useState(null);

  useEffect(() => {
    // Mock data for now
    setTeamStats({
      team_name: "Green Innovators",
      weekly_co2_saved: 4.52,
      benchmark_percentile: 78,
      avg_latency_ms: 620,
      avg_energy_kwh: 0.0032,
      model_usage: {
        micro: 62,
        lite: 30,
        pro: 8
      },
      leaderboard_efficiency: [
        { team: "Green Innovators", score: 92 },
        { team: "Eco Warriors", score: 89 },
        { team: "Carbon Savers", score: 85 }
      ],
      leaderboard_savings: [
        { team: "Green Innovators", saved: 4.52 },
        { team: "Eco Warriors", saved: 3.91 },
        { team: "Carbon Savers", saved: 3.22 }
      ],
      trend_daily_savings: [
        { day: "Mon", saved: 0.4 },
        { day: "Tue", saved: 0.55 },
        { day: "Wed", saved: 0.68 },
        { day: "Thu", saved: 0.74 },
        { day: "Fri", saved: 0.92 },
        { day: "Sat", saved: 0.81 },
        { day: "Sun", saved: 0.42 }
      ]
    });
  }, []);

  if (!teamStats) return <div className="p-10 text-white">Loading…</div>;

  return (
    <div className="p-10 text-white space-y-10">

      {/* HEADER */}
      <h1 className="text-3xl font-bold">{teamStats.team_name} — Team Dashboard</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A1C1E] p-6 rounded-xl">
          <p className="text-sm text-white/60">CO₂ Saved This Week</p>
          <h2 className="text-3xl font-semibold">{teamStats.weekly_co2_saved} kg</h2>
        </div>

        <div className="bg-[#1A1C1E] p-6 rounded-xl">
          <p className="text-sm text-white/60">Benchmark Percentile</p>
          <h2 className="text-3xl font-semibold">{teamStats.benchmark_percentile}%</h2>
        </div>

        <div className="bg-[#1A1C1E] p-6 rounded-xl">
          <p className="text-sm text-white/60">Avg Latency</p>
          <h2 className="text-3xl font-semibold">{teamStats.avg_latency_ms} ms</h2>
        </div>
      </div>

      {/* Efficiency Gauge */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Team Efficiency Score</h3>
        <EfficiencyGauge score={teamStats.benchmark_percentile} />
      </div>

      {/* Model Usage Pie */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Model Usage Distribution</h3>
        <ModelUsagePie data={teamStats.model_usage} />
      </div>

      {/* Trendline */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Daily CO₂ Savings Trend</h3>
        <CarbonTrendChart data={teamStats.trend_daily_savings} />
      </div>

      {/* Leaderboard A */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Model Efficiency Leaderboard</h3>

        <table className="w-full text-left text-white/80">
          <thead>
            <tr className="text-white/50 text-sm">
              <th>Team</th>
              <th>Efficiency Score</th>
            </tr>
          </thead>
          <tbody>
            {teamStats.leaderboard_efficiency.map((row, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-2">{row.team}</td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leaderboard B */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Carbon Savings Leaderboard</h3>

        <table className="w-full text-left text-white/80">
          <thead>
            <tr className="text-white/50 text-sm">
              <th>Team</th>
              <th>CO₂ Saved (kg)</th>
            </tr>
          </thead>
          <tbody>
            {teamStats.leaderboard_savings.map((row, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-2">{row.team}</td>
                <td>{row.saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
