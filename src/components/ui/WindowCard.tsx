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
      className={`w-44 h-72 md:w-56 md:h-96 aspect-[9/16] flex flex-col items-center justify-center rounded-2xl shadow-lg overflow-hidden ${className}`}
      style={{ backgroundColor }}
    >
      {imageSrc && (
        <img src={imageSrc} alt="Okno" className="w-16 h-16 mb-4 select-none pointer-events-none" draggable={false} />
      )}
      <span className="text-white text-xl font-bold select-none text-center px-2">
        {title}
      </span>
    </div>
  );
};

export default WindowCard; 