import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamLogoProps {
  teamName: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function TeamLogo({ 
  teamName, 
  primaryColor = "#3b82f6", 
  secondaryColor = "#ffffff",
  logoUrl,
  size = "md",
  className 
}: TeamLogoProps) {
  const initials = teamName
    .split(' ')
    .map(word => word[0])
    .slice(0, 3)
    .join('')
    .toUpperCase();

  const sizeClasses = {
    sm: "w-12 h-12 text-sm",
    md: "w-16 h-16 text-base",
    lg: "w-20 h-20 text-lg",
    xl: "w-24 h-24 text-xl"
  };

  const iconSizes = {
    sm: 48,
    md: 64,
    lg: 80,
    xl: 96
  };

  // If logo URL is provided, display the image
  if (logoUrl) {
    return (
      <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
        <img 
          src={logoUrl} 
          alt={`${teamName} logo`}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback to shield if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.add('show-fallback');
          }}
        />
        {/* Fallback shield that shows if image fails */}
        <div className="hidden absolute inset-0 items-center justify-center [.show-fallback_&]:flex">
          <Shield 
            size={iconSizes[size]} 
            fill={primaryColor}
            stroke={secondaryColor}
            strokeWidth={1.5}
            className="absolute"
          />
          <span 
            className="relative z-10 font-heading font-bold"
            style={{ color: secondaryColor }}
          >
            {initials}
          </span>
        </div>
      </div>
    );
  }

  // Default shield design
  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      <Shield 
        size={iconSizes[size]} 
        fill={primaryColor}
        stroke={secondaryColor}
        strokeWidth={1.5}
        className="absolute"
      />
      <span 
        className="relative z-10 font-heading font-bold"
        style={{ color: secondaryColor }}
      >
        {initials}
      </span>
    </div>
  );
}
