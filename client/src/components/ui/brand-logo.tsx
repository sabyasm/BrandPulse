import { useState } from "react";
import type { BrandInfo } from "@shared/schema";

interface BrandLogoProps {
  brandInfo?: BrandInfo;
  brandName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-6 h-6 text-sm",
  md: "w-8 h-8 text-base", 
  lg: "w-12 h-12 text-lg"
};

export default function BrandLogo({ brandInfo, brandName, size = "md", className = "" }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const sizeClass = sizeClasses[size];
  const fallbackIcon = brandInfo?.fallbackIcon || '🏢';
  
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  // If we have logo URL and no error, show image
  if (brandInfo?.logoUrl && !imageError) {
    return (
      <div className={`${sizeClass} ${className} rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden relative`}>
        <img
          src={brandInfo.logoUrl}
          alt={`${brandName} logo`}
          className={`${sizeClass} object-contain transition-opacity duration-200 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        {!imageLoaded && !imageError && (
          <div className={`absolute inset-0 flex items-center justify-center text-gray-400`}>
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        {!imageLoaded && !imageError && (
          <span className={`absolute inset-0 flex items-center justify-center text-gray-400 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}>
            {fallbackIcon}
          </span>
        )}
      </div>
    );
  }
  
  // Fallback to icon
  return (
    <div className={`${sizeClass} ${className} rounded-lg bg-gray-100 flex items-center justify-center`}>
      <span className={size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}>
        {fallbackIcon}
      </span>
    </div>
  );
}

// Enhanced Brand Logo with name display
interface BrandLogoWithNameProps extends BrandLogoProps {
  showName?: boolean;
  namePosition?: "right" | "bottom";
}

export function BrandLogoWithName({ 
  brandInfo, 
  brandName, 
  size = "md", 
  className = "",
  showName = true,
  namePosition = "right"
}: BrandLogoWithNameProps) {
  if (namePosition === "bottom") {
    return (
      <div className={`flex flex-col items-center space-y-2 ${className}`}>
        <BrandLogo brandInfo={brandInfo} brandName={brandName} size={size} />
        {showName && (
          <span className={`text-center font-medium text-gray-700 ${
            size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'
          } max-w-16 truncate`}>
            {brandName}
          </span>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <BrandLogo brandInfo={brandInfo} brandName={brandName} size={size} />
      {showName && (
        <span className={`font-medium text-gray-900 ${
          size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
        } truncate`}>
          {brandName}
        </span>
      )}
    </div>
  );
}