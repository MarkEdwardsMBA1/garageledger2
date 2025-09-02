import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface AttachmentIconProps {
  size?: number;
  color?: string;
}

export const AttachmentIcon: React.FC<AttachmentIconProps> = ({ 
  size = 24, 
  color = '#1e293b' 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path 
        d="M15.5 8.5L7.5 16.5C6.4 17.6 4.6 17.6 3.5 16.5C2.4 15.4 2.4 13.6 3.5 12.5L13.5 2.5C14.9 1.1 17.1 1.1 18.5 2.5C19.9 3.9 19.9 6.1 18.5 7.5L10.5 15.5C10.1 15.9 9.4 15.9 9 15.5C8.6 15.1 8.6 14.4 9 14L16 7" 
        stroke={color} 
        strokeWidth="2" 
        fill="none"
      />
    </G>
  </Svg>
);