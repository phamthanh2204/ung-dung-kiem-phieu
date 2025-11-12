import React, { useMemo } from 'react';
import { ResultData, CalculationMode } from '../types';
import { ChartBarIcon, ArrowDownTrayIcon, PrinterIcon } from './icons';

interface ResultsStepProps {
  candidates: string[];
  votes: string[][];
  onReview: () => void;
  candidatesToElect: number;
  ballotCount: number;
  onNewPoll: () => void;
  calculationMode: CalculationMode;
  onCalculationModeChange: (mode: CalculationMode) => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ 
  candidates, 
  votes, 
  onReview, 
  candidatesToElect, 
  ballotCount, 
  onNewPoll,
  calculationMode,
  onCalculationModeChange,
}) => {

  const { results, totalVotes, totalBallots, validBallots, invalidBallots } = useMemo(() => {
    const voteCounts: { [key: string]: number } = {};
    candidates.forEach(c => voteCounts[c] = 0);

    let talliedVotes = 0;
    const totalBallotsCount = votes.length;
    let validBallotsCount = 0;

    votes.forEach(ballot => {
      if (ballot && ballot.length === candidatesToElect) {
        validBallotsCount++;
        ballot.forEach(candidateName => {
          if (voteCounts.hasOwnProperty(candidateName)) {
            voteCounts[candidateName]++;
            talliedVotes++;
          }
        });
      }
    });

    const invalidBallotsCount = totalBallotsCount - validBallotsCount;

    const sortedCandidates = candidates
      .map(c => ({ name: c, votes: voteCounts[c] }))
      .sort((a, b) => b.votes - a.votes);

    const topCandidateNames = sortedCandidates.slice(0, candidatesToElect).map(c => c.name);
    
    const resultData: ResultData[] = sortedCandidates.map(candidate => {
      const denominator = calculationMode === 'validBallots' ? (validBallotsCount > 0 ? validBallotsCount : 1) : (ballotCount > 0 ? ballotCount : 1);
      const percentageValue = (candidate.votes / denominator) * 100;
      
      const thresholdDenominator = calculationMode === 'validBallots' ? validBallotsCount : ballotCount;
      const meetsThreshold = thresholdDenominator > 0 && candidate.votes > (thresholdDenominator / 2);
      const isInTopGroup = topCandidateNames.includes(candidate.name);

      return {
        name: candidate.name,
        votes: candidate.votes,
        percentage: percentageValue.toFixed(2) + '%',
        isWinner: isInTopGroup && meetsThreshold,
      };
    });

    return { 
      results: resultData, 
      totalVotes: talliedVotes, 
      totalBallots: totalBallotsCount,
      validBallots: validBallotsCount,
      invalidBallots: invalidBallotsCount
    };
  }, [candidates, votes, candidatesToElect, ballotCount, calculationMode]);
  
  const winners = useMemo(() => results.filter(r => r.isWinner), [results]);

  const handleDownloadExcel = () => {
    const headers = ['Phiếu #', ...candidates];
    let csvContent = headers.join(',') + '\n';

    votes.forEach((ballot, index) => {
        const row = [
            `Phiếu ${index + 1}`,
            ...candidates.map(candidate => (ballot || []).includes(candidate) ? 'X' : '')
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
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto printable-area">
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

        <div className="text-center text-sm text-gray-500 mb-6">
          <p>Ghi chú: Phiếu hợp lệ là phiếu đã chọn đúng <strong className="text-gray-400">{candidatesToElect}</strong> ứng viên. Các phiếu khác bị coi là không hợp lệ.</p>
        </div>
        
        <div className="mb-6 flex justify-center items-center gap-4 bg-gray-900/50 p-3 rounded-lg no-print">
            <span className="text-sm font-medium text-gray-300">Tính tỷ lệ % trên:</span>
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onCalculationModeChange('totalBallots')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${calculationMode === 'totalBallots' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Tổng phiếu phát ra
                </button>
                <button 
                    onClick={() => onCalculationModeChange('validBallots')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${calculationMode === 'validBallots' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    Tổng phiếu hợp lệ
                </button>
            </div>
        </div>

        {winners.length > 0 ? (
          <div className="my-6 p-4 bg-green-900/50 border-l-4 border-green-500 rounded-r-lg shadow-md text-center">
            <h4 className="text-lg font-bold text-green-300">🎉 ỨNG VIÊN TRÚNG CỬ 🎉</h4>
            {winners.map(winner => (
              <p key={winner.name} className="text-2xl font-semibold text-white animate-pulse">{winner.name}</p>
            ))}
            <p className="text-xs text-green-400 mt-2">
              (Trúng cử khi nằm trong nhóm dẫn đầu VÀ có số phiếu bầu &gt; 50% trên tổng số phiếu {calculationMode === 'validBallots' ? 'hợp lệ' : 'đã thiết lập'})
            </p>
          </div>
        ) : (
          validBallots > 0 && (
            <div className="my-6 p-4 bg-yellow-900/50 border-l-4 border-yellow-500 rounded-r-lg text-center">
                <h4 className="text-lg font-semibold text-yellow-300">Chưa có ứng viên trúng cử</h4>
                <p className="text-yellow-400 mt-1">Không có ứng viên nào trong nhóm dẫn đầu đạt trên 50% tổng số phiếu {calculationMode === 'validBallots' ? 'hợp lệ' : 'đã thiết lập'}.</p>
            </div>
          )
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-green-400 uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Ứng viên</th>
                <th scope="col" className="px-6 py-3">Số phiếu</th>
                <th scope="col" className="px-6 py-3">
                  Tỷ lệ % / {calculationMode === 'validBallots' ? 'Phiếu hợp lệ' : 'Tổng phiếu'}
                </th>
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
      
      <div className="mt-8 text-center flex flex-col md:flex-row justify-center items-center flex-wrap gap-4 no-print">
        <button
          onClick={onNewPoll}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Tạo Kiểm Phiếu Mới
        </button>
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
        <button
          onClick={handlePrint}
          className="w-full md:w-auto bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out flex items-center justify-center gap-2"
        >
          <PrinterIcon className="w-5 h-5" />
          In Kết Quả
        </button>
      </div>
    </div>
  );
};

export default ResultsStep;
