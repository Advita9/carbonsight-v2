import { useEffect, useState } from "react";
import ModelUsagePie from "../charts/ModelUsagePie";

export default function AdminDashboard() {
  const [orgStats, setOrgStats] = useState(null);

  useEffect(() => {
    // mock data for now
    setOrgStats({
      total_teams: 12,
      total_users: 138,
      total_carbon_saved_kg: 42.8,
      top_teams: [
        { team: "Green Innovators", saved: 4.52 },
        { team: "Eco Warriors", saved: 3.91 },
        { team: "Carbon Savers", saved: 3.22 }
      ],
      top_users: [
        { user: "Advita", saved: 1.4 },
        { user: "Ravi", saved: 1.2 },
        { user: "Sam", saved: 0.9 }
      ],
      model_heatmap: {
        teams: ["Alpha", "Beta", "Gamma"],
        micro: [50, 70, 40],
        lite: [30, 20, 50],
        pro: [20, 10, 10]
      }
    });
  }, []);

  if (!orgStats) return <div className="p-10 text-white">Loading…</div>;

  return (
    <div className="p-10 text-white space-y-10">

      <h1 className="text-3xl font-bold">Admin Dashboard — Organization Overview</h1>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1A1C1E] p-6 rounded-xl">
          <p className="text-sm text-white/60">Total Teams</p>
          <h2 className="text-3xl font-semibold">{orgStats.total_teams}</h2>
        </div>
        <div className="bg-[#1A1C1E] p-6 rounded-xl">
          <p className="text-sm text-white/60">Total Users</p>
          <h2 className="text-3xl font-semibold">{orgStats.total_users}</h2>
        </div>
        <div className="bg-[#1A1C1E] p-6 rounded-xl">
          <p className="text-sm text-white/60">Total CO₂ Saved</p>
          <h2 className="text-3xl font-semibold">{orgStats.total_carbon_saved_kg} kg</h2>
        </div>
      </div>

      {/* Top Teams */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Top Carbon Saving Teams</h3>
        <table className="w-full text-left text-white/80">
          <thead>
            <tr className="text-white/50 text-sm">
              <th>Team</th>
              <th>CO₂ Saved (kg)</th>
            </tr>
          </thead>
          <tbody>
            {orgStats.top_teams.map((row, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-2">{row.team}</td>
                <td>{row.saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Users */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Top Users</h3>
        <table className="w-full text-left text-white/80">
          <thead>
            <tr className="text-white/50 text-sm">
              <th>User</th>
              <th>CO₂ Saved (kg)</th>
            </tr>
          </thead>
          <tbody>
            {orgStats.top_users.map((row, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-2">{row.user}</td>
                <td>{row.saved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Heatmap */}
      <div className="bg-[#1A1C1E] p-6 rounded-xl">
        <h3 className="text-xl font-semibold mb-4">Model Usage Heatmap</h3>

        <table className="w-full text-left text-white/80">
          <thead>
            <tr className="text-white/50 text-sm">
              <th>Team</th>
              <th>Micro</th>
              <th>Lite</th>
              <th>Pro</th>
            </tr>
          </thead>
          <tbody>
            {orgStats.model_heatmap.teams.map((team, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-2">{team}</td>
                <td>{orgStats.model_heatmap.micro[i]}</td>
                <td>{orgStats.model_heatmap.lite[i]}</td>
                <td>{orgStats.model_heatmap.pro[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ESG Export */}
      <button className="bg-green-500 px-6 py-3 rounded-lg text-black font-semibold hover:bg-green-400">
        Export ESG Report (PDF/CSV)
      </button>

    </div>
  );
}
