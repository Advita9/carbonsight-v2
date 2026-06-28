import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

export default function CarbonTrendChart({ data, labels }) {
  const defaultLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  return (
    <Line
      data={{
        labels: labels ?? defaultLabels,
        datasets: [{
          label: "CO₂ Saved",
          data,
          borderColor: "#22C55E",
          backgroundColor: "rgba(34,197,94,0.08)",
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
              label: ctx => {
                const v = ctx.raw;
                if (v < 0.000001) return `${(v * 1e9).toFixed(2)} ng CO₂`;
                if (v < 0.001)    return `${(v * 1e6).toFixed(2)} µg CO₂`;
                return `${(v * 1000).toFixed(4)} mg CO₂`;
              }
            }
          }
        },
        scales: {
          y: {
            ticks: {
              color: "rgba(255,255,255,0.4)",
              callback: v => {
                if (v < 0.000001) return (v * 1e9).toFixed(1) + " ng";
                if (v < 0.001)    return (v * 1e6).toFixed(1) + " µg";
                return (v * 1000).toFixed(2) + " mg";
              }
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