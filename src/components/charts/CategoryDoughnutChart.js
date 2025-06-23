// components/charts/CategoryDoughnutChart.jsx
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function CategoryDoughnutChart({ data }) {
  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.value), // Assuming 'value' is percentage or count
        backgroundColor: [
          'rgb(59, 130, 246)', // blue-500
          'rgb(34, 197, 94)',  // green-500
          'rgb(168, 85, 247)', // purple-500
          'rgb(234, 179, 8)',  // yellow-500
          'rgb(239, 68, 68)',  // red-500
        ],
        hoverOffset: 4,
        borderWidth: 0, // No border for segments
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Hide default legend as we display custom list
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += context.parsed + '%'; // Assuming data values are percentages
            }
            return label;
          }
        }
      }
    },
    cutout: '60%', // Creates the doughnut hole
  };

  // Calculate total for center text (if data represents values, not percentages)
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-800">
          ${(totalValue / 100 * 6200).toFixed(0)} {/* Example: If 6.2K is total sales, and data values are percentages. Adjust logic based on your data */}
        </span>
        <span className="text-xs text-gray-500">Total Value</span>
      </div>
    </div>
  );
}