import React from 'react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-sky-600 p-4 shadow-lg ${className}`}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="https://doc.lasuco.vn/wp-content/uploads/2023/07/cropped-thanhpv-EmbeddedImage01.png" 
            alt="Lasuco Logo" 
            className="h-16 w-auto"
          />
        </div>
        <h1 className="text-xl md:text-3xl font-bold text-white tracking-wider text-right">
         PHẦN MỀM KIỂM PHIẾU BẦU CỬ 2025
        </h1>
      </div>
    </header>
  );
};

export default Header;