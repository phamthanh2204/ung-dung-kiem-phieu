import React, { useState, useEffect } from 'react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InstructionContent {
  title: string;
  body: string;
}

// IMPORTANT: The Google Sheet must be published to the web as a CSV for this to work.
// Tệp > Chia sẻ > Xuất bản lên web > Chọn trang tính > Chọn CSV > Xuất bản.
const SHEET_ID = '18Hn0APJ-lNPxTXN5vn3f9IyLF4rbOZOnpBO38W_vzNQ';
const GID = '0'; // GID for the first sheet. Change if your instructions are on a different sheet.
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;


const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState<InstructionContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchInstructions = async () => {
        setLoading(true);
        setError(null);
        setContent([]);
        try {
          const response = await fetch(GOOGLE_SHEET_CSV_URL);
          if (!response.ok) {
            throw new Error(`Không thể tải hướng dẫn. Mã lỗi: ${response.status}`);
          }
          const csvText = await response.text();
          
          // Basic CSV parsing: assumes two columns [title, body] and handles quoted strings.
          const rows = csvText.trim().split(/\r?\n/);
          const parsedContent: InstructionContent[] = rows.slice(1).map(row => { // slice(1) to skip header
            const columns = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
            return {
              title: (columns[0] || '').replace(/"/g, '').trim(),
              body: (columns[1] || '').replace(/"/g, '').trim(),
            };
          }).filter(item => item.title && item.body); // Filter out empty rows

          if (parsedContent.length === 0) {
            throw new Error("Không tìm thấy nội dung hướng dẫn. Vui lòng kiểm tra lại file Google Sheet và chắc chắn rằng nó đã được xuất bản lên web ở định dạng CSV.");
          }

          setContent(parsedContent);
        } catch (err: any) {
          console.error("Lỗi khi tải hướng dẫn:", err);
          setError(err.message || 'Đã xảy ra lỗi không xác định.');
        } finally {
          setLoading(false);
        }
      };

      fetchInstructions();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructions-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="instructions-title" className="text-xl font-bold text-green-400">Hướng dẫn sử dụng</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center h-48">
               <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4 text-gray-400">Đang tải hướng dẫn...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Lỗi!</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}
          {content.length > 0 && (
            <div className="space-y-6 text-gray-300">
              {content.map((item, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-green-300 mb-2">{item.title}</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-700 text-right">
             <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
                Đã hiểu
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;