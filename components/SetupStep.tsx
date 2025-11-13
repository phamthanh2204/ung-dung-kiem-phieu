import React, { useState } from 'react';
import { UsersIcon, ClipboardDocumentListIcon, CheckCircleIcon } from './icons';
import { InvalidBallotCriteria } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface SetupStepProps {
  onStart: (candidates: string[], ballotCount: number, candidatesToElect: number, prefillCount: number, invalidBallotCriteria: InvalidBallotCriteria) => void;
  initialCandidates: string[];
  initialBallotCount: number;
  initialCandidatesToElect: number;
  hasVisitedVoting: boolean;
  onContinue: () => void;
  initialPrefillCount: number;
  initialInvalidBallotCriteria: InvalidBallotCriteria;
}

const SetupStep: React.FC<SetupStepProps> = ({ 
  onStart, 
  initialCandidates, 
  initialBallotCount, 
  initialCandidatesToElect,
  hasVisitedVoting,
  onContinue,
  initialPrefillCount,
  initialInvalidBallotCriteria,
}) => {
  const [candidatesInput, setCandidatesInput] = useState(initialCandidates.join(', '));
  const [candidatesToElectCountInput, setCandidatesToElectCountInput] = useState(initialCandidatesToElect > 0 ? String(initialCandidatesToElect) : '');
  const [ballotCountInput, setBallotCountInput] = useState(initialBallotCount > 0 ? String(initialBallotCount) : '');
  const [prefillCountInput, setPrefillCountInput] = useState(initialPrefillCount > 0 ? String(initialPrefillCount) : '');
  const [invalidBallotCriteria, setInvalidBallotCriteria] = useState(initialInvalidBallotCriteria);
  const [error, setError] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleCriteriaChange = (key: keyof InvalidBallotCriteria, value: boolean) => {
    setInvalidBallotCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleAttemptStart = () => {
    const candidates = candidatesInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const candidatesToElect = parseInt(candidatesToElectCountInput, 10);
    const ballotCount = parseInt(ballotCountInput, 10);
    const prefillCount = parseInt(prefillCountInput, 10) || 0;

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
    if (prefillCount < 0) {
      setError('Số lượng phiếu tự động chọn không được là số âm.');
      return;
    }
    if (prefillCount > ballotCount) {
      setError('Số lượng phiếu tự động chọn không được lớn hơn tổng số phiếu bầu.');
      return;
    }

    setError('');
    setIsConfirmModalOpen(true);
  };

  const handleConfirmStart = () => {
    const candidates = candidatesInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const candidatesToElect = parseInt(candidatesToElectCountInput, 10);
    const ballotCount = parseInt(ballotCountInput, 10);
    const prefillCount = parseInt(prefillCountInput, 10) || 0;
    
    setIsConfirmModalOpen(false);
    onStart(candidates, ballotCount, candidatesToElect, prefillCount, invalidBallotCriteria);
  };
  
  const hasRestoredData = initialCandidates.length > 0 || initialBallotCount > 0 || initialCandidatesToElect > 0;

  return (
    <>
      <div className="p-4 md:p-8 max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-xl mt-8">
        <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">Bước 1: Thiết lập bầu cử</h2>

        {hasRestoredData && !hasVisitedVoting && (
          <div className="bg-blue-900/50 border border-blue-700 text-blue-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Đã khôi phục phiên làm việc!</strong>
            <span className="block sm:inline"> Thiết lập bầu cử trước đó của bạn đã được tải. Bạn có thể tiếp tục hoặc thay đổi.</span>
          </div>
        )}
        
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
              1.3: Tổng số phiếu bầu phát ra
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

          <div className="border-t border-gray-700 pt-6 space-y-4">
              <h3 className="flex items-center text-lg font-semibold text-gray-300">
                  1.4: Trường hợp phiếu không hợp lệ
              </h3>
              <p className="text-sm text-gray-400">Chọn các trường hợp dưới đây sẽ bị tính là phiếu không hợp lệ. Phiếu hợp lệ là phiếu không vi phạm bất kỳ quy tắc nào được chọn.</p>
              
              <div className="space-y-3 pl-2">
                  <label className="flex items-start text-gray-300 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={invalidBallotCriteria.moreThanRequired}
                          onChange={(e) => handleCriteriaChange('moreThanRequired', e.target.checked)}
                          className="w-5 h-5 mt-1 bg-gray-700 border-gray-600 rounded text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                      <span className="ml-3 text-sm">
                          Phiếu bầu tích chọn <span className="font-semibold">nhiều hơn</span> số lượng ứng viên cần bầu.
                          <span className="block text-xs text-gray-500 mt-1">Lưu ý: Chức năng bỏ phiếu hiện tại không cho phép chọn quá số lượng.</span>
                      </span>
                  </label>
                  <label className="flex items-start text-gray-300 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={invalidBallotCriteria.lessThanRequired}
                          onChange={(e) => handleCriteriaChange('lessThanRequired', e.target.checked)}
                          className="w-5 h-5 mt-1 bg-gray-700 border-gray-600 rounded text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                      <span className="ml-3 text-sm">
                          Phiếu bầu tích chọn <span className="font-semibold">ít hơn</span> số lượng ứng viên cần bầu.
                      </span>
                  </label>
                  <label className="flex items-start text-gray-300 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={invalidBallotCriteria.blank}
                          onChange={(e) => handleCriteriaChange('blank', e.target.checked)}
                          className="w-5 h-5 mt-1 bg-gray-700 border-gray-600 rounded text-green-500 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                      <span className="ml-3 text-sm">
                          Phiếu bầu <span className="font-semibold">để trống</span> (không chọn ứng viên nào).
                      </span>
                  </label>
              </div>
          </div>
          
          <div className="border-t border-gray-700 pt-6">
            <label htmlFor="prefill-count" className="block text-lg font-semibold mb-2 text-gray-300">
              1.5: Số lượng phiếu mong muốn tích bầu chọn cả
            </label>
            <input
              id="prefill-count"
              type="number"
              value={prefillCountInput}
              onChange={(e) => setPrefillCountInput(e.target.value)}
              placeholder="Nhập số lượng phiếu"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200 text-white"
              min="0"
            />
            <p className="text-sm text-gray-400 mt-2">
              Hữu ích khi bạn chỉ cần bỏ chọn (phủ quyết) một vài ứng viên, hoặc loại bớt số phiếu không hợp lệ, giúp tăng tốc quá trình kiểm phiếu.
            </p>
          </div>

        </div>
        
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}

        <div className="mt-8 flex flex-col md:flex-row justify-center items-center gap-4">
          <button
            onClick={handleAttemptStart}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
          >
            {hasVisitedVoting ? 'Cập nhật & Bắt đầu lại' : 'Bắt đầu kiểm phiếu'}
          </button>
          {hasVisitedVoting && (
              <button
                  onClick={onContinue}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
              >
                  Tiếp tục kiểm phiếu
              </button>
          )}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmStart}
        title={hasVisitedVoting ? "Xác nhận bắt đầu lại?" : "Xác nhận bắt đầu?"}
      >
        {hasVisitedVoting ? (
            <p>
                Hành động này sẽ xóa tất cả dữ liệu phiếu bầu hiện tại và bắt đầu lại quy trình kiểm phiếu với các thiết lập mới.
                <br/><br/>
                Bạn có chắc chắn muốn tiếp tục không?
            </p>
        ) : (
            <p>Bạn sắp bắt đầu quy trình kiểm phiếu với các thiết lập đã nhập. Hãy đảm bảo mọi thông tin đều chính xác trước khi tiếp tục.</p>
        )}
      </ConfirmationModal>
    </>
  );
};

export default SetupStep;