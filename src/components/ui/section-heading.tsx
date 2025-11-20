import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  highlight?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

export default function SectionHeading({ 
  title, 
  subtitle, 
  highlight, 
  align = "center", 
  className 
}: SectionHeadingProps) {
  return (
    <div className={cn(
      "mb-12 md:mb-16",
      align === "center" && "text-center",
      align === "left" && "text-left",
      align === "right" && "text-right",
      className
    )}>
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
        {title}
        {highlight && <span className="text-red-600 ml-2">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

