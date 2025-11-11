import React, { useMemo, useState, useEffect } from 'react';
import { ResultData } from '../types';
import { ChartBarIcon } from './icons';

// Fix: Add Recharts to the window type to resolve TypeScript error.
declare global {
  interface Window {
    Recharts: any;
  }
}

interface ResultsStepProps {
  candidates: string[];
  votes: string[][];
  onReview: () => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#d0ed57', '#ffc658'];

const ResultsStep: React.FC<ResultsStepProps> = ({ candidates, votes, onReview }) => {
  const [isChartReady, setIsChartReady] = useState(!!window.Recharts);

  useEffect(() => {
    // If Recharts is already loaded, do nothing.
    if (isChartReady) return;

    // Set an interval to check for window.Recharts every 100ms.
    const intervalId = setInterval(() => {
      if (window.Recharts) {
        setIsChartReady(true);
        clearInterval(intervalId);
      }
    }, 100);

    // Cleanup function to clear the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, [isChartReady]);


  const { results, totalVotes, totalBallots } = useMemo(() => {
    const voteCounts: { [key: string]: number } = {};
    candidates.forEach(c => voteCounts[c] = 0);

    let talliedVotes = 0;
    const totalBallotsCount = votes.length;

    votes.forEach(ballot => { // Each ballot is an array of candidate names
      ballot.forEach(candidateName => {
        if (voteCounts.hasOwnProperty(candidateName)) {
          voteCounts[candidateName]++;
          talliedVotes++;
        }
      });
    });

    const resultData: ResultData[] = candidates.map(candidate => ({
      name: candidate,
      votes: voteCounts[candidate],
      percentage: totalBallotsCount > 0 ? ((voteCounts[candidate] / totalBallotsCount) * 100).toFixed(2) + '%' : '0.00%',
    })).sort((a, b) => b.votes - a.votes);

    return { results: resultData, totalVotes: talliedVotes, totalBallots: totalBallotsCount };
  }, [candidates, votes]);

  const renderChart = () => {
    if (!isChartReady) {
      return (
        <div style={{ width: '100%', height: 400 }} className="flex items-center justify-center text-gray-400">
          Đang tải biểu đồ...
        </div>
      );
    }

    const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } = window.Recharts;

    return (
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={results} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey="name" stroke="#A0AEC0" />
            <YAxis allowDecimals={false} stroke="#A0AEC0" />
            <Tooltip
              contentStyle={{ backgroundColor: '#2D3748', border: '1px solid #4A5568' }}
              labelStyle={{ color: '#E2E8F0' }}
            />
            <Bar dataKey="votes">
              {results.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">Bước 3: Kết quả bầu cử</h2>
      
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
        <h3 className="flex items-center text-xl font-semibold mb-4 text-gray-200">
          <ChartBarIcon className="w-6 h-6 mr-2 text-green-400" />
          3.2: Bảng thống kê
        </h3>
        <p className="text-gray-400 mb-4">
          Tổng số lượt bầu: <span className="font-bold text-white">{totalVotes}</span> trên tổng số <span className="font-bold text-white">{totalBallots}</span> phiếu.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-green-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Ứng viên</th>
                <th scope="col" className="px-6 py-3">Số phiếu</th>
                <th scope="col" className="px-6 py-3">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.name} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{result.name}</td>
                  <td className="px-6 py-4">{result.votes}</td>
                  <td className="px-6 py-4">{result.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
         <h3 className="flex items-center text-xl font-semibold mb-4 text-gray-200">
          <ChartBarIcon className="w-6 h-6 mr-2 text-green-400" />
          Biểu đồ kết quả
        </h3>
        {renderChart()}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={onReview}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Xem lại bầu chọn
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;