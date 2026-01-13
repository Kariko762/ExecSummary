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
}

export const GaugeRenderer: React.FC<GaugeRendererProps> = ({ data, isEditMode = false }) => {
  const value = data.value || 0;
  const label = data.label || 'Metric';
  const suffix = data.suffix || '%';
  const size = data.size || 'large';
  
  // Determine color based on value thresholds
  const getColor = () => {
    if (data.color) return data.color;
    if (value >= 80) return 'var(--semantic-success)';
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
  
  // 240-degree arc (2/3 of circle) - starts at 150° and ends at 390° (or -210° to 30°)
  const arcDegrees = 240;
  const circumference = normalizedRadius * 2 * Math.PI;
  const arcLength = (arcDegrees / 360) * circumference;
  const gapLength = circumference - arcLength;
  
  // Calculate progress along the 240-degree arc
  const progressLength = (value / 100) * arcLength;
  const strokeDashoffset = arcLength - progressLength;
  
  const centerX = radius;
  const centerY = radius;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform rotate-[150deg]"
      >
        {/* Background arc (240 degrees) */}
        <circle
          stroke="var(--border-subtle)"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${gapLength}`}
          r={normalizedRadius}
          cx={centerX}
          cy={centerY}
          opacity={0.2}
          strokeLinecap="round"
        />
        
        {/* Progress arc */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${gapLength}`}
          style={{ 
            strokeDashoffset,
            transition: 'stroke-dashoffset 1s ease-in-out'
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={centerX}
          cy={centerY}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <div 
          className={`font-roobert-bold text-${config.fontSize} leading-none`}
          style={{ color }}
        >
          {Math.round(value)}{suffix}
        </div>
        <div className={`text-${config.labelSize} text-gray-600 dark:text-gray-400 font-roobert-medium mt-1 text-center`}>
          {label}
        </div>
      </div>
    </div>
  );
};
