import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 id="confirmation-title" className="text-xl font-bold text-yellow-400 mb-4">{title}</h2>
          <div className="text-gray-300">
            {children}
          </div>
        </div>
        
        <div className="px-6 py-4 bg-gray-700/50 rounded-b-lg flex justify-end items-center gap-4">
            <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
                Hủy
            </button>
            <button
                onClick={onConfirm}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
                Xác nhận
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
