// import { Pie } from "react-chartjs-2";

// export default function ModelUsagePie({ usage }) {
//   return (
//     <div className="bg-white/5 p-6 rounded-xl">
//       <h2 className="text-xl mb-4">Model Usage Breakdown</h2>
//       <Pie
//         data={{
//           labels: Object.keys(usage),
//           datasets: [
//             {
//               data: Object.values(usage)
//             }
//           ]
//         }}
//       />
//     </div>
//   );
// }
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function ModelUsagePie({ data }) {
  if (!data) return <div className="text-white/40">No data</div>;

  const formatted = Object.keys(data).map((key) => ({
    name: key,
    value: data[key],
  }));

  const COLORS = ["#22C55E", "#3B82F6", "#F97316"];

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={formatted}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            fill="#8884d8"
            label
          >
            {formatted.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
