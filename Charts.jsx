import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BidStatsChart({ data }) {
  const chartData = {
    labels: ["Estimates", "Contracts", "Signed"],
    datasets: [
      {
        label: "Bids Overview",
        data: [data.estimates_sent, data.contracts_sent, data.contracts_signed],
        backgroundColor: ["#34d399", "#fbbf24", "#a78bfa"],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return <Bar data={chartData} options={options} />;
}