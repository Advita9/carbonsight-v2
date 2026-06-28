import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

export default function CarbonTrendChart({ data }) {
  return (
    <Line
      data={{
        labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        datasets: [
          {
            label: "kg CO₂",
            data,
            borderWidth: 2
          }
        ]
      }}
      options={{
        responsive: true,
        plugins: { legend: { display: false } }
      }}
    />
  );
}
