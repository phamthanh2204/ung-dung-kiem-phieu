import React, { useState } from 'react';
import { UsersIcon, ClipboardDocumentListIcon, CheckCircleIcon } from './icons';

interface SetupStepProps {
  onStart: (candidates: string[], ballotCount: number, candidatesToElect: number) => void;
}

const SetupStep: React.FC<SetupStepProps> = ({ onStart }) => {
  const [candidatesInput, setCandidatesInput] = useState('');
  const [candidatesToElectCountInput, setCandidatesToElectCountInput] = useState('');
  const [ballotCountInput, setBallotCountInput] = useState('');
  const [error, setError] = useState('');

  const handleStart = () => {
    const candidates = candidatesInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const candidatesToElect = parseInt(candidatesToElectCountInput, 10);
    const ballotCount = parseInt(ballotCountInput, 10);

    if (candidates.length < 1) {
      setError('Vui lòng nhập ít nhất 1 ứng viên.');
      return;
    }
    if (isNaN(candidatesToElect) || candidatesToElect <= 0) {
        setError('Vui lòng nhập số lượng ứng viên cần bầu là một số dương.');
        return;
    }
    if (candidatesToElect > candidates.length) {
        setError('Số lượng ứng viên cần bầu không được lớn hơn tổng số ứng viên.');
        return;
    }
    if (isNaN(ballotCount) || ballotCount <= 0) {
      setError('Vui lòng nhập số phiếu bầu là một số dương.');
      return;
    }

    setError('');
    onStart(candidates, ballotCount, candidatesToElect);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl mt-8">
      <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">Bước 1: Thiết lập bầu cử</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="candidates" className="flex items-center text-lg font-semibold mb-2 text-gray-300">
            <UsersIcon className="w-6 h-6 mr-2 text-green-400" />
            1.1: Danh sách ứng viên (phân tách bằng dấu phẩy)
          </label>
          <textarea
            id="candidates"
            value={candidatesInput}
            onChange={(e) => setCandidatesInput(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn A, Trần Thị B, Lê Văn C"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-white"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="candidates-to-elect" className="flex items-center text-lg font-semibold mb-2 text-gray-300">
             <CheckCircleIcon className="w-6 h-6 mr-2 text-green-400" />
             1.2: Nhập số lượng ứng viên cần bầu
          </label>
          <input
            id="candidates-to-elect"
            type="number"
            value={candidatesToElectCountInput}
            onChange={(e) => setCandidatesToElectCountInput(e.target.value)}
            placeholder="Số lượng lựa chọn tối đa trên mỗi phiếu"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-white"
            min="1"
          />
        </div>

        <div>
          <label htmlFor="ballot-count" className="flex items-center text-lg font-semibold mb-2 text-gray-300">
             <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-green-400" />
            1.3: Tổng số phiếu bầu
          </label>
          <input
            id="ballot-count"
            type="number"
            value={ballotCountInput}
            onChange={(e) => setBallotCountInput(e.target.value)}
            placeholder="Ví dụ: 100"
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-white"
            min="1"
          />
        </div>
      </div>
      
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

      <div className="mt-8 text-center">
        <button
          onClick={handleStart}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
        >
          Bắt đầu kiểm phiếu
        </button>
      </div>
    </div>
  );
};

export default SetupStep;