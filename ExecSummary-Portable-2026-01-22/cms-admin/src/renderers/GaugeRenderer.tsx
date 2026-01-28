import React from 'react';

interface GaugeData {
  value: number; // 0-100 for percentage, or any number
  label: string;
  suffix?: string; // '%' or 'K' or 'M' etc
  color?: string; // Optional custom color
  size?: 'small' | 'medium' | 'large';
}

interface GaugeRendererProps {
  data: GaugeData;
  isEditMode?: boolean;
  displayMode?: 'normal' | 'hero';
}

export const GaugeRenderer: React.FC<GaugeRendererProps> = ({ data, isEditMode = false, displayMode = 'normal' }) => {
  const value = data.value || 0;
  const label = data.label || 'Metric';
  const suffix = data.suffix || '%';
  // Force small size in hero mode
  const size = displayMode === 'hero' ? 'small' : (data.size || 'large');
  
  // Determine color based on value thresholds
  const getColor = () => {
    if (data.color) return data.color;
    if (value >= 80) return 'var(--accent-green)';
    if (value >= 60) return 'var(--accent-yellow)';
    return 'var(--semantic-error)';
  };
  
  const color = getColor();
  
  // Size configurations
  const sizeConfig = {
    small: { radius: 60, strokeWidth: 8, fontSize: '2xl', labelSize: 'xs' },
    medium: { radius: 80, strokeWidth: 10, fontSize: '3xl', labelSize: 'sm' },
    large: { radius: 100, strokeWidth: 12, fontSize: '5xl', labelSize: 'base' }
  };
  
  const config = sizeConfig[size];
  const radius = config.radius;
  const strokeWidth = config.strokeWidth;
  const normalizedRadius = radius - strokeWidth / 2;
  
  // 240-degree arc spanning from -30° (left) to +30° (right) through the top
  // In SVG: 0° is at 3 o'clock, angles increase clockwise
  const arcDegrees = 240;
  const startAngle = 150; // Rotate to position both ends horizontally
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = (arcDegrees / 360) * circumference;
  const gapLength = circumference - arcLength;
  
  // Calculate progress along the 240-degree arc (0% = left side, 100% = right side)
  const progressLength = (value / 100) * arcLength;
  const strokeDashoffset = arcLength - progressLength;
  
  const centerX = radius;
  const centerY = radius;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg
        height={radius * 2}
        width={radius * 2}
      >
        {/* Background arc (240 degrees from left to right) - Full track */}
        <circle
          stroke="var(--brand-primary)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={0}
          r={normalizedRadius}
          cx={centerX}
          cy={centerY}
          opacity={0.15}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${centerX} ${centerY})`}
        />
        
        {/* Progress arc - Only fills to the percentage value */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${progressLength} ${circumference}`}
          strokeDashoffset={0}
          r={normalizedRadius}
          cx={centerX}
          cy={centerY}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${centerX} ${centerY})`}
          style={{ 
            transition: 'stroke-dasharray 1s ease-in-out'
          }}
        />
      </svg>
      
      {/* Center text - positioned absolutely within the gauge */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div 
          className={`font-roobert-bold text-${config.fontSize} leading-none`}
          style={{ color }}
        >
          {Math.round(value)}{suffix}
        </div>
        <div className={`text-${config.labelSize} text-gray-600 dark:text-gray-400 font-roobert-medium mt-1 text-center px-2`}>
          {label}
        </div>
      </div>
    </div>
  );
};
