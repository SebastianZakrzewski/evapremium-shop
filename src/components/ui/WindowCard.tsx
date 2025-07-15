import React from "react";

interface WindowCardProps {
  title: string;
  backgroundColor?: string;
  imageSrc?: string; // np. /window.svg
  className?: string;
}

export const WindowCard: React.FC<WindowCardProps> = ({
  title,
  backgroundColor = "#222",
  imageSrc,
  className = "",
}) => {
  return (
    <div
      className={`w-56 h-80 md:w-72 md:h-112 aspect-[9/16] flex flex-col items-center justify-center rounded-2xl shadow-lg overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      {imageSrc && (
        <img src={imageSrc} alt="Okno" className="w-20 h-20 mb-6 select-none pointer-events-none" draggable={false} />
      )}
      <span className="text-white text-2xl font-bold select-none text-center px-4">
        {title}
      </span>
    </div>
  );
};

export default WindowCard; 