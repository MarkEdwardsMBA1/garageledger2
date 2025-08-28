import React from 'react';
import Svg, { Path, G, Ellipse, Rect, Line, Polygon, Defs, ClipPath } from 'react-native-svg';

interface Car91IconProps {
  size?: number;
  color?: string;
  bodyColor?: string;
  windowColor?: string;
  outlineColor?: string;
}

export const Car91Icon: React.FC<Car91IconProps> = ({ 
  size = 24, 
  color = '#231F20',
  bodyColor = '#FFFFFF',
  windowColor = '#68E1FD',
  outlineColor = '#166534'
}) => {
  console.log('🎨 Car91Icon: Rendering with size:', size, 'colors:', { color, bodyColor, windowColor, outlineColor });
  return (
    <Svg width={size} height={size} viewBox="0 0 500 500">
    <Defs>
      {/* Clipping path for rear tires - only show bottom portion */}
      <ClipPath id="rearTireClip">
        <Rect x="0" y="310" width="500" height="200" />
      </ClipPath>
    </Defs>
    
    {/* Ground */}
    <Path 
      d="M148.86,336c-64.27,0-113.07,0-114.86-.1a.64.64,0,0,1-.61-.66.62.62,0,0,1,.67-.62c5.2.21,428.37,0,432.64,0a.64.64,0,1,1,0,1.28C455.2,335.87,273.13,336,148.86,336Z"
      fill={color}
    />
    
    {/* Car Body - simplified main structure */}
    <Path
      d="M453.05,303.31c-1.26,3.07-4.5,6.83-12.87,6.86l-116.57.41c-11.92.05-15,3-21.21-4.79s-15.6-47.11-27.56-59.23S254.05,235,243.51,253,241,310.87,241,310.87l-123.45.44c-7.08-5.33-3.55-6.32-6.7-22.83S99.75,252,92.66,244.28s-20.35-10.13-30.44,10.81c-10,20.73-3.94,52.33-3.81,53L54,305.7c-4.42-2.42-6.65-9.7-7.55-13.59S34.05,283.39,34,278.53c0-2.2-.21-8.87,0-16.33,0-.14,0-.29,0-.45a114.46,114.46,0,0,1,1.54-17.41q.15-.81.33-1.56a20.93,20.93,0,0,1,1.55-4.62C41.83,229.39,49.33,226.93,56,225s7.91-10.73,19.35-22.44,27.64-29.73,50.33-33.62c13.5-2.31,58.94-4.28,98.47-3.37,41,.94,78.06,3.58,95.7,10s50.75,38.72,50.75,38.72,28.5,9.05,51.74,18.63c6.33,2.6,11.55,5.24,14.58,7.72a26.48,26.48,0,0,1,6.51,9.06c6.46,13.43,9.12,34.94,10.05,44.66.29,3.15.41,5.07.41,5.07A10.28,10.28,0,0,1,453.05,303.31Z"
      fill={bodyColor}
      stroke={outlineColor}
      strokeWidth="2"
    />

    {/* Car Glass - windows */}
    <Path 
      d="M264,214.67l-39.87-41.35s76.83.7,94.51,7.77c18,7.19,41.32,33.24,41.32,33.24Z" 
      fill={windowColor}
    />
    <Path 
      d="M150.63,215.07,158,174.52s45.22-2.1,55.68-.2,41.41,40.38,41.41,40.38Z" 
      fill={windowColor}
    />
    <Path 
      d="M146.43,215.08l7.38-40.54s-30.61,1.8-40.56,5.73c-16.76,6.62-38.31,35.07-38.31,35.07Z" 
      fill={windowColor}
    />

    {/* Front Wheels - fully visible (tires #1 and #3) */}
    {/* Tire #1 - Front Left (fully visible) */}
    <Ellipse cx="78.98" cy="284.7" rx="22.08" ry="50.57" fill={color} />
    <Ellipse cx="78.98" cy="284.7" rx="16.84" ry="38.58" fill="#FFFFFF" />
    
    {/* Tire #3 - Front Right (fully visible) */}
    <Ellipse cx="258.62" cy="284.06" rx="22.08" ry="50.57" fill={color} />
    <Ellipse cx="258.62" cy="284.06" rx="16.84" ry="38.58" fill="#FFFFFF" />
    
    {/* Rear Wheels - partially hidden behind car body (tires #2 and #4) */}
    <G clipPath="url(#rearTireClip)">
      {/* Tire #2 - Rear Left (partially hidden) */}
      <Ellipse cx="177.03" cy="284.35" rx="22.08" ry="50.57" fill={color} />
      <Ellipse cx="177.03" cy="284.35" rx="16.84" ry="38.58" fill="#FFFFFF" />
      
      {/* Tire #4 - Rear Right (partially hidden) */}
      <Ellipse cx="373.32" cy="283.66" rx="22.08" ry="50.57" fill={color} />
      <Ellipse cx="373.32" cy="283.66" rx="16.84" ry="38.58" fill="#FFFFFF" />
    </G>
    
    {/* Headlights */}
    <Path 
      d="M343.9,233.19l-54.24.19c-3.38,0,3.28,11.42,10.79,14.55s42.4,2.85,44.16.09S348.1,235.85,343.9,233.19Z" 
      fill={windowColor}
    />
    <Path 
      d="M443.38,249.7c-11.61.35-24-.33-25.05-1.94-1.78-2.74-3.58-12.14.61-14.83h3.35c6.33,2.6,11.55,5.24,14.58,7.72A26.48,26.48,0,0,1,443.38,249.7Z" 
      fill={windowColor}
    />
  </Svg>
  );
};