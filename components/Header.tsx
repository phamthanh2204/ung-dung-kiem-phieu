import React from 'react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  return (
    <header className={`bg-sky-600 p-4 shadow-lg ${className}`}>
      <div className="container mx-auto flex items-center justify-center relative h-16">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center">
          <img 
            src="https://doc.lasuco.vn/wp-content/uploads/2023/07/cropped-thanhpv-EmbeddedImage01.png" 
            alt="Logo" 
            className="h-16 w-auto"
          />
        </div>
        <div className="flex items-center">
            <h1 className="text-xl md:text-3xl font-bold text-white tracking-wider text-center">
             PHẦN MỀM KIỂM PHIẾU BẦU CỬ
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;