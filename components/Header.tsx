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
            src="https://drive.google.com/file/d/1GL4KB3EnxeHbihj_0c5saIKXMhYP5o_g/view?usp=sharing" 
            alt="Lasuco Logo" 
            className="h-16 w-auto"
          />
        </div>
        <div className="flex items-center">
            <h1 className="text-xl md:text-3xl font-bold text-white tracking-wider text-right">
             PHẦN MỀM KIỂM PHIẾU BẦU CỬ
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;