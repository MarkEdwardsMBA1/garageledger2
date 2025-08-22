import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface MultiGearsIconProps {
  size?: number;
  color?: string;
}

export const MultiGearsIcon: React.FC<MultiGearsIconProps> = ({ 
  size = 24, 
  color = '#1e40af' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Large gear */}
      <Circle cx="9" cy="12" r="3" stroke={color} strokeWidth="2" fill="none" />
      <Path
        d="M9 6v2m0 8v2m-6-3h2m8 0h2m-5.414-7.414l1.414 1.414m4.242 4.242l1.414 1.414m-7.07 0l1.414-1.414M6.344 6.344l1.414 1.414"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Small gear */}
      <Circle cx="16" cy="8" r="2" stroke={color} strokeWidth="2" fill="none" />
      <Path
        d="M16 4v1m0 6v1m-4-2h1m6 0h1m-3.5-4.5l.707.707m2.828 2.828l.707.707m-4.242 0l.707-.707M13.172 4.172l.707.707"
        stroke={color}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
};