import React from 'react';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon } from './icons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const contactInfo = [
    {
      icon: <UserCircleIcon className="w-6 h-6 text-sky-400" />,
      label: 'Người phát triển',
      value: 'Thành.PV',
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6 text-sky-400" />,
      label: 'Mail',
      value: 'thanhpv@lasuco.vn',
      href: 'mailto:thanhpv@lasuco.vn',
    },
    {
      icon: <PhoneIcon className="w-6 h-6 text-sky-400" />,
      label: 'Điện thoại',
      value: '0962.9999.20',
      href: 'tel:0962999920',
    },
    {
      icon: <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Icon_of_Zalo.svg/2048px-Icon_of_Zalo.svg.png" alt="Zalo Logo" className="w-6 h-6"/>,
      label: 'Zalo',
      value: '0962999920',
      href: 'https://zalo.me/0962999920',
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-title"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 id="contact-title" className="text-xl font-bold text-sky-400">Thông tin liên hệ</h2>
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

        <div className="p-6">
          <ul className="space-y-4">
            {contactInfo.map((item, index) => (
              <li key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0">{item.icon}</div>
                <div>
                  <p className="text-sm text-gray-400">{item.label}</p>
                  {item.href ? (
                    <a 
                      href={item.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white font-semibold hover:text-sky-300 transition-colors"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-white font-semibold">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="p-4 bg-gray-900/50 rounded-b-lg text-center">
            <button
                onClick={onClose}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
                Đóng
            </button>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;