import React, { useMemo } from 'react';
import { ResultData } from '../types';
import { ChartBarIcon, ArrowDownTrayIcon } from './icons';

interface ResultsStepProps {
  candidates: string[];
  votes: string[][];
  onReview: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ candidates, votes, onReview }) => {

  const { results, totalVotes, totalBallots, validBallots, invalidBallots } = useMemo(() => {
    const voteCounts: { [key: string]: number } = {};
    candidates.forEach(c => voteCounts[c] = 0);

    let talliedVotes = 0;
    const totalBallotsCount = votes.length;
    let validBallotsCount = 0;

    votes.forEach(ballot => {
      if (ballot.length > 0) {
        validBallotsCount++;
      }
      ballot.forEach(candidateName => {
        if (voteCounts.hasOwnProperty(candidateName)) {
          voteCounts[candidateName]++;
          talliedVotes++;
        }
      });
    });

    const invalidBallotsCount = totalBallotsCount - validBallotsCount;

    const resultData: ResultData[] = candidates.map(candidate => {
      const percentageValue = totalBallotsCount > 0 ? (voteCounts[candidate] / totalBallotsCount) * 100 : 0;
      return {
        name: candidate,
        votes: voteCounts[candidate],
        percentage: percentageValue.toFixed(2) + '%',
        isWinner: percentageValue > 50,
      };
    }).sort((a, b) => b.votes - a.votes);

    return { 
      results: resultData, 
      totalVotes: talliedVotes, 
      totalBallots: totalBallotsCount,
      validBallots: validBallotsCount,
      invalidBallots: invalidBallotsCount
    };
  }, [candidates, votes]);
  
  const winners = useMemo(() => results.filter(r => r.isWinner), [results]);

  const handleDownloadExcel = () => {
    const headers = ['Phiếu #', ...candidates];
    let csvContent = headers.join(',') + '\n';

    votes.forEach((ballot, index) => {
        const row = [
            `Phiếu ${index + 1}`,
            ...candidates.map(candidate => ballot.includes(candidate) ? 'X' : '')
        ];
        csvContent += row.join(',') + '\n';
    });

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ket-qua-bau-cu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">Bước 3: Kết quả bầu cử</h2>
      
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
        <h3 className="flex items-center text-xl font-semibold mb-4 text-gray-200">
          <ChartBarIcon className="w-6 h-6 mr-2 text-green-400" />
          3.2: Bảng thống kê
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
            <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-gray-400">Tổng số phiếu</p>
                <p className="text-2xl font-bold text-white">{totalBallots}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-green-400">Phiếu hợp lệ</p>
                <p className="text-2xl font-bold text-green-400">{validBallots}</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg">
                <p className="text-sm text-red-400">Phiếu không hợp lệ</p>
                <p className="text-2xl font-bold text-red-400">{invalidBallots}</p>
            </div>
        </div>
        
        <p className="text-gray-400 mb-4 text-center">
          Tổng số lượt bầu đã được ghi nhận: <span className="font-bold text-white">{totalVotes}</span>.
        </p>

        {winners.length > 0 && (
          <div className="my-6 p-4 bg-green-900/50 border-l-4 border-green-500 rounded-r-lg shadow-md text-center">
            <h4 className="text-lg font-bold text-green-300">🎉 ỨNG VIÊN TRÚNG CỬ 🎉</h4>
            {winners.map(winner => (
              <p key={winner.name} className="text-2xl font-semibold text-white animate-pulse">{winner.name}</p>
            ))}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-green-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Ứng viên</th>
                <th scope="col" className="px-6 py-3">Số phiếu</th>
                <th scope="col" className="px-6 py-3">Tỷ lệ % / Tổng phiếu</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.name} className={`border-b border-gray-700 transition-colors duration-300 ${result.isWinner ? 'bg-green-600/30' : 'bg-gray-800'}`}>
                  <td className={`px-6 py-4 font-medium whitespace-nowrap ${result.isWinner ? 'text-green-300' : 'text-white'}`}>{result.name}</td>
                  <td className={`px-6 py-4 ${result.isWinner ? 'font-bold text-green-300' : ''}`}>{result.votes}</td>
                  <td className={`px-6 py-4 ${result.isWinner ? 'font-bold text-green-300' : ''}`}>{result.percentage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 text-center flex flex-col md:flex-row justify-center items-center gap-4">
        <button
          onClick={onReview}
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Xem lại bầu chọn
        </button>
        <button
          onClick={handleDownloadExcel}
          className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out flex items-center justify-center gap-2"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Tải xuống Excel
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;