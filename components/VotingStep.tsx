import React from 'react';
import { CheckCircleIcon } from './icons';

interface VotingStepProps {
  candidates: string[];
  ballotCount: number;
  votes: string[][];
  onVote: (ballotIndex: number, candidateName: string) => void;
  onFinish: () => void;
  candidatesToElect: number;
  onBackToSetup: () => void;
}

const VotingStep: React.FC<VotingStepProps> = ({ candidates, ballotCount, votes, onVote, onFinish, candidatesToElect, onBackToSetup }) => {
  return (
    <div className="p-4 md:p-8 mx-auto">
      <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">Bước 2: Bỏ phiếu</h2>
      <p className="text-center text-gray-400 mb-6">
        Nhấp vào ô tương ứng để bỏ phiếu. Mỗi hàng là một lá phiếu.
        <br/>Bạn phải chọn đúng <span className="font-bold text-white">{candidatesToElect}</span> ứng viên để phiếu bầu hợp lệ.
      </p>
      
      <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-xl">
        <table className="w-full min-w-[600px] text-sm text-left text-gray-300">
          <thead className="text-xs text-green-400 uppercase bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 sticky left-0 bg-gray-700 z-10 w-24">
                Phiếu #
              </th>
              {candidates.map(candidate => (
                <th key={candidate} scope="col" className="px-6 py-3 text-center">
                  {candidate}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ballotCount }, (_, i) => (
              <tr key={i} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-600">
                <td className="px-6 py-4 font-medium text-white whitespace-nowrap sticky left-0 bg-gray-800 hover:bg-gray-600 z-10 w-24">
                  Phiếu {i + 1}
                </td>
                {candidates.map(candidate => {
                  const currentBallotVotes = votes[i] || [];
                  const isVoted = currentBallotVotes.includes(candidate);
                  const isLimitReached = currentBallotVotes.length >= candidatesToElect;
                  const isDisabled = isLimitReached && !isVoted;

                  return (
                    <td key={candidate} className="px-6 py-4 text-center">
                      <button
                        onClick={() => onVote(i, candidate)}
                        disabled={isDisabled}
                        className={`w-8 h-8 mx-auto flex items-center justify-center rounded-md border-2 transition-all duration-200 
                          ${isVoted 
                            ? 'bg-green-500 border-green-400' 
                            : 'bg-gray-700 border-gray-500 hover:border-green-500'}
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`
                        }
                        aria-label={`Vote for ${candidate} on ballot ${i + 1}`}
                      >
                        {isVoted && <CheckCircleIcon className="w-7 h-7 text-white" />}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center flex flex-col md:flex-row justify-center items-center gap-4">
        <button
          onClick={onBackToSetup}
          className="w-full md:w-auto bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Quay lại bước 1
        </button>
        <button
          onClick={onFinish}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Kết thúc & Xem kết quả
        </button>
      </div>
    </div>
  );
};

export default VotingStep;