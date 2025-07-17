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
  // Dummy data for demonstration if 'data' prop is not provided or empty
  const dummyData = [
    { name: 'Solar Panel Installation', value: 55 },
    { name: 'Battery Storage', value: 20 },
    { name: 'Maintenance & Repair', value: 15 },
    { name: 'EV Charger Integration', value: 10 },
  ];

  const chartData = {
    labels: (data && data.length > 0 ? data : dummyData).map(item => item.name),
    datasets: [
      {
        data: (data && data.length > 0 ? data : dummyData).map(item => item.value),
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
  // Use dummyData for calculation if original data is not provided/empty
  const displayData = data && data.length > 0 ? data : dummyData;
  const totalValue = displayData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      <div className="absolute flex flex-col items-center justify-center">
        {/* This calculation is an example. Adjust based on how 'totalValue' relates to actual sales. */}
        {/* If totalValue is a sum of percentages (e.g., 100), you'd need the actual total sales figure from elsewhere. */}
        {/* For a dummy, let's just show a representative total if the percentages sum to 100. */}
        <span className="text-xl font-bold text-gray-800">
          {/* Assuming totalValue represents 100% and we want a representative total, e.g., 6200 PKR total sales */}
          PKR {totalValue === 100 ? (6200).toLocaleString('en-PK') : totalValue.toLocaleString('en-PK')}
        </span>
        <span className="text-xs text-gray-500">Total Value</span>
      </div>
    </div>
  );
}