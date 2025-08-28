import React from 'react';
import Svg, { Path, G, Rect, Circle, Polygon } from 'react-native-svg';

interface ReportAnalysisIconProps {
  size?: number;
  color?: string;
  screenColor?: string;
  keyboardColor?: string;
  phoneColor?: string;
}

export const ReportAnalysisIcon: React.FC<ReportAnalysisIconProps> = ({ 
  size = 24, 
  color = '#124577',
  screenColor = '#68E1FD',
  keyboardColor = '#FFA513',
  phoneColor = '#FFA513'
}) => (
  <Svg width={size} height={size} viewBox="0 0 500 500">
    {/* Base/Foundation */}
    <Path 
      d="M45.9,318.8c46.7,25.1,184.3,104.4,227.6,129.5c8.2,4.7,18.3,4.7,26.4-0.1L464.7,352c4.7-2.7,6.3-8.8,3.5-13.5c-0.9-1.5-2.1-2.7-3.6-3.6l-232-131.4c-2.4-1.4-5.4-1.4-7.8,0l-179,101.8c-3.7,2.1-5,6.8-2.9,10.5C43.6,317.1,44.6,318.1,45.9,318.8z"
      fill="#ED6128"
    />
    
    {/* Main Screen/Document */}
    <Path 
      d="M82.7,164.7c-2.1,1.2-3.4,3.5-3.3,5.9v165.3c-0.2,3.4,3.6,6.5,6.7,4.7l67.7-38.5c2.7-1.6,126.6-71.3,126.6-74.4L287,54.5c0.1-1.8-1.3-3.3-3.1-3.4c-0.6,0-1.2,0.1-1.8,0.4C252,68.6,96.4,156.7,82.7,164.7z"
      fill={screenColor}
    />
    
    {/* Document Content Lines */}
    <Path 
      d="M116.4,150.1l-30.9,18.1c-0.6,0.3-1,1-1,1.7v165.2c0,0.7,0.6,1.3,1.3,1.3c0.2,0,0.5-0.1,0.7-0.2l194-112.9c0,0,0.1,4.7-3.6,7.1S86,340.6,86,340.6s-5.2,2.3-6.7-3.8V170.6c0-2.2,1-4.2,2.8-5.5c3-2.2,195.6-114.4,195.6-114.4s7-2.6,9.4,1.7l-151,86.3"
      fill={color}
    />

    {/* Chart/Graph Elements */}
    <Path 
      d="M192.9,188.7l2.3,52.8c0,0,33.3-9.3,35.6-56.2l-1.5-9.6L192.9,188.7z"
      fill="#CEE831"
    />
    <Path 
      d="M192.9,188.7l9-49.5c0,0,23.9,1.3,25.4,39.8L192.9,188.7z"
      fill={keyboardColor}
    />
    
    {/* Circular Chart Element */}
    <Path 
      d="M187.2,251.2c-1.7,0-3.5-0.2-5.2-0.5c-11.4-2-20.8-10.6-26.5-24c-5.3-12.7-6.7-28.4-3.8-44.3c6.1-34.2,29-57.7,52-53.6c11.4,2,20.8,10.6,26.5,24c5.3,12.7,6.7,28.4,3.8,44.3l0,0c-2.8,15.9-9.6,30.2-18.9,40.2C206.7,246.4,197,251.2,187.2,251.2z M198.7,138.9c-15.7,0-32,19.7-36.6,45.4c-2.5,13.9-1.4,27.5,3.2,38.3c4.2,10,10.8,16.3,18.6,17.7s16.1-2.2,23.6-10.2c8-8.6,13.8-21,16.2-34.9l0,0c2.5-13.9,1.4-27.5-3.2-38.3c-4.2-10-10.8-16.3-18.6-17.7C200.9,139,199.8,138.9,198.7,138.9L198.7,138.9z"
      fill="#F2F2F2"
    />

    {/* Secondary Screen */}
    <Path 
      d="M292.9,17.2c-10.8,6.4-37.6,22.2-45.6,26.9c-1.4,0.8-2.2,2.3-2.2,3.9v109.8c-0.2,2.2,2.4,4.3,4.4,3.1l45-25.6c1.8-0.8,3-2.6,3-4.6V19.8c0.1-1.7-1.2-3-2.9-3.1C294.1,16.6,293.4,16.8,292.9,17.2z"
      fill={phoneColor}
    />

    {/* Bar Chart in Secondary Screen */}
    <Rect x="250.6" y="43.8" width="41.2" height="1" fill="#F2F2F2" transform="rotate(-28.5 271.2 44.3)" />
    <Rect x="250.6" y="51.9" width="41.2" height="1" fill="#F2F2F2" transform="rotate(-28.5 271.2 52.4)" />
    <Rect x="249.8" y="62.1" width="41.2" height="1" fill="#F2F2F2" transform="rotate(-28.5 270.4 62.6)" />
    <Rect x="249.8" y="70.3" width="41.2" height="1" fill="#F2F2F2" transform="rotate(-28.5 270.4 70.8)" />
    
    {/* Additional Chart Elements */}
    <Path 
      d="M255.8,108.9c0,0,0.6-15.7,7.2-14.5s6.6,4,10.8-0.1s2.1-14.9,8.8-14.9s5.7,12.6,5.7,12.6L255.8,108.9z"
      fill="#F2F2F2"
    />
  </Svg>
);