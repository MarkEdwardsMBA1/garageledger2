import React from 'react';
import Svg, { Line, Path } from 'react-native-svg';

interface CarDoorIconProps {
  size?: number;
  color?: string;
}

export const CarDoorIcon: React.FC<CarDoorIconProps> = ({ 
  size = 24, 
  color = '#1e40af' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="14"
        y1="15"
        x2="16"
        y2="15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12.41,3H19a1,1,0,0,1,1,1V20a1,1,0,0,1-1,1H12a6.11,6.11,0,0,0-5.08-4.58l-2.06-.3a1,1,0,0,1-.86-1V11l7.71-7.71A1,1,0,0,1,12.41,3ZM4,11H20"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};