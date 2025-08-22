import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface TransmissionCircleIconProps {
  size?: number;
  color?: string;
}

export const TransmissionCircleIcon: React.FC<TransmissionCircleIconProps> = ({ 
  size = 24, 
  color = '#1e40af' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Transmission gear pattern */}
      <Path
        d="M8 9V15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M12 9V15"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M8 12H13C13.9319 12 14.3978 12 14.7654 11.8478C15.2554 11.6448 15.6448 11.2554 15.8478 10.7654C16 10.3978 16 9.93188 16 9"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Circle */}
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
    </Svg>
  );
};