import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface LockIconProps {
  size?: number;
  color?: string;
}

export const LockIcon: React.FC<LockIconProps> = ({ 
  size = 24, 
  color = '#1e293b' 
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <G>
      <Path 
        d="M12 14.5V16.5M7 10H8.8H15.2H17M7 10C6.4 10 6 10.1 5.6 10.3C5.1 10.6 4.6 11.1 4.3 11.6C4 12.3 4 13.1 4 14.8V16.2C4 17.9 4 18.7 4.3 19.4C4.6 19.9 5.1 20.4 5.6 20.7C6.3 21 7.1 21 8.8 21H15.2C16.9 21 17.7 21 18.4 20.7C18.9 20.4 19.4 19.9 19.7 19.4C20 18.7 20 17.9 20 16.2V14.8C20 13.1 20 12.3 19.7 11.6C19.4 11.1 18.9 10.6 18.4 10.3C18 10.1 17.6 10 17 10M7 10V8C7 5.2 9.2 3 12 3C14.8 3 17 5.2 17 8V10" 
        stroke={color} 
        strokeWidth="2" 
        fill="none"
      />
    </G>
  </Svg>
);