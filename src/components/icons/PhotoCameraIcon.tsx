import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

interface PhotoCameraIconProps {
  size?: number;
  color?: string;
}

export const PhotoCameraIcon: React.FC<PhotoCameraIconProps> = ({ 
  size = 24, 
  color = '#1e293b' 
}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20">
    <G>
      <Path 
        d="M5.7 5.1L5.4 6H4.5C2.8 6 1.5 7.3 1.5 9V15C1.5 16.7 2.8 18 4.5 18H15.5C17.2 18 18.5 16.7 18.5 15V9C18.5 7.3 17.2 6 15.5 6H14.6L14.3 5.1C13.9 3.8 12.8 3 11.4 3H8.6C7.2 3 6.1 3.8 5.7 5.1ZM4.5 8H6.9L7.6 5.7C7.7 5.3 8.1 5 8.6 5H11.4C11.9 5 12.3 5.3 12.4 5.7L13.1 8H15.5C16.1 8 16.5 8.4 16.5 9V15C16.5 15.6 16.1 16 15.5 16H4.5C3.9 16 3.5 15.6 3.5 15V9C3.5 8.4 3.9 8 4.5 8Z" 
        fill={color}
      />
      <Path 
        d="M10 8C8.1 8 6.5 9.6 6.5 11.5C6.5 13.4 8.1 15 10 15C11.9 15 13.5 13.4 13.5 11.5C13.5 9.6 11.9 8 10 8ZM10 13C9.2 13 8.5 12.3 8.5 11.5C8.5 10.7 9.2 10 10 10C10.8 10 11.5 10.7 11.5 11.5C11.5 12.3 10.8 13 10 13Z" 
        fill={color}
      />
    </G>
  </Svg>
);